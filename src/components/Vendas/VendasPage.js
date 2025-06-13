var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, ArrowLeft, ArrowRight, Filter, DollarSign, TrendingUp, Calendar, Users, X, Eye } from "lucide-react";
import FormularioVenda from "./FormularioVenda";
import EditSaleModal from './EditSaleModal';
import DeleteSaleModal from './DeleteSaleModal';
import SaleDetailsModal from './SaleDetailsModal';
import api from "../../../server/api/axiosConfig";
// Modal Component
var Modal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, title = _a.title, children = _a.children, _b = _a.size, size = _b === void 0 ? "max-w-xl" : _b;
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", children: _jsxs("div", { className: "bg-white rounded-lg p-6 ".concat(size, " w-full mx-4 max-h-[90vh] overflow-y-auto"), children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: title }), _jsx("button", { onClick: onClose, className: "p-1 hover:bg-gray-100 rounded-full", children: _jsx(X, { className: "w-5 h-5" }) })] }), children] }) }));
};
var VendasPage = function () {
    // Estados para modais
    var _a = useState(false), editModalOpen = _a[0], setEditModalOpen = _a[1];
    var _b = useState(false), deleteModalOpen = _b[0], setDeleteModalOpen = _b[1];
    var _c = useState(false), detailsModalOpen = _c[0], setDetailsModalOpen = _c[1];
    var _d = useState(null), selectedSale = _d[0], setSelectedSale = _d[1];
    var _e = useState(false), isModalOpen = _e[0], setIsModalOpen = _e[1];
    // Estados para dados e paginação
    var _f = useState([]), sales = _f[0], setSales = _f[1];
    var _g = useState(true), loading = _g[0], setLoading = _g[1];
    var _h = useState(1), page = _h[0], setPage = _h[1];
    var _j = useState(1), totalPages = _j[0], setTotalPages = _j[1];
    var _k = useState(""), searchTerm = _k[0], setSearchTerm = _k[1];
    // Estados para filtros avançados
    var _l = useState({
        paymentMethod: "",
        status: "",
        dateFrom: "",
        dateTo: ""
    }), filtroAvancado = _l[0], setFiltroAvancado = _l[1];
    // Estado para ordenação
    var _m = useState({
        campo: "sale_date",
        ordem: "desc"
    }), ordenacao = _m[0], setOrdenacao = _m[1];
    // Estado para estatísticas
    var _o = useState({
        totalVendas: 0,
        vendasConcluidas: 0,
        vendasPendentes: 0,
        vendasCanceladas: 0,
        receitaTotal: 0,
        ticketMedio: 0,
        vendasHoje: 0,
        receitaHoje: 0
    }), estatisticas = _o[0], setEstatisticas = _o[1];
    // Função para buscar vendas
    var fetchSales = function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, fullUrl, response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    console.log('\n🚀 === DEBUG FILTROS VENDAS ===');
                    console.log('Estado filtroAvancado:', JSON.stringify(filtroAvancado, null, 2));
                    console.log('================================\n');
                    params = new URLSearchParams({
                        page: page.toString(),
                        limit: "10",
                        search: searchTerm,
                        orderBy: ordenacao.campo,
                        orderDirection: ordenacao.ordem,
                        paymentMethod: filtroAvancado.paymentMethod,
                        status: filtroAvancado.status,
                        dateFrom: filtroAvancado.dateFrom,
                        dateTo: filtroAvancado.dateTo
                    });
                    console.log('📤 Parâmetros enviados para a API:', {
                        page: page.toString(),
                        limit: "10",
                        search: searchTerm,
                        orderBy: ordenacao.campo,
                        orderDirection: ordenacao.ordem,
                        paymentMethod: filtroAvancado.paymentMethod,
                        status: filtroAvancado.status,
                        dateFrom: filtroAvancado.dateFrom,
                        dateTo: filtroAvancado.dateTo
                    });
                    fullUrl = "/sales?".concat(params);
                    console.log('🌐 URL completa:', fullUrl);
                    return [4 /*yield*/, api.get(fullUrl)];
                case 1:
                    response = _b.sent();
                    console.log('\n📥 === RESPOSTA DA API ===');
                    console.log('Total de vendas retornadas:', (_a = response.data.sales) === null || _a === void 0 ? void 0 : _a.length);
                    console.log('Estatísticas recebidas:', response.data.statistics);
                    console.log('Total filtrado:', response.data.total);
                    console.log('==========================\n');
                    if (response.data && response.data.sales) {
                        setSales(response.data.sales);
                        setTotalPages(Math.ceil(response.data.total / 10));
                        if (response.data.statistics) {
                            console.log('✅ Atualizando estatísticas:', response.data.statistics);
                            setEstatisticas(response.data.statistics);
                        }
                    }
                    else {
                        console.error("Resposta da API em formato inesperado:", response.data);
                        setSales([]);
                        setTotalPages(0);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error("Erro ao buscar vendas:", error_1);
                    setSales([]);
                    setTotalPages(0);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Atualizar vendas quando mudar página, busca ou filtros
    useEffect(function () {
        console.log('\n🔄 === useEffect TRIGGERED ===');
        console.log('Page changed:', page);
        console.log('SearchTerm changed:', searchTerm);
        console.log('FiltroAvancado changed:', filtroAvancado);
        console.log('Ordenacao changed:', ordenacao);
        console.log('Calling fetchSales...');
        console.log('==============================\n');
        fetchSales();
    }, [page, searchTerm, filtroAvancado, ordenacao]);
    // Handler para visualizar detalhes da venda
    var handleViewSale = function (sale) {
        setSelectedSale(sale);
        setDetailsModalOpen(true);
    };
    // Handler para edição de venda
    var handleEditSale = function (sale) {
        setSelectedSale(sale);
        setEditModalOpen(true);
    };
    // Handler para nova venda
    var handleNewSale = function () {
        setIsModalOpen(true);
    };
    // Handler para atualização de venda
    var handleUpdateSale = function (updatedSale) { return __awaiter(void 0, void 0, void 0, function () {
        var response_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!(selectedSale === null || selectedSale === void 0 ? void 0 : selectedSale.id)) {
                        throw new Error('ID da venda não encontrado');
                    }
                    console.log('🔍 Updated sale data received:', updatedSale);
                    return [4 /*yield*/, api.put("/sales/".concat(selectedSale.id), updatedSale)];
                case 1:
                    response_1 = _a.sent();
                    console.log('✅ Response from backend:', response_1.data);
                    // Atualizar lista de vendas
                    setSales(function (prevSales) {
                        return prevSales.map(function (s) {
                            return s.id.toString() === selectedSale.id.toString() ? response_1.data : s;
                        });
                    });
                    setEditModalOpen(false);
                    setSelectedSale(null);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('❌ Erro ao atualizar venda:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Handler para exclusão de venda
    var handleDeleteSale = function (saleId) {
        var sale = sales.find(function (s) { return s.id.toString() === saleId.toString(); });
        if (sale) {
            setSelectedSale(sale);
            setDeleteModalOpen(true);
        }
    };
    // Handler para confirmação de exclusão
    var handleConfirmDelete = function (saleId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api.delete("/sales/".concat(saleId))];
                case 1:
                    _a.sent();
                    setSales(function (prevSales) { return prevSales.filter(function (s) { return s.id.toString() !== saleId.toString(); }); });
                    setDeleteModalOpen(false);
                    setSelectedSale(null);
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Erro ao excluir venda:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Handler para salvar nova venda
    var handleSaveVenda = function (vendaData) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_4;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 3, , 4]);
                    console.log('\n🚀 === DEBUG HANDLESA_VENDA ===');
                    console.log('🎯 Dados recebidos no handleSaveVenda:', JSON.stringify(vendaData, null, 2));
                    console.log('🌐 URL da API:', '/sales');
                    console.log('📡 Método:', 'POST');
                    console.log('===============================\n');
                    return [4 /*yield*/, api.post('/sales', vendaData)];
                case 1:
                    response = _e.sent();
                    console.log('\n✅ === RESPOSTA DA API ===');
                    console.log('Status:', response.status);
                    console.log('Data:', response.data);
                    console.log('========================\n');
                    alert('Venda salva com sucesso!');
                    return [4 /*yield*/, fetchSales()];
                case 2:
                    _e.sent(); // Recarregar a lista
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _e.sent();
                    console.error('\n❌ === ERRO COMPLETO ===');
                    console.error('Error object:', error_4);
                    if (error_4 instanceof Error) {
                        console.error('Error message:', error_4.message);
                    }
                    if (error_4.response) {
                        console.error('Error response:', error_4.response);
                        console.error('Error config:', error_4.config);
                        console.error('Request data sent:', (_a = error_4.config) === null || _a === void 0 ? void 0 : _a.data);
                        console.error('Request headers:', (_b = error_4.config) === null || _b === void 0 ? void 0 : _b.headers);
                    }
                    console.error('======================\n');
                    console.error('❌ Erro ao salvar venda:', error_4);
                    alert('Erro ao salvar venda: ' + (((_d = (_c = error_4.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) || error_4.message));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Função para formatar data
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };
    // Função para formatar moeda
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    // Função para obter a cor do status
    var getStatusColor = function (status) {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    // Função para obter o texto do status
    var getStatusText = function (status) {
        switch (status) {
            case 'completed':
                return 'Concluída';
            case 'pending':
                return 'Pendente';
            case 'cancelled':
                return 'Cancelada';
            default:
                return 'Desconhecido';
        }
    };
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-800", children: "Vendas" }), _jsxs("button", { onClick: handleNewSale, className: "flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: [_jsx(Plus, { size: 20, className: "mr-2" }), "Nova Venda"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(DollarSign, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Receita Hoje" }), _jsx("p", { className: "text-2xl font-semibold", children: formatCurrency(estatisticas.receitaHoje) })] })] }) }), _jsx("div", { className: "bg-white p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: _jsx(TrendingUp, { className: "w-6 h-6 text-purple-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Ticket M\u00E9dio" }), _jsx("p", { className: "text-2xl font-semibold", children: formatCurrency(estatisticas.ticketMedio) })] })] }) }), _jsx("div", { className: "bg-white p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(Calendar, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Vendas Hoje" }), _jsx("p", { className: "text-2xl font-semibold", children: estatisticas.vendasHoje })] })] }) }), _jsx("div", { className: "bg-white p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-yellow-100 rounded-lg", children: _jsx(Users, { className: "w-6 h-6 text-yellow-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Total de Vendas" }), _jsx("p", { className: "text-2xl font-semibold", children: estatisticas.totalVendas })] })] }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6", children: [_jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", placeholder: "Buscar por cliente...", className: "w-full pl-10 pr-4 py-2 border rounded-lg", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); } }), _jsx(Search, { className: "absolute left-3 top-2.5 text-gray-400", size: 20 })] }), _jsxs("select", { value: filtroAvancado.paymentMethod, onChange: function (e) {
                            return setFiltroAvancado(function (prev) { return (__assign(__assign({}, prev), { paymentMethod: e.target.value })); });
                        }, className: "border rounded-lg px-4 py-2", children: [_jsx("option", { value: "", children: "M\u00E9todo de Pagamento" }), _jsx("option", { value: "pix", children: "PIX" }), _jsx("option", { value: "cartao_credito", children: "Cart\u00E3o de Cr\u00E9dito" }), _jsx("option", { value: "cartao_debito", children: "Cart\u00E3o de D\u00E9bito" }), _jsx("option", { value: "dinheiro", children: "Dinheiro" }), _jsx("option", { value: "transferencia", children: "Transfer\u00EAncia" })] }), _jsxs("select", { value: filtroAvancado.status, onChange: function (e) {
                            var newStatus = e.target.value;
                            setFiltroAvancado(function (prev) { return (__assign(__assign({}, prev), { status: newStatus })); });
                        }, className: "border rounded-lg px-4 py-2", children: [_jsx("option", { value: "", children: "Status" }), _jsx("option", { value: "completed", children: "Conclu\u00EDda" }), _jsx("option", { value: "pending", children: "Pendente" }), _jsx("option", { value: "cancelled", children: "Cancelada" })] }), _jsx("input", { type: "date", value: filtroAvancado.dateFrom, onChange: function (e) {
                            return setFiltroAvancado(function (prev) { return (__assign(__assign({}, prev), { dateFrom: e.target.value })); });
                        }, className: "border rounded-lg px-4 py-2", placeholder: "Data inicial" }), _jsx("input", { type: "date", value: filtroAvancado.dateTo, onChange: function (e) {
                            return setFiltroAvancado(function (prev) { return (__assign(__assign({}, prev), { dateTo: e.target.value })); });
                        }, className: "border rounded-lg px-4 py-2", placeholder: "Data final" }), _jsxs("button", { onClick: function () { return setFiltroAvancado({
                            paymentMethod: "",
                            status: "",
                            dateFrom: "",
                            dateTo: ""
                        }); }, className: "flex items-center px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50", children: [_jsx(Filter, { size: 20, className: "mr-2" }), "Limpar"] })] }), _jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Data" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Cliente" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Produtos" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Valor Total" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Pagamento" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "px-6 py-4 text-center", children: "Carregando..." }) })) : sales.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "px-6 py-4 text-center", children: "Nenhuma venda encontrada" }) })) : (sales.map(function (sale) { return (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: formatDate(sale.sale_date) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: sale.customer_name }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-500", children: _jsx("div", { className: "max-w-xs overflow-hidden", children: sale.items && sale.items.length > 0 ? (_jsxs("span", { children: [sale.items.slice(0, 2).map(function (item) { return item.product_name; }).join(', '), sale.items.length > 2 && " +".concat(sale.items.length - 2, " mais")] })) : ('Sem itens') }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold", children: formatCurrency(sale.total_amount) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: sale.payment_method }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: "px-2 py-1 text-xs font-medium rounded-full ".concat(getStatusColor(sale.status)), children: getStatusText(sale.status) }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: [_jsx("button", { className: "text-blue-600 hover:text-blue-900 mr-3", onClick: function () { return handleViewSale(sale); }, title: "Ver Detalhes", children: _jsx(Eye, { size: 18 }) }), _jsx("button", { className: "text-blue-600 hover:text-blue-900 mr-3", onClick: function () { return handleEditSale(sale); }, title: "Editar Venda", children: _jsx(Edit, { size: 18 }) }), _jsx("button", { className: "text-red-600 hover:text-red-900", onClick: function () { return handleDeleteSale(sale.id); }, title: "Excluir Venda", children: _jsx(Trash2, { size: 18 }) })] })] }, sale.id)); })) })] }) }) }), _jsxs("div", { className: "flex items-center justify-between px-6 py-3 bg-white border-t", children: [_jsx("div", { className: "flex items-center", children: _jsxs("span", { className: "text-sm text-gray-700", children: ["Mostrando", ' ', _jsx("span", { className: "font-medium", children: (page - 1) * 10 + 1 }), " at\u00E9", ' ', _jsx("span", { className: "font-medium", children: Math.min(page * 10, sales.length) }), ' ', "de ", _jsx("span", { className: "font-medium", children: estatisticas.totalVendas }), " resultados"] }) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: function () { return setPage(function (p) { return Math.max(1, p - 1); }); }, disabled: page === 1, className: "px-3 py-1 border rounded-md disabled:opacity-50", children: _jsx(ArrowLeft, { size: 16 }) }), _jsxs("span", { className: "text-sm text-gray-700", children: ["P\u00E1gina ", page, " de ", totalPages] }), _jsx("button", { onClick: function () { return setPage(function (p) { return Math.min(totalPages, p + 1); }); }, disabled: page === totalPages, className: "px-3 py-1 border rounded-md disabled:opacity-50", children: _jsx(ArrowRight, { size: 16 }) })] })] }), _jsx(Modal, { isOpen: isModalOpen, onClose: function () { return setIsModalOpen(false); }, title: "Nova Venda", size: "max-w-4xl", children: _jsx(FormularioVenda, { onClose: function () { return setIsModalOpen(false); }, onSave: handleSaveVenda }) }), selectedSale && detailsModalOpen && (_jsx(SaleDetailsModal, { isOpen: detailsModalOpen, onClose: function () {
                    setDetailsModalOpen(false);
                    setSelectedSale(null);
                }, sale: selectedSale })), selectedSale && editModalOpen && (_jsx(EditSaleModal, { isOpen: editModalOpen, onClose: function () {
                    setEditModalOpen(false);
                    setSelectedSale(null);
                }, onSave: handleUpdateSale, sale: selectedSale })), selectedSale && deleteModalOpen && (_jsx(DeleteSaleModal, { isOpen: deleteModalOpen, onClose: function () {
                    setDeleteModalOpen(false);
                    setSelectedSale(null);
                }, onConfirm: handleConfirmDelete, saleId: selectedSale.id, customerName: selectedSale.customer_name }))] }));
};
export default VendasPage;
