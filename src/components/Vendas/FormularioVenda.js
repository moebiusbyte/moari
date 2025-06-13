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
import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, User, CreditCard, Package, Calculator } from 'lucide-react';
import api from "../../../server/api/axiosConfig";
var FormularioVenda = function (_a) {
    var onClose = _a.onClose, onSave = _a.onSave;
    // Estados do formulário
    var _b = useState({
        cliente: '',
        email: '',
        telefone: '',
        metodoPagamento: '',
        desconto: 0,
        observacoes: '',
        status: 'completed'
    }), formData = _b[0], setFormData = _b[1];
    // Estados para produtos
    var _c = useState([]), products = _c[0], setProducts = _c[1];
    var _d = useState([]), selectedItems = _d[0], setSelectedItems = _d[1];
    var _e = useState(''), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = useState(false), showProductSearch = _f[0], setShowProductSearch = _f[1];
    var _g = useState(false), loading = _g[0], setLoading = _g[1];
    // Buscar produtos
    var fetchProducts = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (search) {
            var params, response, availableProducts, error_1, params, fallbackResponse, productsWithStock, fallbackError_1;
            if (search === void 0) { search = ''; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 7]);
                        params = new URLSearchParams({
                            search: search,
                            limit: '50'
                        });
                        console.log('🔍 Buscando produtos para venda (apenas com estoque)');
                        return [4 /*yield*/, api.get("/products-for-sale?".concat(params))];
                    case 1:
                        response = _a.sent();
                        if (response.data && response.data.products) {
                            availableProducts = response.data.products.map(function (product) { return (__assign(__assign({}, product), { final_price: product.final_price || Number(product.base_price) * ((Number(product.profit_margin) / 100) + 1) })); });
                            console.log("\u2705 ".concat(availableProducts.length, " produtos com estoque dispon\u00EDveis"));
                            setProducts(availableProducts);
                        }
                        return [3 /*break*/, 7];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Erro ao buscar produtos:', error_1);
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        console.log('🔄 Usando fallback com filtro forSale=true');
                        params = new URLSearchParams({
                            page: '1',
                            limit: '50',
                            search: search,
                            fstatus: 'active',
                            forSale: 'true' // ✅ PARÂMETRO IMPORTANTE
                        });
                        return [4 /*yield*/, api.get("/products?".concat(params))];
                    case 4:
                        fallbackResponse = _a.sent();
                        if (fallbackResponse.data && fallbackResponse.data.products) {
                            productsWithStock = fallbackResponse.data.products
                                .filter(function (product) {
                                var hasStock = product.quantity > 0;
                                var isActive = product.status === 'active';
                                if (!hasStock) {
                                    console.log("\u26A0\uFE0F Produto ".concat(product.name, " exclu\u00EDdo: sem estoque"));
                                }
                                return hasStock && isActive;
                            })
                                .map(function (product) { return (__assign(__assign({}, product), { final_price: Number(product.base_price) * ((Number(product.profit_margin) / 100) + 1) })); });
                            console.log("\u2705 ".concat(productsWithStock.length, " produtos v\u00E1lidos no fallback"));
                            setProducts(productsWithStock);
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        fallbackError_1 = _a.sent();
                        console.error('Erro no fallback:', fallbackError_1);
                        setProducts([]);
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // Carregar produtos ao montar o componente
    useEffect(function () {
        fetchProducts();
    }, []);
    // Buscar produtos quando o termo de busca mudar
    useEffect(function () {
        if (showProductSearch) {
            fetchProducts(searchTerm);
        }
    }, [searchTerm, showProductSearch]);
    // Handler para mudanças no formulário
    var handleInputChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    // Adicionar produto à venda
    var addProduct = function (product) {
        if (!product.quantity || product.quantity <= 0) {
            alert("O produto \"".concat(product.name, "\" est\u00E1 sem estoque dispon\u00EDvel."));
            return;
        }
        var existingItem = selectedItems.find(function (item) { return item.product_id === product.id; });
        if (existingItem) {
            // Verificar se pode incrementar a quantidade
            var newQuantity_1 = existingItem.quantity + 1;
            if (newQuantity_1 > product.quantity) {
                alert("N\u00E3o \u00E9 poss\u00EDvel adicionar mais unidades. Estoque dispon\u00EDvel: ".concat(product.quantity, ", J\u00E1 selecionado: ").concat(existingItem.quantity));
                return;
            }
            // Incrementar quantidade se o produto já existe
            setSelectedItems(function (prev) {
                return prev.map(function (item) {
                    return item.product_id === product.id
                        ? __assign(__assign({}, item), { quantity: newQuantity_1, total_price: newQuantity_1 * item.unit_price }) : item;
                });
            });
        }
        else {
            // Adicionar novo produto
            var newItem_1 = {
                product_id: product.id,
                product_name: product.name,
                product_code: product.code,
                quantity: 1,
                unit_price: product.final_price || product.base_price,
                total_price: product.final_price || product.base_price,
                max_quantity: product.quantity
            };
            setSelectedItems(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newItem_1], false); });
        }
        setShowProductSearch(false);
        setSearchTerm('');
    };
    // Remover produto da venda
    var removeProduct = function (productId) {
        setSelectedItems(function (prev) { return prev.filter(function (item) { return item.product_id !== productId; }); });
    };
    // Atualizar quantidade do produto
    var updateQuantity = function (productId, quantity) {
        if (quantity <= 0) {
            removeProduct(productId);
            return;
        }
        var selectedItem = selectedItems.find(function (item) { return item.product_id === productId; });
        if (!selectedItem)
            return;
        // ✅ Buscar estoque atual do produto
        var product = products.find(function (p) { return p.id === productId; });
        if (product && quantity > product.quantity) {
            alert("Quantidade solicitada (".concat(quantity, ") excede o estoque dispon\u00EDvel (").concat(product.quantity, ")."));
            return;
        }
        setSelectedItems(function (prev) {
            return prev.map(function (item) {
                return item.product_id === productId
                    ? __assign(__assign({}, item), { quantity: quantity, total_price: quantity * item.unit_price }) : item;
            });
        });
    };
    // Atualizar preço unitário do produto
    var updateUnitPrice = function (productId, unitPrice) {
        setSelectedItems(function (prev) {
            return prev.map(function (item) {
                return item.product_id === productId
                    ? __assign(__assign({}, item), { unit_price: unitPrice, total_price: item.quantity * unitPrice }) : item;
            });
        });
    };
    // Calcular totais
    var subtotal = selectedItems.reduce(function (sum, item) { return sum + item.total_price; }, 0);
    var valorDesconto = Number(formData.desconto) || 0;
    var valorTotal = subtotal - valorDesconto;
    // Formatar moeda
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    // Submeter formulário - CORRIGIDO
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var _loop_1, _i, selectedItems_1, item, state_1, vendaData, serializedData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    console.log('🚀 === DEBUG SUBMIT ===');
                    console.log('selectedItems:', selectedItems);
                    console.log('formData:', formData);
                    console.log('valorTotal:', valorTotal);
                    console.log('======================');
                    if (selectedItems.length === 0) {
                        alert('Adicione pelo menos um produto à venda');
                        return [2 /*return*/];
                    }
                    if (!formData.cliente.trim()) {
                        alert('O nome do cliente é obrigatório');
                        return [2 /*return*/];
                    }
                    if (!formData.metodoPagamento) {
                        alert('Selecione um método de pagamento');
                        return [2 /*return*/];
                    }
                    _loop_1 = function (item) {
                        var product = products.find(function (p) { return p.id === item.product_id; });
                        if (!product) {
                            alert("Produto ".concat(item.product_name, " n\u00E3o encontrado. Recarregue a p\u00E1gina."));
                            return { value: void 0 };
                        }
                        if (product.quantity < item.quantity) {
                            alert("Estoque insuficiente para ".concat(item.product_name, ". Dispon\u00EDvel: ").concat(product.quantity, ", Solicitado: ").concat(item.quantity));
                            return { value: void 0 };
                        }
                    };
                    for (_i = 0, selectedItems_1 = selectedItems; _i < selectedItems_1.length; _i++) {
                        item = selectedItems_1[_i];
                        state_1 = _loop_1(item);
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                    }
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    vendaData = {
                        customer_name: formData.cliente, // ✅ Corrigido: cliente -> customer_name
                        customer_email: formData.email, // ✅ Corrigido: email -> customer_email  
                        customer_phone: formData.telefone, // ✅ Corrigido: telefone -> customer_phone
                        payment_method: formData.metodoPagamento, // ✅ Corrigido: metodoPagamento -> payment_method
                        total_amount: valorTotal, // ✅ Mantido
                        discount_amount: valorDesconto, // ✅ Corrigido: desconto -> discount_amount
                        notes: formData.observacoes, // ✅ Corrigido: observacoes -> notes
                        status: formData.status, // ✅ Mantido
                        items: selectedItems.map(function (item) { return ({
                            product_id: item.product_id,
                            quantity: item.quantity,
                            unit_price: item.unit_price,
                            total_price: item.total_price,
                            update_stock: true // ✅ Adicionado para controle de estoque
                        }); })
                    };
                    console.log('📦 === DADOS ENVIADOS PARA API ===');
                    console.log('vendaData:', JSON.stringify(vendaData, null, 2));
                    console.log('==================================');
                    serializedData = JSON.parse(JSON.stringify(vendaData));
                    console.log('📦 === DADOS SERIALIZADOS ===');
                    console.log('serializedData:', serializedData);
                    console.log('=============================');
                    return [4 /*yield*/, onSave(serializedData)];
                case 2:
                    _a.sent();
                    // ✅ FECHAR MODAL AUTOMATICAMENTE APÓS SUCESSO
                    onClose();
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('Erro ao salvar venda:', error_2);
                    alert('Erro ao salvar venda. Tente novamente.');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(User, { className: "w-5 h-5 text-gray-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Informa\u00E7\u00F5es do Cliente" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nome do Cliente *" }), _jsx("input", { type: "text", name: "cliente", value: formData.cliente, onChange: handleInputChange, required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Nome completo do cliente" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", name: "email", value: formData.email, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "email@exemplo.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Telefone" }), _jsx("input", { type: "tel", name: "telefone", value: formData.telefone, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "(11) 99999-9999" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "M\u00E9todo de Pagamento *" }), _jsxs("select", { name: "metodoPagamento", value: formData.metodoPagamento, onChange: handleInputChange, required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "Selecione..." }), _jsx("option", { value: "pix", children: "PIX" }), _jsx("option", { value: "cartao_credito", children: "Cart\u00E3o de Cr\u00E9dito" }), _jsx("option", { value: "cartao_debito", children: "Cart\u00E3o de D\u00E9bito" }), _jsx("option", { value: "dinheiro", children: "Dinheiro" }), _jsx("option", { value: "transferencia", children: "Transfer\u00EAncia" })] })] })] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Package, { className: "w-5 h-5 text-gray-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Produtos" })] }), _jsxs("button", { type: "button", onClick: function () { return setShowProductSearch(!showProductSearch); }, className: "flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700", children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), "Adicionar Produto"] })] }), showProductSearch && (_jsxs("div", { className: "mb-4 p-3 bg-white rounded-md border", children: [_jsxs("div", { className: "relative mb-3", children: [_jsx("input", { type: "text", placeholder: "Buscar produtos...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx(Search, { className: "absolute left-3 top-2.5 text-gray-400", size: 20 })] }), _jsx("div", { className: "max-h-60 overflow-y-auto", children: products.length === 0 ? (_jsx("p", { className: "text-gray-500 text-center py-4", children: "Nenhum produto dispon\u00EDvel para venda" })) : (_jsx("div", { className: "space-y-2", children: products.map(function (product) { return (_jsxs("div", { onClick: function () { return addProduct(product); }, className: "flex justify-between items-center p-3 rounded-md cursor-pointer transition-colors ".concat(product.quantity <= 5
                                            ? 'bg-yellow-50 border border-yellow-200 hover:bg-yellow-100'
                                            : 'bg-gray-50 hover:bg-gray-100'), children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-medium", children: product.name }), product.quantity <= 5 && (_jsx("span", { className: "px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full", children: "ESTOQUE BAIXO" }))] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["C\u00F3d: ", product.code, " | Estoque: ", product.quantity, " unidades"] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold text-green-600", children: formatCurrency(product.final_price || product.base_price) }), _jsx("p", { className: "text-sm text-gray-500", children: product.category })] })] }, product.id)); }) })) })] })), selectedItems.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(Package, { className: "w-12 h-12 mx-auto mb-2 text-gray-300" }), _jsx("p", { children: "Nenhum produto adicionado" }), _jsx("p", { className: "text-sm", children: "Clique em \"Adicionar Produto\" para come\u00E7ar" })] })) : (_jsx("div", { className: "space-y-3", children: selectedItems.map(function (item, index) { return (_jsxs("div", { className: "bg-white p-4 rounded-md border", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium", children: item.product_name }), _jsxs("p", { className: "text-sm text-gray-500", children: ["C\u00F3d: ", item.product_code] })] }), _jsx("button", { type: "button", onClick: function () { return removeProduct(item.product_id); }, className: "text-red-600 hover:text-red-800 ml-2", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3 mt-3", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: ["Quantidade", (function () {
                                                            var product = products.find(function (p) { return p.id === item.product_id; });
                                                            return product ? " (m\u00E1x: ".concat(product.quantity, ")") : '';
                                                        })()] }), _jsx("input", { type: "number", min: "1", max: (function () {
                                                        var product = products.find(function (p) { return p.id === item.product_id; });
                                                        return product ? product.quantity : undefined;
                                                    })(), value: item.quantity, onChange: function (e) {
                                                        var newQty = parseInt(e.target.value) || 0;
                                                        var product = products.find(function (p) { return p.id === item.product_id; });
                                                        if (product && newQty > product.quantity) {
                                                            alert("M\u00E1ximo dispon\u00EDvel: ".concat(product.quantity));
                                                            return;
                                                        }
                                                        updateQuantity(item.product_id, newQty);
                                                    }, className: "w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 ".concat((function () {
                                                        var product = products.find(function (p) { return p.id === item.product_id; });
                                                        return product && item.quantity > product.quantity
                                                            ? 'border-red-500 focus:ring-red-500'
                                                            : 'border-gray-300 focus:ring-blue-500';
                                                    })()) }), (function () {
                                                    var product = products.find(function (p) { return p.id === item.product_id; });
                                                    if (product && item.quantity > product.quantity) {
                                                        return (_jsxs("p", { className: "text-xs text-red-600 mt-1", children: ["Excede estoque dispon\u00EDvel (", product.quantity, ")"] }));
                                                    }
                                                    return null;
                                                })()] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Pre\u00E7o Unit\u00E1rio" }), _jsx("input", { type: "number", step: "0.01", min: "0", value: item.unit_price, onChange: function (e) { return updateUnitPrice(item.product_id, parseFloat(e.target.value) || 0); }, className: "w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Total" }), _jsx("div", { className: "px-2 py-1 bg-gray-100 rounded text-sm font-semibold text-green-600", children: formatCurrency(item.total_price) })] })] })] }, index)); }) }))] }), selectedItems.length > 0 && (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(Calculator, { className: "w-5 h-5 text-gray-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Resumo Financeiro" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Subtotal:" }), _jsx("span", { className: "font-semibold", children: formatCurrency(subtotal) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("label", { className: "text-gray-600", children: "Desconto:" }), _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "mr-2", children: "R$" }), _jsx("input", { type: "number", name: "desconto", value: formData.desconto, onChange: handleInputChange, step: "0.01", min: "0", max: subtotal, className: "w-24 px-2 py-1 border rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500" })] })] }), _jsxs("div", { className: "flex justify-between text-lg font-bold border-t pt-3", children: [_jsx("span", { children: "Total:" }), _jsx("span", { className: "text-green-600", children: formatCurrency(valorTotal) })] })] })] })), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(CreditCard, { className: "w-5 h-5 text-gray-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Informa\u00E7\u00F5es Adicionais" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status da Venda" }), _jsxs("select", { name: "status", value: formData.status, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "completed", children: "Conclu\u00EDda" }), _jsx("option", { value: "pending", children: "Pendente" }), _jsx("option", { value: "cancelled", children: "Cancelada" })] })] }), _jsxs("div", { className: "md:col-span-1", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Observa\u00E7\u00F5es" }), _jsx("textarea", { name: "observacoes", value: formData.observacoes, onChange: handleInputChange, rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Observa\u00E7\u00F5es sobre a venda..." })] })] })] }), _jsxs("div", { className: "flex justify-end space-x-3 pt-4 border-t", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300", children: "Cancelar" }), _jsx("button", { type: "submit", disabled: loading || selectedItems.length === 0, className: "px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Salvando...' : 'Salvar Venda' })] })] }));
};
export default FormularioVenda;
