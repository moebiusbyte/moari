import { Router } from "express";
import multer from "multer";
import dotenv from "dotenv";
import { Octokit } from "@octokit/rest";
import pkg from "pg";
const { Pool } = pkg;
dotenv.config();
const router = Router();
// Configurar GitHub
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});
async function uploadToGitHub(fileBuffer, filename) {
    try {
        const base64Content = fileBuffer.toString('base64');
        const repoInfo = await octokit.repos.get({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
        });
        const defaultBranch = repoInfo.data.default_branch;
        console.log(`📋 Branch padrão detectada: ${defaultBranch}`);
        const response = await octokit.repos.createOrUpdateFileContents({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            path: `uploads/products/${filename}`,
            message: `Upload image: ${filename}`,
            content: base64Content,
            branch: defaultBranch,
        });
        const imageUrl = `https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/raw/${defaultBranch}/uploads/products/${filename}`;
        console.log(`📎 URL gerada: ${imageUrl}`);
        return imageUrl;
    }
    catch (error) {
        console.error('Erro no upload para GitHub:', error);
        throw error;
    }
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
const handleDatabaseError = (error, res) => {
    console.error("Database error:", error);
    const apiError = error;
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
// ==================== ROTAS DE CÓDIGO DE BARRAS (MOVIDAS PARA O TOPO) ====================
console.log("🔧 === REGISTRANDO ROTAS DE CÓDIGO DE BARRAS ===");
// 1. Rota de setup da tabela (PRIMEIRA A SER CHAMADA)
router.get("/setup-barcode-table", async (req, res) => {
    const client = await pool.connect();
    try {
        console.log('🔧 Verificando/criando tabela de códigos de barras...');
        const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'moari' 
        AND table_name = 'product_barcodes'
      );
    `);
        if (checkTable.rows[0].exists) {
            console.log('✅ Tabela product_barcodes já existe');
            res.json({
                success: true,
                message: 'Tabela de códigos de barras já existe',
                exists: true
            });
            return;
        }
        await client.query(`
      CREATE TABLE moari.product_barcodes (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES moari.products(id) ON DELETE CASCADE,
        barcode_text VARCHAR(255) NOT NULL,
        barcode_url TEXT,
        config JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await client.query(`CREATE INDEX idx_product_barcodes_product_id ON moari.product_barcodes(product_id);`);
        await client.query(`CREATE INDEX idx_product_barcodes_barcode_text ON moari.product_barcodes(barcode_text);`);
        console.log('✅ Tabela product_barcodes criada com sucesso!');
        res.json({
            success: true,
            message: 'Tabela de códigos de barras criada com sucesso!',
            created: true
        });
    }
    catch (error) {
        console.error('❌ Erro ao criar tabela:', error);
        res.status(500).json({
            error: 'Erro ao criar tabela de códigos de barras',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
    finally {
        client.release();
    }
});
// 2. Rota para listar códigos de barras de um produto
router.get("/products/:id/barcodes", async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        console.log(`📋 Buscando códigos de barras para produto ID: ${id}`);
        // Verificar se a tabela existe primeiro
        const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'moari' 
        AND table_name = 'product_barcodes'
      );
    `);
        if (!tableCheck.rows[0].exists) {
            console.log('❌ Tabela product_barcodes não existe');
            res.status(400).json({
                error: 'Tabela de códigos de barras não existe',
                suggestion: 'Execute GET /api/setup-barcode-table primeiro',
                barcodes: []
            });
            return;
        }
        const query = `
      SELECT pb.*, p.name as product_name, p.code as product_code
      FROM moari.product_barcodes pb
      JOIN moari.products p ON pb.product_id = p.id
      WHERE pb.product_id = $1
      ORDER BY pb.created_at DESC
    `;
        const result = await client.query(query, [id]);
        console.log(`✅ Encontrados ${result.rows.length} códigos de barras para produto ${id}`);
        res.json({
            barcodes: result.rows,
            total: result.rows.length,
            productId: id
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar códigos de barras do produto:', error);
        res.status(500).json({
            error: 'Erro ao buscar códigos de barras',
            barcodes: [],
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
    finally {
        client.release();
    }
});
// 3. Rota para gerar/salvar código de barras (CORRIGIDA)
router.post("/products/:id/generate-barcode", async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { barcodeText, config, imageData } = req.body;
        console.log(`📊 === SALVANDO CÓDIGO DE BARRAS ===`);
        console.log(`🆔 Product ID: ${id}`);
        console.log(`📋 Barcode Text: ${barcodeText}`);
        console.log(`⚙️ Config:`, config);
        console.log(`🖼️ Has Image Data: ${!!imageData}`);
        // 1. Verificar se o produto existe
        const productResult = await client.query('SELECT * FROM moari.products WHERE id = $1', [id]);
        if (productResult.rowCount === 0) {
            console.log(`❌ Produto ${id} não encontrado`);
            res.status(404).json({ error: 'Produto não encontrado' });
            return;
        }
        console.log(`✅ Produto encontrado: ${productResult.rows[0].name}`);
        // 2. Verificar se a tabela existe
        const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'moari' 
        AND table_name = 'product_barcodes'
      );
    `);
        if (!tableCheck.rows[0].exists) {
            console.log(`❌ Tabela product_barcodes não existe`);
            res.status(400).json({
                error: 'Tabela de códigos de barras não existe',
                suggestion: 'Execute GET /api/setup-barcode-table primeiro'
            });
            return;
        }
        console.log(`✅ Tabela product_barcodes existe`);
        // 3. Validar dados obrigatórios
        if (!barcodeText || barcodeText.trim().length === 0) {
            res.status(400).json({
                error: 'Texto do código de barras é obrigatório'
            });
            return;
        }
        // 4. Inserir código de barras
        const insertQuery = `
      INSERT INTO moari.product_barcodes (product_id, barcode_text, config, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING *
    `;
        const insertParams = [
            parseInt(id),
            barcodeText.trim(),
            JSON.stringify(config || {})
        ];
        console.log(`💾 Executando insert com parâmetros:`, insertParams);
        const insertResult = await client.query(insertQuery, insertParams);
        console.log(`✅ Código de barras inserido:`, insertResult.rows[0]);
        res.json({
            success: true,
            barcode: insertResult.rows[0],
            message: 'Código de barras salvo com sucesso',
            product: productResult.rows[0]
        });
        return;
    }
    catch (error) {
        console.error('❌ === ERRO AO SALVAR CÓDIGO DE BARRAS ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error details:', error);
        res.status(500).json({
            error: 'Erro ao salvar código de barras',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        return;
    }
    finally {
        client.release();
    }
});
// 4. Rota para deletar código de barras
router.delete("/barcodes/:barcodeId", async (req, res) => {
    const client = await pool.connect();
    try {
        const { barcodeId } = req.params;
        console.log(`🗑️ Deletando código de barras ID: ${barcodeId}`);
        const result = await client.query('DELETE FROM moari.product_barcodes WHERE id = $1 RETURNING *', [barcodeId]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Código de barras não encontrado' });
            return;
        }
        console.log(`✅ Código de barras ${barcodeId} deletado com sucesso`);
        res.json({
            success: true,
            message: 'Código de barras deletado com sucesso',
            deletedBarcode: result.rows[0]
        });
        return;
    }
    catch (error) {
        console.error('❌ Erro ao deletar código de barras:', error);
        res.status(500).json({
            error: 'Erro ao deletar código de barras',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
        return;
    }
    finally {
        client.release();
    }
});
// 5. Buscar produto por código de barras
router.get("/search-by-barcode/:barcode", async (req, res) => {
    const client = await pool.connect();
    try {
        const { barcode } = req.params;
        console.log(`🔍 Buscando produto por código: "${barcode}"`);
        // Primeiro, tenta buscar na tabela de códigos de barras
        const barcodeQuery = `
      SELECT pb.*, p.*, s.nome as supplier_name
      FROM moari.product_barcodes pb
      JOIN moari.products p ON pb.product_id = p.id
      LEFT JOIN moari.suppliers s ON p.supplier_id = s.id
      WHERE pb.barcode_text = $1
      LIMIT 1
    `;
        const barcodeResult = await client.query(barcodeQuery, [barcode]);
        if ((barcodeResult.rowCount ?? 0) > 0) {
            console.log(`✅ Produto encontrado via código de barras: ${barcodeResult.rows[0].name}`);
            res.json({
                product: barcodeResult.rows[0],
                found: true,
                searchType: 'barcode',
                message: 'Produto encontrado por código de barras registrado'
            });
            return;
        }
        // Se não encontrou, tenta busca por similaridade
        const simpleQuery = `
      SELECT 
        p.*,
        s.nome as supplier_name,
        array_agg(DISTINCT pm.material_name) FILTER (WHERE pm.material_name IS NOT NULL) as materials,
        array_agg(DISTINCT pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) as images
      FROM moari.products p
      LEFT JOIN moari.suppliers s ON p.supplier_id = s.id
      LEFT JOIN moari.product_materials pm ON p.id = pm.product_id
      LEFT JOIN moari.product_images pi ON p.id = pi.product_id
      WHERE 
        p.code ILIKE $1 OR 
        p.name ILIKE $1
      GROUP BY p.id, s.nome
      LIMIT 1
    `;
        const cleanBarcode = barcode.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const result = await client.query(simpleQuery, [`%${barcode}%`]);
        if ((result.rowCount ?? 0) > 0) {
            console.log(`✅ Produto encontrado por similaridade: ${result.rows[0].name}`);
            res.json({
                product: result.rows[0],
                found: true,
                searchType: 'similarity',
                message: 'Produto encontrado por similaridade'
            });
        }
        else {
            console.log(`❌ Nenhum produto encontrado para: "${barcode}"`);
            res.status(404).json({
                error: 'Produto não encontrado para este código de barras',
                searchedFor: barcode,
                found: false,
                message: 'Tente gerar um código de barras primeiro'
            });
        }
    }
    catch (error) {
        console.error('❌ Erro ao buscar produto:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
    finally {
        client.release();
    }
});
// 6. Rotas de teste e debug
router.get("/test-simple", (req, res) => {
    console.log("🧪 Rota de teste simples chamada");
    res.json({
        message: "Rota simples funcionando!",
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
    });
});
router.post("/test-save-barcode", async (req, res) => {
    console.log("🧪 === TESTE DE SALVAMENTO ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Body:", req.body);
    console.log("Params:", req.params);
    console.log("==============================");
    res.json({
        message: "Rota de teste funcionando",
        received: req.body,
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
    });
});
router.get("/debug-barcode-status", (req, res) => {
    res.json({
        message: "Status das rotas de código de barras",
        timestamp: new Date().toISOString(),
        routes: {
            "GET /api/setup-barcode-table": "✅ Configurar tabela",
            "POST /api/products/:id/generate-barcode": "✅ Gerar código",
            "GET /api/products/:id/barcodes": "✅ Listar códigos",
            "GET /api/search-by-barcode/:barcode": "✅ Buscar por código",
            "DELETE /api/barcodes/:barcodeId": "✅ Deletar código"
        },
        testUrls: {
            setupTable: `${req.protocol}://${req.get('host')}/api/setup-barcode-table`,
            generateBarcode: `${req.protocol}://${req.get('host')}/api/products/44/generate-barcode`,
            listBarcodes: `${req.protocol}://${req.get('host')}/api/products/44/barcodes`
        }
    });
});
// Log das rotas de código de barras registradas
console.log("📊 === ROTAS DE CÓDIGO DE BARRAS REGISTRADAS ===");
console.log("✅ GET  /api/test-simple");
console.log("✅ POST /api/test-save-barcode");
console.log("✅ GET  /api/debug-barcode-status");
console.log("✅ GET  /api/setup-barcode-table");
console.log("✅ POST /api/products/:id/generate-barcode");
console.log("✅ GET  /api/products/:id/barcodes");
console.log("✅ GET  /api/search-by-barcode/:barcode");
console.log("✅ DELETE /api/barcodes/:barcodeId");
console.log("===============================================");
// ==================== ROTAS PRINCIPAIS DE PRODUTOS ====================
router.get("/next-product-id", async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
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
        const formattedNextId = nextId.toString().padStart(7, '0');
        await client.query('COMMIT');
        console.log(`Próximo código gerado: ${formattedNextId}`);
        res.json({ nextId: formattedNextId });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao gerar próximo ID:', error);
        res.status(500).json({ error: 'Erro ao gerar ID do produto' });
    }
    finally {
        client.release();
    }
});
router.get("/products", async (req, res) => {
    const client = await pool.connect();
    try {
        console.log("Consulta de produtos recebida com parâmetros:", req.query);
        const { page = 1, limit = 10, search, orderBy = "created_at", orderDirection = "desc" } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let queryParams = [];
        let conditions = [];
        let paramIndex = 1; // ← ADICIONADO: controle manual de índices
        const isForSale = req.query.forSale === 'true';
        if (isForSale) {
            conditions.push(`p.quantity > 0`);
            console.log('🛡️ Filtro de estoque aplicado: apenas produtos com quantity > 0 (para venda)');
        }
        else {
            console.log('📋 Consultando TODOS os produtos (incluindo sem estoque) - tela administrativa');
        }
        // ← CORRIGIDO: Sistema de parâmetros mais robusto
        if (search && search.toString().trim() !== '') {
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
            conditions.push(`(
        p.name ILIKE $${paramIndex} OR 
        p.code ILIKE $${paramIndex + 1} OR
        EXISTS (
          SELECT 1 FROM moari.product_materials pm 
          WHERE pm.product_id = p.id 
          AND pm.material_name ILIKE $${paramIndex + 2}
        )
      )`);
            paramIndex += 3;
            console.log(`🔍 Busca aplicada: "${search}" (nome, código ou material)`);
        }
        if (req.query.category && req.query.category.toString().trim() !== '') {
            queryParams.push(req.query.category);
            conditions.push(`p.category = $${paramIndex}`);
            paramIndex++;
        }
        if (req.query.fstatus && req.query.fstatus.toString().trim() !== '') {
            queryParams.push(req.query.fstatus);
            conditions.push(`p.status = $${paramIndex}`);
            paramIndex++;
        }
        if (req.query.ffornecedor && req.query.ffornecedor.toString().trim() !== '') {
            queryParams.push(req.query.ffornecedor);
            conditions.push(`p.supplier_id = $${paramIndex}`);
            paramIndex++;
        }
        if (req.query.tempoestoque && req.query.tempoestoque.toString().trim() !== '') {
            const tempoEstoque = req.query.tempoestoque;
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
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        // ← SEPARAR consulta de estatísticas da consulta de produtos
        console.log(`🔍 Query params até agora:`, queryParams);
        console.log(`🔍 Conditions:`, conditions);
        console.log(`🔍 Where clause:`, whereClause);
        // Consulta de estatísticas
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
        console.log(`📊 Executando query de estatísticas...`);
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
        // Consulta de produtos
        let productsQuery = `
      SELECT 
        p.*,
        p.quantity,
        p.buy_date,
        s.nome as supplier_name,
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
        COALESCE(array_agg(pi.image_url ORDER BY pi.order_index) FILTER (WHERE pi.image_url IS NOT NULL), ARRAY[]::text[]) as images
      FROM moari.products p
      LEFT JOIN moari.product_materials pm ON p.id = pm.product_id
      LEFT JOIN moari.product_images pi ON p.id = pi.product_id
      LEFT JOIN moari.suppliers s ON p.supplier_id = s.id
      ${whereClause}
      GROUP BY p.id, s.nome
    `;
        // Ordenação
        let orderColumn = "p.created_at";
        if (orderBy === "name")
            orderColumn = "p.name";
        if (orderBy === "code")
            orderColumn = "p.code";
        if (orderBy === "category")
            orderColumn = "p.category";
        if (orderBy === "price")
            orderColumn = "p.base_price";
        if (orderBy === "quantity")
            orderColumn = "p.quantity";
        if (orderBy === "buy_date")
            orderColumn = "p.buy_date";
        if (orderBy === "stock_time")
            orderColumn = "CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date)";
        let direction = "DESC";
        if (orderDirection === "asc")
            direction = "ASC";
        productsQuery += ` ORDER BY ${orderColumn} ${direction}`;
        // ← CORRIGIDO: Criar nova array para paginação
        const paginationParams = [...queryParams, Number(limit), Number(offset)];
        productsQuery += ` LIMIT $${paginationParams.length - 1} OFFSET $${paginationParams.length}`;
        console.log(`📋 Executando query de produtos...`);
        console.log(`📋 Query final:`, productsQuery);
        console.log(`📋 Params finais:`, paginationParams);
        const productsResult = await client.query(productsQuery, paginationParams);
        console.log(`✅ Query executada com sucesso. Produtos encontrados: ${productsResult.rows.length}`);
        // ...após obter o resultado da query, por exemplo:
        console.log("Produtos retornados:");
        const produtos = productsResult.rows;
        produtos.forEach((p) => console.log("Produto:", p.name, p.nome, p.code));
        res.json({
            products: productsResult.rows,
            statistics,
            total: statistics.totalProdutos
        });
    }
    catch (error) {
        console.error("❌ Erro na consulta de produtos:", error);
        console.error("❌ Stack trace:", error.stack);
        handleDatabaseError(error, res);
    }
    finally {
        client.release();
    }
});
router.post("/products", upload.array("images", 5), async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const { code, name, category, format, quality, material_type, usage_mode, size, origin, warranty, base_price, profit_margin, description, materials, supplier_id, buy_date, quantity } = req.body;
        const insertQuery = `
        INSERT INTO moari.products (
          code, name, category, format, quality, material_type,
          usage_mode, size, origin, warranty, base_price,
          profit_margin, description, supplier_id, buy_date, quantity
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `;
        const insertParams = [
            code, name, category, format, quality, material_type,
            usage_mode, size, origin, warranty, base_price,
            profit_margin, description, supplier_id, buy_date, quantity
        ];
        const productResult = await client.query(insertQuery, insertParams);
        const product = productResult.rows[0];
        if (materials) {
            const materialsList = Array.isArray(materials) ? materials : JSON.parse(materials);
            for (const material of materialsList) {
                await client.query("INSERT INTO moari.product_materials (product_id, material_name) VALUES ($1, $2)", [product.id, material]);
            }
        }
        const files = req.files;
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExtension = file.originalname.split('.').pop() || 'jpg';
                const filename = `${product.id}-${i}-${Date.now()}.${fileExtension}`;
                try {
                    const imageUrl = await uploadToGitHub(file.buffer, filename);
                    await client.query('INSERT INTO moari.product_images (product_id, image_url, order_index) VALUES ($1, $2, $3)', [product.id, imageUrl, i]);
                }
                catch (imageError) {
                    console.error(`❌ Erro ao fazer upload da imagem ${i + 1}:`, imageError);
                }
            }
        }
        await client.query("COMMIT");
        res.status(201).json(product);
    }
    catch (error) {
        await client.query("ROLLBACK");
        handleDatabaseError(error, res);
    }
    finally {
        client.release();
    }
});
router.put("/products/:id", upload.array("images", 5), async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const { id } = req.params;
        const { code, name, category, format, quality, material_type, usage_mode, size, origin, warranty, base_price, profit_margin, description, status, materials, removed_images, buy_date, quantity, supplier_id } = req.body;
        const updateQuery = `
        UPDATE moari.products 
        SET
          code = $1, name = $2, category = $3, format = $4, quality = $5, material_type = $6,
          usage_mode = $7, size = $8, origin = $9, warranty = $10, base_price = $11,
          profit_margin = $12, description = $13, status = $14, buy_date = $15,
          quantity = $16, supplier_id = $17, updated_at = CURRENT_TIMESTAMP
        WHERE id = $18
        RETURNING *
      `;
        const updateParams = [
            code, name, category, format, quality, material_type,
            usage_mode, size, origin, warranty, base_price,
            profit_margin, description, status, buy_date,
            quantity, supplier_id, id
        ];
        const productResult = await client.query(updateQuery, updateParams);
        if (productResult.rowCount === 0) {
            throw new Error('Produto não encontrado');
        }
        if (removed_images && removed_images.length > 0) {
            await client.query('DELETE FROM moari.product_images WHERE product_id = $1 AND image_url = ANY($2)', [id, removed_images]);
        }
        if (materials) {
            await client.query('DELETE FROM moari.product_materials WHERE product_id = $1', [id]);
            const materialsList = Array.isArray(materials) ? materials : JSON.parse(materials);
            for (const material of materialsList) {
                await client.query('INSERT INTO moari.product_materials (product_id, material_name) VALUES ($1, $2)', [id, material]);
            }
        }
        const files = req.files;
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExtension = file.originalname.split('.').pop() || 'jpg';
                const filename = `${id}-edit-${i}-${Date.now()}.${fileExtension}`;
                try {
                    const imageUrl = await uploadToGitHub(file.buffer, filename);
                    await client.query('INSERT INTO moari.product_images (product_id, image_url, order_index) VALUES ($1, $2, $3)', [id, imageUrl, i]);
                }
                catch (imageError) {
                    console.error(`❌ Erro ao fazer upload da nova imagem ${i + 1}:`, imageError);
                }
            }
        }
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
        res.json(updatedProduct.rows[0]);
    }
    catch (error) {
        await client.query("ROLLBACK");
        handleDatabaseError(error, res);
    }
    finally {
        client.release();
    }
});
router.delete('/products/:id', (async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');
        await client.query('DELETE FROM moari.product_images WHERE product_id = $1', [id]);
        await client.query('DELETE FROM moari.product_materials WHERE product_id = $1', [id]);
        const result = await client.query('DELETE FROM moari.products WHERE id = $1 RETURNING *', [id]);
        await client.query('COMMIT');
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        res.status(200).json({ message: 'Produto deletado com sucesso' });
    }
    catch (error) {
        await client.query('ROLLBACK');
        handleDatabaseError(error, res);
    }
    finally {
        client.release();
    }
}));
export default router;
//# sourceMappingURL=productRoutes.js.map