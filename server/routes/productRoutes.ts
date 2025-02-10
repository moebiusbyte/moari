import express from 'express';
import { neon, Pool } from '@neondatabase/serverless';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const router = express.Router();
const sql = neon(process.env.DATABASE_URL!);

// Criar uma única instância do pool de conexões
const pool = new Pool({ connectionString: process.env.DATABASE_URL });


// Configuração do multer para upload de imagens
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Listar produtos com paginação e filtros
router.get('/products', async (req, res, next) => {
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
      whereConditions.push(`(p.name ILIKE $${params.length + 1} OR p.code ILIKE $${params.length + 1})`);
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
      baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    baseQuery += `
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;
    
    params.push(limit, offset);

    const { rows } = await pool.query(baseQuery, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro na consulta:', error);
    next(error);
  }
});
  
// Cadastrar novo produto
router.post('/products', upload.array('images', 5), async (req, res, next) => {
  try {
    const {
      code,
      name,
      category,
      format,
      quality,
      materialType,
      usageMode,
      size,
      origin,
      warranty,
      basePrice,
      profitMargin,
      description,
      materials
    } = req.body;

    // Inserir produto
    const insertQuery = `
      INSERT INTO moari.products (
        code, name, category, format, quality, material_type,
        usage_mode, size, origin, warranty, base_price,
        profit_margin, description
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13
      )
      RETURNING *
    `;

    const [product] = await sql(insertQuery, [
      code, name, category, format, quality, materialType,
      usageMode, size, origin, warranty, basePrice,
      profitMargin, description
    ]);

    // Inserir materiais
    if (materials && materials.length > 0) {
      const materialsList = JSON.parse(materials);
      const materialValues = materialsList.map((material: string) => 
        `(${product.id}, '${material}')`
      ).join(',');

      await sql(`
        INSERT INTO moari.product_materials (product_id, material_name)
        VALUES ${materialValues}
      `);
    }

    // Processar e salvar imagens
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const imageValues = files.map((_, index) => 
        `(${product.id}, 'https://storage.example.com/${uuidv4()}.jpg', ${index})`
      ).join(',');

      await sql(`
        INSERT INTO moari.product_images (product_id, image_url, order_index)
        VALUES ${imageValues}
      `);
    }

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

export default router;