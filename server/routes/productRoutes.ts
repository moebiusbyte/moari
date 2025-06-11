import express, { Router, Request, Response, RequestHandler } from "express";
import { ParamsDictionary } from 'express-serve-static-core';
import { Pool } from "pg";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const router: Router = express.Router();


interface DeleteProductParams extends ParamsDictionary {
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

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Função helper para debug de queries - adicione no início do arquivo
const debugQuery = (queryText: string, params?: any[]) => {
  console.log('\n🔍 === DEBUG SQL QUERY ===');
  console.log('📝 Query:', queryText);
  console.log('📋 Parameters:', params);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('========================\n');
};

router.put("/products/:id", 
  // Middleware de debug específico
  (req, res, next) => {
    console.log('\n🚀 === PUT /products/:id DEBUG ===');
    console.log('🆔 Product ID:', req.params.id);
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('📁 Files:', req.files ? (req.files as any[]).length : 0);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('=================================\n');
    next();
  },
  upload.array("images", 5), 
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      await client.query("BEGIN");
      
      console.log("PUT /products/:id req.body:", req.body);
      const { id } = req.params;
      const {
        code,
        name,
        category,
        format,
        quality,
        material_type,
        usage_mode,
        size,
        origin,
        warranty,
        base_price,
        profit_margin,
        description,
        status,
        materials,
        removed_images,
        buy_date,     // CAMPO EXISTENTE
        quantity,     // CAMPO EXISTENTE
        supplier_id   // NOVO CAMPO ADICIONADO
      } = req.body;

      // Log específico dos valores que serão atualizados
      console.log('\n📊 === VALORES PARA ATUALIZAÇÃO ===');
      console.log('Status recebido:', status);
      console.log('Base price:', base_price);
      console.log('Profit margin:', profit_margin);
      console.log('Buy date:', buy_date);
      console.log('Quantity:', quantity);
      console.log('Supplier ID:', supplier_id);  // LOG DO NOVO CAMPO
      console.log('ID do produto:', id);
      console.log('===============================\n');

      const updateQuery = `
        UPDATE moari.products 
        SET
          code = $1,
          name = $2,
          category = $3,
          format = $4,
          quality = $5,
          material_type = $6,
          usage_mode = $7,
          size = $8,
          origin = $9,
          warranty = $10,
          base_price = $11,
          profit_margin = $12,
          description = $13,
          status = $14,
          buy_date = $15,
          quantity = $16,
          supplier_id = $17,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $18
        RETURNING *
      `;

      const updateParams = [
        code,
        name,
        category,
        format,
        quality,
        material_type,
        usage_mode,
        size,
        origin,
        warranty,
        base_price,
        profit_margin,
        description,
        status,
        buy_date,
        quantity,
        supplier_id,  // NOVO PARÂMETRO
        id
      ];

      console.log('\n💾 === PARÂMETROS DO UPDATE ===');
      updateParams.forEach((param, index) => {
        console.log(`$${index + 1}:`, param, `(${typeof param})`);
      });
      console.log('===============================\n');

      // Debug da query antes de executar
      debugQuery(updateQuery, updateParams);

      const productResult = await client.query(updateQuery, updateParams);

      console.log('\n✅ === RESULTADO DO UPDATE ===');
      console.log('Rows affected:', productResult.rowCount);
      console.log('Updated product:', productResult.rows[0]);
      console.log('===============================\n');

      if (productResult.rowCount === 0) {
        throw new Error('Produto não encontrado');
      }

      // Atualizar imagens removidas
      if (removed_images && removed_images.length > 0) {
        await client.query(
          'DELETE FROM moari.product_images WHERE product_id = $1 AND image_url = ANY($2)',
          [id, removed_images]
        );
      }

      // Atualizar materiais
      if (materials) {
        await client.query(
          'DELETE FROM moari.product_materials WHERE product_id = $1',
          [id]
        );

        const materialsList = Array.isArray(materials) ? materials : JSON.parse(materials);
        for (const material of materialsList) {
          await client.query(
            'INSERT INTO moari.product_materials (product_id, material_name) VALUES ($1, $2)',
            [id, material]
          );
        }
      }

      // Inserir novas imagens
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const imageUrl = `https://storage.example.com/${uuidv4()}.jpg`;
          await client.query(
            'INSERT INTO moari.product_images (product_id, image_url, order_index) VALUES ($1, $2, $3)',
            [id, imageUrl, i]
          );
        }
      }

      // Buscar produto atualizado com relacionamentos
      const updatedProductQuery = `
        SELECT 
          p.*,
          s.nome as supplier_name,
          array_agg(DISTINCT pm.material_name) as materials,
          array_agg(DISTINCT pi.image_url) as images
        FROM moari.products p
        LEFT JOIN moari.suppliers s ON p.supplier_id = s.id
        LEFT JOIN moari.product_materials pm ON p.id = pm.product_id
        LEFT JOIN moari.product_images pi ON p.id = pi.product_id
        WHERE p.id = $1
        GROUP BY p.id, s.nome
      `;

      const updatedProduct = await client.query(updatedProductQuery, [id]);

      await client.query("COMMIT");
      
      console.log('\n🎉 === PRODUTO FINAL ATUALIZADO ===');
      console.log('Final product:', JSON.stringify(updatedProduct.rows[0], null, 2));
      console.log('===================================\n');
      
      res.json(updatedProduct.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error('\n❌ === ERRO NO UPDATE ===');
      console.error('Error details:', error);
      console.error('=====================\n');
      handleDatabaseError(error, res);
    } finally {
      client.release();
    }
  }
);

const deleteProduct = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    
    await client.query('BEGIN');
    
    await client.query(
      'DELETE FROM moari.product_images WHERE product_id = $1',
      [id]
    );

    await client.query(
      'DELETE FROM moari.product_materials WHERE product_id = $1',
      [id]
    );

    const result = await client.query(
      'DELETE FROM moari.products WHERE id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.status(200).json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
};

const handleDatabaseError = (error: unknown, res: Response): void => {
  console.error("Database error:", error);
  
  // Cast para o tipo ApiError para acessar propriedades de erro comuns
  const apiError = error as ApiError;
  
  // Determinar código de status HTTP apropriado
  let statusCode = 500;
  let errorMessage = 'Erro interno do servidor';
  
  // Verificar se é um erro de violação de chave única
  if (apiError.code === '23505') {
    statusCode = 409; // Conflict
    errorMessage = 'Registro duplicado';
  }
  
  // Verificar se é um erro de violação de restrição
  else if (apiError.code === '23503') {
    statusCode = 400; // Bad Request
    errorMessage = 'Violação de restrição de integridade';
  }
  
  // Enviar resposta de erro ao cliente
  res.status(statusCode).json({
    error: errorMessage,
    details: process.env.NODE_ENV === "development" ? apiError.message : undefined,
  });
};

// Substitua o endpoint /next-product-id atual por esta implementação
router.get("/next-product-id", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    // Iniciar transação
    await client.query('BEGIN');
    
    // Consulta simplificada para obter o maior código numérico
    const result = await client.query(`
      SELECT 
        COALESCE(
          MAX(
            CASE 
              WHEN code ~ '^[0-9]+$' THEN CAST(code AS INTEGER)
              ELSE 0
            END
          ), 
          0
        ) + 1 AS next_id 
      FROM moari.products
    `);
    
    const nextId = result.rows[0].next_id;
    
    // Formatar o código com zeros à esquerda (7 dígitos)
    const formattedNextId = nextId.toString().padStart(7, '0');
    
    await client.query('COMMIT');
    
    console.log(`Próximo código gerado: ${formattedNextId}`);
    
    res.json({ nextId: formattedNextId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao gerar próximo ID:', error);
    res.status(500).json({ error: 'Erro ao gerar ID do produto' });
  } finally {
    client.release();
  }
});

router.get("/test-cors", async (req: Request, res: Response) => {
  try {
    res.json({
      message: "CORS configurado corretamente!",
      timestamp: new Date().toISOString(),
      headers: req.headers,
      origin: req.headers.origin
    });
  } catch (error) {
    console.error("Erro na rota de teste:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Adicione este endpoint ao arquivo productRoutes.ts
router.get("/diagnose-products-table", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    // Verificar se a tabela existe
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'moari' 
        AND table_name = 'products'
      );
    `;
    const tableExists = await client.query(tableExistsQuery);
    
    // Obter estrutura da tabela
    const tableStructureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'moari' AND table_name = 'products';
    `;
    const tableStructure = await client.query(tableStructureQuery);
    
    // Contar registros
    const countQuery = `SELECT COUNT(*) FROM moari.products;`;
    const recordCount = await client.query(countQuery);
    
    // Obter amostra de registros
    const sampleQuery = `SELECT * FROM moari.products LIMIT 5;`;
    const sampleRecords = await client.query(sampleQuery);
    
    // Verificar códigos existentes
    const codesQuery = `
      SELECT code FROM moari.products 
      WHERE code ~ '^[0-9]+$'
      ORDER BY CAST(code AS INTEGER);
    `;
    const existingCodes = await client.query(codesQuery);
    
    res.json({
      tableExists: tableExists.rows[0].exists,
      tableStructure: tableStructure.rows,
      recordCount: recordCount.rows[0].count,
      sampleRecords: sampleRecords.rows,
      existingCodes: existingCodes.rows.map(row => row.code)
    });
  } catch (error: any) { // Explicitamente tipado como 'any' para acessar .message
    console.error('Erro ao diagnosticar tabela de produtos:', error);
    res.status(500).json({ 
      error: 'Erro ao diagnosticar tabela de produtos',
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

router.get("/products", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    console.log("Consulta de produtos recebida com parâmetros:", req.query);
    
    const { 
      page = 1, 
      limit = 10, 
      search, 
      orderBy = "created_at",
      orderDirection = "desc"
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);

    // ✅ CONSTRUIR CONDIÇÕES DOS FILTROS
    let queryParams: any[] = [];
    let conditions: string[] = [];

    // ✅ FILTRO CRÍTICO: APENAS PRODUTOS COM ESTOQUE > 0 (SOMENTE PARA VENDAS)
    // Este filtro deve ser aplicado APENAS quando forSale=true
    const isForSale = req.query.forSale === 'true';
    if (isForSale) {
      conditions.push(`p.quantity > 0`);
      console.log('🛡️ Filtro de estoque aplicado: apenas produtos com quantity > 0 (para venda)');
    } else {
      console.log('📋 Consultando TODOS os produtos (incluindo sem estoque) - tela administrativa');
    }

    // Filtro de busca por nome ou código
    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`(p.name ILIKE $${queryParams.length} OR p.code ILIKE $${queryParams.length})`);
    }

    // Filtro por categoria
    if (req.query.category) {
      queryParams.push(req.query.category);
      conditions.push(`p.category = $${queryParams.length}`);
    }

    // Filtro por status
    if (req.query.fstatus) {
      queryParams.push(req.query.fstatus);
      conditions.push(`p.status = $${queryParams.length}`);
    }

    // Filtro por fornecedor
    if (req.query.ffornecedor) {
      queryParams.push(req.query.ffornecedor);
      conditions.push(`p.supplier_id = $${queryParams.length}`);
    }

    // Filtro tempo em estoque
    if (req.query.tempoestoque) {
      const tempoEstoque = req.query.tempoestoque as string;
      
      switch (tempoEstoque) {
        case "0-1":
          conditions.push(`
            (CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)) >= 0 
            AND (CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)) <= 30
          `);
          break;
        case "1-3":
          conditions.push(`
            (CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)) > 30 
            AND (CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)) <= 90
          `);
          break;
        case "3-6":
          conditions.push(`
            (CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)) > 90 
            AND (CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)) <= 180
          `);
          break;
        case "6+":
          conditions.push(`
            (CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)) > 180
          `);
          break;
      }
    }

    // Construir cláusula WHERE
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    console.log('\n📋 === CONDIÇÕES FINAIS ===');
    console.log('WHERE clause:', whereClause);
    console.log('Parâmetros:', queryParams);
    console.log('É para venda?:', isForSale);
    console.log('===========================\n');

    // Consulta para estatísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total_produtos,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as produtos_ativos,
        COUNT(CASE WHEN status != 'active' OR status IS NULL THEN 1 END) as produtos_inativos,
        COUNT(CASE WHEN has_quality_issues = true THEN 1 END) as produtos_problemas_qualidade,
        COUNT(CASE WHEN status = 'consigned' THEN 1 END) as produtos_consignados,
        COALESCE(SUM(base_price * COALESCE(quantity, 1)), 0) as valor_total_estoque,
        COALESCE(SUM(COALESCE(quantity, 1)), 0) as quantidade_total_estoque,
        COUNT(CASE WHEN (CURRENT_DATE - COALESCE(buy_date, created_at::date)) > 180 THEN 1 END) as produtos_alerta,
        ROUND(AVG(CURRENT_DATE - COALESCE(buy_date, created_at::date)), 0) as tempo_medio_estoque,
        COUNT(CASE WHEN quantity <= 0 THEN 1 END) as produtos_sem_estoque
      FROM moari.products p
      ${whereClause}
    `;

    const statsResult = await client.query(statsQuery, queryParams);
    
    const statistics = {
      totalProdutos: parseInt(statsResult.rows[0].total_produtos) || 0,
      valorTotalEstoque: parseFloat(statsResult.rows[0].valor_total_estoque) || 0,
      quantidadeTotalEstoque: parseInt(statsResult.rows[0].quantidade_total_estoque) || 0,
      tempoMedioEstoque: parseInt(statsResult.rows[0].tempo_medio_estoque) || 0,
      produtosAtivos: parseInt(statsResult.rows[0].produtos_ativos) || 0,
      produtosInativos: parseInt(statsResult.rows[0].produtos_inativos) || 0,
      produtosAlerta: parseInt(statsResult.rows[0].produtos_alerta) || 0,
      produtosProblemasQualidade: parseInt(statsResult.rows[0].produtos_problemas_qualidade) || 0,
      produtosConsignados: parseInt(statsResult.rows[0].produtos_consignados) || 0,
      produtosSemEstoque: parseInt(statsResult.rows[0].produtos_sem_estoque) || 0
    };

    // Query para produtos
    let productsQuery = `
      SELECT 
        p.*,
        p.quantity,
        p.buy_date,
        CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date) as dias_em_estoque,
        CASE 
          WHEN CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date) > 365 THEN 'Mais de 1 ano'
          WHEN CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date) > 180 THEN '6 meses - 1 ano'
          WHEN CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date) > 90 THEN '3-6 meses'
          WHEN CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date) > 30 THEN '1-3 meses'
          ELSE 'Menos de 1 mês'
        END as tempo_estoque_categoria,
        CASE 
          WHEN p.quantity <= 0 THEN 'SEM ESTOQUE'
          WHEN p.quantity <= 5 THEN 'ESTOQUE BAIXO'
          ELSE 'ESTOQUE OK'
        END as status_estoque,
        COALESCE(array_agg(DISTINCT pm.material_name) FILTER (WHERE pm.material_name IS NOT NULL), ARRAY[]::text[]) as materials,
        COALESCE(array_agg(DISTINCT pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL), ARRAY[]::text[]) as images
      FROM moari.products p
      LEFT JOIN moari.product_materials pm ON p.id = pm.product_id
      LEFT JOIN moari.product_images pi ON p.id = pi.product_id
      LEFT JOIN moari.suppliers s ON p.supplier_id = s.id
      ${whereClause}
      GROUP BY p.id
    `;
        
    // Adiciona ordenação
    let orderColumn = "p.created_at";
    if (orderBy === "name") orderColumn = "p.name";
    if (orderBy === "code") orderColumn = "p.code";
    if (orderBy === "category") orderColumn = "p.category";
    if (orderBy === "price") orderColumn = "p.base_price";
    if (orderBy === "quantity") orderColumn = "p.quantity";
    if (orderBy === "buy_date") orderColumn = "p.buy_date";
    if (orderBy === "stock_time") orderColumn = "CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)";
    
    let direction = "DESC";
    if (orderDirection === "asc") direction = "ASC";
    
    productsQuery += ` ORDER BY ${orderColumn} ${direction}`;

    // Adicionar parâmetros de paginação
    const paginationParams = [...queryParams, Number(limit), Number(offset)];
    productsQuery += ` LIMIT $${paginationParams.length - 1} OFFSET $${paginationParams.length}`;

    console.log("✅ Executando consulta de produtos com parâmetros:", paginationParams);
    debugQuery(productsQuery, paginationParams);
    
    const productsResult = await client.query(productsQuery, paginationParams);
    console.log(`📦 Consulta retornou ${productsResult.rows.length} produtos de ${statistics.totalProdutos} total filtrado`);

    res.json({
      products: productsResult.rows,
      statistics,
      total: statistics.totalProdutos
    });

  } catch (error: any) {
    console.error("❌ Erro na consulta de produtos:", error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});


router.get("/debug-stock-time", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    // Query para analisar os dados de tempo em estoque
    const debugQuery = `
      SELECT 
        p.id,
        p.code,
        p.name,
        p.buy_date,
        p.created_at,
        CURRENT_DATE as today,
        COALESCE(p.buy_date, p.created_at::date) as reference_date,
        (CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)) as days_in_stock,
        CASE 
          WHEN (CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)) >= 0 
               AND (CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)) <= 30 THEN '0-1 mês'
          WHEN (CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)) > 30 
               AND (CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)) <= 90 THEN '1-3 meses'
          WHEN (CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)) > 90 
               AND (CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)) <= 180 THEN '3-6 meses'
          WHEN (CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)) > 180 THEN '6+ meses'
          ELSE 'ERRO/NULL'
        END as category
      FROM moari.products p
      ORDER BY days_in_stock
      LIMIT 20;
    `;

    const result = await client.query(debugQuery);
    
    // Análise dos resultados
    const analysis = {
      total_products: result.rows.length,
      categories: {} as { [key: string]: number },
      sample_data: result.rows,
      date_issues: result.rows.filter(row => 
        row.days_in_stock === null || 
        row.days_in_stock < 0 || 
        row.reference_date === null
      ),
      zero_to_thirty: result.rows.filter(row => 
        row.days_in_stock >= 0 && row.days_in_stock <= 30
      ).length
    };

    // Contar por categoria
    result.rows.forEach(row => {
      const cat = row.category as string;
      analysis.categories[cat] = (analysis.categories[cat] || 0) + 1;
    });

    console.log('\n🔍 === DEBUG TEMPO EM ESTOQUE ===');
    console.log('Análise:', JSON.stringify(analysis, null, 2));
    console.log('================================\n');

    res.json(analysis);
  } catch (error) {
    console.error('Erro no debug:', error);
    res.status(500).json({ error: 'Erro no debug' });
  } finally {
    client.release();
  }
});

router.post("/products", 
  // Middleware de debug para POST
  (req, res, next) => {
    console.log('\n🚀 === POST /products DEBUG ===');
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('📁 Files:', req.files ? (req.files as any[]).length : 0);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('===============================\n');
    next();
  },
  upload.array("images", 5), 
  async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      console.log("POST /products req.body:", req.body);

      const {
        code,
        name,
        category,
        format,
        quality,
        material_type,
        usage_mode,
        size,
        origin,
        warranty,
        base_price,
        profit_margin,
        description,
        materials,
        supplier_id,
        buy_date,     // NOVO CAMPO
        quantity      // NOVO CAMPO
      } = req.body;

      // Log específico dos valores que serão inseridos
      console.log('\n📊 === VALORES PARA INSERÇÃO ===');
      console.log('Code:', code);
      console.log('Name:', name);
      console.log('Category:', category);
      console.log('Base price:', base_price);
      console.log('Supplier ID:', supplier_id);
      console.log('Buy date:', buy_date);
      console.log('Quantity:', quantity);
      console.log('===============================\n');

      const insertQuery = `
        INSERT INTO moari.products (
          code, name, category, format, quality, material_type,
          usage_mode, size, origin, warranty, base_price,
          profit_margin, description, supplier_id, buy_date, quantity
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `;

      const insertParams = [
        code,
        name,      
        category,
        format,
        quality,
        material_type,
        usage_mode,
        size,
        origin,
        warranty,
        base_price,
        profit_margin,
        description,
        supplier_id,
        buy_date,    // Se vazio, insere NULL
        quantity        // Se vazio, insere 1
      ];

      console.log('\n💾 === PARÂMETROS DO INSERT ===');
      insertParams.forEach((param, index) => {
        console.log(`$${index + 1}:`, param, `(${typeof param})`);
      });
      console.log('===============================\n');

      // Debug da query antes de executar
      debugQuery(insertQuery, insertParams);

      const productResult = await client.query(insertQuery, insertParams);

      console.log('\n✅ === RESULTADO DO INSERT ===');
      console.log('Produto criado:', productResult.rows[0]);
      console.log('==============================\n');

      const product = productResult.rows[0];

      if (materials) {
        const materialsList = Array.isArray(materials) ? materials : JSON.parse(materials);
        for (const material of materialsList) {
          await client.query(
            "INSERT INTO moari.product_materials (product_id, material_name) VALUES ($1, $2)",
            [product.id, material]
          );
        }
      }

      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const imageUrl = `https://storage.example.com/${uuidv4()}.jpg`;
          await client.query(
            "INSERT INTO moari.product_images (product_id, image_url, order_index) VALUES ($1, $2, $3)",
            [product.id, imageUrl, i]
          );
        }
      }

      await client.query("COMMIT");
      
      console.log('\n🎉 === PRODUTO FINAL CRIADO ===');
      console.log('Final product:', JSON.stringify(product, null, 2));
      console.log('===============================\n');
      
      res.status(201).json(product);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error('\n❌ === ERRO NO INSERT ===');
      console.error('Error details:', error);
      console.error('=======================\n');
      handleDatabaseError(error, res);
    } finally {
      client.release();
    }
  }
);

router.get("/products-for-sale", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { search = '', limit = 50 } = req.query;
    
    let queryParams: any[] = [];
    let conditions: string[] = [];
    
    // ✅ CONDIÇÕES OBRIGATÓRIAS PARA VENDA
    conditions.push("p.status = 'active'");     // Apenas produtos ativos
    conditions.push("p.quantity > 0");          // Apenas com estoque
    
    // Filtro de busca
    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`(p.name ILIKE $${queryParams.length} OR p.code ILIKE $${queryParams.length})`);
    }
    
    const whereClause = `WHERE ${conditions.join(" AND ")}`;
    
    const query = `
      SELECT 
        p.id,
        p.code,
        p.name,
        p.base_price,
        p.profit_margin,
        p.category,
        p.quantity,
        p.base_price * ((p.profit_margin / 100) + 1) as final_price
      FROM moari.products p
      ${whereClause}
      ORDER BY p.name ASC
      LIMIT $${queryParams.length + 1}
    `;
    
    const queryParamsWithLimit = [...queryParams, Number(limit)];
    
    console.log('🛒 Buscando produtos para venda:', query);
    console.log('📋 Parâmetros:', queryParamsWithLimit);
    
    const result = await client.query(query, queryParamsWithLimit);
    
    console.log(`✅ ${result.rows.length} produtos disponíveis para venda encontrados`);
    
    res.json({
      products: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar produtos para venda:', error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

router.delete('/products/:id', (async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    
    await client.query('BEGIN');
    
    await client.query(
      'DELETE FROM moari.product_images WHERE product_id = $1',
      [id]
    );

    await client.query(
      'DELETE FROM moari.product_materials WHERE product_id = $1',
      [id]
    );

    const result = await client.query(
      'DELETE FROM moari.products WHERE id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.status(200).json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
}) as RequestHandler);

export default router;