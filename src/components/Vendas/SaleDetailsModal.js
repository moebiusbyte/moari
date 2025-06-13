import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X, User, CreditCard, Calendar, Package } from 'lucide-react';
// Modal base component
const ModalBase = ({ isOpen, onClose, title, children, size = "max-w-xl" }) => {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", children: _jsxs("div", { className: `bg-white rounded-lg p-6 ${size} w-full mx-4 max-h-[90vh] overflow-y-auto`, children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: title }), _jsx("button", { onClick: onClose, className: "p-1 hover:bg-gray-100 rounded-full", children: _jsx(X, { className: "w-5 h-5" }) })] }), children] }) }));
};
// Modal de Detalhes da Venda
const SaleDetailsModal = ({ isOpen, onClose, sale }) => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'Concluída';
            case 'pending':
                return 'Pendente';
            case 'cancelled':
                return 'Cancelada';
            default:
                return 'Desconhecido';
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
    return (_jsx(ModalBase, { isOpen: isOpen, onClose: onClose, title: "Detalhes da Venda", size: "max-w-3xl", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(User, { className: "w-5 h-5 text-gray-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Informa\u00E7\u00F5es do Cliente" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600", children: "Nome" }), _jsx("p", { className: "text-gray-900", children: sale.customer_name })] }), sale.customer_email && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600", children: "Email" }), _jsx("p", { className: "text-gray-900", children: sale.customer_email })] })), sale.customer_phone && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600", children: "Telefone" }), _jsx("p", { className: "text-gray-900", children: sale.customer_phone })] }))] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(Calendar, { className: "w-5 h-5 text-gray-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Informa\u00E7\u00F5es da Venda" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600", children: "Data da Venda" }), _jsx("p", { className: "text-gray-900", children: formatDate(sale.sale_date) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600", children: "Status" }), _jsx("span", { className: `inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sale.status)}`, children: getStatusText(sale.status) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600", children: "M\u00E9todo de Pagamento" }), _jsx("p", { className: "text-gray-900", children: getPaymentMethodText(sale.payment_method) })] })] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(Package, { className: "w-5 h-5 text-gray-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Produtos" })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "text-left py-2 text-sm font-medium text-gray-600", children: "Produto" }), _jsx("th", { className: "text-center py-2 text-sm font-medium text-gray-600", children: "Qtd" }), _jsx("th", { className: "text-right py-2 text-sm font-medium text-gray-600", children: "Pre\u00E7o Unit." }), _jsx("th", { className: "text-right py-2 text-sm font-medium text-gray-600", children: "Total" })] }) }), _jsx("tbody", { children: sale.items && sale.items.length > 0 ? (sale.items.map((item, index) => (_jsxs("tr", { className: "border-b", children: [_jsxs("td", { className: "py-2 text-sm text-gray-900", children: [item.product_name, item.product_code && (_jsxs("span", { className: "block text-xs text-gray-500", children: ["C\u00F3d: ", item.product_code] }))] }), _jsx("td", { className: "py-2 text-sm text-gray-900 text-center", children: item.quantity }), _jsx("td", { className: "py-2 text-sm text-gray-900 text-right", children: formatCurrency(item.unit_price) }), _jsx("td", { className: "py-2 text-sm font-semibold text-gray-900 text-right", children: formatCurrency(item.total_price) })] }, index)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "py-4 text-center text-gray-500", children: "Nenhum item encontrado" }) })) })] }) })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(CreditCard, { className: "w-5 h-5 text-gray-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Resumo Financeiro" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Subtotal:" }), _jsx("span", { className: "text-gray-900", children: formatCurrency(sale.total_amount + (sale.discount_amount || 0)) })] }), sale.discount_amount > 0 && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Desconto:" }), _jsxs("span", { className: "text-red-600", children: ["-", formatCurrency(sale.discount_amount)] })] })), _jsxs("div", { className: "flex justify-between text-lg font-semibold border-t pt-2", children: [_jsx("span", { children: "Total:" }), _jsx("span", { className: "text-green-600", children: formatCurrency(sale.total_amount) })] })] })] }), sale.notes && (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Observa\u00E7\u00F5es" }), _jsx("p", { className: "text-gray-700", children: sale.notes })] })), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Informa\u00E7\u00F5es do Sistema" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-600", children: "ID da Venda:" }), _jsxs("p", { className: "text-gray-900", children: ["#", sale.id] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-600", children: "Criado em:" }), _jsx("p", { className: "text-gray-900", children: formatDate(sale.created_at) })] }), sale.updated_at && (_jsxs("div", { children: [_jsx("label", { className: "block text-gray-600", children: "\u00DAltima atualiza\u00E7\u00E3o:" }), _jsx("p", { className: "text-gray-900", children: formatDate(sale.updated_at) })] }))] })] })] }) }));
};
export default SaleDetailsModal;
