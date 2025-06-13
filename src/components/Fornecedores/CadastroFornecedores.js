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
import { X } from "lucide-react";
import api from '../../../server/api/axiosConfig';
var fornecedorInicial = {
    codigo: "",
    nome: "",
    contato: "",
    telefone: "",
    email: "",
    cidade: "",
    estado: "",
    endereco: "",
    ultimacompra: null,
};
var estadosBrasil = [
    { uf: 'AC', nome: 'Acre' },
    { uf: 'AL', nome: 'Alagoas' },
    { uf: 'AP', nome: 'Amapá' },
    { uf: 'AM', nome: 'Amazonas' },
    { uf: 'BA', nome: 'Bahia' },
    { uf: 'CE', nome: 'Ceará' },
    { uf: 'DF', nome: 'Distrito Federal' },
    { uf: 'ES', nome: 'Espírito Santo' },
    { uf: 'GO', nome: 'Goiás' },
    { uf: 'MA', nome: 'Maranhão' },
    { uf: 'MT', nome: 'Mato Grosso' },
    { uf: 'MS', nome: 'Mato Grosso do Sul' },
    { uf: 'MG', nome: 'Minas Gerais' },
    { uf: 'PA', nome: 'Pará' },
    { uf: 'PB', nome: 'Paraíba' },
    { uf: 'PR', nome: 'Paraná' },
    { uf: 'PE', nome: 'Pernambuco' },
    { uf: 'PI', nome: 'Piauí' },
    { uf: 'RJ', nome: 'Rio de Janeiro' },
    { uf: 'RN', nome: 'Rio Grande do Norte' },
    { uf: 'RS', nome: 'Rio Grande do Sul' },
    { uf: 'RO', nome: 'Rondônia' },
    { uf: 'RR', nome: 'Roraima' },
    { uf: 'SC', nome: 'Santa Catarina' },
    { uf: 'SP', nome: 'São Paulo' },
    { uf: 'SE', nome: 'Sergipe' },
    { uf: 'TO', nome: 'Tocantins' }
];
var CadastroFornecedores = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, onSave = _a.onSave;
    var _b = useState(fornecedorInicial), fornecedor = _b[0], setFornecedor = _b[1];
    var _c = useState(false), loading = _c[0], setLoading = _c[1];
    var _d = useState(null), error = _d[0], setError = _d[1];
    var _e = useState(null), alerta = _e[0], setAlerta = _e[1];
    useEffect(function () {
        if (isOpen) {
            console.log("Modal está aberto:", isOpen);
            generateSupplierCode();
            // ... outras inicializações
        }
    }, [isOpen]);
    var generateSupplierCode = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, nextId, formattedCode_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true); // Define o estado como "carregando"
                    return [4 /*yield*/, api.get('/next-Supplier-id')];
                case 1:
                    response = _a.sent();
                    console.log('Resposta da API de código de Fornecedor:', response.data);
                    // Verificar se a resposta contém o campo esperado
                    if (!response.data || response.data.nextId === undefined) {
                        throw new Error('Resposta da API inválida - campo nextId ausente');
                    }
                    nextId = response.data.nextId;
                    if (typeof nextId === 'string') {
                        // Se já for uma string, certificar-se de que tem o formato correto
                        formattedCode_1 = nextId.match(/^\d+$/)
                            ? nextId.padStart(7, '0')
                            : '0000001'; // Fallback se não for numérico
                    }
                    else if (typeof nextId === 'number') {
                        // Se for um número, converter para string com padding
                        formattedCode_1 = nextId.toString().padStart(7, '0');
                    }
                    else {
                        // Tipo inesperado, usar fallback
                        console.warn('Tipo de nextId inesperado:', typeof nextId);
                        formattedCode_1 = '0000001';
                    }
                    console.log('Código formatado para uso:', formattedCode_1);
                    // Atualizar o estado do Fornecedor
                    setFornecedor(function (prev) { return (__assign(__assign({}, prev), { codigo: formattedCode_1 })); });
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Erro ao gerar código do Fornecedor:', error_1);
                    // Define um código padrão em caso de erro
                    setFornecedor(function (prev) { return (__assign(__assign({}, prev), { codigo: '0000001' })); });
                    setAlerta({
                        tipo: 'warning',
                        mensagem: 'Erro ao gerar código do Fornecedor. Usando código padrão.',
                    });
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false); // Finaliza o estado de "carregando"
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
                validatedValue = "0"; // Define como 0 se o valor for inválido
            }
            else {
                validatedValue = numValue.toString();
            }
        }
        setFornecedor(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = validatedValue, _a)));
        });
    };
    var handleSave = function () { return __awaiter(void 0, void 0, void 0, function () {
        var fornecedorComDataFormatada, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!fornecedor.nome || !fornecedor.contato || !fornecedor.ultimacompra) {
                        setAlerta({
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
                    fornecedorComDataFormatada = __assign(__assign({}, fornecedor), { ultimacompra: fornecedor.ultimacompra instanceof Date
                            ? fornecedor.ultimacompra
                            : fornecedor.ultimacompra
                                ? new Date(fornecedor.ultimacompra)
                                : null });
                    // Salvar o fornecedor com a data formatada
                    return [4 /*yield*/, onSave(fornecedorComDataFormatada, [])];
                case 2:
                    // Salvar o fornecedor com a data formatada
                    _a.sent();
                    onClose();
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error("Erro ao salvar fornecedor:", err_1);
                    setError("Erro ao salvar fornecedor. Por favor, tente novamente.");
                    setAlerta({
                        tipo: "error",
                        mensagem: "Erro ao salvar fornecedor. Por favor, tente novamente.",
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg w-full max-w-4xl m-4", children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b", children: [_jsx("h2", { className: "text-2xl font-semibold", children: "Cadastro de Fornecedor" }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-full", children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "p-6 max-h-[calc(100vh-200px)] overflow-y-auto", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "C\u00F3digo *" }), _jsx("input", { type: "text", name: "codigo", value: loading ? "Carregando..." : fornecedor.codigo, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 bg-gray-200 p-2", required: true, readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nome *" }), _jsx("input", { type: "text", name: "nome", value: fornecedor.nome, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Contato *" }), _jsx("input", { type: "text", name: "contato", value: fornecedor.contato, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", required: true })] })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Telefone" }), _jsx("input", { type: "text", name: "telefone", value: fornecedor.telefone, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", required: true })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "E-mail" }), _jsx("input", { type: "text", name: "email", value: fornecedor.email, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", required: true })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Cidade" }), _jsx("input", { type: "text", name: "cidade", value: fornecedor.cidade, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", required: true })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Estado" }), _jsxs("select", { name: "estado", value: fornecedor.estado, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2 bg-white", required: true, children: [_jsx("option", { value: "", children: "Selecione um estado" }), estadosBrasil.map(function (estado) { return (_jsxs("option", { value: estado.uf, children: [estado.uf, " - ", estado.nome] }, estado.uf)); })] })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Endere\u00E7o" }), _jsx("input", { type: "text", name: "endereco", value: fornecedor.endereco, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", required: true })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Data da \u00FAltima compra" }), _jsx("input", { type: "date", name: "ultimacompra", value: fornecedor.ultimacompra
                                                ? new Date(fornecedor.ultimacompra).toISOString().slice(0, 10) // Pega apenas YYYY-MM-DD
                                                : "", onChange: function (e) {
                                                return setFornecedor(function (prev) { return (__assign(__assign({}, prev), { ultimacompra: e.target.value ? new Date(e.target.value) : null })); });
                                            }, className: "w-full rounded-lg border border-gray-300 p-2", required: true })] })] }), _jsxs("div", { className: "border-t p-6 flex justify-end gap-4", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50", children: "Cancelar" }), _jsx("button", { onClick: handleSave, className: "px-4 py-2 rounded-lg flex items-center ".concat(loading
                                        ? "bg-blue-400 text-white cursor-not-allowed" // Azul claro quando carregando
                                        : "bg-blue-600 text-white hover:bg-blue-700" // Azul padrão
                                    ), disabled: loading, children: loading ? (_jsx("span", { className: "inline-block", children: "Salvando..." })) : ("Salvar") })] })] })] }) }));
};
export default CadastroFornecedores;
