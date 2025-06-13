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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, ArrowLeft, ArrowRight, Eye // ← NOVO ÍCONE
 } from "lucide-react";
import CadastroProdutos from "./CadastroProdutos";
import EditProductModal from './EditProductModal';
import DeleteProductModal from './DeleteProductModal';
import ViewProductModal from './ViewProductModal'; // ← NOVO IMPORT
import api from "../../../server/api/axiosConfig";
var ProductsPage = function () {
    // Estados para modais
    var _a = useState(false), editModalOpen = _a[0], setEditModalOpen = _a[1];
    var _b = useState(false), deleteModalOpen = _b[0], setDeleteModalOpen = _b[1];
    var _c = useState(false), viewModalOpen = _c[0], setViewModalOpen = _c[1]; // ← NOVO ESTADO
    var _d = useState(null), selectedProduct = _d[0], setSelectedProduct = _d[1];
    var _e = useState(false), isModalOpen = _e[0], setIsModalOpen = _e[1];
    // Estados para dados e paginação
    var _f = useState([]), products = _f[0], setProducts = _f[1];
    var _g = useState(true), loading = _g[0], setLoading = _g[1];
    var _h = useState(1), page = _h[0], setPage = _h[1];
    var _j = useState(1), totalPages = _j[0], setTotalPages = _j[1];
    var _k = useState(""), searchTerm = _k[0], setSearchTerm = _k[1];
    // Estado para fornecedores (para o filtro)
    var _l = useState([]), suppliers = _l[0], setSuppliers = _l[1];
    // Estado para filtros avançados
    var _m = useState({
        categoria: "",
        origem: "",
        status: "",
        fornecedor: "",
        tempoEstoque: "",
        precoRange: ""
    }), filtroAvancado = _m[0], setFiltroAvancado = _m[1];
    // Estado para ordenação
    var _o = useState({
        campo: "created_at",
        ordem: "desc"
    }), ordenacao = _o[0], setOrdenacao = _o[1];
    // Estado para estatísticas
    var _p = useState({
        totalProdutos: 0,
        valorTotalEstoque: 0,
        produtosAtivos: 0,
        produtosInativos: 0,
        produtosAlerta: 0,
        produtosConsignados: 0
    }), estatisticas = _p[0], setEstatisticas = _p[1];
    var fetchProducts = function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, fullUrl, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    params = new URLSearchParams({
                        page: page.toString(),
                        limit: "10",
                        search: searchTerm,
                        orderBy: ordenacao.campo,
                        orderDirection: ordenacao.ordem,
                        category: filtroAvancado.categoria,
                        tempoestoque: filtroAvancado.tempoEstoque,
                        fstatus: filtroAvancado.status,
                        ffornecedor: filtroAvancado.fornecedor
                    });
                    fullUrl = "/products?".concat(params);
                    // 🔍 DEBUG: Log da URL e parâmetros
                    console.log('\n🚀 === FRONTEND DEBUG ===');
                    console.log('🔗 URL completa:', fullUrl);
                    console.log('🔍 Search term:', searchTerm);
                    console.log('📋 Todos os parâmetros:', Object.fromEntries(params));
                    console.log('========================\n');
                    return [4 /*yield*/, api.get(fullUrl)];
                case 1:
                    response = _a.sent();
                    // 🔍 DEBUG: Log da resposta
                    console.log('\n📦 === RESPONSE DEBUG ===');
                    console.log('📊 Status:', response.status);
                    console.log('📋 Data structure:', Object.keys(response.data));
                    if (response.data.products) {
                        console.log('🎯 Products found:', response.data.products.length);
                        console.log('📝 First product:', response.data.products[0]);
                    }
                    console.log('=========================\n');
                    // Verifica se a resposta tem a estrutura esperada
                    if (response.data && response.data.products) {
                        setProducts(response.data.products);
                        setTotalPages(Math.ceil(response.data.total / 10));
                        if (response.data.statistics) {
                            setEstatisticas(response.data.statistics);
                        }
                    }
                    else {
                        console.error("Resposta da API em formato inesperado:", response.data);
                        setProducts([]);
                        setTotalPages(0);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error("❌ Erro ao buscar produtos:", error_1);
                    // 🔍 DEBUG: Log detalhado do erro
                    if (error_1.response) {
                        console.log('📊 Error status:', error_1.response.status);
                        console.log('📋 Error data:', error_1.response.data);
                    }
                    setProducts([]);
                    setTotalPages(0);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Função para buscar fornecedores para o filtro
    var fetchSuppliers = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, suppliersData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api.get("/suppliers")];
                case 1:
                    response = _a.sent();
                    suppliersData = response.data.suppliers || response.data;
                    if (Array.isArray(suppliersData)) {
                        setSuppliers(suppliersData);
                    }
                    else {
                        console.error("API response for suppliers is not an array:", response.data);
                        setSuppliers([]);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error("Erro ao buscar fornecedores:", error_2);
                    setSuppliers([]);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Atualizar produtos quando mudar página, busca ou filtros
    useEffect(function () {
        console.log('\n🔄 === useEffect TRIGGERED ===');
        console.log('📄 Page:', page);
        console.log('🔍 Search term:', searchTerm);
        console.log('🎛️ Filtros:', filtroAvancado);
        console.log('📊 Ordenação:', ordenacao);
        console.log('==============================\n');
        fetchProducts();
    }, [page, searchTerm, filtroAvancado, ordenacao]);
    var getMonthsInStock = function (createdAt) {
        var createdDate = new Date(createdAt);
        return Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    };
    // Buscar fornecedores ao carregar a página
    useEffect(function () {
        fetchSuppliers();
    }, []);
    // ← NOVO HANDLER PARA VISUALIZAÇÃO
    var handleViewProduct = function (product) {
        setSelectedProduct(product);
        setViewModalOpen(true);
    };
    // Handler para edição de produto
    var handleEditProduct = function (product) {
        setSelectedProduct(product);
        setEditModalOpen(true);
    };
    var handleNewProduct = function () {
        setIsModalOpen(true);
    };
    var handleUpdateProduct = function (updatedProduct_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([updatedProduct_1], args_1, true), void 0, function (updatedProduct, newImages) {
            var formData_1, response_1, error_3;
            if (newImages === void 0) { newImages = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        formData_1 = new FormData();
                        // Garantir que temos o ID do produto
                        if (!(selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.id)) {
                            throw new Error('ID do produto não encontrado');
                        }
                        console.log('🔍 Updated product data received:', updatedProduct);
                        console.log('🏢 Supplier ID from form:', updatedProduct.supplier_id);
                        // Adicionar campos do produto - INCLUINDO supplier_id
                        Object.entries(updatedProduct).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            if (value !== undefined && value !== null && value !== '') {
                                if (key === 'materials' || key === 'images') {
                                    formData_1.append(key, JSON.stringify(value));
                                }
                                else {
                                    formData_1.append(key, value.toString());
                                }
                            }
                        });
                        // Adicionar novas imagens
                        newImages.forEach(function (image) {
                            formData_1.append('images', image);
                        });
                        return [4 /*yield*/, api.put("/products/".concat(selectedProduct.id), formData_1, {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            })];
                    case 1:
                        response_1 = _a.sent();
                        // Atualizar lista de produtos
                        setProducts(function (prevProducts) {
                            return prevProducts.map(function (p) {
                                return p.id.toString() === selectedProduct.id.toString() ? response_1.data : p;
                            });
                        });
                        setEditModalOpen(false);
                        setSelectedProduct(null);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('❌ Erro ao atualizar produto:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Handler para exclusão de produto
    var handleDeleteProduct = function (productId) {
        var product = products.find(function (p) { return p.id.toString() === productId.toString(); });
        if (product) {
            setSelectedProduct(product);
            setDeleteModalOpen(true);
        }
    };
    // Handler para confirmação de exclusão
    var handleConfirmDelete = function (productId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api.delete("/products/".concat(productId))];
                case 1:
                    _a.sent();
                    setProducts(function (prevProducts) { return prevProducts.filter(function (p) { return p.id.toString() !== productId.toString(); }); });
                    setDeleteModalOpen(false);
                    setSelectedProduct(null);
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Erro ao excluir produto:', error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveProduto = function (produto, imagens) { return __awaiter(void 0, void 0, void 0, function () {
        var formData_2, apiData, response, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    console.log('📦 Dados recebidos do formulário:', produto);
                    formData_2 = new FormData();
                    apiData = {
                        code: produto.codigo,
                        name: produto.nome,
                        category: produto.categoria,
                        format: produto.formato,
                        material_type: produto.tipoMaterial,
                        usage_mode: produto.modoUso,
                        size: produto.tamanho,
                        origin: produto.origem,
                        warranty: produto.garantia,
                        base_price: produto.precoBase,
                        profit_margin: produto.margemLucro,
                        description: produto.descricao,
                        materials: produto.materiaisComponentes,
                        supplier_id: produto.fornecedor,
                        buy_date: produto.dataCompra || null,
                        quantity: parseInt(produto.quantidade) || 1
                    };
                    Object.entries(apiData).forEach(function (_a) {
                        var key = _a[0], value = _a[1];
                        if (value !== undefined && value !== null) {
                            if (key === 'materials') {
                                formData_2.append(key, JSON.stringify(value));
                            }
                            else {
                                formData_2.append(key, value.toString());
                            }
                        }
                    });
                    imagens.forEach(function (imagem) {
                        formData_2.append('images', imagem);
                    });
                    return [4 /*yield*/, api.post("/products", formData_2, {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        })];
                case 1:
                    response = _a.sent();
                    console.log('✅ Produto salvo com sucesso:', response.data);
                    return [4 /*yield*/, fetchProducts()];
                case 2:
                    _a.sent();
                    setIsModalOpen(false);
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error("❌ Erro ao salvar produto:", error_5);
                    throw error_5;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-800", children: "Produtos" }), _jsxs("button", { onClick: function () { return setIsModalOpen(true); }, className: "flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: [_jsx(Plus, { size: 20, className: "mr-2" }), "Novo Produto"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Total de Produtos" }), _jsx("p", { className: "text-2xl font-semibold", children: estatisticas.totalProdutos })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Valor em Estoque" }), _jsxs("p", { className: "text-2xl font-semibold", children: ["R$ ", estatisticas.valorTotalEstoque.toLocaleString()] })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Produtos Ativos" }), _jsx("p", { className: "text-2xl font-semibold", children: estatisticas.produtosAtivos })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Produtos Consignados" }), _jsx("p", { className: "text-2xl font-semibold", children: estatisticas.produtosInativos })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-5", children: [_jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", placeholder: "Buscar por nome, c\u00F3digo ou material...", className: "w-full pl-10 pr-4 py-2 border rounded-lg", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); } }), _jsx(Search, { className: "absolute left-3 top-2.5 text-gray-400", size: 20 })] }), _jsxs("select", { value: filtroAvancado.categoria, onChange: function (e) {
                            return setFiltroAvancado(function (prev) { return (__assign(__assign({}, prev), { categoria: e.target.value })); });
                        }, className: "border rounded-lg px-6 py-2", children: [_jsx("option", { value: "", children: "Categoria" }), _jsx("option", { value: "colares", children: "Colares" }), _jsx("option", { value: "brincos", children: "Brincos" }), _jsx("option", { value: "aneis", children: "An\u00E9is" }), _jsx("option", { value: "pulseiras", children: "Pulseiras" })] }), _jsxs("select", { value: filtroAvancado.tempoEstoque, onChange: function (e) {
                            return setFiltroAvancado(function (prev) { return (__assign(__assign({}, prev), { tempoEstoque: e.target.value })); });
                        }, className: "border rounded-lg px-6 py-2", children: [_jsx("option", { value: "", children: "Tempo em Estoque" }), _jsx("option", { value: "0-1", children: "Menos de 1 m\u00EAs" }), _jsx("option", { value: "1-3", children: "1-3 meses" }), _jsx("option", { value: "3-6", children: "3-6 meses" }), _jsx("option", { value: "6+", children: "Mais de 6 meses" })] }), _jsxs("select", { value: filtroAvancado.fornecedor, onChange: function (e) { return setFiltroAvancado(function (prev) { return (__assign(__assign({}, prev), { fornecedor: e.target.value })); }); }, className: "border rounded-lg px-6 py-2", children: [_jsx("option", { value: "", children: "Fornecedor" }), suppliers.map(function (supplier) { return (_jsx("option", { value: supplier.id, children: supplier.nome || 'Fornecedor Desconhecido' }, supplier.id)); })] }), _jsxs("select", { value: filtroAvancado.status, onChange: function (e) {
                            var newStatus = e.target.value;
                            setFiltroAvancado(function (prev) { return (__assign(__assign({}, prev), { status: newStatus })); });
                        }, className: "border rounded-lg px-6 py-2", children: [_jsx("option", { value: "", children: "Status" }), _jsx("option", { value: "active", children: "Ativo" }), _jsx("option", { value: "consigned", children: "Consignado" })] })] }), _jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "C\u00F3digo" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Produto" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Categoria" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Materiais" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Pre\u00E7o Base" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Margem" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Pre\u00E7o Final" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Estoque" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 10, className: "px-6 py-4 text-center", children: "Carregando..." }) })) : products.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 10, className: "px-6 py-4 text-center", children: searchTerm ?
                                            "Nenhum produto encontrado para \"".concat(searchTerm, "\"") :
                                            "Nenhum produto encontrado" }) })) : (products.map(function (product) { return (_jsxs("tr", { className: "hover:bg-gray-50 ".concat(product.found_by_material ? 'bg-blue-50 border-l-4 border-blue-400' : ''), children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: _jsxs("div", { className: "flex items-center gap-2", children: [product.code, product.found_by_material && (_jsx("span", { className: "px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium", children: "Material" }))] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: product.name }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: product.category }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-500", children: _jsxs("div", { className: "flex flex-wrap gap-1 max-w-48", children: [product.materials && product.materials.length > 0 ? (product.materials.slice(0, 3).map(function (material, index) { return (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ".concat(searchTerm && material.toLowerCase().includes(searchTerm.toLowerCase())
                                                            ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300'
                                                            : 'bg-gray-100 text-gray-800'), children: material }, index)); })) : (_jsx("span", { className: "text-gray-400 text-xs", children: "Sem materiais" })), product.materials && product.materials.length > 3 && (_jsxs("span", { className: "text-xs text-gray-500", children: ["+", product.materials.length - 3, " mais"] }))] }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-green-900", children: ["R$ ", Number(product.base_price).toFixed(2)] }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-green-600", children: ["% ", Number(product.profit_margin).toFixed(2)] }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-green-600", children: ["R$ ", (Number(product.base_price) * ((Number(product.profit_margin) / 100) + 1)).toFixed(2)] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm", children: _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "font-medium ".concat(Number(product.quantity) <= 0
                                                            ? "text-red-600"
                                                            : Number(product.quantity) <= 5
                                                                ? "text-yellow-600"
                                                                : "text-green-600"), children: product.quantity || 0 }), Number(product.quantity) <= 0 && (_jsx("span", { className: "text-xs text-red-500 font-medium", children: "SEM ESTOQUE" })), Number(product.quantity) > 0 && Number(product.quantity) <= 5 && (_jsx("span", { className: "text-xs text-yellow-500 font-medium", children: "ESTOQUE BAIXO" }))] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "px-2 py-1 text-xs font-medium rounded-full ".concat(product.status === "active"
                                                            ? "bg-green-100 text-green-800"
                                                            : product.status === "consigned"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-yellow-100 text-yellow-800"), children: product.status === "active"
                                                            ? "Ativo"
                                                            : product.status === "consigned"
                                                                ? "Consignado"
                                                                : "Inativo" }), getMonthsInStock(product.created_at) > 6 && (_jsx("span", { className: "px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full", children: "+6 Meses em Estoque" }))] }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: [_jsx("button", { className: "text-gray-600 hover:text-gray-900 mr-3", onClick: function () { return handleViewProduct(product); }, title: "Visualizar Produto", children: _jsx(Eye, { size: 18 }) }), _jsx("button", { className: "text-blue-600 hover:text-blue-900 mr-3", onClick: function () { return handleEditProduct(product); }, title: "Editar Produto", children: _jsx(Edit, { size: 18 }) }), _jsx("button", { className: "text-red-600 hover:text-red-900", onClick: function () { return handleDeleteProduct(product.id); }, title: "Excluir Produto", children: _jsx(Trash2, { size: 18 }) })] })] }, product.id)); })) })] }) }) }), _jsxs("div", { className: "flex items-center justify-between px-6 py-3 bg-white border-t", children: [_jsx("div", { className: "flex items-center", children: _jsxs("span", { className: "text-sm text-gray-700", children: ["Mostrando", ' ', _jsx("span", { className: "font-medium", children: (page - 1) * 10 + 1 }), " at\u00E9", ' ', _jsx("span", { className: "font-medium", children: Math.min(page * 10, products.length) }), ' ', "de ", _jsx("span", { className: "font-medium", children: products.length }), " resultados"] }) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: function () { return setPage(function (p) { return Math.max(1, p - 1); }); }, disabled: page === 1, className: "px-3 py-1 border rounded-md disabled:opacity-50", children: _jsx(ArrowLeft, { size: 16 }) }), _jsxs("span", { className: "text-sm text-gray-700", children: ["P\u00E1gina ", page, " de ", totalPages] }), _jsx("button", { onClick: function () { return setPage(function (p) { return Math.min(totalPages, p + 1); }); }, disabled: page === totalPages, className: "px-3 py-1 border rounded-md disabled:opacity-50", children: _jsx(ArrowRight, { size: 16 }) })] })] }), isModalOpen && (_jsx(CadastroProdutos, { isOpen: isModalOpen, onClose: function () { return setIsModalOpen(false); }, onSave: handleSaveProduto })), selectedProduct && viewModalOpen && (_jsx(ViewProductModal, { isOpen: viewModalOpen, onClose: function () {
                    setViewModalOpen(false);
                    setSelectedProduct(null);
                }, product: selectedProduct })), selectedProduct && editModalOpen && (_jsx(EditProductModal, { isOpen: editModalOpen, onClose: function () {
                    setEditModalOpen(false);
                    setSelectedProduct(null);
                }, onSave: function (formData, newImages) { return handleUpdateProduct(formData, newImages); }, product: selectedProduct, suppliers: suppliers })), selectedProduct && deleteModalOpen && (_jsx(DeleteProductModal, { isOpen: deleteModalOpen, onClose: function () {
                    setDeleteModalOpen(false);
                    setSelectedProduct(null);
                }, onConfirm: handleConfirmDelete, productId: selectedProduct.id, productName: selectedProduct.name }))] }));
};
export default ProductsPage;
