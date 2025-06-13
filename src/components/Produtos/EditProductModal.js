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
var EditProductModal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, onSave = _a.onSave, product = _a.product, suppliers = _a.suppliers;
    var _b = useState({}), formData = _b[0], setFormData = _b[1];
    var _c = useState([]), newImages = _c[0], setNewImages = _c[1];
    var _d = useState(null), error = _d[0], setError = _d[1];
    var _e = useState(false), loading = _e[0], setLoading = _e[1];
    var _f = useState(null), validationMessage = _f[0], setValidationMessage = _f[1];
    // Atualizar o useEffect para incluir o supplier_id
    useEffect(function () {
        if (product) {
            console.log('🔍 Product data received in modal:', product);
            console.log('🏢 Supplier ID from product:', product.supplier_id);
            setFormData({
                id: product.id,
                code: product.code,
                name: product.name,
                category: product.category,
                material_type: product.material_type,
                size: product.size,
                base_price: product.base_price,
                profit_margin: product.profit_margin,
                description: product.description,
                status: product.status,
                quantity: product.quantity,
                buy_date: product.buy_date,
                supplier_id: product.supplier_id || '' // Garantir que não seja undefined
            });
        }
    }, [product]);
    // Validação para campos numéricos
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
        var _a = e.target, name = _a.name, value = _a.value;
        var validatedValue = value;
        // Validação de campos numéricos
        if (name === "base_price") {
            validatedValue = validateNumberInput(value, 99999.99);
            if (parseFloat(value) > 99999.99) {
                setValidationMessage("O preço base não pode exceder R$ 99.999,99");
            }
            else {
                setValidationMessage(null);
            }
        }
        else if (name === "profit_margin") {
            validatedValue = validateNumberInput(value, 999.99);
            if (parseFloat(value) > 999.99) {
                setValidationMessage("A margem de lucro não pode exceder 999,99%");
            }
            else {
                setValidationMessage(null);
            }
        }
        else if (name === "quantity") {
            var intValue = parseInt(value);
            if (isNaN(intValue) || intValue < 0) {
                validatedValue = "1";
            }
            else if (intValue > 9999) {
                validatedValue = "9999";
                setValidationMessage("A quantidade não pode exceder 9.999 unidades");
            }
            else {
                validatedValue = value;
                setValidationMessage(null);
            }
        }
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = validatedValue, _a)));
        });
    };
    var handleImageChange = function (e) {
        if (e.target.files) {
            setNewImages(Array.from(e.target.files));
        }
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
                    console.log('📤 Form data being sent:', formData);
                    console.log('🏢 Supplier ID being sent:', formData.supplier_id);
                    return [4 /*yield*/, onSave(formData, newImages)];
                case 2:
                    _a.sent();
                    onClose();
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError(err_1 instanceof Error ? err_1.message : 'Erro ao atualizar produto');
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
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg w-full max-w-2xl m-4 flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b", children: [_jsx("h2", { className: "text-2xl font-semibold", children: "Editar Produto" }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-full", children: _jsx(X, { size: 24 }) })] }), _jsx("div", { className: "overflow-y-auto flex-1 p-6", children: _jsxs("form", { id: "edit-product-form", onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "C\u00F3digo" }), _jsx("input", { type: "text", name: "code", value: formData.code || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 bg-gray-200 p-2", readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nome" }), _jsx("input", { type: "text", name: "name", value: formData.name || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Categoria" }), _jsxs("select", { name: "category", value: formData.category || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", children: [_jsx("option", { value: "", children: "Selecione..." }), _jsx("option", { value: "colares", children: "Colares" }), _jsx("option", { value: "brincos", children: "Brincos" }), _jsx("option", { value: "aneis", children: "An\u00E9is" }), _jsx("option", { value: "pulseiras", children: "Pulseiras" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Fornecedor" }), _jsxs("select", { name: "supplier_id", value: formData.supplier_id || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", children: [_jsx("option", { value: "", children: "Selecione um fornecedor..." }), suppliers.map(function (supplier) { return (_jsx("option", { value: supplier.id, children: supplier.nome || "Fornecedor ".concat(supplier.id) }, supplier.id)); })] }), _jsx("span", { className: "text-xs text-gray-500", children: "Associe este produto a um fornecedor existente" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Qualidade" }), _jsxs("select", { name: "quality", value: formData.quality || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", children: [_jsx("option", { value: "", children: "Selecione..." }), _jsx("option", { value: "alta", children: "Alta" }), _jsx("option", { value: "media", children: "M\u00E9dia" }), _jsx("option", { value: "baixa", children: "Baixa" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Pre\u00E7o Base" }), _jsx("input", { type: "number", name: "base_price", value: formData.base_price || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", step: "0.01", max: "99999.99", min: "0" }), _jsx("span", { className: "text-xs text-gray-500", children: "M\u00E1ximo: R$ 99.999,99" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Margem de Lucro" }), _jsx("input", { type: "number", name: "profit_margin", value: formData.profit_margin || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", step: "0.01", max: "999.99", min: "0" }), _jsx("span", { className: "text-xs text-gray-500", children: "M\u00E1ximo: 999,99%" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { name: "status", value: formData.status || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", children: [_jsx("option", { value: "active", children: "Ativo" }), _jsx("option", { value: "consigned", children: "Consignado" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Quantidade em Estoque" }), _jsx("input", { type: "number", name: "quantity", value: formData.quantity || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", min: "0", max: "9999", step: "1" }), _jsx("span", { className: "text-xs text-gray-500", children: "M\u00E1ximo: 9.999 unidades" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Data de Compra" }), _jsx("input", { type: "date", name: "buy_date", value: formData.buy_date || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" }), _jsx("span", { className: "text-xs text-gray-500", children: "Data de entrada no estoque" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { name: "description", value: formData.description || '', onChange: handleChange, rows: 4, className: "w-full rounded-lg border border-gray-300 p-2" })] }), formData.buy_date && (_jsx("div", { className: "bg-blue-50 p-3 rounded-lg", children: _jsxs("div", { className: "text-sm text-blue-800", children: [_jsx("strong", { children: "Tempo em Estoque:" }), " ", (function () {
                                            var buyDate = new Date(formData.buy_date);
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
                                        })()] }) })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Novas Imagens" }), _jsx("input", { type: "file", onChange: handleImageChange, multiple: true, accept: "image/*", className: "w-full rounded-lg border border-gray-300 p-2" })] }), validationMessage && (_jsx(Alert, { className: "mt-4", children: _jsx(AlertDescription, { children: validationMessage }) })), error && (_jsx(Alert, { className: "mt-4", children: _jsx(AlertDescription, { children: error }) }))] }) }), _jsxs("div", { className: "border-t p-6 flex justify-end gap-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50", disabled: loading, children: "Cancelar" }), _jsxs("button", { type: "submit", form: "edit-product-form", className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50", disabled: loading, children: [_jsx(Save, { size: 20, className: "mr-2" }), loading ? 'Salvando...' : 'Salvar Alterações'] })] })] }) }));
};
export default EditProductModal;
