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
import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
var DeleteProductModal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, onConfirm = _a.onConfirm, productId = _a.productId, productName = _a.productName;
    var _b = useState(false), loading = _b[0], setLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var handleDelete = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!productId) {
                        setError('ID do produto inválido');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setLoading(true);
                    setError(null);
                    // Log para debug
                    console.log('Tentando excluir produto com ID:', productId);
                    return [4 /*yield*/, onConfirm(productId)];
                case 2:
                    _a.sent();
                    // Se chegou aqui, deu tudo certo
                    onClose();
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    // Log detalhado do erro
                    console.error('Erro ao excluir:', {
                        productId: productId,
                        error: err_1
                    });
                    errorMessage = 'Erro ao excluir produto. Por favor, tente novamente.';
                    if (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) {
                        errorMessage = err_1.message;
                    }
                    setError(errorMessage);
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
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", children: _jsxs("div", { className: "bg-white rounded-lg w-full max-w-md m-4", children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b", children: [_jsxs("div", { className: "flex items-center text-red-600", children: [_jsx(AlertTriangle, { size: 24, className: "mr-2" }), _jsx("h2", { className: "text-xl font-semibold", children: "Confirmar Exclus\u00E3o" })] }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-full", disabled: loading, children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("p", { className: "text-gray-700 mb-4", children: ["Voc\u00EA tem certeza que deseja excluir o produto", ' ', _jsx("span", { className: "font-semibold", children: productName }), "?"] }), _jsx("p", { className: "text-sm text-gray-500 mb-6", children: "Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita e todos os dados associados a este produto ser\u00E3o permanentemente removidos." }), error && (_jsx(Alert, { className: "mb-4 border-red-200 bg-red-50", children: _jsx(AlertDescription, { className: "text-red-800", children: error }) })), _jsxs("div", { className: "flex justify-end gap-4", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50", disabled: loading, children: "Cancelar" }), _jsx("button", { onClick: handleDelete, className: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center min-w-[120px]", disabled: loading, children: loading ? (_jsx("span", { className: "inline-block", children: "Excluindo..." })) : ('Confirmar Exclusão') })] })] })] }) }));
};
export default DeleteProductModal;
