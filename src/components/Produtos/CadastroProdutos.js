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
import { useEffect, useState, useCallback } from "react";
import { X, Upload, Trash2, Plus, Tag, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from '../../../server/api/axiosConfig';
var produtoInicial = {
    codigo: "",
    nome: "",
    categoria: "",
    formato: "",
    tipoMaterial: "",
    modoUso: "",
    tamanho: "",
    materiaisComponentes: [],
    origem: "",
    garantia: "false",
    fornecedor: "",
    precoBase: "",
    margemLucro: "",
    descricao: "",
    dataCompra: "", // CORRIGIDO
    quantidade: "1", // CORRIGIDO: valor padrão 1
};
var CadastroProdutos = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, onSave = _a.onSave;
    var _b = useState(produtoInicial), produto = _b[0], setProduto = _b[1];
    var _c = useState([]), imagens = _c[0], setImagens = _c[1];
    var _d = useState([]), previewImagens = _d[0], setPreviewImagens = _d[1];
    var _e = useState(""), novoMaterial = _e[0], setNovoMaterial = _e[1];
    var _f = useState(false), loading = _f[0], setLoading = _f[1];
    var _g = useState(null), error = _g[0], setError = _g[1];
    var _h = useState(null), alertaPreco = _h[0], setAlertaPreco = _h[1];
    var _j = useState([]), fornecedores = _j[0], setFornecedores = _j[1];
    useEffect(function () {
        if (isOpen) {
            console.log("Modal está aberto:", isOpen);
            generateProductCode();
        }
    }, [isOpen]);
    // Função para buscar fornecedores
    var fetchSuppliers = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api.get('/suppliers')];
                case 1:
                    response = _a.sent();
                    setFornecedores(response.data);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Erro ao buscar fornecedores:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        fetchSuppliers();
    }, []);
    var generateProductCode = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, nextId, formattedCode_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setAlertaPreco(null);
                    return [4 /*yield*/, api.get('/next-product-id')];
                case 1:
                    response = _a.sent();
                    console.log('Resposta da API de código de produto:', response.data);
                    if (!response.data || response.data.nextId === undefined) {
                        throw new Error('Resposta da API inválida - campo nextId ausente');
                    }
                    nextId = response.data.nextId;
                    if (typeof nextId === 'string') {
                        formattedCode_1 = nextId.match(/^\d+$/)
                            ? nextId.padStart(7, '0')
                            : '0000001';
                    }
                    else if (typeof nextId === 'number') {
                        formattedCode_1 = nextId.toString().padStart(7, '0');
                    }
                    else {
                        console.warn('Tipo de nextId inesperado:', typeof nextId);
                        formattedCode_1 = '0000001';
                    }
                    console.log('Código formatado para uso:', formattedCode_1);
                    setProduto(function (prev) { return (__assign(__assign({}, prev), { codigo: formattedCode_1 })); });
                    return [3 /*break*/, 4];
                case 2:
                    error_2 = _a.sent();
                    console.error('Erro ao gerar código do produto:', error_2);
                    setProduto(function (prev) { return (__assign(__assign({}, prev), { codigo: '0000001' })); });
                    setAlertaPreco({
                        tipo: 'warning',
                        mensagem: 'Erro ao gerar código do produto. Usando código padrão.',
                    });
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var validateNumberInput = function (value, maxValue) {
        var numValue = parseFloat(value);
        if (isNaN(numValue))
            return "";
        if (numValue < 0)
            return "0";
        if (numValue > maxValue)
            return maxValue.toString();
        return value;
    };
    var calcularPrecoSugerido = useCallback(function () {
        var precoBase = parseFloat(produto.precoBase);
        var margem = parseFloat(produto.margemLucro);
        if (!isNaN(precoBase) && !isNaN(margem)) {
            var precoSugerido = precoBase * (1 + margem / 100);
            var precoFinal = Math.ceil(precoSugerido * 100) / 100;
            setAlertaPreco({
                tipo: "info",
                mensagem: "Pre\u00E7o sugerido: R$ ".concat(precoFinal.toFixed(2)),
            });
        }
    }, [produto.precoBase, produto.margemLucro]);
    var handleImageUpload = function (e) {
        if (!e.target.files)
            return;
        var files = Array.from(e.target.files);
        if (files.length + imagens.length > 5) {
            setAlertaPreco({
                tipo: "warning",
                mensagem: "Máximo de 5 imagens permitido",
            });
            return;
        }
        files.forEach(function (file) {
            if (file.size > 5 * 1024 * 1024) {
                setAlertaPreco({
                    tipo: "error",
                    mensagem: "Imagens devem ter no máximo 5MB",
                });
                return;
            }
            var reader = new FileReader();
            reader.onload = function (e) {
                var _a;
                if ((_a = e.target) === null || _a === void 0 ? void 0 : _a.result) {
                    setPreviewImagens(function (prev) { return __spreadArray(__spreadArray([], prev, true), [e.target.result], false); });
                }
            };
            reader.readAsDataURL(file);
        });
        setImagens(function (prev) { return __spreadArray(__spreadArray([], prev, true), files, true); });
    };
    var handleRemoveImage = function (index) {
        setImagens(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
        setPreviewImagens(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
    };
    var handleAddMaterial = function () {
        if (novoMaterial.trim()) {
            setProduto(function (prev) { return (__assign(__assign({}, prev), { materiaisComponentes: __spreadArray(__spreadArray([], prev.materiaisComponentes, true), [
                    novoMaterial.trim(),
                ], false) })); });
            setNovoMaterial("");
        }
    };
    var handleRemoveMaterial = function (index) {
        setProduto(function (prev) { return (__assign(__assign({}, prev), { materiaisComponentes: prev.materiaisComponentes.filter(function (_, i) { return i !== index; }) })); });
    };
    var handleChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value, type = _a.type;
        var validatedValue = value;
        // Lidar com checkboxes
        if (type === "checkbox" && e.target instanceof HTMLInputElement) {
            validatedValue = e.target.checked ? "true" : "false";
        }
        // Validação para campos numéricos
        if (["precoBase", "margemLucro"].includes(name)) {
            var numValue = parseFloat(value);
            if (isNaN(numValue) || numValue < 0) {
                validatedValue = "0";
            }
            else {
                validatedValue = numValue.toString();
            }
        }
        // NOVA VALIDAÇÃO: para quantidade
        if (name === "quantidade") {
            var intValue = parseInt(value);
            if (isNaN(intValue) || intValue < 0) {
                validatedValue = "1";
            }
            else if (intValue > 9999) {
                validatedValue = "9999";
                setAlertaPreco({
                    tipo: "warning",
                    mensagem: "A quantidade não pode exceder 9.999 unidades"
                });
            }
            else {
                validatedValue = value;
                setAlertaPreco(null);
            }
        }
        setProduto(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = validatedValue, _a)));
        });
        if (["precoBase", "margemLucro"].includes(name)) {
            calcularPrecoSugerido();
        }
    };
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!produto.nome || !produto.codigo || !produto.categoria) {
                        setAlertaPreco({
                            tipo: "error",
                            mensagem: "Por favor, preencha todos os campos obrigatórios",
                        });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    setError(null);
                    console.log("Tentando salvar produto com ID:", produto.codigo);
                    return [4 /*yield*/, onSave(__assign(__assign({}, produto), { fornecedor: produto.fornecedor }), imagens)];
                case 2:
                    _a.sent();
                    onClose();
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error("Erro ao salvar produto:", {
                        codigo: produto.codigo,
                        error: err_1,
                    });
                    errorMessage = "Erro ao salvar produto. Por favor, tente novamente.";
                    if (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) {
                        errorMessage = err_1.message;
                    }
                    setError(errorMessage);
                    setAlertaPreco({
                        tipo: "error",
                        mensagem: errorMessage,
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg w-full max-w-4xl m-4", children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b", children: [_jsx("h2", { className: "text-2xl font-semibold", children: "Cadastro de Produto" }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-full", children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "p-6 max-h-[calc(100vh-200px)] overflow-y-auto", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "C\u00F3digo *" }), _jsx("input", { type: "text", name: "codigo", value: loading ? "Carregando..." : produto.codigo, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 bg-gray-200 p-2", required: true, readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nome *" }), _jsx("input", { type: "text", name: "nome", value: produto.nome, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Categoria *" }), _jsxs("select", { name: "categoria", value: produto.categoria, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", required: true, children: [_jsx("option", { value: "", children: "Selecione..." }), _jsx("option", { value: "colares", children: "Colares" }), _jsx("option", { value: "brincos", children: "Brincos" }), _jsx("option", { value: "aneis", children: "An\u00E9is" }), _jsx("option", { value: "pulseiras", children: "Pulseiras" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Fornecedor" }), _jsxs("select", { name: "fornecedor", value: produto.fornecedor, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", children: [_jsx("option", { value: "", children: "Selecione o fornecedor..." }), fornecedores.map(function (fornecedor) { return (_jsx("option", { value: fornecedor.id, children: fornecedor.nome }, fornecedor.id)); })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Quantidade em Estoque" }), _jsx("input", { type: "number", name: "quantidade", value: produto.quantidade, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", min: "0", max: "9999", step: "1" }), _jsx("span", { className: "text-xs text-gray-500", children: "M\u00E1ximo: 9.999 unidades" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Data de Compra" }), _jsx("input", { type: "date", name: "dataCompra", value: produto.dataCompra, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" }), _jsx("span", { className: "text-xs text-gray-500", children: "Data de entrada no estoque" })] }), produto.dataCompra && (_jsx("div", { className: "bg-blue-50 p-3 rounded-lg", children: _jsxs("div", { className: "text-sm text-blue-800", children: [_jsx("strong", { children: "Tempo em Estoque:" }), " ", (function () {
                                                        var buyDate = new Date(produto.dataCompra);
                                                        var today = new Date();
                                                        var diffTime = Math.abs(today.getTime() - buyDate.getTime());
                                                        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                        if (diffDays > 365) {
                                                            return "".concat(Math.floor(diffDays / 365), " ano(s) e ").concat(diffDays % 365, " dias");
                                                        }
                                                        else if (diffDays > 30) {
                                                            return "".concat(Math.floor(diffDays / 30), " m\u00EAs(es) e ").concat(diffDays % 30, " dias");
                                                        }
                                                        else {
                                                            return "".concat(diffDays, " dias");
                                                        }
                                                    })()] }) }))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Tipo de Material" }), _jsx("input", { type: "text", name: "tipoMaterial", value: produto.tipoMaterial, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Tamanho" }), _jsx("input", { type: "text", name: "tamanho", value: produto.tamanho, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Garantia" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", name: "garantia", checked: produto.garantia === "true", onChange: function (e) {
                                                                return setProduto(function (prev) { return (__assign(__assign({}, prev), { garantia: e.target.checked ? "true" : "false" })); });
                                                            }, className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" }), _jsx("span", { children: "Produto com garantia" })] })] })] })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Materiais Componentes" }), _jsxs("div", { className: "flex gap-2 mb-2", children: [_jsx("input", { type: "text", value: novoMaterial, onChange: function (e) { return setNovoMaterial(e.target.value); }, className: "flex-1 rounded-lg border border-gray-300 p-2", placeholder: "Adicionar material..." }), _jsx("button", { onClick: handleAddMaterial, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: _jsx(Plus, { size: 20 }) })] }), _jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: produto.materiaisComponentes.map(function (material, index) { return (_jsxs("span", { className: "inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full", children: [_jsx(Tag, { size: 14 }), material, _jsx("button", { onClick: function () { return handleRemoveMaterial(index); }, className: "ml-1 text-gray-500 hover:text-red-500", children: _jsx(X, { size: 14 }) })] }, index)); }) })] }), _jsxs("div", { className: "mt-6 p-4 bg-gray-50 rounded-lg", children: [_jsxs("h3", { className: "text-lg font-medium mb-4 flex items-center gap-2", children: [_jsx(Info, { size: 20 }), "Precifica\u00E7\u00E3o"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Pre\u00E7o Base (R$)" }), _jsx("input", { type: "number", name: "precoBase", value: produto.precoBase, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", step: "0.01" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Margem de Lucro (%)" }), _jsx("input", { type: "number", name: "margemLucro", value: produto.margemLucro, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" })] })] }), alertaPreco && (_jsx(Alert, { className: "mt-4", children: _jsx(AlertDescription, { children: alertaPreco.mensagem }) }))] }), _jsxs("div", { className: "mt-6", children: [_jsx("h3", { className: "text-lg font-medium mb-4", children: "Imagens do Produto" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [previewImagens.map(function (preview, index) { return (_jsxs("div", { className: "relative", children: [_jsx("img", { src: preview, alt: "Preview ".concat(index + 1), className: "w-full h-32 object-cover rounded-lg" }), _jsx("button", { onClick: function () { return handleRemoveImage(index); }, className: "absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600", children: _jsx(Trash2, { size: 16 }) })] }, index)); }), previewImagens.length < 5 && (_jsxs("label", { className: "border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400", children: [_jsx(Upload, { size: 24, className: "text-gray-400" }), _jsx("span", { className: "mt-2 text-sm text-gray-500", children: "Adicionar Imagem" }), _jsx("span", { className: "mt-1 text-xs text-gray-400", children: "M\u00E1x. 5 imagens" }), _jsx("input", { type: "file", multiple: true, accept: "image/*", onChange: handleImageUpload, className: "hidden" })] }))] })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { name: "descricao", value: produto.descricao, onChange: handleChange, rows: 4, className: "w-full rounded-lg border border-gray-300 p-2" })] })] }), _jsxs("div", { className: "border-t p-6 flex justify-end gap-4", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50", children: "Cancelar" }), _jsx("button", { onClick: handleSave, className: "px-4 py-2 rounded-lg flex items-center ".concat(loading
                                ? "bg-blue-400 text-white cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"), disabled: loading, children: loading ? (_jsx("span", { className: "inline-block", children: "Salvando..." })) : ("Salvar") })] })] }) }));
};
export default CadastroProdutos;
