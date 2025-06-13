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
import { X, Trash2, AlertTriangle, Calendar, CreditCard } from 'lucide-react';
// Modal base component
var ModalBase = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, title = _a.title, children = _a.children, _b = _a.size, size = _b === void 0 ? "max-w-xl" : _b;
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", children: _jsxs("div", { className: "bg-white rounded-lg p-6 ".concat(size, " w-full mx-4 max-h-[90vh] overflow-y-auto"), children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: title }), _jsx("button", { onClick: onClose, className: "p-1 hover:bg-gray-100 rounded-full", children: _jsx(X, { className: "w-5 h-5" }) })] }), children] }) }));
};
// Modal de Confirmação de Exclusão
var DeleteSaleModal = function (_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, onConfirm = _a.onConfirm, saleId = _a.saleId, customerName = _a.customerName, saleAmount = _a.saleAmount, saleDate = _a.saleDate, paymentMethod = _a.paymentMethod;
    var _b = useState(false), loading = _b[0], setLoading = _b[1];
    var _c = useState(''), confirmText = _c[0], setConfirmText = _c[1];
    var handleConfirm = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, onConfirm(saleId)];
                case 2:
                    _a.sent();
                    onClose();
                    setConfirmText(''); // Limpar campo de confirmação
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Erro ao excluir venda:', error_1);
                    alert('Erro ao excluir venda. Tente novamente.');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    var getPaymentMethodText = function (method) {
        switch (method) {
            case 'pix':
                return 'PIX';
            case 'cartao_credito':
                return 'Cartão de Crédito';
            case 'cartao_debito':
                return 'Cartão de Débito';
            case 'dinheiro':
                return 'Dinheiro';
            case 'transferencia':
                return 'Transferência';
            default:
                return method || 'Não informado';
        }
    };
    // Validar se o usuário digitou "EXCLUIR" para confirmar
    var canConfirm = confirmText.toUpperCase() === 'EXCLUIR';
    return (_jsx(ModalBase, { isOpen: isOpen, onClose: onClose, title: "Confirmar Exclus\u00E3o", size: "max-w-md", children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-center", children: _jsx("div", { className: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center", children: _jsx(AlertTriangle, { className: "w-8 h-8 text-red-600" }) }) }), _jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Excluir Venda" }), _jsx("p", { className: "text-sm text-gray-600", children: "Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita. A venda ser\u00E1 permanentemente removida do sistema." })] }), _jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(Trash2, { className: "w-5 h-5 text-red-600 mt-1" }) }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-sm font-medium text-red-900", children: ["Venda para: ", _jsx("span", { className: "font-semibold", children: customerName })] }), _jsxs("p", { className: "text-xs text-red-700", children: ["ID: #", saleId] })] }), (saleAmount || saleDate || paymentMethod) && (_jsxs("div", { className: "border-t border-red-200 pt-2 space-y-1", children: [saleAmount && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-red-700", children: "Valor:" }), _jsx("span", { className: "text-xs font-medium text-red-900", children: formatCurrency(saleAmount) })] })), saleDate && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs text-red-700 flex items-center", children: [_jsx(Calendar, { className: "w-3 h-3 mr-1" }), "Data:"] }), _jsx("span", { className: "text-xs font-medium text-red-900", children: formatDate(saleDate) })] })), paymentMethod && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs text-red-700 flex items-center", children: [_jsx(CreditCard, { className: "w-3 h-3 mr-1" }), "Pagamento:"] }), _jsx("span", { className: "text-xs font-medium text-red-900", children: getPaymentMethodText(paymentMethod) })] }))] }))] })] }) }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Para confirmar, digite ", _jsx("span", { className: "font-semibold text-red-600", children: "\"EXCLUIR\"" }), " abaixo:"] }), _jsx("input", { type: "text", value: confirmText, onChange: function (e) { return setConfirmText(e.target.value); }, placeholder: "Digite EXCLUIR para confirmar", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500", disabled: loading })] }), _jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-3", children: _jsxs("div", { className: "flex items-start", children: [_jsx(AlertTriangle, { className: "w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" }), _jsxs("div", { className: "text-xs text-yellow-800", children: [_jsx("p", { className: "font-medium", children: "Aten\u00E7\u00E3o:" }), _jsxs("ul", { className: "mt-1 space-y-1", children: [_jsx("li", { children: "\u2022 A venda ser\u00E1 removida permanentemente" }), _jsx("li", { children: "\u2022 Os produtos n\u00E3o retornar\u00E3o ao estoque automaticamente" }), _jsx("li", { children: "\u2022 Relat\u00F3rios e estat\u00EDsticas ser\u00E3o atualizados" }), _jsx("li", { children: "\u2022 Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita" })] })] })] }) }), _jsxs("div", { className: "flex justify-end space-x-3 pt-4 border-t", children: [_jsx("button", { type: "button", onClick: onClose, disabled: loading, className: "px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors", children: "Cancelar" }), _jsxs("button", { type: "button", onClick: handleConfirm, disabled: loading || !canConfirm, className: "flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: [_jsx(Trash2, { className: "w-4 h-4 mr-2" }), loading ? 'Excluindo...' : 'Excluir Venda'] })] }), loading && (_jsx("div", { className: "text-center", children: _jsxs("div", { className: "inline-flex items-center text-sm text-gray-600", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2" }), "Processando exclus\u00E3o..."] }) }))] }) }));
};
export default DeleteSaleModal;
