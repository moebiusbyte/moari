import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
const DeleteProductModal = ({ isOpen, onClose, onConfirm, productId, productName }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleDelete = async () => {
        if (!productId) {
            setError('ID do produto inválido');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            // Log para debug
            console.log('Tentando excluir produto com ID:', productId);
            await onConfirm(productId);
            // Se chegou aqui, deu tudo certo
            onClose();
        }
        catch (err) {
            // Log detalhado do erro
            console.error('Erro ao excluir:', {
                productId,
                error: err
            });
            // Tratamento mais específico do erro
            let errorMessage = 'Erro ao excluir produto. Por favor, tente novamente.';
            if (err?.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", children: _jsxs("div", { className: "bg-white rounded-lg w-full max-w-md m-4", children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b", children: [_jsxs("div", { className: "flex items-center text-red-600", children: [_jsx(AlertTriangle, { size: 24, className: "mr-2" }), _jsx("h2", { className: "text-xl font-semibold", children: "Confirmar Exclus\u00E3o" })] }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-full", disabled: loading, children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("p", { className: "text-gray-700 mb-4", children: ["Voc\u00EA tem certeza que deseja excluir o produto", ' ', _jsx("span", { className: "font-semibold", children: productName }), "?"] }), _jsx("p", { className: "text-sm text-gray-500 mb-6", children: "Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita e todos os dados associados a este produto ser\u00E3o permanentemente removidos." }), error && (_jsx(Alert, { className: "mb-4 border-red-200 bg-red-50", children: _jsx(AlertDescription, { className: "text-red-800", children: error }) })), _jsxs("div", { className: "flex justify-end gap-4", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50", disabled: loading, children: "Cancelar" }), _jsx("button", { onClick: handleDelete, className: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center min-w-[120px]", disabled: loading, children: loading ? (_jsx("span", { className: "inline-block", children: "Excluindo..." })) : ('Confirmar Exclusão') })] })] })] }) }));
};
export default DeleteProductModal;
