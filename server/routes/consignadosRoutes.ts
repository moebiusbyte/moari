import express, { Router, Request, Response, RequestHandler } from "express";
import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

const router = Router();

interface ApiError extends Error {
  code?: string;
  status?: number;
  detail?: string;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const handleDatabaseError = (error: unknown, res: Response): void => {
  console.error("Database error:", error);
  
  const apiError = error as ApiError;
  
  let statusCode = 500;
  let errorMessage = 'Erro interno do servidor';
  
  if (apiError.code === '23505') {
    statusCode = 409;
    errorMessage = 'Registro duplicado';
  }
  else if (apiError.code === '23503') {
    statusCode = 400;
    errorMessage = 'Violação de restrição de integridade';
  }
  
  res.status(statusCode).json({
    error: errorMessage,
    details: process.env.NODE_ENV === "development" ? apiError.message : undefined,
  });
};

// ==================== SETUP DAS TABELAS ====================

console.log("🔧 === REGISTRANDO ROTAS DE CONSIGNADOS ===");

// Rota para setup das tabelas de consignados
router.get("/setup-consignados-tables", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    console.log('🔧 Verificando/criando tabelas de consignados...');
    
    // Verificar se a tabela de consignados já existe
    const checkConsignadosTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'moari' 
        AND table_name = 'consignados'
      );
    `);

    // Verificar se a tabela de produtos consignados já existe
    const checkProductConsignadosTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'moari' 
        AND table_name = 'product_consignados'
      );
    `);

    let tablesCreated = [];

    // Criar tabela de consignados se não existir
    if (!checkConsignadosTable.rows[0].exists) {
      await client.query(`
        CREATE TABLE moari.consignados (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          contato VARCHAR(255),
          telefone VARCHAR(20),
          email VARCHAR(255),
          endereco TEXT,
          cidade VARCHAR(100),
          estado VARCHAR(2),
          cnpj VARCHAR(20),
          comissao DECIMAL(5,2) DEFAULT 0.00,
          ultima_entrega DATE,
          status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Criar índices para a tabela de consignados
      await client.query(`CREATE INDEX idx_consignados_nome ON moari.consignados(nome);`);
      await client.query(`CREATE INDEX idx_consignados_status ON moari.consignados(status);`);
      await client.query(`CREATE INDEX idx_consignados_cidade_estado ON moari.consignados(cidade, estado);`);

      console.log('✅ Tabela consignados criada com sucesso!');
      tablesCreated.push('consignados');
    } else {
      console.log('✅ Tabela consignados já existe');
    }

    // Criar tabela de relacionamento produto-consignado se não existir
    if (!checkProductConsignadosTable.rows[0].exists) {
      await client.query(`
        CREATE TABLE moari.product_consignados (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES moari.products(id) ON DELETE CASCADE,
          consignado_id INTEGER REFERENCES moari.consignados(id) ON DELETE CASCADE,
          data_consignacao DATE NOT NULL DEFAULT CURRENT_DATE,
          data_devolucao DATE,
          quantidade_consignada INTEGER NOT NULL DEFAULT 1,
          quantidade_vendida INTEGER DEFAULT 0,
          valor_combinado DECIMAL(10,2),
          observacoes TEXT,
          status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'vendido', 'devolvido', 'perdido')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(product_id, consignado_id, data_consignacao)
        );
      `);

      // Criar índices para a tabela de produto-consignados
      await client.query(`CREATE INDEX idx_product_consignados_product_id ON moari.product_consignados(product_id);`);
      await client.query(`CREATE INDEX idx_product_consignados_consignado_id ON moari.product_consignados(consignado_id);`);
      await client.query(`CREATE INDEX idx_product_consignados_status ON moari.product_consignados(status);`);
      await client.query(`CREATE INDEX idx_product_consignados_data_consignacao ON moari.product_consignados(data_consignacao);`);

      console.log('✅ Tabela product_consignados criada com sucesso!');
      tablesCreated.push('product_consignados');
    } else {
      console.log('✅ Tabela product_consignados já existe');
    }

    // Criar trigger para atualizar updated_at automaticamente
    if (tablesCreated.length > 0) {
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);

      if (tablesCreated.includes('consignados')) {
        await client.query(`
          CREATE TRIGGER update_consignados_updated_at 
          BEFORE UPDATE ON moari.consignados 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);
      }

      if (tablesCreated.includes('product_consignados')) {
        await client.query(`
          CREATE TRIGGER update_product_consignados_updated_at 
          BEFORE UPDATE ON moari.product_consignados 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);
      }
    }

    res.json({ 
      success: true, 
      message: tablesCreated.length > 0 
        ? `Tabelas criadas: ${tablesCreated.join(', ')}` 
        : 'Todas as tabelas já existem',
      tablesCreated,
      tables: {
        consignados: checkConsignadosTable.rows[0].exists,
        product_consignados: checkProductConsignadosTable.rows[0].exists
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    res.status(500).json({ 
      error: 'Erro ao criar tabelas de consignados',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  } finally {
    client.release();
  }
});

// ==================== ROTAS CRUD DE CONSIGNADOS ====================

// Obter próximo ID para código do consignado
router.get("/next-consignado-id", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT COALESCE(MAX(id), 0) + 1 AS next_id 
      FROM moari.consignados
    `);
    
    const nextId = result.rows[0].next_id;
    const formattedNextId = `CONS${nextId.toString().padStart(4, '0')}`;
    
    console.log(`Próximo código de consignado gerado: ${formattedNextId}`);
    
    res.json({ nextId: formattedNextId });
  } catch (error) {
    console.error('Erro ao gerar próximo ID de consignado:', error);
    res.status(500).json({ error: 'Erro ao gerar ID do consignado' });
  } finally {
    client.release();
  }
});

// Listar todos os consignados com busca
router.get("/consignados", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    console.log("Consulta de consignados recebida com parâmetros:", req.query);
    
    const { search, status, estado, cidade } = req.query;
    
    let queryParams: any[] = [];
    let conditions: string[] = [];
    let paramIndex = 1;

    // Filtro de busca por nome, contato, email ou CNPJ
    if (search && search.toString().trim() !== '') {
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      conditions.push(`(
        c.nome ILIKE $${paramIndex} OR 
        c.contato ILIKE $${paramIndex + 1} OR
        c.email ILIKE $${paramIndex + 2} OR
        c.cnpj ILIKE $${paramIndex + 3}
      )`);
      paramIndex += 4;
      console.log(`🔍 Busca aplicada: "${search}"`);
    }

    // Filtro por status
    if (status && status.toString().trim() !== '') {
      queryParams.push(status);
      conditions.push(`c.status = $${paramIndex}`);
      paramIndex++;
    }

    // Filtro por estado
    if (estado && estado.toString().trim() !== '') {
      queryParams.push(estado);
      conditions.push(`c.estado = $${paramIndex}`);
      paramIndex++;
    }

    // Filtro por cidade
    if (cidade && cidade.toString().trim() !== '') {
      queryParams.push(`%${cidade}%`);
      conditions.push(`c.cidade ILIKE $${paramIndex}`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        c.*,
        COUNT(pc.id) as produtos_consignados,
        COUNT(CASE WHEN pc.status = 'ativo' THEN 1 END) as produtos_ativos,
        COUNT(CASE WHEN pc.status = 'vendido' THEN 1 END) as produtos_vendidos,
        COALESCE(SUM(pc.valor_combinado), 0) as valor_total_consignado
      FROM moari.consignados c
      LEFT JOIN moari.product_consignados pc ON c.id = pc.consignado_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;

    console.log(`📋 Executando query: ${query}`);
    console.log(`📋 Parâmetros: ${JSON.stringify(queryParams)}`);

    const result = await client.query(query, queryParams);

    console.log(`✅ Consignados encontrados: ${result.rows.length}`);

    res.json(result.rows);

  } catch (error: any) {
    console.error("❌ Erro na consulta de consignados:", error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

// Criar novo consignado
router.post("/consignados", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      nome, contato, telefone, email, endereco, cidade, estado,
      cnpj, comissao, ultima_entrega, status = 'ativo',
      produtos = [] // Array de produtos para consignar
    } = req.body;

    console.log('📝 Criando novo consignado:', { nome, contato, cidade, estado });
    console.log('📦 Produtos para consignar:', produtos);

    // Validações básicas
    if (!nome || nome.trim() === '') {
      res.status(400).json({ error: 'Nome é obrigatório' });
      return;
    }

    // Validar produtos antes de criar o consignado
    if (produtos && produtos.length > 0) {
      for (const produto of produtos) {
        const { product_id, quantidade } = produto;
        
        // Verificar se o produto existe e está disponível
        const productCheck = await client.query(
          'SELECT id, name, status, quantity FROM moari.products WHERE id = $1',
          [product_id]
        );

        if (productCheck.rowCount === 0) {
          res.status(400).json({ 
            error: `Produto com ID ${product_id} não encontrado` 
          });
          return;
        }

        const produtoData = productCheck.rows[0];

        // Verificar se o produto está ativo
        if (produtoData.status !== 'active') {
          res.status(400).json({ 
            error: `Produto "${produtoData.name}" não está disponível para consignação (status: ${produtoData.status})` 
          });
          return;
        }

        // Verificar se há quantidade suficiente
        if (!produtoData.quantity || produtoData.quantity < quantidade) {
          res.status(400).json({ 
            error: `Produto "${produtoData.name}" não tem quantidade suficiente. Disponível: ${produtoData.quantity || 0}, Solicitado: ${quantidade}` 
          });
          return;
        }

        // Verificar se já existe uma consignação ativa para este produto
        const existingCheck = await client.query(
          'SELECT * FROM moari.product_consignados WHERE product_id = $1 AND status = $2',
          [product_id, 'ativo']
        );

        if ((existingCheck.rowCount ?? 0) > 0) {
          res.status(400).json({ 
            error: `Produto "${produtoData.name}" já está consignado para outro consignado` 
          });
          return;
        }
      }
    }

    // Criar o consignado
    const insertQuery = `
      INSERT INTO moari.consignados (
        nome, contato, telefone, email, endereco, cidade, estado,
        cnpj, comissao, ultima_entrega, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const insertParams = [
      nome.trim(), contato, telefone, email, endereco, cidade, estado,
      cnpj, comissao || 0, ultima_entrega || null, status
    ];

    const result = await client.query(insertQuery, insertParams);
    const consignado = result.rows[0];

    console.log(`✅ Consignado criado com ID: ${consignado.id}`);

    // Processar produtos para consignação
    const produtosConsignados = [];
    if (produtos && produtos.length > 0) {
      for (const produto of produtos) {
        const { product_id, quantidade, valor_combinado, observacoes } = produto;
        
        console.log(`📦 Consignando produto ${product_id} (quantidade: ${quantidade}) para consignado ${consignado.id}`);

        // Criar registro de consignação
        const consignacaoQuery = `
          INSERT INTO moari.product_consignados (
            product_id, consignado_id, quantidade_consignada, valor_combinado, observacoes
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;

        const consignacaoResult = await client.query(consignacaoQuery, [
          product_id, consignado.id, quantidade, valor_combinado || 0, observacoes || null
        ]);

        // Atualizar status do produto para 'consigned'
        await client.query(
          'UPDATE moari.products SET status = $1 WHERE id = $2',
          ['consigned', product_id]
        );

        // Reduzir a quantidade do produto (se necessário)
        await client.query(
          'UPDATE moari.products SET quantity = quantity - $1 WHERE id = $2',
          [quantidade, product_id]
        );

        produtosConsignados.push(consignacaoResult.rows[0]);
        
        console.log(`✅ Produto ${product_id} consignado com sucesso`);
      }

      // Atualizar data da última entrega do consignado
      await client.query(
        'UPDATE moari.consignados SET ultima_entrega = CURRENT_DATE WHERE id = $1',
        [consignado.id]
      );
    }

    await client.query("COMMIT");
    
    console.log(`✅ Consignado ${consignado.id} criado com ${produtosConsignados.length} produtos consignados`);
    
    res.status(201).json({
      consignado,
      produtosConsignados,
      message: `Consignado criado com sucesso${produtos.length > 0 ? ` com ${produtos.length} produto(s) consignado(s)` : ''}`
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error('❌ Erro ao criar consignado:', error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

// Atualizar consignado
router.put("/consignados/:id", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const { id } = req.params;
    const {
      nome, contato, telefone, email, endereco, cidade, estado,
      cnpj, comissao, ultima_entrega, status
    } = req.body;

    console.log(`📝 Atualizando consignado ID: ${id}`);

    // Verificar se o consignado existe
    const checkResult = await client.query('SELECT * FROM moari.consignados WHERE id = $1', [id]);
    
    if (checkResult.rowCount === 0) {
      res.status(404).json({ error: 'Consignado não encontrado' });
      return;
    }

    const updateQuery = `
      UPDATE moari.consignados 
      SET
        nome = $1, contato = $2, telefone = $3, email = $4, endereco = $5,
        cidade = $6, estado = $7, cnpj = $8, comissao = $9, 
        ultima_entrega = $10, status = $11, updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `;

    const updateParams = [
      nome, contato, telefone, email, endereco, cidade, estado,
      cnpj, comissao, ultima_entrega, status, id
    ];

    const result = await client.query(updateQuery, updateParams);

    await client.query("COMMIT");
    
    console.log(`✅ Consignado ${id} atualizado com sucesso`);
    
    res.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`❌ Erro ao atualizar consignado ${req.params.id}:`, error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

// Deletar consignado
router.delete("/consignados/:id", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const { id } = req.params;

    console.log(`🗑️ Deletando consignado ID: ${id}`);

    // Verificar se há produtos associados
    const productsCheck = await client.query(
      'SELECT COUNT(*) as count FROM moari.product_consignados WHERE consignado_id = $1 AND status = $2',
      [id, 'ativo']
    );

    if (parseInt(productsCheck.rows[0].count) > 0) {
      res.status(400).json({ 
        error: 'Não é possível excluir. Há produtos ativos consignados para este consignado.',
        activeProducts: parseInt(productsCheck.rows[0].count)
      });
      return;
    }

    // Deletar histórico de produtos consignados primeiro
    await client.query('DELETE FROM moari.product_consignados WHERE consignado_id = $1', [id]);
    
    // Deletar o consignado
    const result = await client.query('DELETE FROM moari.consignados WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Consignado não encontrado' });
      return;
    }

    await client.query("COMMIT");
    
    console.log(`✅ Consignado ${id} deletado com sucesso`);
    
    res.json({ 
      success: true,
      message: 'Consignado deletado com sucesso',
      deletedConsignado: result.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`❌ Erro ao deletar consignado ${req.params.id}:`, error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

// ==================== ROTAS DE PRODUTOS CONSIGNADOS ====================

// Consignar produto para um consignado
router.post("/consignados/:consignadoId/products/:productId", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const { consignadoId, productId } = req.params;
    const { quantidade_consignada = 1, valor_combinado, observacoes } = req.body;

    console.log(`📦 Consignando produto ${productId} para consignado ${consignadoId}`);

    // Verificar se o produto existe e está disponível
    const productCheck = await client.query(
      'SELECT * FROM moari.products WHERE id = $1 AND status = $2',
      [productId, 'active']
    );

    if (productCheck.rowCount === 0) {
      res.status(404).json({ error: 'Produto não encontrado ou não disponível' });
      return;
    }

    // Verificar se o consignado existe
    const consignadoCheck = await client.query(
      'SELECT * FROM moari.consignados WHERE id = $1 AND status = $2',
      [consignadoId, 'ativo']
    );

    if (consignadoCheck.rowCount === 0) {
      res.status(404).json({ error: 'Consignado não encontrado ou inativo' });
      return;
    }

    // Verificar se já existe uma consignação ativa para este produto
    const existingCheck = await client.query(
      'SELECT * FROM moari.product_consignados WHERE product_id = $1 AND status = $2',
      [productId, 'ativo']
    );

    if ((existingCheck.rowCount ?? 0) > 0) {
      res.status(400).json({ 
        error: 'Este produto já está consignado ativamente',
        currentConsignado: existingCheck.rows[0]
      });
      return;
    }

    // Criar registro de consignação
    const insertQuery = `
      INSERT INTO moari.product_consignados (
        product_id, consignado_id, quantidade_consignada, valor_combinado, observacoes
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const consignacaoResult = await client.query(insertQuery, [
      productId, consignadoId, quantidade_consignada, valor_combinado, observacoes
    ]);

    // Atualizar status do produto para 'consigned'
    await client.query(
      'UPDATE moari.products SET status = $1 WHERE id = $2',
      ['consigned', productId]
    );

    // Atualizar data da última entrega do consignado
    await client.query(
      'UPDATE moari.consignados SET ultima_entrega = CURRENT_DATE WHERE id = $1',
      [consignadoId]
    );

    await client.query("COMMIT");
    
    console.log(`✅ Produto ${productId} consignado para ${consignadoId} com sucesso`);
    
    res.status(201).json({
      success: true,
      consignacao: consignacaoResult.rows[0],
      message: 'Produto consignado com sucesso'
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error('❌ Erro ao consignar produto:', error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

// Listar produtos de um consignado
router.get("/consignados/:id/products", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status } = req.query;

    console.log(`📋 Listando produtos do consignado ${id}`);

    let statusCondition = '';
    let queryParams = [id];

    if (status) {
      statusCondition = 'AND pc.status = $2';
      queryParams.push(status as string);
    }

    const query = `
      SELECT 
        pc.*,
        p.name as product_name,
        p.code as product_code,
        p.base_price,
        p.category,
        array_agg(pi.image_url ORDER BY pi.order_index) FILTER (WHERE pi.image_url IS NOT NULL) as images
      FROM moari.product_consignados pc
      JOIN moari.products p ON pc.product_id = p.id
      LEFT JOIN moari.product_images pi ON p.id = pi.product_id
      WHERE pc.consignado_id = $1 ${statusCondition}
      GROUP BY pc.id, p.id
      ORDER BY pc.created_at DESC
    `;

    const result = await client.query(query, queryParams);

    console.log(`✅ Encontrados ${result.rows.length} produtos para o consignado ${id}`);

    res.json(result.rows);
  } catch (error) {
    console.error(`❌ Erro ao listar produtos do consignado ${req.params.id}:`, error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

// Devolver produto consignado
router.put("/consignados/products/:consignacaoId/devolver", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const { consignacaoId } = req.params;
    const { observacoes } = req.body;

    console.log(`🔄 Devolvendo produto da consignação ${consignacaoId}`);

    // Buscar informações da consignação
    const consignacaoCheck = await client.query(
      'SELECT * FROM moari.product_consignados WHERE id = $1 AND status = $2',
      [consignacaoId, 'ativo']
    );

    if (consignacaoCheck.rowCount === 0) {
      res.status(404).json({ error: 'Consignação não encontrada ou já finalizada' });
      return;
    }

    const consignacao = consignacaoCheck.rows[0];

    // Atualizar status da consignação para devolvido
    await client.query(
      'UPDATE moari.product_consignados SET status = $1, data_devolucao = CURRENT_DATE, observacoes = $2 WHERE id = $3',
      ['devolvido', observacoes, consignacaoId]
    );

    // Voltar status do produto para active
    await client.query(
      'UPDATE moari.products SET status = $1 WHERE id = $2',
      ['active', consignacao.product_id]
    );

    await client.query("COMMIT");
    
    console.log(`✅ Produto da consignação ${consignacaoId} devolvido com sucesso`);
    
    res.json({
      success: true,
      message: 'Produto devolvido com sucesso'
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`❌ Erro ao devolver produto da consignação ${req.params.consignacaoId}:`, error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

// Nova rota: Buscar informações de consignação de um produto
router.get("/products/:productId/consignacao-info", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { productId } = req.params;
    
    console.log(`🔍 Buscando informações de consignação para produto ID: ${productId}`);

    // Buscar consignação ativa do produto
    const consignacaoQuery = `
      SELECT 
        pc.*,
        c.nome as consignado_nome,
        c.contato as consignado_contato,
        c.telefone as consignado_telefone,
        c.email as consignado_email,
        c.cidade as consignado_cidade,
        c.estado as consignado_estado,
        c.endereco as consignado_endereco,
        c.ultima_entrega as consignado_ultima_entrega,
        p.name as produto_nome,
        p.code as produto_codigo
      FROM moari.product_consignados pc
      JOIN moari.consignados c ON pc.consignado_id = c.id
      JOIN moari.products p ON pc.product_id = p.id
      WHERE pc.product_id = $1 AND pc.status = 'ativo'
      ORDER BY pc.created_at DESC
      LIMIT 1
    `;
    
    const result = await client.query(consignacaoQuery, [productId]);
    
    if (result.rowCount === 0) {
      console.log(`ℹ️ Produto ${productId} não possui consignação ativa`);
      res.json({ 
        hasConsignacao: false,
        message: 'Produto não está consignado'
      });
      return;
    }

    const consignacaoInfo = result.rows[0];
    
    console.log(`✅ Consignação ativa encontrada para produto ${productId} com ${consignacaoInfo.consignado_nome}`);
    
    res.json({
      hasConsignacao: true,
      consignacao: {
        id: consignacaoInfo.id,
        dataConsignacao: consignacaoInfo.created_at,
        quantidadeConsignada: consignacaoInfo.quantidade_consignada,
        valorCombinado: consignacaoInfo.valor_combinado,
        observacoes: consignacaoInfo.observacoes,
        consignado: {
          id: consignacaoInfo.consignado_id,
          nome: consignacaoInfo.consignado_nome,
          contato: consignacaoInfo.consignado_contato,
          telefone: consignacaoInfo.consignado_telefone,
          email: consignacaoInfo.consignado_email,
          cidade: consignacaoInfo.consignado_cidade,
          estado: consignacaoInfo.consignado_estado,
          endereco: consignacaoInfo.consignado_endereco,
          ultimaEntrega: consignacaoInfo.consignado_ultima_entrega
        },
        produto: {
          nome: consignacaoInfo.produto_nome,
          codigo: consignacaoInfo.produto_codigo
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar informações de consignação:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar informações de consignação',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  } finally {
    client.release();
  }
});

// ==================== ROTAS DE RELATÓRIOS ====================

// Relatório de consignados
router.get("/consignados/relatorio", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    console.log('📊 Gerando relatório de consignados...');

    const relatorioQuery = `
      SELECT 
        c.id,
        c.nome,
        c.cidade,
        c.estado,
        c.status,
        c.comissao,
        c.ultima_entrega,
        COUNT(pc.id) as total_produtos_consignados,
        COUNT(CASE WHEN pc.status = 'ativo' THEN 1 END) as produtos_ativos,
        COUNT(CASE WHEN pc.status = 'vendido' THEN 1 END) as produtos_vendidos,
        COUNT(CASE WHEN pc.status = 'devolvido' THEN 1 END) as produtos_devolvidos,
        COALESCE(SUM(pc.valor_combinado), 0) as valor_total_consignado,
        COALESCE(SUM(CASE WHEN pc.status = 'vendido' THEN pc.valor_combinado END), 0) as valor_total_vendido
      FROM moari.consignados c
      LEFT JOIN moari.product_consignados pc ON c.id = pc.consignado_id
      GROUP BY c.id
      ORDER BY produtos_ativos DESC, c.nome
    `;

    const result = await client.query(relatorioQuery);

    // Estatísticas gerais
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT c.id) as total_consignados,
        COUNT(DISTINCT CASE WHEN c.status = 'ativo' THEN c.id END) as consignados_ativos,
        COUNT(pc.id) as total_produtos_consignados,
        COUNT(CASE WHEN pc.status = 'ativo' THEN 1 END) as produtos_atualmente_consignados,
        COUNT(CASE WHEN pc.status = 'vendido' THEN 1 END) as produtos_vendidos_consignacao,
        COUNT(CASE WHEN pc.status = 'devolvido' THEN 1 END) as produtos_devolvidos,
        COALESCE(SUM(pc.valor_combinado), 0) as valor_total_movimento,
        COALESCE(SUM(CASE WHEN pc.status = 'vendido' THEN pc.valor_combinado END), 0) as receita_consignacao,
        COALESCE(AVG(pc.valor_combinado), 0) as ticket_medio_consignacao
      FROM moari.consignados c
      LEFT JOIN moari.product_consignados pc ON c.id = pc.consignado_id
    `;

    const statsResult = await client.query(statsQuery);
    const stats = statsResult.rows[0];

    console.log(`✅ Relatório gerado com ${result.rows.length} consignados`);

    res.json({
      success: true,
      estatisticas: {
        totalConsignados: parseInt(stats.total_consignados) || 0,
        consignadosAtivos: parseInt(stats.consignados_ativos) || 0,
        totalProdutosConsignados: parseInt(stats.total_produtos_consignados) || 0,
        produtosAtualmenteConsignados: parseInt(stats.produtos_atualmente_consignados) || 0,
        produtosVendidosConsignacao: parseInt(stats.produtos_vendidos_consignacao) || 0,
        produtosDevolvidos: parseInt(stats.produtos_devolvidos) || 0,
        valorTotalMovimento: parseFloat(stats.valor_total_movimento) || 0,
        receitaConsignacao: parseFloat(stats.receita_consignacao) || 0,
        ticketMedioConsignacao: parseFloat(stats.ticket_medio_consignacao) || 0
      },
      consignados: result.rows.map(row => ({
        id: row.id,
        nome: row.nome,
        cidade: row.cidade,
        estado: row.estado,
        status: row.status,
        comissao: parseFloat(row.comissao) || 0,
        ultimaEntrega: row.ultima_entrega,
        totalProdutosConsignados: parseInt(row.total_produtos_consignados) || 0,
        produtosAtivos: parseInt(row.produtos_ativos) || 0,
        produtosVendidos: parseInt(row.produtos_vendidos) || 0,
        produtosDevolvidos: parseInt(row.produtos_devolvidos) || 0,
        valorTotalConsignado: parseFloat(row.valor_total_consignado) || 0,
        valorTotalVendido: parseFloat(row.valor_total_vendido) || 0
      }))
    });

  } catch (error) {
    console.error('❌ Erro ao gerar relatório de consignados:', error);
    res.status(500).json({ 
      error: 'Erro ao gerar relatório de consignados',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  } finally {
    client.release();
  }
});

// Nova rota: Relatório de evolução de consignações
router.get("/consignados/evolucao", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { period = 'month' } = req.query;
    
    console.log(`📈 Gerando evolução de consignações para período: ${period}`);

    let dateFormat = '';
    let interval = '';
    
    switch (period) {
      case 'week':
        dateFormat = 'YYYY-MM-DD';
        interval = '7 days';
        break;
      case 'month':
        dateFormat = 'YYYY-MM-DD';
        interval = '30 days';
        break;
      case 'quarter':
        dateFormat = 'YYYY-MM';
        interval = '90 days';
        break;
      case 'year':
        dateFormat = 'YYYY-MM';
        interval = '365 days';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
        interval = '30 days';
    }

    const evolucaoQuery = `
      SELECT 
        TO_CHAR(pc.created_at, '${dateFormat}') as periodo,
        COUNT(pc.id) as novas_consignacoes,
        COUNT(CASE WHEN pc.status = 'vendido' THEN 1 END) as vendas_periodo,
        COUNT(CASE WHEN pc.status = 'devolvido' THEN 1 END) as devolucoes_periodo,
        COALESCE(SUM(pc.valor_combinado), 0) as valor_consignado,
        COALESCE(SUM(CASE WHEN pc.status = 'vendido' THEN pc.valor_combinado END), 0) as receita_periodo
      FROM moari.product_consignados pc
      WHERE pc.created_at >= CURRENT_DATE - INTERVAL '${interval}'
      GROUP BY TO_CHAR(pc.created_at, '${dateFormat}')
      ORDER BY periodo DESC
      LIMIT 30
    `;

    const result = await client.query(evolucaoQuery);

    res.json({
      success: true,
      period,
      dados: result.rows.map(row => ({
        periodo: row.periodo,
        novasConsignacoes: parseInt(row.novas_consignacoes) || 0,
        vendasPeriodo: parseInt(row.vendas_periodo) || 0,
        devolucoesPeriodo: parseInt(row.devolucoes_periodo) || 0,
        valorConsignado: parseFloat(row.valor_consignado) || 0,
        receitaPeriodo: parseFloat(row.receita_periodo) || 0
      }))
    });

  } catch (error) {
    console.error('❌ Erro ao gerar evolução de consignações:', error);
    res.status(500).json({ 
      error: 'Erro ao gerar evolução de consignações',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  } finally {
    client.release();
  }
});

// ==================== ROTAS DE DEBUG ====================

router.get("/debug-consignados-status", (req: Request, res: Response) => {
  res.json({
    message: "Status das rotas de consignados",
    timestamp: new Date().toISOString(),
    routes: {
      "GET /api/setup-consignados-tables": "✅ Configurar tabelas",
      "GET /api/next-consignado-id": "✅ Próximo ID",
      "GET /api/consignados": "✅ Listar consignados",
      "POST /api/consignados": "✅ Criar consignado",
      "PUT /api/consignados/:id": "✅ Atualizar consignado",
      "DELETE /api/consignados/:id": "✅ Deletar consignado",
      "POST /api/consignados/:consignadoId/products/:productId": "✅ Consignar produto",
      "GET /api/consignados/:id/products": "✅ Listar produtos do consignado",
      "PUT /api/consignados/products/:consignacaoId/devolver": "✅ Devolver produto",
      "GET /api/products/:productId/consignacao-info": "✅ Info de consignação do produto",
      "GET /api/consignados/relatorio": "✅ Relatório de consignados",
      "GET /api/consignados/evolucao": "✅ Evolução de consignações"
    },
    testUrls: {
      setupTables: `${req.protocol}://${req.get('host')}/api/setup-consignados-tables`,
      nextId: `${req.protocol}://${req.get('host')}/api/next-consignado-id`,
      listConsignados: `${req.protocol}://${req.get('host')}/api/consignados`,
      relatorio: `${req.protocol}://${req.get('host')}/api/consignados/relatorio`
    }
  });
});

// Log das rotas registradas
console.log("📊 === ROTAS DE CONSIGNADOS REGISTRADAS ===");
console.log("✅ GET  /api/setup-consignados-tables");
console.log("✅ GET  /api/next-consignado-id");
console.log("✅ GET  /api/consignados");
console.log("✅ POST /api/consignados");
console.log("✅ PUT  /api/consignados/:id");
console.log("✅ DELETE /api/consignados/:id");
console.log("✅ POST /api/consignados/:consignadoId/products/:productId");
console.log("✅ GET  /api/consignados/:id/products");
console.log("✅ PUT  /api/consignados/products/:consignacaoId/devolver");
console.log("✅ GET  /api/products/:productId/consignacao-info");
console.log("✅ GET  /api/consignados/relatorio");
console.log("✅ GET  /api/consignados/evolucao");
console.log("✅ GET  /api/debug-consignados-status");
console.log("===============================================");

export default router;