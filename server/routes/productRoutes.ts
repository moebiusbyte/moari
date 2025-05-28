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
      category, 
      quality,
      orderBy = "created_at",
      orderDirection = "desc"
    } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);

    // Consulta para obter estatísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total_produtos,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as produtos_ativos,
        COUNT(CASE WHEN status != 'active' OR status IS NULL THEN 1 END) as produtos_inativos,
        COUNT(CASE WHEN has_quality_issues = true THEN 1 END) as produtos_problemas_qualidade,
        COUNT(CASE WHEN status = 'consigned' THEN 1 END) as produtos_consignados,
        COALESCE(SUM(base_price), 0) as valor_total_estoque,
        COUNT(CASE WHEN (CURRENT_DATE - created_at::date) > 180 THEN 1 END) as produtos_alerta
      FROM moari.products
    `;

    console.log("Executando consulta de estatísticas");
    const statsResult = await client.query(statsQuery);
    const statistics = {
      totalProdutos: parseInt(statsResult.rows[0].total_produtos) || 0,
      valorTotalEstoque: parseFloat(statsResult.rows[0].valor_total_estoque) || 0,
      produtosAtivos: parseInt(statsResult.rows[0].produtos_ativos) || 0,
      produtosInativos: parseInt(statsResult.rows[0].produtos_inativos) || 0,
      produtosAlerta: parseInt(statsResult.rows[0].produtos_alerta) || 0,
      produtosProblemasQualidade: parseInt(statsResult.rows[0].produtos_problemas_qualidade) || 0,
      produtosConsignados: parseInt(statsResult.rows[0].produtos_consignados) || 0
    };

    // Query para produtos
    let queryParams: any[] = [];
    let conditions: string[] = [];
    let queryText = `
      SELECT 
        p.*,
        COALESCE(array_agg(DISTINCT pm.material_name) FILTER (WHERE pm.material_name IS NOT NULL), ARRAY[]::text[]) as materials,
        COALESCE(array_agg(DISTINCT pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL), ARRAY[]::text[]) as images
      FROM moari.products p
      LEFT JOIN moari.product_materials pm ON p.id = pm.product_id
      LEFT JOIN moari.product_images pi ON p.id = pi.product_id
      LEFT JOIN moari.suppliers s ON p.supplier_id = s.id
    `;

    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`(p.name ILIKE $${queryParams.length} OR p.code ILIKE $${queryParams.length})`);
    }

    if (category) {
      queryParams.push(category);
      conditions.push(`p.category = $${queryParams.length}`);
    }

    if (quality) {
      queryParams.push(quality);
      conditions.push(`p.quality = $${queryParams.length}`);
    }

    // Add the status filter
    if (req.query.fstatus) {
      queryParams.push(req.query.fstatus);
      conditions.push(`p.status = $${queryParams.length}`);
    }

    // Add the supplier filter
    if (req.query.ffornecedor) {
      queryParams.push(req.query.ffornecedor);
      conditions.push(`p.supplier_id = $${queryParams.length}`);
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(" AND ")}`;
    }

    queryText += ` GROUP BY p.id`;
    
    // Adiciona ordenação
    let orderColumn = "p.created_at";
    if (orderBy === "name") orderColumn = "p.name";
    if (orderBy === "code") orderColumn = "p.code";
    if (orderBy === "category") orderColumn = "p.category";
    if (orderBy === "price") orderColumn = "p.base_price";
    
    let direction = "DESC";
    if (orderDirection === "asc") direction = "ASC";
    
    queryText += ` ORDER BY ${orderColumn} ${direction}`;

    // Adiciona limit e offset
    queryParams.push(Number(limit), Number(offset));
    queryText += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

    console.log("Executando consulta de produtos com parâmetros:", queryParams);
    console.log("Query SQL:", queryText);
    
    const productsResult = await client.query(queryText, queryParams);
    console.log(`Consulta retornou ${productsResult.rows.length} produtos`);

    res.json({
      products: productsResult.rows,
      statistics,
      total: parseInt(statsResult.rows[0].total_produtos)
    });

  } catch (error: any) {
    console.error("Erro na consulta de produtos:", error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

router.post("/products", upload.array("images", 5), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

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
    } = req.body;

    const insertQuery = `
      INSERT INTO moari.products (
        code, name, category, format, quality, material_type,
        usage_mode, size, origin, warranty, base_price,
        profit_margin, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const productResult = await client.query(insertQuery, [
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
    ]);

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
    res.status(201).json(product);
  } catch (error) {
    await client.query("ROLLBACK");
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

router.put("/products/:id", upload.array("images", 5), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
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
      materials,
      removed_images
    } = req.body;

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
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `;

    const productResult = await client.query(updateQuery, [
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
      id
    ]);

    if (productResult.rowCount === 0) {
      throw new Error('Produto não encontrado');
    }

    if (removed_images && removed_images.length > 0) {
      await client.query(
        'DELETE FROM moari.product_images WHERE product_id = $1 AND image_url = ANY($2)',
        [id, removed_images]
      );
    }

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

    const updatedProductQuery = `
      SELECT 
        p.*,
        array_agg(DISTINCT pm.material_name) as materials,
        array_agg(DISTINCT pi.image_url) as images
      FROM moari.products p
      LEFT JOIN moari.product_materials pm ON p.id = pm.product_id
      LEFT JOIN moari.product_images pi ON p.id = pi.product_id
      WHERE p.id = $1
      GROUP BY p.id
    `;

    const updatedProduct = await client.query(updatedProductQuery, [id]);

    await client.query("COMMIT");
    res.json(updatedProduct.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

export default router;