import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Download, Calendar, TrendingUp, DollarSign, Package, Users, RefreshCw } from "lucide-react";
import api from "../../../server/api/axiosConfig";
const RelatoriosPage = () => {
    // Estados
    const [periodoSelecionado, setPeriodoSelecionado] = useState("month");
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [salesEvolution, setSalesEvolution] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    // Cores para gráficos
    const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#EF4444', '#F59E0B'];
    // Função para buscar dados de overview
    const fetchOverview = async () => {
        try {
            const response = await api.get(`/reports/overview?period=${periodoSelecionado}`);
            setOverview(response.data);
            console.log('📊 Overview carregado:', response.data);
        }
        catch (error) {
            console.error('❌ Erro ao carregar overview:', error);
        }
    };
    // Função para buscar evolução das vendas
    const fetchSalesEvolution = async () => {
        try {
            const groupBy = periodoSelecionado === 'week' ? 'day' :
                periodoSelecionado === 'month' ? 'day' : 'month';
            const response = await api.get(`/reports/sales-evolution?period=${periodoSelecionado}&groupBy=${groupBy}`);
            setSalesEvolution(response.data.dados || []);
            console.log('📈 Evolução de vendas carregada:', response.data);
        }
        catch (error) {
            console.error('❌ Erro ao carregar evolução de vendas:', error);
            setSalesEvolution([]);
        }
    };
    // Função para buscar performance dos produtos
    const fetchProductsPerformance = async () => {
        try {
            const response = await api.get(`/reports/products-performance?period=${periodoSelecionado}&limit=10`);
            setTopProducts(response.data.topProdutos || []);
            console.log('🏆 Performance de produtos carregada:', response.data);
        }
        catch (error) {
            console.error('❌ Erro ao carregar performance de produtos:', error);
            setTopProducts([]);
        }
    };
    // Função para buscar métodos de pagamento
    const fetchPaymentMethods = async () => {
        try {
            const response = await api.get(`/reports/payment-methods?period=${periodoSelecionado}`);
            setPaymentMethods(response.data.metodosPageamento || []);
            console.log('💳 Métodos de pagamento carregados:', response.data);
        }
        catch (error) {
            console.error('❌ Erro ao carregar métodos de pagamento:', error);
            setPaymentMethods([]);
        }
    };
    // Função para carregar todos os dados
    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchOverview(),
                fetchSalesEvolution(),
                fetchProductsPerformance(),
                fetchPaymentMethods()
            ]);
            setLastUpdate(new Date());
        }
        catch (error) {
            console.error('❌ Erro ao carregar dados dos relatórios:', error);
        }
        finally {
            setLoading(false);
        }
    };
    // Carregar dados quando mudar o período
    useEffect(() => {
        loadAllData();
    }, [periodoSelecionado]);
    // Função para formatar moeda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    // Função para formatar números
    const formatNumber = (value) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    };
    // Função para exportar relatório (placeholder)
    const handleExport = () => {
        alert('Funcionalidade de exportação será implementada em breve!');
    };
    // Preparar dados para gráfico de pizza dos métodos de pagamento
    const paymentChartData = paymentMethods.map((method, index) => ({
        name: method.metodo,
        value: method.receitaTotal,
        percentage: method.percentualReceita,
        color: COLORS[index % COLORS.length]
    }));
    if (loading) {
        return (_jsx("div", { className: "p-6 flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "flex items-center gap-3 text-lg", children: [_jsx(RefreshCw, { className: "w-6 h-6 animate-spin" }), "Carregando relat\u00F3rios..."] }) }));
    }
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-800", children: "Relat\u00F3rios" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["\u00DAltima atualiza\u00E7\u00E3o: ", lastUpdate.toLocaleString('pt-BR')] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("select", { className: "px-4 py-2 border rounded-lg text-gray-600", value: periodoSelecionado, onChange: (e) => setPeriodoSelecionado(e.target.value), children: [_jsx("option", { value: "week", children: "\u00DAltima Semana" }), _jsx("option", { value: "month", children: "\u00DAltimo M\u00EAs" }), _jsx("option", { value: "quarter", children: "\u00DAltimo Trimestre" }), _jsx("option", { value: "year", children: "\u00DAltimo Ano" })] }), _jsxs("button", { onClick: loadAllData, className: "flex items-center px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50", disabled: loading, children: [_jsx(RefreshCw, { className: `w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}` }), "Atualizar"] }), _jsxs("button", { onClick: handleExport, className: "flex items-center px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50", children: [_jsx(Download, { className: "w-5 h-5 mr-2" }), "Exportar"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", children: [_jsx("div", { className: "bg-white p-6 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded", children: _jsx(DollarSign, { className: "h-6 w-6 text-blue-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Faturamento Total" }), _jsx("p", { className: "text-2xl font-semibold text-green-700", children: formatCurrency(overview?.receita.total || 0) }), overview?.receita.crescimento !== undefined && (_jsxs("p", { className: `text-sm ${overview.receita.crescimento >= 0 ? 'text-green-600' : 'text-red-600'}`, children: [overview.receita.crescimento >= 0 ? '+' : '', overview.receita.crescimento.toFixed(1), "% vs per\u00EDodo anterior"] }))] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-green-100 rounded", children: _jsx(TrendingUp, { className: "h-6 w-6 text-green-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Ticket M\u00E9dio" }), _jsx("p", { className: "text-2xl font-semibold text-blue-700", children: formatCurrency(overview?.receita.ticketMedio || 0) }), _jsxs("p", { className: "text-sm text-gray-500", children: [formatNumber(overview?.vendas.concluidas || 0), " vendas conclu\u00EDdas"] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-yellow-100 rounded", children: _jsx(Package, { className: "h-6 w-6 text-yellow-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total de Produtos" }), _jsx("p", { className: "text-2xl font-semibold text-gray-700", children: formatNumber(overview?.produtos.total || 0) }), overview?.produtos.semEstoque ? (_jsxs("p", { className: "text-sm text-red-600", children: [overview.produtos.semEstoque, " sem estoque"] })) : (_jsx("p", { className: "text-sm text-green-600", children: "Todos com estoque" }))] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded", children: _jsx(Calendar, { className: "h-6 w-6 text-purple-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Meta Mensal" }), _jsxs("p", { className: "text-2xl font-semibold text-yellow-700", children: [overview?.receita.meta.percentual || 0, "%"] }), _jsxs("p", { className: "text-sm text-gray-500", children: [formatCurrency(overview?.receita.meta.valor || 0), " meta"] })] })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Evolu\u00E7\u00E3o das Vendas" }), _jsx("div", { className: "h-80", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: salesEvolution, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "periodo" }), _jsx(YAxis, {}), _jsx(Tooltip, { formatter: (value, name) => [
                                                    name === 'receita' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                                                    name === 'receita' ? 'Receita' : name === 'vendasConcluidas' ? 'Vendas' : name
                                                ] }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "receita", fill: "#4F46E5", name: "Receita" }), _jsx(Bar, { dataKey: "vendasConcluidas", fill: "#7C3AED", name: "Vendas" })] }) }) })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "M\u00E9todos de Pagamento" }), _jsx("div", { className: "h-80", children: paymentChartData.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: paymentChartData, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percentage }) => `${name}: ${percentage?.toFixed(1)}%`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: paymentChartData.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value) => formatCurrency(Number(value)) })] }) })) : (_jsx("div", { className: "flex items-center justify-center h-full text-gray-500", children: "Nenhum dado de pagamento dispon\u00EDvel" })) })] })] }), topProducts.length > 0 && (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow mb-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Produtos Mais Vendidos" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Produto" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Categoria" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Unidades Vendidas" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Receita Gerada" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: topProducts.slice(0, 10).map((product, index) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "text-sm font-medium text-gray-900", children: ["#", index + 1, " ", product.produto.nome] }), _jsxs("div", { className: "text-sm text-gray-500 ml-2", children: ["(", product.produto.codigo, ")"] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: product.produto.categoria }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: formatNumber(product.vendas.unidadesVendidas) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold", children: formatCurrency(product.vendas.receitaGerada) })] }, product.produto.id))) })] }) })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center", children: [_jsx(Users, { className: "w-5 h-5 mr-2" }), "Status das Vendas"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-green-600", children: "Conclu\u00EDdas:" }), _jsx("span", { className: "font-semibold", children: overview?.vendas.concluidas || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-yellow-600", children: "Pendentes:" }), _jsx("span", { className: "font-semibold", children: overview?.vendas.pendentes || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-red-600", children: "Canceladas:" }), _jsx("span", { className: "font-semibold", children: overview?.vendas.canceladas || 0 })] }), _jsx("hr", {}), _jsxs("div", { className: "flex justify-between font-semibold", children: [_jsx("span", { children: "Total:" }), _jsx("span", { children: overview?.vendas.total || 0 })] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center", children: [_jsx(Package, { className: "w-5 h-5 mr-2" }), "Status dos Produtos"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-green-600", children: "Ativos:" }), _jsx("span", { className: "font-semibold", children: overview?.produtos.ativos || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-blue-600", children: "Consignados:" }), _jsx("span", { className: "font-semibold", children: overview?.produtos.consignados || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-red-600", children: "Sem Estoque:" }), _jsx("span", { className: "font-semibold", children: overview?.produtos.semEstoque || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-yellow-600", children: "Estoque Baixo:" }), _jsx("span", { className: "font-semibold", children: overview?.produtos.estoqueBaixo || 0 })] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center", children: [_jsx(DollarSign, { className: "w-5 h-5 mr-2" }), "Performance Hoje"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Receita Hoje" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: formatCurrency(overview?.receita.hoje || 0) })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Vendas Hoje" }), _jsx("p", { className: "text-xl font-semibold text-blue-600", children: overview?.vendas.hoje || 0 })] }), overview?.produtos.valorTotalEstoque && (_jsxs("div", { className: "text-center pt-2 border-t", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Valor em Estoque" }), _jsx("p", { className: "text-lg font-semibold text-purple-600", children: formatCurrency(overview.produtos.valorTotalEstoque) })] }))] })] })] })] }));
};
export default RelatoriosPage;
