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
import { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
var EditFornecedorModal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, onSave = _a.onSave, fornecedor = _a.fornecedor;
    var _b = useState({}), formData = _b[0], setFormData = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var _d = useState(false), loading = _d[0], setLoading = _d[1];
    var _e = useState(null), validationMessage = _e[0], setValidationMessage = _e[1];
    // Atualizar o useEffect para incluir todos os campos do fornecedor
    useEffect(function () {
        if (fornecedor) {
            setFormData({
                id: fornecedor.id,
                nome: fornecedor.nome,
                contato: fornecedor.contato,
                telefone: fornecedor.telefone,
                email: fornecedor.email,
                endereco: fornecedor.endereco,
                cidade: fornecedor.cidade,
                estado: fornecedor.estado,
                ultima_compra: fornecedor.ultima_compra
            });
        }
    }, [fornecedor]);
    var handleChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onSave(formData)];
                case 2:
                    _a.sent();
                    onClose();
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError(err_1 instanceof Error ? err_1.message : 'Erro ao atualizar fornecedor');
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
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg w-full max-w-2xl m-4 flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b", children: [_jsx("h2", { className: "text-2xl font-semibold", children: "Editar Fornecedor" }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-full", children: _jsx(X, { size: 24 }) })] }), _jsx("div", { className: "overflow-y-auto flex-1 p-6", children: _jsxs("form", { id: "edit-fornecedor-form", onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "ID" }), _jsx("input", { type: "text", name: "id", value: formData.id || '', className: "w-full rounded-lg border border-gray-300 bg-gray-200 p-2", readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nome do Fornecedor *" }), _jsx("input", { type: "text", name: "nome", value: formData.nome || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Contato" }), _jsx("input", { type: "text", name: "contato", value: formData.contato || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Telefone" }), _jsx("input", { type: "text", name: "telefone", value: formData.telefone || '', onChange: handleChange, placeholder: "(11) 99999-9999", className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "E-mail" }), _jsx("input", { type: "email", name: "email", value: formData.email || '', onChange: handleChange, placeholder: "exemplo@email.com", className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Endere\u00E7o" }), _jsx("input", { type: "text", name: "endereco", value: formData.endereco || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Cidade" }), _jsx("input", { type: "text", name: "cidade", value: formData.cidade || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Estado" }), _jsxs("select", { name: "estado", value: formData.estado || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", children: [_jsx("option", { value: "", children: "Selecione..." }), _jsx("option", { value: "AC", children: "Acre (AC)" }), _jsx("option", { value: "AL", children: "Alagoas (AL)" }), _jsx("option", { value: "AP", children: "Amap\u00E1 (AP)" }), _jsx("option", { value: "AM", children: "Amazonas (AM)" }), _jsx("option", { value: "BA", children: "Bahia (BA)" }), _jsx("option", { value: "CE", children: "Cear\u00E1 (CE)" }), _jsx("option", { value: "DF", children: "Distrito Federal (DF)" }), _jsx("option", { value: "ES", children: "Esp\u00EDrito Santo (ES)" }), _jsx("option", { value: "GO", children: "Goi\u00E1s (GO)" }), _jsx("option", { value: "MA", children: "Maranh\u00E3o (MA)" }), _jsx("option", { value: "MT", children: "Mato Grosso (MT)" }), _jsx("option", { value: "MS", children: "Mato Grosso do Sul (MS)" }), _jsx("option", { value: "MG", children: "Minas Gerais (MG)" }), _jsx("option", { value: "PA", children: "Par\u00E1 (PA)" }), _jsx("option", { value: "PB", children: "Para\u00EDba (PB)" }), _jsx("option", { value: "PR", children: "Paran\u00E1 (PR)" }), _jsx("option", { value: "PE", children: "Pernambuco (PE)" }), _jsx("option", { value: "PI", children: "Piau\u00ED (PI)" }), _jsx("option", { value: "RJ", children: "Rio de Janeiro (RJ)" }), _jsx("option", { value: "RN", children: "Rio Grande do Norte (RN)" }), _jsx("option", { value: "RS", children: "Rio Grande do Sul (RS)" }), _jsx("option", { value: "RO", children: "Rond\u00F4nia (RO)" }), _jsx("option", { value: "RR", children: "Roraima (RR)" }), _jsx("option", { value: "SC", children: "Santa Catarina (SC)" }), _jsx("option", { value: "SP", children: "S\u00E3o Paulo (SP)" }), _jsx("option", { value: "SE", children: "Sergipe (SE)" }), _jsx("option", { value: "TO", children: "Tocantins (TO)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u00DAltima Compra" }), _jsx("input", { type: "date", name: "ultima_compra", value: formData.ultima_compra ? formData.ultima_compra.split('T')[0] : '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" }), _jsx("span", { className: "text-xs text-gray-500", children: "Data da \u00FAltima compra realizada" })] }), formData.ultima_compra && (_jsx("div", { className: "bg-blue-50 p-3 rounded-lg", children: _jsxs("div", { className: "text-sm text-blue-800", children: [_jsx("strong", { children: "Tempo desde a \u00FAltima compra:" }), " ", (function () {
                                            var buyDate = new Date(formData.ultima_compra);
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
                                        })()] }) })), validationMessage && (_jsx(Alert, { className: "mt-4", children: _jsx(AlertDescription, { children: validationMessage }) })), error && (_jsx(Alert, { className: "mt-4", children: _jsx(AlertDescription, { children: error }) }))] }) }), _jsxs("div", { className: "border-t p-6 flex justify-end gap-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50", disabled: loading, children: "Cancelar" }), _jsxs("button", { type: "submit", form: "edit-fornecedor-form", className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50", disabled: loading, children: [_jsx(Save, { size: 20, className: "mr-2" }), loading ? 'Salvando...' : 'Salvar Alterações'] })] })] }) }));
};
export default EditFornecedorModal;
