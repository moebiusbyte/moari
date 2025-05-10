import express, { Router, Request, Response, RequestHandler } from "express";
import { ParamsDictionary } from 'express-serve-static-core';
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { pool, query } from '../../database'; // Importar a função query do arquivo database.ts

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