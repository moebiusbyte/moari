import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, User, CreditCard, Save } from 'lucide-react';
// Modal base component
const ModalBase = ({ isOpen, onClose, title, children, size = "max-w-xl" }) => {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", children: _jsxs("div", { className: `bg-white rounded-lg p-6 ${size} w-full mx-4 max-h-[90vh] overflow-y-auto`, children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: title }), _jsx("button", { onClick: onClose, className: "p-1 hover:bg-gray-100 rounded-full", children: _jsx(X, { className: "w-5 h-5" }) })] }), children] }) }));
};
// Modal de Edição da Venda
const EditSaleModal = ({ isOpen, onClose, onSave, sale }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        payment_method: '',
        total_amount: 0,
        discount_amount: 0,
        notes: '',
        status: 'completed'
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (sale) {
            setFormData({
                customer_name: sale.customer_name || '',
                customer_email: sale.customer_email || '',
                customer_phone: sale.customer_phone || '',
                payment_method: sale.payment_method || '',
                total_amount: sale.total_amount || 0,
                discount_amount: sale.discount_amount || 0,
                notes: sale.notes || '',
                status: sale.status || 'completed'
            });
            setErrors({}); // Limpar erros quando um novo sale é carregado
        }
    }, [sale]);
    const validateForm = () => {
        const newErrors = {};
        if (!formData.customer_name.trim()) {
            newErrors.customer_name = 'Nome do cliente é obrigatório';
        }
        if (!formData.payment_method) {
            newErrors.payment_method = 'Método de pagamento é obrigatório';
        }
        if (formData.total_amount <= 0) {
            newErrors.total_amount = 'Valor total deve ser maior que zero';
        }
        if (formData.discount_amount < 0) {
            newErrors.discount_amount = 'Desconto não pode ser negativo';
        }
        if (formData.discount_amount > formData.total_amount + formData.discount_amount) {
            newErrors.discount_amount = 'Desconto não pode ser maior que o subtotal';
        }
        if (formData.customer_email && !isValidEmail(formData.customer_email)) {
            newErrors.customer_email = 'Email inválido';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        }
        catch (error) {
            console.error('Erro ao atualizar venda:', error);
            alert('Erro ao atualizar venda. Tente novamente.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'total_amount' || name === 'discount_amount'
                ? parseFloat(value) || 0
                : value
        }));
        // Limpar erro do campo quando o usuário começar a digitar
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    const getPaymentMethodText = (method) => {
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
                return method;
        }
    };
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    const subtotal = formData.total_amount + formData.discount_amount;
    return (_jsx(ModalBase, { isOpen: isOpen, onClose: onClose, title: "Editar Venda", size: "max-w-2xl", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(User, { className: "w-5 h-5 text-gray-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Informa\u00E7\u00F5es do Cliente" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nome do Cliente *" }), _jsx("input", { type: "text", name: "customer_name", value: formData.customer_name, onChange: handleChange, required: true, className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.customer_name ? 'border-red-500' : 'border-gray-300'}`, placeholder: "Nome completo do cliente" }), errors.customer_name && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.customer_name }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email do Cliente" }), _jsx("input", { type: "email", name: "customer_email", value: formData.customer_email, onChange: handleChange, className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.customer_email ? 'border-red-500' : 'border-gray-300'}`, placeholder: "email@exemplo.com" }), errors.customer_email && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.customer_email }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Telefone do Cliente" }), _jsx("input", { type: "tel", name: "customer_phone", value: formData.customer_phone, onChange: handleChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "(11) 99999-9999" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status da Venda *" }), _jsxs("select", { name: "status", value: formData.status, onChange: handleChange, required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "completed", children: "Conclu\u00EDda" }), _jsx("option", { value: "pending", children: "Pendente" }), _jsx("option", { value: "cancelled", children: "Cancelada" })] })] })] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(CreditCard, { className: "w-5 h-5 text-gray-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Informa\u00E7\u00F5es de Pagamento" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "M\u00E9todo de Pagamento *" }), _jsxs("select", { name: "payment_method", value: formData.payment_method, onChange: handleChange, required: true, className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.payment_method ? 'border-red-500' : 'border-gray-300'}`, children: [_jsx("option", { value: "", children: "Selecione..." }), _jsx("option", { value: "pix", children: "PIX" }), _jsx("option", { value: "cartao_credito", children: "Cart\u00E3o de Cr\u00E9dito" }), _jsx("option", { value: "cartao_debito", children: "Cart\u00E3o de D\u00E9bito" }), _jsx("option", { value: "dinheiro", children: "Dinheiro" }), _jsx("option", { value: "transferencia", children: "Transfer\u00EAncia" })] }), errors.payment_method && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.payment_method }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Valor Total *" }), _jsx("input", { type: "number", name: "total_amount", value: formData.total_amount, onChange: handleChange, step: "0.01", min: "0", required: true, className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.total_amount ? 'border-red-500' : 'border-gray-300'}`, placeholder: "0,00" }), errors.total_amount && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.total_amount }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Desconto" }), _jsx("input", { type: "number", name: "discount_amount", value: formData.discount_amount, onChange: handleChange, step: "0.01", min: "0", max: subtotal, className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.discount_amount ? 'border-red-500' : 'border-gray-300'}`, placeholder: "0,00" }), errors.discount_amount && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.discount_amount }))] }), _jsxs("div", { className: "bg-white p-3 rounded border", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Resumo" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Subtotal:" }), _jsx("span", { children: formatCurrency(subtotal) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Desconto:" }), _jsxs("span", { className: "text-red-600", children: ["-", formatCurrency(formData.discount_amount)] })] }), _jsxs("div", { className: "flex justify-between font-semibold border-t pt-1", children: [_jsx("span", { children: "Total:" }), _jsx("span", { className: "text-green-600", children: formatCurrency(formData.total_amount) })] })] })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Observa\u00E7\u00F5es" }), _jsx("textarea", { name: "notes", value: formData.notes, onChange: handleChange, rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Observa\u00E7\u00F5es sobre a venda..." })] }), _jsxs("div", { className: "flex justify-end space-x-3 pt-4 border-t", children: [_jsx("button", { type: "button", onClick: onClose, disabled: loading, className: "px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50", children: "Cancelar" }), _jsxs("button", { type: "submit", disabled: loading, className: "flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50", children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), loading ? 'Salvando...' : 'Salvar Alterações'] })] })] }) }));
};
export default EditSaleModal;
