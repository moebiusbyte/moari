import express, { Router, Request, Response, RequestHandler } from "express";
import { ParamsDictionary } from 'express-serve-static-core';
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

const router: Router = express.Router();


interface DeleteSupplierParams {
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
router.get("/diagnose-suppliers-table", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    // Verificar se a tabela existe
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'moari' 
        AND table_name = 'suppliers'
      );
    `;
    const tableExists = await client.query(tableExistsQuery);
    
    // Obter estrutura da tabela
    const tableStructureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'moari' AND table_name = 'suppliers';
    `;
    const tableStructure = await client.query(tableStructureQuery);
    
    // Contar registros
    const countQuery = `SELECT COUNT(*) FROM moari.suppliers;`;
    const recordCount = await client.query(countQuery);
    
    // Obter amostra de registros
    const sampleQuery = `SELECT * FROM moari.suppliers LIMIT 5;`;
    const sampleRecords = await client.query(sampleQuery);
    
    // Verificar códigos existentes
    const codesQuery = `
      SELECT id FROM moari.suppliers 
      WHERE id ~ '^[0-9]+$'
      ORDER BY CAST(id AS INTEGER);
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
    console.error('Erro ao diagnosticar tabela de fornecedores:', error);
    res.status(500).json({ 
      error: 'Erro ao diagnosticar tabela de fornecedores',
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

router.delete("/suppliers/:id", (async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    console.log("Debug - Deletando fornecedor ID:", id);

    // Primeiro, verificar quantos produtos estão associados (opcional, só para log)
    const checkProductsQuery = `
      SELECT COUNT(*) AS product_count
      FROM moari.products
      WHERE supplier_id = $1
    `;
    const productCheck = await client.query(checkProductsQuery, [id]);
    const productCount = parseInt(productCheck.rows[0].product_count, 10);
    
    console.log(`Debug - Fornecedor ${id} possui ${productCount} produtos associados`);

    // Excluir fornecedor diretamente
    const deleteQuery = `
      DELETE FROM moari.suppliers
      WHERE id = $1
      RETURNING *
    `;
    const result = await client.query(deleteQuery, [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ message: "Fornecedor não encontrado" });
      return;
    }

    console.log("Debug - Fornecedor deletado:", result.rows[0]);
    res.status(200).json({ 
      message: "Fornecedor excluído com sucesso",
      deletedSupplier: result.rows[0]
    });
  } catch (error: any) {
    console.error("Erro ao excluir fornecedor:", error);
    
    // Se for erro de constraint (FK), dar uma mensagem mais específica
    if (error.code === '23503') {
      res.status(400).json({ 
        message: `Este fornecedor possui produtos associados e não pode ser excluído devido às restrições do banco de dados. Remova primeiro a associação dos produtos ou use a opção de inativar o fornecedor.`,
        error: "Violação de chave estrangeira",
        suggestion: "Edite os produtos associados para remover a referência ao fornecedor antes de excluí-lo."
      });
    } else {
      handleDatabaseError(error, res);
    }
  } finally {
    client.release();
  }
}) as RequestHandler);

router.put("/suppliers/:id", (async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      nome,
      contato,
      telefone,
      email,
      cidade,
      estado,
      endereco,
      ultima_compra,
    } = req.body;

    console.log("Debug - Atualizando fornecedor ID:", id);
    console.log("Debug - Dados recebidos:", req.body);

    const updateQuery = `
      UPDATE moari.suppliers 
      SET 
        nome = $1,
        contato = $2,
        telefone = $3,
        email = $4,
        cidade = $5,
        estado = $6,
        endereco = $7,
        ultima_compra = $8
      WHERE id = $9
      RETURNING *;
    `;

    const values = [
      nome,
      contato,
      telefone,
      email,
      cidade,
      estado,
      endereco,
      ultima_compra ? new Date(ultima_compra) : null,
      id
    ];

    console.log("Debug - Query SQL:", updateQuery);
    console.log("Debug - Valores enviados:", values);

    const result = await client.query(updateQuery, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Fornecedor não encontrado" });
    }

    console.log("Debug - Fornecedor atualizado:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar fornecedor:", error);
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
}) as RequestHandler);

// Rota GET: Listar fornecedores com filtros, paginação e ordenação
router.get("/suppliers", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const {
      page = 1,
      limit = 10,
      search,
      cidade,
      estado,
      orderBy = "nome",
      orderDirection = "asc",
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let queryParams: any[] = [];
    let conditions: string[] = [];
    let queryText = `
      SELECT *
      FROM moari.suppliers
    `;

    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`(nome ILIKE $${queryParams.length} OR contato ILIKE $${queryParams.length})`);
    }

    if (cidade) {
      queryParams.push(cidade);
      conditions.push(`cidade = $${queryParams.length}`);
    }

    if (estado) {
      queryParams.push(estado);
      conditions.push(`estado = $${queryParams.length}`);
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(" AND ")}`;
    }

    queryText += ` ORDER BY ${orderBy} ${orderDirection === "desc" ? "DESC" : "ASC"}`;
    queryParams.push(Number(limit), Number(offset));
    queryText += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

    const result = await client.query(queryText, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar fornecedores:", error);
    res.status(500).json({ error: "Erro ao listar fornecedores" });
  } finally {
    client.release();
  }
});

// Rota POST: Criar fornecedor
router.post("/suppliers", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const {
      nome,
      contato,
      telefone,
      email,
      cidade,
      estado,
      endereco,
      ultimacompra,
    } = req.body;

    console.log("Debug - Dados recebidos no backend:", req.body);

    // Query para inserir o fornecedor (sem o campo 'id')
    const query = `
      INSERT INTO moari.suppliers (nome, contato, telefone, email, cidade, estado, endereco, ultima_compra)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      nome,
      contato,
      telefone,
      email,
      cidade,
      estado,
      endereco,
      ultimacompra ? new Date(ultimacompra) : null, // Converte para Date se necessário
    ];

    // Log da query e dos valores
    console.log("Debug - Query SQL:", query);
    console.log("Debug - Valores enviados:", values);

    // Executa a query
    const result = await client.query(query, values);

    // Log do resultado retornado pelo banco
    console.log("Debug - Resultado do banco:", result.rows);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao salvar fornecedor no banco:", error);
    res.status(500).json({ error: "Erro ao salvar fornecedor" });
  } finally {
    client.release();
  }
});

// Rota DELETE: Excluir fornecedor
router.delete("/suppliers/:id", async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Verificar produtos ativos associados ao fornecedor
    const activeProductsQuery = `
      SELECT COUNT(*) AS active_products
      FROM moari.products
      WHERE fornecedor_id = $1 AND status = 'ativo'
    `;
    const activeProductsResult = await client.query(activeProductsQuery, [id]);
    const activeProducts = parseInt(activeProductsResult.rows[0].active_products, 10);

    if (activeProducts > 0) {
      res.status(400).json({
        message: `Não é possível excluir o fornecedor. Existem ${activeProducts} produtos ativos associados.`,
      });
    }

    // Excluir fornecedor
    const deleteQuery = `
      DELETE FROM moari.suppliers
      WHERE id = $1
      RETURNING *
    `;
    const result = await client.query(deleteQuery, [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ message: "Fornecedor não encontrado" });
    }

    res.status(200).json({ message: "Fornecedor excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir fornecedor:", error);
    res.status(500).json({ error: "Erro ao excluir fornecedor" });
  } finally {
    client.release();
  }
});

router.get("/next-Supplier-id", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    console.log("Iniciando consulta para obter o próximo código de fornecedor...");
    console.log("Executando consulta para obter o próximo ID usando a coluna 'id'");

    const query = `
      SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) + 1 AS nextId
      FROM moari.suppliers;
    `;
    console.log("Query SQL:", query);

    const result = await client.query(query);
    console.log("Resultado da consulta:", result.rows);

    // Retorna o próximo código
    res.json({ nextId: result.rows[0].nextid }); // Certifique-se de usar "nextid" em minúsculas
  } catch (error) {
    console.error("Erro ao obter próximo código de fornecedor:", error);
    res.status(500).json({ error: "Erro ao obter próximo código de fornecedor" });
  } finally {
    client.release();
  }
});

export default router;