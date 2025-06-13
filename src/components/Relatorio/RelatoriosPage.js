var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Download, Calendar, TrendingUp, DollarSign, Package, Users, RefreshCw } from "lucide-react";
import api from "../../../server/api/axiosConfig";
var RelatoriosPage = function () {
    // Estados
    var _a = useState("month"), periodoSelecionado = _a[0], setPeriodoSelecionado = _a[1];
    var _b = useState(true), loading = _b[0], setLoading = _b[1];
    var _c = useState(null), overview = _c[0], setOverview = _c[1];
    var _d = useState([]), salesEvolution = _d[0], setSalesEvolution = _d[1];
    var _e = useState([]), topProducts = _e[0], setTopProducts = _e[1];
    var _f = useState([]), paymentMethods = _f[0], setPaymentMethods = _f[1];
    var _g = useState(new Date()), lastUpdate = _g[0], setLastUpdate = _g[1];
    // Cores para gráficos
    var COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#EF4444', '#F59E0B'];
    // Função para buscar dados de overview
    var fetchOverview = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api.get("/reports/overview?period=".concat(periodoSelecionado))];
                case 1:
                    response = _a.sent();
                    setOverview(response.data);
                    console.log('📊 Overview carregado:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('❌ Erro ao carregar overview:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Função para buscar evolução das vendas
    var fetchSalesEvolution = function () { return __awaiter(void 0, void 0, void 0, function () {
        var groupBy, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    groupBy = periodoSelecionado === 'week' ? 'day' :
                        periodoSelecionado === 'month' ? 'day' : 'month';
                    return [4 /*yield*/, api.get("/reports/sales-evolution?period=".concat(periodoSelecionado, "&groupBy=").concat(groupBy))];
                case 1:
                    response = _a.sent();
                    setSalesEvolution(response.data.dados || []);
                    console.log('📈 Evolução de vendas carregada:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('❌ Erro ao carregar evolução de vendas:', error_2);
                    setSalesEvolution([]);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Função para buscar performance dos produtos
    var fetchProductsPerformance = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api.get("/reports/products-performance?period=".concat(periodoSelecionado, "&limit=10"))];
                case 1:
                    response = _a.sent();
                    setTopProducts(response.data.topProdutos || []);
                    console.log('🏆 Performance de produtos carregada:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('❌ Erro ao carregar performance de produtos:', error_3);
                    setTopProducts([]);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Função para buscar métodos de pagamento
    var fetchPaymentMethods = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api.get("/reports/payment-methods?period=".concat(periodoSelecionado))];
                case 1:
                    response = _a.sent();
                    setPaymentMethods(response.data.metodosPageamento || []);
                    console.log('💳 Métodos de pagamento carregados:', response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('❌ Erro ao carregar métodos de pagamento:', error_4);
                    setPaymentMethods([]);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Função para carregar todos os dados
    var loadAllData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            fetchOverview(),
                            fetchSalesEvolution(),
                            fetchProductsPerformance(),
                            fetchPaymentMethods()
                        ])];
                case 2:
                    _a.sent();
                    setLastUpdate(new Date());
                    return [3 /*break*/, 5];
                case 3:
                    error_5 = _a.sent();
                    console.error('❌ Erro ao carregar dados dos relatórios:', error_5);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Carregar dados quando mudar o período
    useEffect(function () {
        loadAllData();
    }, [periodoSelecionado]);
    // Função para formatar moeda
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    // Função para formatar números
    var formatNumber = function (value) {
        return new Intl.NumberFormat('pt-BR').format(value);
    };
    // Função para exportar relatório (placeholder)
    var handleExport = function () {
        alert('Funcionalidade de exportação será implementada em breve!');
    };
    // Preparar dados para gráfico de pizza dos métodos de pagamento
    var paymentChartData = paymentMethods.map(function (method, index) { return ({
        name: method.metodo,
        value: method.receitaTotal,
        percentage: method.percentualReceita,
        color: COLORS[index % COLORS.length]
    }); });
    if (loading) {
        return (_jsx("div", { className: "p-6 flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "flex items-center gap-3 text-lg", children: [_jsx(RefreshCw, { className: "w-6 h-6 animate-spin" }), "Carregando relat\u00F3rios..."] }) }));
    }
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-800", children: "Relat\u00F3rios" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["\u00DAltima atualiza\u00E7\u00E3o: ", lastUpdate.toLocaleString('pt-BR')] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("select", { className: "px-4 py-2 border rounded-lg text-gray-600", value: periodoSelecionado, onChange: function (e) { return setPeriodoSelecionado(e.target.value); }, children: [_jsx("option", { value: "week", children: "\u00DAltima Semana" }), _jsx("option", { value: "month", children: "\u00DAltimo M\u00EAs" }), _jsx("option", { value: "quarter", children: "\u00DAltimo Trimestre" }), _jsx("option", { value: "year", children: "\u00DAltimo Ano" })] }), _jsxs("button", { onClick: loadAllData, className: "flex items-center px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50", disabled: loading, children: [_jsx(RefreshCw, { className: "w-5 h-5 mr-2 ".concat(loading ? 'animate-spin' : '') }), "Atualizar"] }), _jsxs("button", { onClick: handleExport, className: "flex items-center px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50", children: [_jsx(Download, { className: "w-5 h-5 mr-2" }), "Exportar"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", children: [_jsx("div", { className: "bg-white p-6 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded", children: _jsx(DollarSign, { className: "h-6 w-6 text-blue-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Faturamento Total" }), _jsx("p", { className: "text-2xl font-semibold text-green-700", children: formatCurrency((overview === null || overview === void 0 ? void 0 : overview.receita.total) || 0) }), (overview === null || overview === void 0 ? void 0 : overview.receita.crescimento) !== undefined && (_jsxs("p", { className: "text-sm ".concat(overview.receita.crescimento >= 0 ? 'text-green-600' : 'text-red-600'), children: [overview.receita.crescimento >= 0 ? '+' : '', overview.receita.crescimento.toFixed(1), "% vs per\u00EDodo anterior"] }))] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-green-100 rounded", children: _jsx(TrendingUp, { className: "h-6 w-6 text-green-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Ticket M\u00E9dio" }), _jsx("p", { className: "text-2xl font-semibold text-blue-700", children: formatCurrency((overview === null || overview === void 0 ? void 0 : overview.receita.ticketMedio) || 0) }), _jsxs("p", { className: "text-sm text-gray-500", children: [formatNumber((overview === null || overview === void 0 ? void 0 : overview.vendas.concluidas) || 0), " vendas conclu\u00EDdas"] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-yellow-100 rounded", children: _jsx(Package, { className: "h-6 w-6 text-yellow-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total de Produtos" }), _jsx("p", { className: "text-2xl font-semibold text-gray-700", children: formatNumber((overview === null || overview === void 0 ? void 0 : overview.produtos.total) || 0) }), (overview === null || overview === void 0 ? void 0 : overview.produtos.semEstoque) ? (_jsxs("p", { className: "text-sm text-red-600", children: [overview.produtos.semEstoque, " sem estoque"] })) : (_jsx("p", { className: "text-sm text-green-600", children: "Todos com estoque" }))] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded", children: _jsx(Calendar, { className: "h-6 w-6 text-purple-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Meta Mensal" }), _jsxs("p", { className: "text-2xl font-semibold text-yellow-700", children: [(overview === null || overview === void 0 ? void 0 : overview.receita.meta.percentual) || 0, "%"] }), _jsxs("p", { className: "text-sm text-gray-500", children: [formatCurrency((overview === null || overview === void 0 ? void 0 : overview.receita.meta.valor) || 0), " meta"] })] })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Evolu\u00E7\u00E3o das Vendas" }), _jsx("div", { className: "h-80", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: salesEvolution, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "periodo" }), _jsx(YAxis, {}), _jsx(Tooltip, { formatter: function (value, name) { return [
                                                    name === 'receita' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                                                    name === 'receita' ? 'Receita' : name === 'vendasConcluidas' ? 'Vendas' : name
                                                ]; } }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "receita", fill: "#4F46E5", name: "Receita" }), _jsx(Bar, { dataKey: "vendasConcluidas", fill: "#7C3AED", name: "Vendas" })] }) }) })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "M\u00E9todos de Pagamento" }), _jsx("div", { className: "h-80", children: paymentChartData.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: paymentChartData, cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                                    var name = _a.name, percentage = _a.percentage;
                                                    return "".concat(name, ": ").concat(percentage === null || percentage === void 0 ? void 0 : percentage.toFixed(1), "%");
                                                }, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: paymentChartData.map(function (entry, index) { return (_jsx(Cell, { fill: entry.color }, "cell-".concat(index))); }) }), _jsx(Tooltip, { formatter: function (value) { return formatCurrency(Number(value)); } })] }) })) : (_jsx("div", { className: "flex items-center justify-center h-full text-gray-500", children: "Nenhum dado de pagamento dispon\u00EDvel" })) })] })] }), topProducts.length > 0 && (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow mb-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Produtos Mais Vendidos" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Produto" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Categoria" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Unidades Vendidas" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Receita Gerada" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: topProducts.slice(0, 10).map(function (product, index) { return (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "text-sm font-medium text-gray-900", children: ["#", index + 1, " ", product.produto.nome] }), _jsxs("div", { className: "text-sm text-gray-500 ml-2", children: ["(", product.produto.codigo, ")"] })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: product.produto.categoria }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: formatNumber(product.vendas.unidadesVendidas) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold", children: formatCurrency(product.vendas.receitaGerada) })] }, product.produto.id)); }) })] }) })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center", children: [_jsx(Users, { className: "w-5 h-5 mr-2" }), "Status das Vendas"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-green-600", children: "Conclu\u00EDdas:" }), _jsx("span", { className: "font-semibold", children: (overview === null || overview === void 0 ? void 0 : overview.vendas.concluidas) || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-yellow-600", children: "Pendentes:" }), _jsx("span", { className: "font-semibold", children: (overview === null || overview === void 0 ? void 0 : overview.vendas.pendentes) || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-red-600", children: "Canceladas:" }), _jsx("span", { className: "font-semibold", children: (overview === null || overview === void 0 ? void 0 : overview.vendas.canceladas) || 0 })] }), _jsx("hr", {}), _jsxs("div", { className: "flex justify-between font-semibold", children: [_jsx("span", { children: "Total:" }), _jsx("span", { children: (overview === null || overview === void 0 ? void 0 : overview.vendas.total) || 0 })] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center", children: [_jsx(Package, { className: "w-5 h-5 mr-2" }), "Status dos Produtos"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-green-600", children: "Ativos:" }), _jsx("span", { className: "font-semibold", children: (overview === null || overview === void 0 ? void 0 : overview.produtos.ativos) || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-blue-600", children: "Consignados:" }), _jsx("span", { className: "font-semibold", children: (overview === null || overview === void 0 ? void 0 : overview.produtos.consignados) || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-red-600", children: "Sem Estoque:" }), _jsx("span", { className: "font-semibold", children: (overview === null || overview === void 0 ? void 0 : overview.produtos.semEstoque) || 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-yellow-600", children: "Estoque Baixo:" }), _jsx("span", { className: "font-semibold", children: (overview === null || overview === void 0 ? void 0 : overview.produtos.estoqueBaixo) || 0 })] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center", children: [_jsx(DollarSign, { className: "w-5 h-5 mr-2" }), "Performance Hoje"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Receita Hoje" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: formatCurrency((overview === null || overview === void 0 ? void 0 : overview.receita.hoje) || 0) })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Vendas Hoje" }), _jsx("p", { className: "text-xl font-semibold text-blue-600", children: (overview === null || overview === void 0 ? void 0 : overview.vendas.hoje) || 0 })] }), (overview === null || overview === void 0 ? void 0 : overview.produtos.valorTotalEstoque) && (_jsxs("div", { className: "text-center pt-2 border-t", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Valor em Estoque" }), _jsx("p", { className: "text-lg font-semibold text-purple-600", children: formatCurrency(overview.produtos.valorTotalEstoque) })] }))] })] })] })] }));
};
export default RelatoriosPage;
