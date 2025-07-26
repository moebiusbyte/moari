import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, Search, Package, User, MapPin, DollarSign } from 'lucide-react';
import api from '../../../server/api/axiosConfig';
const FormularioVendaConsignado = ({ isOpen, onClose, onSave }) => {
    // Estados para busca e seleção de consignados
    const [consignadosDisponiveis, setConsignadosDisponiveis] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedConsignado, setSelectedConsignado] = useState(null);
    // Estados do formulário de venda
    const [formData, setFormData] = useState({
        quantidadeVendida: 1,
        precoVenda: 0,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        paymentMethod: 'dinheiro',
        notes: '',
        desconto: 0
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    // Buscar consignados disponíveis
    const fetchConsignadosDisponiveis = async () => {
        try {
            setLoading(true);
            console.log('🔍 Buscando consignados disponíveis...');
            const params = new URLSearchParams();
            if (searchTerm.trim()) {
                params.append('search', searchTerm.trim());
            }
            const response = await api.get(`/consignados-vendas/disponiveis?${params}`);
            if (response.data.success) {
                setConsignadosDisponiveis(response.data.consignados);
                console.log(`✅ ${response.data.consignados.length} consignados encontrados`);
            }
        }
        catch (error) {
            console.error('❌ Erro ao buscar consignados:', error);
            setConsignadosDisponiveis([]);
        }
        finally {
            setLoading(false);
        }
    };
    // Efeito para buscar consignados ao abrir modal ou mudar busca
    useEffect(() => {
        if (isOpen) {
            fetchConsignadosDisponiveis();
        }
    }, [isOpen, searchTerm]);
    // Reset do formulário ao fechar
    useEffect(() => {
        if (!isOpen) {
            setSelectedConsignado(null);
            setSearchTerm('');
            setFormData({
                quantidadeVendida: 1,
                precoVenda: 0,
                customerName: '',
                customerEmail: '',
                customerPhone: '',
                paymentMethod: 'dinheiro',
                notes: '',
                desconto: 0
            });
            setErrors({});
        }
    }, [isOpen]);
    // Atualizar preço quando selecionar consignado
    useEffect(() => {
        if (selectedConsignado) {
            setFormData(prev => ({
                ...prev,
                precoVenda: Number(selectedConsignado.valor_combinado || selectedConsignado.base_price || 0),
                quantidadeVendida: Math.min(1, selectedConsignado.quantidade_disponivel)
            }));
        }
    }, [selectedConsignado]);
    // Função para selecionar consignado
    const handleSelectConsignado = (consignado) => {
        setSelectedConsignado(consignado);
        console.log('📦 Consignado selecionado:', consignado);
    };
    // Função para voltar à seleção
    const handleBackToSelection = () => {
        setSelectedConsignado(null);
    };
    // Validação do formulário
    const validateForm = () => {
        const newErrors = {};
        if (!selectedConsignado) {
            newErrors.consignado = 'Selecione um produto consignado';
        }
        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Nome do cliente é obrigatório';
        }
        if (!formData.paymentMethod) {
            newErrors.paymentMethod = 'Método de pagamento é obrigatório';
        }
        if (formData.quantidadeVendida < 1) {
            newErrors.quantidadeVendida = 'Quantidade deve ser maior que 0';
        }
        if (selectedConsignado && formData.quantidadeVendida > selectedConsignado.quantidade_disponivel) {
            newErrors.quantidadeVendida = `Quantidade máxima disponível: ${selectedConsignado.quantidade_disponivel}`;
        }
        if (formData.precoVenda <= 0) {
            newErrors.precoVenda = 'Preço deve ser maior que 0';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // Função para submeter venda
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            setSubmitting(true);
            const vendaData = {
                consignacaoId: selectedConsignado.consignacao_id,
                quantidadeVendida: formData.quantidadeVendida,
                precoVenda: formData.precoVenda,
                customerName: formData.customerName.trim(),
                customerEmail: formData.customerEmail.trim() || null,
                customerPhone: formData.customerPhone.trim() || null,
                paymentMethod: formData.paymentMethod,
                notes: formData.notes.trim() || null,
                desconto: formData.desconto || 0
            };
            console.log('💰 Submetendo venda de consignado:', vendaData);
            await onSave(vendaData);
            onClose();
        }
        catch (error) {
            console.error('❌ Erro ao salvar venda:', error);
        }
        finally {
            setSubmitting(false);
        }
    };
    if (!isOpen)
        return null;
    const valorTotal = (formData.precoVenda * formData.quantidadeVendida) - formData.desconto;
    const comissaoValue = selectedConsignado ? valorTotal * (Number(selectedConsignado.comissao || 0) / 100) : 0;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-800", children: selectedConsignado ? 'Registrar Venda de Consignado' : 'Selecionar Produto Consignado' }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-full transition-colors", title: "Fechar modal", "aria-label": "Fechar modal", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "p-6", children: !selectedConsignado ? (
                    // Tela de seleção de consignado
                    _jsxs("div", { children: [_jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Buscar produto consignado" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-3 h-4 w-4 text-gray-400" }), _jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Busque por produto, c\u00F3digo ou consignado...", className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] })] }), loading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("p", { className: "mt-2 text-gray-600", children: "Carregando produtos..." })] })) : consignadosDisponiveis.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(Package, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-gray-600", children: "Nenhum produto consignado dispon\u00EDvel para venda" })] })) : (_jsx("div", { className: "grid gap-4", children: consignadosDisponiveis.map((consignado) => (_jsx("div", { onClick: () => handleSelectConsignado(consignado), className: "border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors", children: _jsx("div", { className: "flex justify-between items-start", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: consignado.product_name }), _jsxs("p", { className: "text-sm text-gray-600", children: ["C\u00F3digo: ", consignado.product_code || 'N/A'] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-lg font-bold text-green-600", children: ["R$ ", Number(consignado.valor_combinado || consignado.base_price || 0).toFixed(2)] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Comiss\u00E3o: ", Number(consignado.comissao || 0), "%"] })] })] }), _jsxs("div", { className: "mt-3 grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(User, { className: "w-4 h-4 mr-2" }), _jsx("span", { children: consignado.consignado_nome })] }), _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(MapPin, { className: "w-4 h-4 mr-2" }), _jsxs("span", { children: [consignado.consignado_cidade, ", ", consignado.consignado_estado] })] })] }), _jsxs("div", { className: "mt-3 flex justify-between items-center", children: [_jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800", children: ["Dispon\u00EDvel: ", consignado.quantidade_disponivel, " / ", consignado.quantidade_consignada] }), _jsxs("span", { className: "text-sm text-gray-500", children: ["Consignado em: ", new Date(consignado.data_consignacao).toLocaleDateString('pt-BR')] })] })] }) }) }, consignado.consignacao_id))) }))] })) : (
                    // Formulário de venda
                    _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("h3", { className: "font-semibold text-blue-900", children: selectedConsignado.product_name }), _jsx("button", { type: "button", onClick: handleBackToSelection, className: "text-sm text-blue-600 hover:text-blue-800", children: "Alterar produto" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-blue-700", children: "Consignado:" }), " ", selectedConsignado.consignado_nome] }), _jsxs("div", { children: [_jsx("span", { className: "text-blue-700", children: "Dispon\u00EDvel:" }), " ", selectedConsignado.quantidade_disponivel, " unidades"] }), _jsxs("div", { children: [_jsx("span", { className: "text-blue-700", children: "Pre\u00E7o base:" }), " R$ ", Number(selectedConsignado.base_price || 0).toFixed(2)] }), _jsxs("div", { children: [_jsx("span", { className: "text-blue-700", children: "Comiss\u00E3o:" }), " ", Number(selectedConsignado.comissao || 0), "%"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Dados da Venda" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Quantidade Vendida *" }), _jsx("input", { type: "number", min: "1", max: selectedConsignado.quantidade_disponivel, value: formData.quantidadeVendida, onChange: (e) => setFormData({ ...formData, quantidadeVendida: parseInt(e.target.value) || 1 }), className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.quantidadeVendida ? 'border-red-300' : 'border-gray-300'}`, title: "Quantidade a ser vendida", placeholder: "Quantidade" }), errors.quantidadeVendida && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.quantidadeVendida }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Pre\u00E7o de Venda (unidade) *" }), _jsx("input", { type: "number", step: "0.01", min: "0", value: formData.precoVenda, onChange: (e) => setFormData({ ...formData, precoVenda: parseFloat(e.target.value) || 0 }), className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.precoVenda ? 'border-red-300' : 'border-gray-300'}`, title: "Pre\u00E7o unit\u00E1rio de venda", placeholder: "0.00" }), errors.precoVenda && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.precoVenda }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Desconto" }), _jsx("input", { type: "number", step: "0.01", min: "0", value: formData.desconto, onChange: (e) => setFormData({ ...formData, desconto: parseFloat(e.target.value) || 0 }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", title: "Valor do desconto", placeholder: "0.00" })] }), _jsx("div", { className: "p-3 bg-gray-50 rounded-lg", children: _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Subtotal:" }), _jsxs("span", { children: ["R$ ", (formData.precoVenda * formData.quantidadeVendida).toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Desconto:" }), _jsxs("span", { children: ["- R$ ", formData.desconto.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between font-semibold text-base border-t pt-2", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { children: ["R$ ", valorTotal.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between text-blue-600", children: [_jsxs("span", { children: ["Comiss\u00E3o (", Number(selectedConsignado.comissao || 0), "%):"] }), _jsxs("span", { children: ["R$ ", comissaoValue.toFixed(2)] })] })] }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Dados do Cliente" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nome do Cliente *" }), _jsx("input", { type: "text", value: formData.customerName, onChange: (e) => setFormData({ ...formData, customerName: e.target.value }), className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.customerName ? 'border-red-300' : 'border-gray-300'}`, placeholder: "Nome completo do cliente" }), errors.customerName && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.customerName }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", value: formData.customerEmail, onChange: (e) => setFormData({ ...formData, customerEmail: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "email@exemplo.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Telefone" }), _jsx("input", { type: "tel", value: formData.customerPhone, onChange: (e) => setFormData({ ...formData, customerPhone: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "(11) 99999-9999" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "M\u00E9todo de Pagamento *" }), _jsxs("select", { value: formData.paymentMethod, onChange: (e) => setFormData({ ...formData, paymentMethod: e.target.value }), className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.paymentMethod ? 'border-red-300' : 'border-gray-300'}`, title: "Selecione o m\u00E9todo de pagamento", children: [_jsx("option", { value: "dinheiro", children: "Dinheiro" }), _jsx("option", { value: "cartao_credito", children: "Cart\u00E3o de Cr\u00E9dito" }), _jsx("option", { value: "cartao_debito", children: "Cart\u00E3o de D\u00E9bito" }), _jsx("option", { value: "pix", children: "PIX" }), _jsx("option", { value: "transferencia", children: "Transfer\u00EAncia" }), _jsx("option", { value: "cheque", children: "Cheque" })] }), errors.paymentMethod && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.paymentMethod }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Observa\u00E7\u00F5es" }), _jsx("textarea", { value: formData.notes, onChange: (e) => setFormData({ ...formData, notes: e.target.value }), rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: "Observa\u00E7\u00F5es sobre a venda..." })] })] })] }), _jsxs("div", { className: "mt-8 flex justify-end space-x-3", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors", disabled: submitting, children: "Cancelar" }), _jsx("button", { type: "submit", disabled: submitting, className: "px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center", children: submitting ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Processando..."] })) : (_jsxs(_Fragment, { children: [_jsx(DollarSign, { className: "w-4 h-4 mr-2" }), "Registrar Venda"] })) })] })] })) })] }) }));
};
export default FormularioVendaConsignado;
