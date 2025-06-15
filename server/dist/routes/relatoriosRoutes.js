import express from "express";
import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;
dotenv.config();
const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});
// Função helper para debug de queries
const debugQuery = (queryText, params) => {
    console.log('\n🔍 === DEBUG SQL QUERY ===');
    console.log('📝 Query:', queryText);
    console.log('📋 Parameters:', params);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('========================\n');
};
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
// Função helper para calcular datas
const getDateRange = (period) => {
    const now = new Date();
    let startDate;
    switch (period) {
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'quarter':
            const quarterStart = Math.floor(now.getMonth() / 3) * 3;
            startDate = new Date(now.getFullYear(), quarterStart, 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        case 'last30':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case 'last90':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1); // default: mês atual
    }
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
    };
};
// GET /reports/overview - Visão geral consolidada
router.get("/reports/overview", async (req, res) => {
    const client = await pool.connect();
    try {
        console.log("📊 Gerando relatório overview...");
        const { period = 'month', startDate, endDate } = req.query;
        // Determinar intervalo de datas
        let dateRange;
        if (startDate && endDate) {
            dateRange = { startDate: startDate, endDate: endDate };
        }
        else {
            dateRange = getDateRange(period);
        }
        console.log('📅 Período analisado:', dateRange);
        // Query consolidada para overview
        const overviewQuery = `
      WITH sales_data AS (
        SELECT 
          COUNT(*) as total_vendas,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as vendas_concluidas,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as vendas_pendentes,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as vendas_canceladas,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as receita_total,
          COALESCE(AVG(CASE WHEN status = 'completed' THEN total_amount END), 0) as ticket_medio,
          COUNT(CASE WHEN DATE(sale_date) = CURRENT_DATE AND status = 'completed' THEN 1 END) as vendas_hoje,
          COALESCE(SUM(CASE WHEN DATE(sale_date) = CURRENT_DATE AND status = 'completed' THEN total_amount ELSE 0 END), 0) as receita_hoje
        FROM moari.sales 
        WHERE sale_date >= $1::date AND sale_date <= $2::date + INTERVAL '1 day'
      ),
      products_data AS (
        SELECT 
          COUNT(*) as total_produtos,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as produtos_ativos,
          COUNT(CASE WHEN status = 'consigned' THEN 1 END) as produtos_consignados,
          COUNT(CASE WHEN quantity <= 0 THEN 1 END) as produtos_sem_estoque,
          COUNT(CASE WHEN quantity <= 5 AND quantity > 0 THEN 1 END) as produtos_estoque_baixo,
          COALESCE(SUM(base_price * COALESCE(quantity, 1)), 0) as valor_total_estoque,
          COUNT(CASE WHEN (CURRENT_DATE - COALESCE(buy_date, created_at::date)) > 180 THEN 1 END) as produtos_estoque_longo
        FROM moari.products
      ),
      previous_period AS (
        SELECT 
          COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as receita_periodo_anterior
        FROM moari.sales 
        WHERE sale_date >= ($1::date - INTERVAL '1 month') 
          AND sale_date < $1::date
      )
      SELECT 
        s.*,
        p.*,
        pp.receita_periodo_anterior,
        CASE 
          WHEN pp.receita_periodo_anterior > 0 THEN 
            ROUND((s.receita_total - pp.receita_periodo_anterior) / pp.receita_periodo_anterior * 100, 2)
          ELSE 0 
        END as crescimento_receita_percentual
      FROM sales_data s, products_data p, previous_period pp
    `;
        debugQuery(overviewQuery, [dateRange.startDate, dateRange.endDate]);
        const result = await client.query(overviewQuery, [dateRange.startDate, dateRange.endDate]);
        const data = result.rows[0];
        // Calcular meta mensal (assumindo meta de R$ 50.000)
        const metaMensal = 50000;
        const percentualMeta = Math.round((data.receita_total / metaMensal) * 100);
        const overview = {
            periodo: {
                inicio: dateRange.startDate,
                fim: dateRange.endDate,
                tipo: period
            },
            vendas: {
                total: parseInt(data.total_vendas) || 0,
                concluidas: parseInt(data.vendas_concluidas) || 0,
                pendentes: parseInt(data.vendas_pendentes) || 0,
                canceladas: parseInt(data.vendas_canceladas) || 0,
                hoje: parseInt(data.vendas_hoje) || 0
            },
            receita: {
                total: parseFloat(data.receita_total) || 0,
                hoje: parseFloat(data.receita_hoje) || 0,
                ticketMedio: parseFloat(data.ticket_medio) || 0,
                crescimento: parseFloat(data.crescimento_receita_percentual) || 0,
                meta: {
                    valor: metaMensal,
                    percentual: percentualMeta,
                    atingida: percentualMeta >= 100
                }
            },
            produtos: {
                total: parseInt(data.total_produtos) || 0,
                ativos: parseInt(data.produtos_ativos) || 0,
                consignados: parseInt(data.produtos_consignados) || 0,
                semEstoque: parseInt(data.produtos_sem_estoque) || 0,
                estoqueBaixo: parseInt(data.produtos_estoque_baixo) || 0,
                estoqueAntigo: parseInt(data.produtos_estoque_longo) || 0,
                valorTotalEstoque: parseFloat(data.valor_total_estoque) || 0
            }
        };
        console.log('✅ Overview gerado:', overview);
        res.json(overview);
    }
    catch (error) {
        console.error("❌ Erro ao gerar overview:", error);
        handleDatabaseError(error, res);
    }
    finally {
        client.release();
    }
});
// GET /reports/sales-evolution - Evolução das vendas por período
router.get("/reports/sales-evolution", async (req, res) => {
    const client = await pool.connect();
    try {
        console.log("📈 Gerando relatório de evolução de vendas...");
        const { period = 'month', groupBy = 'day' } = req.query;
        const dateRange = getDateRange(period);
        let dateFormat, dateGroup;
        switch (groupBy) {
            case 'hour':
                dateFormat = "YYYY-MM-DD HH24:00";
                dateGroup = "DATE_TRUNC('hour', sale_date)";
                break;
            case 'day':
                dateFormat = "YYYY-MM-DD";
                dateGroup = "DATE_TRUNC('day', sale_date)";
                break;
            case 'week':
                dateFormat = "YYYY-\"W\"WW";
                dateGroup = "DATE_TRUNC('week', sale_date)";
                break;
            case 'month':
                dateFormat = "YYYY-MM";
                dateGroup = "DATE_TRUNC('month', sale_date)";
                break;
            default:
                dateFormat = "YYYY-MM-DD";
                dateGroup = "DATE_TRUNC('day', sale_date)";
        }
        const evolutionQuery = `
      SELECT 
        TO_CHAR(${dateGroup}, '${dateFormat}') as periodo,
        ${dateGroup} as data_ordenacao,
        COUNT(*) as total_vendas,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as vendas_concluidas,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as receita,
        COALESCE(AVG(CASE WHEN status = 'completed' THEN total_amount END), 0) as ticket_medio
      FROM moari.sales 
      WHERE sale_date >= $1::date AND sale_date <= $2::date + INTERVAL '1 day'
      GROUP BY ${dateGroup}
      ORDER BY data_ordenacao ASC
    `;
        debugQuery(evolutionQuery, [dateRange.startDate, dateRange.endDate]);
        const result = await client.query(evolutionQuery, [dateRange.startDate, dateRange.endDate]);
        const evolution = result.rows.map(row => ({
            periodo: row.periodo,
            totalVendas: parseInt(row.total_vendas),
            vendasConcluidas: parseInt(row.vendas_concluidas),
            receita: parseFloat(row.receita),
            ticketMedio: parseFloat(row.ticket_medio)
        }));
        res.json({
            periodo: dateRange,
            agrupamento: groupBy,
            dados: evolution
        });
    }
    catch (error) {
        console.error("❌ Erro ao gerar evolução de vendas:", error);
        handleDatabaseError(error, res);
    }
    finally {
        client.release();
    }
});
// GET /reports/products-performance - Performance dos produtos
router.get("/reports/products-performance", async (req, res) => {
    const client = await pool.connect();
    try {
        console.log("🏆 Gerando relatório de performance de produtos...");
        const { period = 'month', limit = 20 } = req.query;
        const dateRange = getDateRange(period);
        const performanceQuery = `
      SELECT 
        p.id,
        p.code,
        p.name,
        p.category,
        p.base_price,
        p.profit_margin,
        p.quantity as estoque_atual,
        COUNT(si.id) as quantidade_vendida,
        SUM(si.total_price) as receita_gerada,
        AVG(si.unit_price) as preco_medio_venda,
        COUNT(DISTINCT s.id) as numero_vendas,
        COALESCE(SUM(si.quantity), 0) as unidades_vendidas
      FROM moari.products p
      LEFT JOIN moari.sale_items si ON p.id = si.product_id
      LEFT JOIN moari.sales s ON si.sale_id = s.id 
        AND s.status = 'completed' 
        AND s.sale_date >= $1::date 
        AND s.sale_date <= $2::date + INTERVAL '1 day'
      GROUP BY p.id, p.code, p.name, p.category, p.base_price, p.profit_margin, p.quantity
      ORDER BY receita_gerada DESC NULLS LAST
      LIMIT $3
    `;
        debugQuery(performanceQuery, [dateRange.startDate, dateRange.endDate, limit]);
        const result = await client.query(performanceQuery, [dateRange.startDate, dateRange.endDate, limit]);
        const performance = result.rows.map(row => ({
            produto: {
                id: row.id,
                codigo: row.code,
                nome: row.name,
                categoria: row.category,
                precoBase: parseFloat(row.base_price),
                margemLucro: parseFloat(row.profit_margin)
            },
            vendas: {
                unidadesVendidas: parseInt(row.unidades_vendidas) || 0,
                numeroVendas: parseInt(row.numero_vendas) || 0,
                receitaGerada: parseFloat(row.receita_gerada) || 0,
                precoMedioVenda: parseFloat(row.preco_medio_venda) || 0
            },
            estoque: {
                atual: parseInt(row.estoque_atual) || 0,
                status: parseInt(row.estoque_atual) <= 0 ? 'SEM_ESTOQUE' :
                    parseInt(row.estoque_atual) <= 5 ? 'ESTOQUE_BAIXO' : 'OK'
            }
        }));
        // Análise por categoria
        const categoryQuery = `
      SELECT 
        p.category,
        COUNT(DISTINCT p.id) as total_produtos,
        COALESCE(SUM(si.total_price), 0) as receita_categoria,
        COALESCE(SUM(si.quantity), 0) as unidades_vendidas,
        COUNT(DISTINCT s.id) as numero_vendas
      FROM moari.products p
      LEFT JOIN moari.sale_items si ON p.id = si.product_id
      LEFT JOIN moari.sales s ON si.sale_id = s.id 
        AND s.status = 'completed' 
        AND s.sale_date >= $1::date 
        AND s.sale_date <= $2::date + INTERVAL '1 day'
      GROUP BY p.category
      ORDER BY receita_categoria DESC
    `;
        const categoryResult = await client.query(categoryQuery, [dateRange.startDate, dateRange.endDate]);
        const categorias = categoryResult.rows.map(row => ({
            categoria: row.category || 'Sem Categoria',
            totalProdutos: parseInt(row.total_produtos),
            receitaCategoria: parseFloat(row.receita_categoria) || 0,
            unidadesVendidas: parseInt(row.unidades_vendidas) || 0,
            numeroVendas: parseInt(row.numero_vendas) || 0
        }));
        res.json({
            periodo: dateRange,
            topProdutos: performance,
            categorias: categorias
        });
    }
    catch (error) {
        console.error("❌ Erro ao gerar performance de produtos:", error);
        handleDatabaseError(error, res);
    }
    finally {
        client.release();
    }
});
// GET /reports/payment-methods - Análise dos métodos de pagamento
router.get("/reports/payment-methods", async (req, res) => {
    const client = await pool.connect();
    try {
        console.log("💳 Gerando relatório de métodos de pagamento...");
        const { period = 'month' } = req.query;
        const dateRange = getDateRange(period);
        const paymentQuery = `
      SELECT 
        payment_method,
        COUNT(*) as quantidade_vendas,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as vendas_concluidas,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as receita_total,
        COALESCE(AVG(CASE WHEN status = 'completed' THEN total_amount END), 0) as ticket_medio,
        ROUND(
          COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2
        ) as percentual_vendas,
        ROUND(
          COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) * 100.0 / 
          SUM(COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0)) OVER(), 2
        ) as percentual_receita
      FROM moari.sales 
      WHERE sale_date >= $1::date AND sale_date <= $2::date + INTERVAL '1 day'
      GROUP BY payment_method
      ORDER BY receita_total DESC
    `;
        debugQuery(paymentQuery, [dateRange.startDate, dateRange.endDate]);
        const result = await client.query(paymentQuery, [dateRange.startDate, dateRange.endDate]);
        const metodosPageamento = result.rows.map(row => ({
            metodo: row.payment_method,
            quantidadeVendas: parseInt(row.quantidade_vendas),
            vendasConcluidas: parseInt(row.vendas_concluidas),
            receitaTotal: parseFloat(row.receita_total),
            ticketMedio: parseFloat(row.ticket_medio),
            percentualVendas: parseFloat(row.percentual_vendas),
            percentualReceita: parseFloat(row.percentual_receita)
        }));
        res.json({
            periodo: dateRange,
            metodosPageamento: metodosPageamento
        });
    }
    catch (error) {
        console.error("❌ Erro ao gerar relatório de métodos de pagamento:", error);
        handleDatabaseError(error, res);
    }
    finally {
        client.release();
    }
});
// GET /reports/stock-analysis - Análise de estoque
router.get("/reports/stock-analysis", async (req, res) => {
    const client = await pool.connect();
    try {
        console.log("📦 Gerando relatório de análise de estoque...");
        const stockQuery = `
      SELECT 
        p.*,
        CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date) as dias_em_estoque,
        CASE 
          WHEN p.quantity <= 0 THEN 'SEM_ESTOQUE'
          WHEN p.quantity <= 5 THEN 'ESTOQUE_BAIXO'
          WHEN p.quantity <= 20 THEN 'ESTOQUE_MEDIO'
          ELSE 'ESTOQUE_ALTO'
        END as nivel_estoque,
        CASE 
          WHEN CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date) <= 30 THEN 'NOVO'
          WHEN CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date) <= 90 THEN 'RECENTE'
          WHEN CURRENT_DATE - COALESCE(p.buy_date, p.created_at::date) <= 180 THEN 'MEDIO'
          ELSE 'ANTIGO'
        END as tempo_categoria,
        p.base_price * p.quantity as valor_estoque_produto
      FROM moari.products p
      ORDER BY dias_em_estoque DESC
    `;
        debugQuery(stockQuery, []);
        const result = await client.query(stockQuery, []);
        // Análise consolidada
        const analiseEstoque = {
            resumo: {
                totalProdutos: result.rows.length,
                semEstoque: result.rows.filter(p => p.nivel_estoque === 'SEM_ESTOQUE').length,
                estoqueBaixo: result.rows.filter(p => p.nivel_estoque === 'ESTOQUE_BAIXO').length,
                estoqueMedio: result.rows.filter(p => p.nivel_estoque === 'ESTOQUE_MEDIO').length,
                estoqueAlto: result.rows.filter(p => p.nivel_estoque === 'ESTOQUE_ALTO').length,
                produtosAntigos: result.rows.filter(p => p.tempo_categoria === 'ANTIGO').length,
                valorTotalEstoque: result.rows.reduce((sum, p) => sum + parseFloat(p.valor_estoque_produto || 0), 0)
            },
            produtosSemEstoque: result.rows
                .filter(p => p.nivel_estoque === 'SEM_ESTOQUE')
                .map(p => ({
                id: p.id,
                codigo: p.code,
                nome: p.name,
                categoria: p.category,
                diasEmEstoque: p.dias_em_estoque
            })),
            produtosEstoqueBaixo: result.rows
                .filter(p => p.nivel_estoque === 'ESTOQUE_BAIXO')
                .map(p => ({
                id: p.id,
                codigo: p.code,
                nome: p.name,
                categoria: p.category,
                quantidadeAtual: p.quantity,
                diasEmEstoque: p.dias_em_estoque,
                valorEstoque: parseFloat(p.valor_estoque_produto || 0)
            })),
            produtosAntigos: result.rows
                .filter(p => p.tempo_categoria === 'ANTIGO')
                .slice(0, 20) // Top 20 mais antigos
                .map(p => ({
                id: p.id,
                codigo: p.code,
                nome: p.name,
                categoria: p.category,
                quantidadeAtual: p.quantity,
                diasEmEstoque: p.dias_em_estoque,
                valorEstoque: parseFloat(p.valor_estoque_produto || 0),
                status: p.status
            }))
        };
        res.json(analiseEstoque);
    }
    catch (error) {
        console.error("❌ Erro ao gerar análise de estoque:", error);
        handleDatabaseError(error, res);
    }
    finally {
        client.release();
    }
});
// GET /reports/debug-sales - Debug das vendas
router.get("/reports/debug-sales", async (req, res) => {
    const client = await pool.connect();
    try {
        // Teste 1: Verificar se existem vendas
        const allSales = await client.query('SELECT COUNT(*) as total FROM moari.sales');
        // Teste 2: Verificar estrutura da tabela
        const tableInfo = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sales' AND table_schema = 'moari'
    `);
        // Teste 3: Amostra de dados com datas
        const sampleSales = await client.query(`
      SELECT id, customer_name, total_amount, sale_date, status,
             DATE(sale_date AT TIME ZONE 'America/Sao_Paulo') as sale_date_local,
             DATE(NOW() AT TIME ZONE 'America/Sao_Paulo') as today_local
      FROM moari.sales 
      ORDER BY sale_date DESC 
      LIMIT 5
    `);
        // Teste 4: Vendas de hoje especificamente
        const todaySales = await client.query(`
      SELECT COUNT(*) as vendas_hoje, SUM(total_amount) as receita_hoje
      FROM moari.sales 
      WHERE DATE(sale_date AT TIME ZONE 'America/Sao_Paulo') = DATE(NOW() AT TIME ZONE 'America/Sao_Paulo')
        AND status = 'completed'
    `);
        res.json({
            totalSales: allSales.rows[0],
            tableStructure: tableInfo.rows,
            sampleData: sampleSales.rows,
            todayAnalysis: todaySales.rows[0],
            currentTimezone: new Date().toISOString(),
            brazilTime: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        });
    }
    catch (error) {
        res.json({ error: error.message, stack: error.stack });
    }
    finally {
        client.release();
    }
});
// GET /reports/test - Rota de teste
router.get("/reports/test", (req, res) => {
    res.json({
        message: "Rotas de relatórios carregadas com sucesso!",
        timestamp: new Date().toISOString(),
        availableRoutes: [
            "GET /api/reports/overview - Visão geral consolidada",
            "GET /api/reports/sales-evolution - Evolução das vendas",
            "GET /api/reports/products-performance - Performance dos produtos",
            "GET /api/reports/payment-methods - Análise métodos de pagamento",
            "GET /api/reports/stock-analysis - Análise de estoque",
            "GET /api/reports/debug-sales - Debug das vendas",
            "GET /api/reports/test - Esta rota de teste"
        ]
    });
});
export default router;
//# sourceMappingURL=relatoriosRoutes.js.map