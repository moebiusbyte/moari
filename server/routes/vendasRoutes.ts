import express, { Router, Request, Response, RequestHandler } from "express";
import { ParamsDictionary } from 'express-serve-static-core';
import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

const router: Router = express.Router();

interface DeleteSaleParams extends ParamsDictionary {
  id: string;
}

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

// Função helper para debug de queries
const debugQuery = (queryText: string, params?: any[]) => {
  console.log('\n🔍 === DEBUG SQL QUERY ===');
  console.log('📝 Query:', queryText);
  console.log('📋 Parameters:', params);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('========================\n');
};

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

// GET /sales - Listar vendas com filtros e paginação
router.get("/sales", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    console.log("Consulta de vendas recebida com parâmetros:", req.query);
    
    console.log('\n🎯 === DEBUG PARÂMETROS RECEBIDOS ===');
    console.log('req.query completo:', JSON.stringify(req.query, null, 2));
    console.log('======================================\n');
    
    const { 
      page = 1, 
      limit = 10, 
      search, 
      orderBy = "sale_date",
      orderDirection = "desc"
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);

    // Construir condições dos filtros
    let queryParams: any[] = [];
    let conditions: string[] = [];

    // Filtro de busca por cliente
    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`s.customer_name ILIKE $${queryParams.length}`);
      
      console.log('\n🔍 === FILTRO BUSCA DEBUG ===');
      console.log('Termo de busca:', search);
      console.log('Condição aplicada:', `s.customer_name ILIKE $${queryParams.length}`);
      console.log('===============================\n');
    }

    // Filtro por método de pagamento
    if (req.query.paymentMethod) {
      queryParams.push(req.query.paymentMethod);
      conditions.push(`s.payment_method = $${queryParams.length}`);
      
      console.log('\n🎯 === FILTRO PAGAMENTO DEBUG ===');
      console.log('Método solicitado:', req.query.paymentMethod);
      console.log('Condição aplicada:', `s.payment_method = $${queryParams.length}`);
      console.log('==================================\n');
    }

    // Filtro por período de data
    if (req.query.dateFrom) {
      queryParams.push(req.query.dateFrom);
      conditions.push(`s.sale_date >= $${queryParams.length}`);
    }

    if (req.query.dateTo) {
      queryParams.push(req.query.dateTo);
      conditions.push(`s.sale_date <= $${queryParams.length}`);
    }

    // Filtro por status
    if (req.query.status) {
      queryParams.push(req.query.status);
      conditions.push(`s.status = $${queryParams.length}`);
    }

    // Construir cláusula WHERE
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    console.log('\n📋 === CONDIÇÕES FINAIS ===');
    console.log('WHERE clause:', whereClause);
    console.log('Parâmetros:', queryParams);
    console.log('===========================\n');

    // Consulta para estatísticas com os mesmos filtros aplicados
    const statsQuery = `
    SELECT 
      COUNT(*) as total_vendas,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as vendas_concluidas,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as vendas_pendentes,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as vendas_canceladas,
      COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as receita_total,
      COALESCE(AVG(CASE WHEN status = 'completed' THEN total_amount END), 0) as ticket_medio,
      COUNT(CASE WHEN DATE(sale_date AT TIME ZONE 'America/Sao_Paulo') = DATE(NOW() AT TIME ZONE 'America/Sao_Paulo') THEN 1 END) as vendas_hoje,
      COALESCE(SUM(CASE WHEN DATE(sale_date AT TIME ZONE 'America/Sao_Paulo') = DATE(NOW() AT TIME ZONE 'America/Sao_Paulo') AND status = 'completed' THEN total_amount ELSE 0 END), 0) as receita_hoje
    FROM moari.sales s
    ${whereClause}
  `;

    console.log("✅ Executando consulta de estatísticas FILTRADAS");
    debugQuery(statsQuery, queryParams);
    
    const statsResult = await client.query(statsQuery, queryParams);
    
    const statistics = {
      totalVendas: parseInt(statsResult.rows[0].total_vendas) || 0,
      vendasConcluidas: parseInt(statsResult.rows[0].vendas_concluidas) || 0,
      vendasPendentes: parseInt(statsResult.rows[0].vendas_pendentes) || 0,
      vendasCanceladas: parseInt(statsResult.rows[0].vendas_canceladas) || 0,
      receitaTotal: parseFloat(statsResult.rows[0].receita_total) || 0,
      ticketMedio: parseFloat(statsResult.rows[0].ticket_medio) || 0,
      vendasHoje: parseInt(statsResult.rows[0].vendas_hoje) || 0,
      receitaHoje: parseFloat(statsResult.rows[0].receita_hoje) || 0
    };

    console.log('Estatísticas processadas:', statistics);

    // Query para vendas com os mesmos filtros
    let salesQuery = `
      SELECT 
        s.*,
        array_agg(
          json_build_object(
            'product_id', si.product_id,
            'product_name', p.name,
            'quantity', si.quantity,
            'unit_price', si.unit_price,
            'total_price', si.total_price
          )
        ) as items
      FROM moari.sales s
      LEFT JOIN moari.sale_items si ON s.id = si.sale_id
      LEFT JOIN moari.products p ON si.product_id = p.id
      ${whereClause}
      GROUP BY s.id
    `;
        
    // Adiciona ordenação
    let orderColumn = "s.sale_date";
    if (orderBy === "customer_name") orderColumn = "s.customer_name";
    if (orderBy === "total_amount") orderColumn = "s.total_amount";
    if (orderBy === "payment_method") orderColumn = "s.payment_method";
    if (orderBy === "status") orderColumn = "s.status";
    
    let direction = "DESC";
    if (orderDirection === "asc") direction = "ASC";
    
    salesQuery += ` ORDER BY ${orderColumn} ${direction}`;

    // Adicionar parâmetros de paginação
    const paginationParams = [...queryParams, Number(limit), Number(offset)];
    salesQuery += ` LIMIT $${paginationParams.length - 1} OFFSET $${paginationParams.length}`;

    console.log("✅ Executando consulta de vendas com parâmetros:", paginationParams);
    debugQuery(salesQuery, paginationParams);
    
    const salesResult = await client.query(salesQuery, paginationParams);
    console.log(`📦 Consulta retornou ${salesResult.rows.length} vendas de ${statistics.totalVendas} total filtrado`);

    res.json({
      sales: salesResult.rows,
      statistics,
      total: statistics.totalVendas
    });

  } catch (error: any) {
    console.error("❌ Erro na consulta de vendas:", error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

// POST /sales - Criar nova venda
router.post("/sales", (async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log('\n🚀 === POST /sales DEBUG ===');
    console.log('📦 Request Body completo:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Campos específicos:');
    console.log('  - customer_name:', req.body.customer_name);
    console.log('  - payment_method:', req.body.payment_method);
    console.log('  - total_amount:', req.body.total_amount);
    console.log('  - items:', req.body.items);
    console.log('  - produtos:', req.body.produtos);
    console.log('===============================\n');

    const {
      customer_name,
      customer_email,
      customer_phone,
      payment_method,
      total_amount,
      discount_amount = 0,
      notes,
      status = 'completed',
      items,
      produtos  // ✅ Suporte para ambos os nomes
    } = req.body;

    // ✅ Flexibilidade: aceita tanto 'items' quanto 'produtos'
    const saleItems = items || produtos;

    console.log('\n🔍 === VALIDAÇÃO DOS CAMPOS ===');
    console.log('customer_name:', customer_name, '(tipo:', typeof customer_name, ')');
    console.log('payment_method:', payment_method, '(tipo:', typeof payment_method, ')');
    console.log('total_amount:', total_amount, '(tipo:', typeof total_amount, ')');
    console.log('saleItems:', saleItems, '(tipo:', typeof saleItems, ')');
    console.log('saleItems length:', saleItems ? saleItems.length : 'undefined');
    console.log('==============================\n');

    // ✅ VALIDAÇÃO DETALHADA
    const errors = [];
    
    if (!customer_name || customer_name.trim() === '') {
      errors.push('customer_name é obrigatório');
    }
    
    if (!payment_method || payment_method.trim() === '') {
      errors.push('payment_method é obrigatório');
    }
    
    if (!total_amount || total_amount <= 0) {
      errors.push('total_amount deve ser maior que 0');
    }
    
    if (!saleItems || !Array.isArray(saleItems) || saleItems.length === 0) {
      errors.push('items/produtos deve ser um array com pelo menos um item');
    }

    if (errors.length > 0) {
      console.log('\n❌ === ERROS DE VALIDAÇÃO ===');
      errors.forEach(error => console.log('  -', error));
      console.log('=============================\n');
      
      return res.status(400).json({ 
        error: 'Dados obrigatórios faltando ou inválidos',
        details: errors
      });
    }

    // ✅ VALIDAÇÃO DE ESTOQUE ANTES DE PROCESSAR
    for (const item of saleItems) {
      console.log(`🔍 Verificando estoque do produto ${item.product_id}...`);
      
      const stockCheck = await client.query(
        'SELECT quantity FROM moari.products WHERE id = $1',
        [item.product_id]
      );
      
      if (stockCheck.rowCount === 0) {
        throw new Error(`Produto com ID ${item.product_id} não encontrado`);
      }
      
      const currentStock = stockCheck.rows[0].quantity || 0;
      const shouldUpdateStock = item.update_stock !== false && status === 'completed';
      
      console.log(`📊 Produto ${item.product_id}: estoque atual ${currentStock}, solicitado ${item.quantity}, atualizar estoque: ${shouldUpdateStock}`);
      
      if (shouldUpdateStock && currentStock < item.quantity) {
        throw new Error(`Estoque insuficiente para o produto ${item.product_id}. Disponível: ${currentStock}, Solicitado: ${item.quantity}`);
      }
    }

    // ✅ VALIDAÇÃO ADICIONAL: Verificar se produtos têm estoque suficiente
    for (const item of saleItems) {
      console.log(`🔍 Verificando estoque do produto ${item.product_id}...`);
      
      const stockCheck = await client.query(
        'SELECT quantity, name FROM moari.products WHERE id = $1',
        [item.product_id]
      );
      
      if (stockCheck.rowCount === 0) {
        throw new Error(`Produto com ID ${item.product_id} não encontrado`);
      }
      
      const currentStock = stockCheck.rows[0].quantity || 0;
      const productName = stockCheck.rows[0].name;
      const shouldUpdateStock = item.update_stock !== false && status === 'completed';
      
      console.log(`📊 Produto ${item.product_id} (${productName}): estoque atual ${currentStock}, solicitado ${item.quantity}, atualizar estoque: ${shouldUpdateStock}`);
      
      // ✅ VALIDAÇÃO CRÍTICA: Não permitir venda de produtos sem estoque
      if (currentStock <= 0) {
        throw new Error(`Produto "${productName}" está sem estoque disponível`);
      }
      
      if (shouldUpdateStock && currentStock < item.quantity) {
        throw new Error(`Estoque insuficiente para o produto "${productName}". Disponível: ${currentStock}, Solicitado: ${item.quantity}`);
      }
    }

    console.log('\n📊 === VALORES PARA INSERÇÃO ===');
    console.log('Customer:', customer_name);
    console.log('Payment method:', payment_method);
    console.log('Total amount:', total_amount);
    console.log('Items count:', saleItems.length);
    console.log('Status:', status);
    console.log('===============================\n');

    const insertSaleQuery = `
      INSERT INTO moari.sales (
        customer_name, customer_email, customer_phone, payment_method,
        total_amount, discount_amount, notes, status, sale_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const saleParams = [
      customer_name,
      customer_email,
      customer_phone,
      payment_method,
      total_amount,
      discount_amount,
      notes,
      status
    ];

    debugQuery(insertSaleQuery, saleParams);

    const saleResult = await client.query(insertSaleQuery, saleParams);
    const sale = saleResult.rows[0];

    console.log('\n✅ === VENDA CRIADA ===');
    console.log('Sale ID:', sale.id);
    console.log('======================\n');

    // ✅ INSERIR ITENS E ATUALIZAR ESTOQUE
    for (const item of saleItems) {
      console.log(`📦 Processando item: ${item.product_id} x ${item.quantity}`);
      
      const insertItemQuery = `
        INSERT INTO moari.sale_items (
          sale_id, product_id, quantity, unit_price, total_price
        ) VALUES ($1, $2, $3, $4, $5)
      `;

      const itemParams = [
        sale.id,
        item.product_id,
        item.quantity,
        item.unit_price,
        item.total_price
      ];

      await client.query(insertItemQuery, itemParams);

      // ✅ LÓGICA DE ATUALIZAÇÃO DE ESTOQUE
      const shouldUpdateStock = item.update_stock !== false && status === 'completed';
      
      if (shouldUpdateStock) {
        console.log(`🔄 Atualizando estoque do produto ${item.product_id}: -${item.quantity}`);
        
        const updateStockResult = await client.query(
          'UPDATE moari.products SET quantity = quantity - $1 WHERE id = $2 RETURNING quantity',
          [item.quantity, item.product_id]
        );
        
        const newQuantity = updateStockResult.rows[0]?.quantity;
        console.log(`✅ Novo estoque do produto ${item.product_id}: ${newQuantity}`);
        
        // ✅ ALERTA PARA ESTOQUE BAIXO
        if (newQuantity <= 5) {
          console.log(`⚠️ ALERTA: Estoque baixo para produto ${item.product_id}: ${newQuantity} unidades`);
        }
      } else {
        console.log(`⏭️ Estoque NÃO atualizado para produto ${item.product_id} (update_stock: ${item.update_stock}, status: ${status})`);
      }
    }

    await client.query("COMMIT");
    
    // Buscar venda completa com itens
    const completeSaleQuery = `
      SELECT 
        s.*,
        array_agg(
          json_build_object(
            'product_id', si.product_id,
            'product_name', p.name,
            'quantity', si.quantity,
            'unit_price', si.unit_price,
            'total_price', si.total_price,
            'current_stock', p.quantity
          )
        ) as items
      FROM moari.sales s
      LEFT JOIN moari.sale_items si ON s.id = si.sale_id
      LEFT JOIN moari.products p ON si.product_id = p.id
      WHERE s.id = $1
      GROUP BY s.id
    `;

    const completeSale = await client.query(completeSaleQuery, [sale.id]);
    
    console.log('\n🎉 === VENDA FINAL CRIADA ===');
    console.log('Final sale ID:', completeSale.rows[0].id);
    console.log('Final sale data:', JSON.stringify(completeSale.rows[0], null, 2));
    console.log('===============================\n');
    
    res.status(201).json(completeSale.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error('\n❌ === ERRO NO INSERT ===');
    console.error('Error details:', error);
    
    // ✅ Type-safe error handling
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error type:', typeof error);
    }
    
    console.error('=======================\n');
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
}) as RequestHandler);

// PUT /sales/:id - Atualizar venda
router.put("/sales/:id", (async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    console.log('\n🚀 === PUT /sales/:id DEBUG ===');
    console.log('🆔 Sale ID:', req.params.id);
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('=================================\n');
    
    const { id } = req.params;
    const {
      customer_name,
      customer_email,
      customer_phone,
      payment_method,
      total_amount,
      discount_amount,
      notes,
      status,
      items
    } = req.body;

    // ✅ BUSCAR VENDA ATUAL PARA COMPARAR STATUS
    const currentSaleQuery = await client.query('SELECT status FROM moari.sales WHERE id = $1', [id]);
    
    if (currentSaleQuery.rowCount === 0) {
      throw new Error('Venda não encontrada');
    }
    
    const oldStatus = currentSaleQuery.rows[0].status;
    const newStatus = status;
    
    console.log(`📊 Mudança de status: ${oldStatus} -> ${newStatus}`);

    // ✅ SE ESTÁ MUDANDO PARA 'completed', PRECISA VERIFICAR ESTOQUE
    if (oldStatus !== 'completed' && newStatus === 'completed' && items) {
      console.log('🔍 Verificando estoque para venda que está sendo finalizada...');
      
      for (const item of items) {
        const stockCheck = await client.query(
          'SELECT quantity FROM moari.products WHERE id = $1',
          [item.product_id]
        );
        
        if (stockCheck.rowCount === 0) {
          throw new Error(`Produto com ID ${item.product_id} não encontrado`);
        }
        
        const currentStock = stockCheck.rows[0].quantity || 0;
        
        if (currentStock < item.quantity) {
          throw new Error(`Estoque insuficiente para o produto ${item.product_id}. Disponível: ${currentStock}, Solicitado: ${item.quantity}`);
        }
      }
    }

    // ✅ SE ESTÁ SAINDO DE 'completed', PRECISA DEVOLVER AO ESTOQUE
    if (oldStatus === 'completed' && newStatus !== 'completed') {
      console.log('🔄 Devolvendo itens ao estoque (venda cancelada/pendente)...');
      
      // Buscar itens da venda atual
      const currentItemsQuery = await client.query(
        'SELECT product_id, quantity FROM moari.sale_items WHERE sale_id = $1',
        [id]
      );
      
      for (const currentItem of currentItemsQuery.rows) {
        await client.query(
          'UPDATE moari.products SET quantity = quantity + $1 WHERE id = $2',
          [currentItem.quantity, currentItem.product_id]
        );
        
        console.log(`✅ Devolvido ${currentItem.quantity} unidades do produto ${currentItem.product_id}`);
      }
    }

    const updateQuery = `
      UPDATE moari.sales 
      SET
        customer_name = $1,
        customer_email = $2,
        customer_phone = $3,
        payment_method = $4,
        total_amount = $5,
        discount_amount = $6,
        notes = $7,
        status = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;

    const updateParams = [
      customer_name,
      customer_email,
      customer_phone,
      payment_method,
      total_amount,
      discount_amount,
      notes,
      status,
      id
    ];

    debugQuery(updateQuery, updateParams);
    const saleResult = await client.query(updateQuery, updateParams);

    // ✅ ATUALIZAR ITENS SE FORNECIDOS
    if (items && Array.isArray(items)) {
      // Remover itens existentes
      await client.query('DELETE FROM moari.sale_items WHERE sale_id = $1', [id]);

      // Inserir novos itens
      for (const item of items) {
        const insertItemQuery = `
          INSERT INTO moari.sale_items (
            sale_id, product_id, quantity, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5)
        `;

        const itemParams = [
          id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.total_price
        ];

        await client.query(insertItemQuery, itemParams);

        // ✅ ATUALIZAR ESTOQUE APENAS SE A VENDA ESTÁ COMPLETED
        if (newStatus === 'completed' && oldStatus !== 'completed') {
          await client.query(
            'UPDATE moari.products SET quantity = quantity - $1 WHERE id = $2',
            [item.quantity, item.product_id]
          );
          
          console.log(`🔄 Removido ${item.quantity} unidades do produto ${item.product_id} (venda finalizada)`);
        }
      }
    }

    // Buscar venda atualizada com itens
    const updatedSaleQuery = `
      SELECT 
        s.*,
        array_agg(
          json_build_object(
            'product_id', si.product_id,
            'product_name', p.name,
            'quantity', si.quantity,
            'unit_price', si.unit_price,
            'total_price', si.total_price,
            'current_stock', p.quantity
          )
        ) as items
      FROM moari.sales s
      LEFT JOIN moari.sale_items si ON s.id = si.sale_id
      LEFT JOIN moari.products p ON si.product_id = p.id
      WHERE s.id = $1
      GROUP BY s.id
    `;

    const updatedSale = await client.query(updatedSaleQuery, [id]);

    await client.query("COMMIT");
    
    console.log('\n🎉 === VENDA ATUALIZADA ===');
    console.log('Updated sale:', JSON.stringify(updatedSale.rows[0], null, 2));
    console.log('==========================\n');
    
    res.json(updatedSale.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error('\n❌ === ERRO NO UPDATE ===');
    console.error('Error details:', error);
    console.error('=====================\n');
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
}) as RequestHandler);  

// DELETE /sales/:id - Deletar venda
router.delete('/sales/:id', (async (req: Request, res: Response) => {
  console.log("🗑️ DELETE /sales/:id chamado para ID:", req.params.id);
  
  const client = await pool.connect();
  try {
    const { id } = req.params;
    
    console.log("Iniciando exclusão da venda ID:", id);
    
    await client.query('BEGIN');
    
    // Deletar itens da venda primeiro
    const deleteItemsResult = await client.query(
      'DELETE FROM moari.sale_items WHERE sale_id = $1',
      [id]
    );
    
    console.log("Itens deletados:", deleteItemsResult.rowCount);

    // Deletar a venda
    const result = await client.query(
      'DELETE FROM moari.sales WHERE id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');

    console.log("Resultado da exclusão:", result.rowCount);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }

    res.status(200).json({ 
      message: 'Venda deletada com sucesso',
      deletedSale: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Erro ao deletar venda:", error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
}) as RequestHandler);

// ==================== ROTA PARA VENDA DE CONSIGNADOS ====================

// GET /consignados-vendas/disponiveis - Listar produtos consignados disponíveis para venda
router.get("/consignados-vendas/disponiveis", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    console.log('📋 Listando produtos consignados disponíveis para venda...');

    const { search } = req.query;
    
    let queryParams: any[] = [];
    let conditions: string[] = ['pc.status = $1'];
    queryParams.push('ativo');

    // Adicionar filtro de busca se fornecido
    if (search && search.toString().trim() !== '') {
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
      conditions.push(`(
        p.name ILIKE $${queryParams.length - 2} OR 
        p.code ILIKE $${queryParams.length - 1} OR
        c.nome ILIKE $${queryParams.length}
      )`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        pc.id as consignacao_id,
        pc.product_id,
        pc.quantidade_consignada,
        pc.quantidade_vendida,
        pc.valor_combinado,
        pc.data_consignacao,
        pc.observacoes,
        (pc.quantidade_consignada - COALESCE(pc.quantidade_vendida, 0)) as quantidade_disponivel,
        p.name as product_name,
        p.code as product_code,
        p.base_price,
        p.category,
        c.id as consignado_id,
        c.nome as consignado_nome,
        c.contato as consignado_contato,
        c.telefone as consignado_telefone,
        c.cidade as consignado_cidade,
        c.estado as consignado_estado,
        c.comissao,
        array_agg(pi.image_url ORDER BY pi.order_index) FILTER (WHERE pi.image_url IS NOT NULL) as images
      FROM moari.product_consignados pc
      JOIN moari.products p ON pc.product_id = p.id
      JOIN moari.consignados c ON pc.consignado_id = c.id
      LEFT JOIN moari.product_images pi ON p.id = pi.product_id
      ${whereClause}
      GROUP BY pc.id, p.id, c.id
      HAVING (pc.quantidade_consignada - COALESCE(pc.quantidade_vendida, 0)) > 0
      ORDER BY pc.created_at DESC
    `;

    debugQuery(query, queryParams);

    const result = await client.query(query, queryParams);

    console.log(`✅ Encontrados ${result.rows.length} produtos consignados disponíveis para venda`);

    res.json({
      success: true,
      consignados: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar produtos consignados disponíveis:', error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

// POST /consignados-vendas/registrar - Registrar venda de produto consignado
router.post("/consignados-vendas/registrar", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const {
      consignacaoId,
      quantidadeVendida,
      precoVenda,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod,
      notes,
      desconto = 0
    } = req.body;

    console.log(`💰 Registrando venda de consignado - Consignação ID: ${consignacaoId}`);
    console.log('📦 Dados da venda:', { quantidadeVendida, precoVenda, customerName, paymentMethod });

    // Validações básicas
    if (!consignacaoId || !quantidadeVendida || !precoVenda || !customerName || !paymentMethod) {
      res.status(400).json({ 
        error: 'Dados obrigatórios: consignacaoId, quantidadeVendida, precoVenda, customerName, paymentMethod' 
      });
      return;
    }

    // Buscar informações da consignação
    const consignacaoCheck = await client.query(`
      SELECT 
        pc.*,
        p.name as product_name,
        p.code as product_code,
        p.base_price,
        c.nome as consignado_nome,
        c.comissao
      FROM moari.product_consignados pc
      JOIN moari.products p ON pc.product_id = p.id
      JOIN moari.consignados c ON pc.consignado_id = c.id
      WHERE pc.id = $1 AND pc.status = 'ativo'
    `, [consignacaoId]);

    if (consignacaoCheck.rowCount === 0) {
      res.status(404).json({ error: 'Consignação não encontrada ou já finalizada' });
      return;
    }

    const consignacao = consignacaoCheck.rows[0];

    // Verificar se a quantidade vendida não excede a quantidade consignada
    const quantidadeDisponivelParaVenda = consignacao.quantidade_consignada - (consignacao.quantidade_vendida || 0);
    
    if (quantidadeVendida > quantidadeDisponivelParaVenda) {
      res.status(400).json({ 
        error: `Quantidade inválida. Disponível para venda: ${quantidadeDisponivelParaVenda}` 
      });
      return;
    }

    const valorTotal = (precoVenda * quantidadeVendida) - desconto;
    const comissaoValue = valorTotal * (consignacao.comissao / 100);

    // 1. Criar registro de venda normal
    const saleInsertQuery = `
      INSERT INTO moari.sales (
        customer_name, customer_email, customer_phone, payment_method, 
        total_amount, discount_amount, notes, status, sale_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
      RETURNING *
    `;

    const saleNotes = `${notes || ''}\n[VENDA CONSIGNADA] Produto: ${consignacao.product_name} | Consignado: ${consignacao.consignado_nome}`.trim();

    const saleResult = await client.query(saleInsertQuery, [
      customerName, 
      customerEmail || null, 
      customerPhone || null, 
      paymentMethod,
      valorTotal,
      desconto,
      saleNotes,
      'completed'
    ]);

    const sale = saleResult.rows[0];

    // 2. Criar item da venda
    const saleItemInsertQuery = `
      INSERT INTO moari.sale_items (
        sale_id, product_id, quantity, unit_price, total_price
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    await client.query(saleItemInsertQuery, [
      sale.id,
      consignacao.product_id,
      quantidadeVendida,
      precoVenda,
      precoVenda * quantidadeVendida
    ]);

    // 3. Atualizar quantidade vendida na consignação
    const novaQuantidadeVendida = (consignacao.quantidade_vendida || 0) + quantidadeVendida;
    const statusConsignacao = novaQuantidadeVendida >= consignacao.quantidade_consignada ? 'vendido' : 'ativo';

    await client.query(`
      UPDATE moari.product_consignados 
      SET quantidade_vendida = $1, status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [novaQuantidadeVendida, statusConsignacao, consignacaoId]);

    // 4. Se produto foi totalmente vendido, atualizar status do produto
    if (statusConsignacao === 'vendido') {
      await client.query(
        'UPDATE moari.products SET status = $1 WHERE id = $2',
        ['sold', consignacao.product_id]
      );
      console.log(`✅ Produto ${consignacao.product_id} marcado como vendido`);
    }

    await client.query("COMMIT");
    
    console.log(`✅ Venda de consignado registrada com sucesso - Sale ID: ${sale.id}`);
    
    res.status(201).json({
      success: true,
      sale: sale,
      consignacao: {
        id: consignacaoId,
        quantidadeVendida: novaQuantidadeVendida,
        quantidadeConsignada: consignacao.quantidade_consignada,
        status: statusConsignacao,
        produto: consignacao.product_name,
        consignado: consignacao.consignado_nome,
        comissao: comissaoValue
      },
      message: `Venda registrada com sucesso! ${statusConsignacao === 'vendido' ? 'Produto totalmente vendido.' : 'Produto parcialmente vendido.'}`
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error('❌ Erro ao registrar venda de consignado:', error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

// POST /sales/consignado - Registrar venda de produto consignado
router.post("/sales/consignado", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const {
      consignacaoId,
      quantidadeVendida,
      precoVenda,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod,
      notes,
      desconto = 0
    } = req.body;

    console.log(`💰 Registrando venda de consignado - Consignação ID: ${consignacaoId}`);
    console.log('📦 Dados da venda:', { quantidadeVendida, precoVenda, customerName, paymentMethod });

    // Validações básicas
    if (!consignacaoId || !quantidadeVendida || !precoVenda || !customerName || !paymentMethod) {
      res.status(400).json({ 
        error: 'Dados obrigatórios: consignacaoId, quantidadeVendida, precoVenda, customerName, paymentMethod' 
      });
      return;
    }

    // Buscar informações da consignação
    const consignacaoCheck = await client.query(`
      SELECT 
        pc.*,
        p.name as product_name,
        p.code as product_code,
        p.base_price,
        c.nome as consignado_nome,
        c.comissao
      FROM moari.product_consignados pc
      JOIN moari.products p ON pc.product_id = p.id
      JOIN moari.consignados c ON pc.consignado_id = c.id
      WHERE pc.id = $1 AND pc.status = 'ativo'
    `, [consignacaoId]);

    if (consignacaoCheck.rowCount === 0) {
      res.status(404).json({ error: 'Consignação não encontrada ou já finalizada' });
      return;
    }

    const consignacao = consignacaoCheck.rows[0];

    // Verificar se a quantidade vendida não excede a quantidade consignada
    const quantidadeDisponivelParaVenda = consignacao.quantidade_consignada - (consignacao.quantidade_vendida || 0);
    
    if (quantidadeVendida > quantidadeDisponivelParaVenda) {
      res.status(400).json({ 
        error: `Quantidade inválida. Disponível para venda: ${quantidadeDisponivelParaVenda}` 
      });
      return;
    }

    const valorTotal = (precoVenda * quantidadeVendida) - desconto;
    const comissaoValue = valorTotal * (consignacao.comissao / 100);

    // 1. Criar registro de venda normal
    const saleInsertQuery = `
      INSERT INTO moari.sales (
        customer_name, customer_email, customer_phone, payment_method, 
        total_amount, discount_amount, notes, status, sale_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
      RETURNING *
    `;

    const saleNotes = `${notes || ''}\n[VENDA CONSIGNADA] Produto: ${consignacao.product_name} | Consignado: ${consignacao.consignado_nome}`.trim();

    const saleResult = await client.query(saleInsertQuery, [
      customerName, 
      customerEmail || null, 
      customerPhone || null, 
      paymentMethod,
      valorTotal,
      desconto,
      saleNotes,
      'completed'
    ]);

    const sale = saleResult.rows[0];

    // 2. Criar item da venda
    const saleItemInsertQuery = `
      INSERT INTO moari.sale_items (
        sale_id, product_id, quantity, unit_price, total_price
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    await client.query(saleItemInsertQuery, [
      sale.id,
      consignacao.product_id,
      quantidadeVendida,
      precoVenda,
      precoVenda * quantidadeVendida
    ]);

    // 3. Atualizar quantidade vendida na consignação
    const novaQuantidadeVendida = (consignacao.quantidade_vendida || 0) + quantidadeVendida;
    const statusConsignacao = novaQuantidadeVendida >= consignacao.quantidade_consignada ? 'vendido' : 'ativo';

    await client.query(`
      UPDATE moari.product_consignados 
      SET quantidade_vendida = $1, status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [novaQuantidadeVendida, statusConsignacao, consignacaoId]);

    // 4. Se produto foi totalmente vendido, atualizar status do produto
    if (statusConsignacao === 'vendido') {
      await client.query(
        'UPDATE moari.products SET status = $1 WHERE id = $2',
        ['sold', consignacao.product_id]
      );
      console.log(`✅ Produto ${consignacao.product_id} marcado como vendido`);
    }

    await client.query("COMMIT");
    
    console.log(`✅ Venda de consignado registrada com sucesso - Sale ID: ${sale.id}`);
    
    res.status(201).json({
      success: true,
      sale: sale,
      consignacao: {
        id: consignacaoId,
        quantidadeVendida: novaQuantidadeVendida,
        quantidadeConsignada: consignacao.quantidade_consignada,
        status: statusConsignacao,
        produto: consignacao.product_name,
        consignado: consignacao.consignado_nome,
        comissao: comissaoValue
      },
      message: `Venda registrada com sucesso! ${statusConsignacao === 'vendido' ? 'Produto totalmente vendido.' : 'Produto parcialmente vendido.'}`
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error('❌ Erro ao registrar venda de consignado:', error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

// GET /sales/:id - Buscar venda específica
router.get("/sales/:id", (async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    const saleQuery = `
      SELECT 
        s.*,
        array_agg(
          json_build_object(
            'product_id', si.product_id,
            'product_name', p.name,
            'product_code', p.code,
            'quantity', si.quantity,
            'unit_price', si.unit_price,
            'total_price', si.total_price
          )
        ) as items
      FROM moari.sales s
      LEFT JOIN moari.sale_items si ON s.id = si.sale_id
      LEFT JOIN moari.products p ON si.product_id = p.id
      WHERE s.id = $1
      GROUP BY s.id
    `;

    const result = await client.query(saleQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
}) as RequestHandler);

// GET /next-sale-id - Gerar próximo ID de venda
router.get("/next-sale-id", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const result = await client.query(`
      SELECT 
        COALESCE(MAX(id), 0) + 1 AS next_id 
      FROM moari.sales
    `);
    
    const nextId = result.rows[0].next_id;
    const formattedNextId = nextId.toString().padStart(6, '0');
    
    await client.query('COMMIT');
    
    console.log(`Próximo ID de venda gerado: ${formattedNextId}`);
    
    res.json({ nextId: formattedNextId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao gerar próximo ID de venda:', error);
    res.status(500).json({ error: 'Erro ao gerar ID da venda' });
  } finally {
    client.release();
  }
});

// Rotas de debug
router.get("/test-vendas", (req: Request, res: Response) => {
  res.json({ 
    message: "Rotas de vendas carregadas com sucesso!",
    timestamp: new Date().toISOString()
  });
});

router.get("/debug-vendas-routes", (req: Request, res: Response) => {
  const routes = [
    "GET /api/sales - Listar vendas",
    "POST /api/sales - Criar venda",
    "PUT /api/sales/:id - Atualizar venda", 
    "DELETE /api/sales/:id - Deletar venda",
    "GET /api/sales/:id - Buscar venda específica",
    "GET /api/next-sale-id - Próximo ID",
    "GET /api/test-vendas - Teste de conexão",
    "GET /api/debug-vendas-routes - Esta rota",
    "GET /api/consignados-vendas/disponiveis - Listar produtos consignados para venda",
    "POST /api/consignados-vendas/registrar - Venda de produto consignado"
  ];
  
  res.json({
    message: "Rotas de vendas disponíveis:",
    routes: routes,
    totalRoutes: routes.length
  });
});

// ==================== ROTA PARA VENDA DE CONSIGNADOS ====================

// GET /sales/consignados-disponiveis - Listar produtos consignados disponíveis para venda
router.get("/sales/consignados-disponiveis", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    console.log('📋 Listando produtos consignados disponíveis para venda...');

    const { search } = req.query;
    
    let queryParams: any[] = [];
    let conditions: string[] = ['pc.status = $1'];
    queryParams.push('ativo');

    // Adicionar filtro de busca se fornecido
    if (search && search.toString().trim() !== '') {
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
      conditions.push(`(
        p.name ILIKE $${queryParams.length - 2} OR 
        p.code ILIKE $${queryParams.length - 1} OR
        c.nome ILIKE $${queryParams.length}
      )`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        pc.id as consignacao_id,
        pc.product_id,
        pc.quantidade_consignada,
        pc.quantidade_vendida,
        pc.valor_combinado,
        pc.data_consignacao,
        pc.observacoes,
        (pc.quantidade_consignada - COALESCE(pc.quantidade_vendida, 0)) as quantidade_disponivel,
        p.name as product_name,
        p.code as product_code,
        p.base_price,
        p.category,
        c.id as consignado_id,
        c.nome as consignado_nome,
        c.contato as consignado_contato,
        c.telefone as consignado_telefone,
        c.cidade as consignado_cidade,
        c.estado as consignado_estado,
        c.comissao,
        array_agg(pi.image_url ORDER BY pi.order_index) FILTER (WHERE pi.image_url IS NOT NULL) as images
      FROM moari.product_consignados pc
      JOIN moari.products p ON pc.product_id = p.id
      JOIN moari.consignados c ON pc.consignado_id = c.id
      LEFT JOIN moari.product_images pi ON p.id = pi.product_id
      ${whereClause}
      GROUP BY pc.id, p.id, c.id
      HAVING (pc.quantidade_consignada - COALESCE(pc.quantidade_vendida, 0)) > 0
      ORDER BY pc.created_at DESC
    `;

    debugQuery(query, queryParams);

    const result = await client.query(query, queryParams);

    console.log(`✅ Encontrados ${result.rows.length} produtos consignados disponíveis para venda`);

    res.json({
      success: true,
      consignados: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar produtos consignados disponíveis:', error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

export default router;