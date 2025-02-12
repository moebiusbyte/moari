// src/routes/productRoutes.ts
import express, { Router, Request, Response, RequestHandler } from "express";
import { ParamsDictionary } from 'express-serve-static-core';
import { Pool } from "pg";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const router: Router = express.Router();

// Interface para os parâmetros da rota
interface DeleteProductParams extends ParamsDictionary {
  id: string;
}

// Defina a interface para os parâmetros
interface DeleteParams {
  id: string;
}

// Criar uma única instância do pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Configuração do multer para upload de imagens
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Handler de erro para queries do banco
const handleDatabaseError = (error: any, res: express.Response) => {
  console.error("Database error:", error);
  res.status(500).json({
    error: "Erro interno do servidor",
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
};

// Listar produtos com paginação e filtros
router.get("/products", async (req, res) => {
  const client = await pool.connect();
  try {
    const { page = 1, limit = 10, search, category, quality } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let baseQuery = `
      SELECT 
        p.*,
        array_agg(DISTINCT pm.material_name) as materials,
        array_agg(DISTINCT pi.image_url) as images
      FROM moari.products p
      LEFT JOIN moari.product_materials pm ON p.id = pm.product_id
      LEFT JOIN moari.product_images pi ON p.id = pi.product_id
    `;

    const whereConditions = [];
    const params = [];

    if (search) {
      whereConditions.push(
        `(p.name ILIKE $${params.length + 1} OR p.code ILIKE $${
          params.length + 1
        })`
      );
      params.push(`%${search}%`);
    }

    if (category) {
      whereConditions.push(`p.category = $${params.length + 1}`);
      params.push(category);
    }

    if (quality) {
      whereConditions.push(`p.quality = $${params.length + 1}`);
      params.push(quality);
    }

    if (whereConditions.length > 0) {
      baseQuery += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    baseQuery += `
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await client.query(baseQuery, params);
    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  } finally {
    client.release();
  }
});

// Cadastrar novo produto
router.post("/products", upload.array("images", 5), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("Corpo da requisição:", req.body);
    console.log("Arquivos:", req.files);

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

    // Inserir produto
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

    // Inserir materiais
    if (materials) {
      const materialsList = Array.isArray(materials)
        ? materials
        : JSON.parse(materials);
      for (const material of materialsList) {
        await client.query(
          "INSERT INTO moari.product_materials (product_id, material_name) VALUES ($1, $2)",
          [product.id, material]
        );
      }
    }

    // Processar e salvar imagens
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

// Adicione a rota de DELETE
const deleteProduct: RequestHandler<DeleteParams> = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    
    await client.query('BEGIN');
    
    // Deletar imagens relacionadas
    await client.query(
      'DELETE FROM moari.product_images WHERE product_id = $1',
      [id]
    );

    // Deletar materiais relacionados
    await client.query(
      'DELETE FROM moari.product_materials WHERE product_id = $1',
      [id]
    );

    // Deletar o produto
    const result = await client.query(
      'DELETE FROM moari.products WHERE id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Produto não encontrado' });
      return; // Retorna void
    }

    res.status(200).json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ message: 'Erro ao deletar produto' });
  } finally {
    client.release();
  }
};

// Usar o handler na rota
router.delete('/products/:id', deleteProduct);

export default router;
