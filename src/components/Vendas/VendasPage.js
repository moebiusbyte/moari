import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, ArrowLeft, ArrowRight, Filter, DollarSign, TrendingUp, Calendar, Users, X, Eye } from "lucide-react";
import FormularioVenda from "./FormularioVenda";
import EditSaleModal from './EditSaleModal';
import DeleteSaleModal from './DeleteSaleModal';
import SaleDetailsModal from './SaleDetailsModal';
import api from "../../../server/api/axiosConfig";
const Modal = ({ isOpen, onClose, title, children, size = "max-w-xl" }) => {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", children: _jsxs("div", { className: `bg-white rounded-lg p-6 ${size} w-full mx-4 max-h-[90vh] overflow-y-auto`, children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: title }), _jsx("button", { onClick: onClose, className: "p-1 hover:bg-gray-100 rounded-full", children: _jsx(X, { className: "w-5 h-5" }) })] }), children] }) }));
};
const VendasPage = () => {
    // Estados para modais
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Estados para dados e paginação
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    // Estados para filtros avançados
    const [filtroAvancado, setFiltroAvancado] = useState({
        paymentMethod: "",
        status: "",
        dateFrom: "",
        dateTo: ""
    });
    // Estado para ordenação
    const [ordenacao, setOrdenacao] = useState({
        campo: "sale_date",
        ordem: "desc"
    });
    // Estado para estatísticas
    const [estatisticas, setEstatisticas] = useState({
        totalVendas: 0,
        vendasConcluidas: 0,
        vendasPendentes: 0,
        vendasCanceladas: 0,
        receitaTotal: 0,
        ticketMedio: 0,
        vendasHoje: 0,
        receitaHoje: 0
    });
    // Função para buscar vendas
    const fetchSales = async () => {
        try {
            setLoading(true);
            console.log('\n🚀 === DEBUG FILTROS VENDAS ===');
            console.log('Estado filtroAvancado:', JSON.stringify(filtroAvancado, null, 2));
            console.log('================================\n');
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search: searchTerm,
                orderBy: ordenacao.campo,
                orderDirection: ordenacao.ordem,
                paymentMethod: filtroAvancado.paymentMethod,
                status: filtroAvancado.status,
                dateFrom: filtroAvancado.dateFrom,
                dateTo: filtroAvancado.dateTo
            });
            console.log('📤 Parâmetros enviados para a API:', {
                page: page.toString(),
                limit: "10",
                search: searchTerm,
                orderBy: ordenacao.campo,
                orderDirection: ordenacao.ordem,
                paymentMethod: filtroAvancado.paymentMethod,
                status: filtroAvancado.status,
                dateFrom: filtroAvancado.dateFrom,
                dateTo: filtroAvancado.dateTo
            });
            const fullUrl = `/sales?${params}`;
            console.log('🌐 URL completa:', fullUrl);
            const response = await api.get(fullUrl);
            console.log('\n📥 === RESPOSTA DA API ===');
            console.log('Total de vendas retornadas:', response.data.sales?.length);
            console.log('Estatísticas recebidas:', response.data.statistics);
            console.log('Total filtrado:', response.data.total);
            console.log('==========================\n');
            if (response.data && response.data.sales) {
                setSales(response.data.sales);
                setTotalPages(Math.ceil(response.data.total / 10));
                if (response.data.statistics) {
                    console.log('✅ Atualizando estatísticas:', response.data.statistics);
                    setEstatisticas(response.data.statistics);
                }
            }
            else {
                console.error("Resposta da API em formato inesperado:", response.data);
                setSales([]);
                setTotalPages(0);
            }
        }
        catch (error) {
            console.error("Erro ao buscar vendas:", error);
            setSales([]);
            setTotalPages(0);
        }
        finally {
            setLoading(false);
        }
    };
    // Atualizar vendas quando mudar página, busca ou filtros
    useEffect(() => {
        console.log('\n🔄 === useEffect TRIGGERED ===');
        console.log('Page changed:', page);
        console.log('SearchTerm changed:', searchTerm);
        console.log('FiltroAvancado changed:', filtroAvancado);
        console.log('Ordenacao changed:', ordenacao);
        console.log('Calling fetchSales...');
        console.log('==============================\n');
        fetchSales();
    }, [page, searchTerm, filtroAvancado, ordenacao]);
    // Handler para visualizar detalhes da venda
    const handleViewSale = (sale) => {
        setSelectedSale(sale);
        setDetailsModalOpen(true);
    };
    // Handler para edição de venda
    const handleEditSale = (sale) => {
        setSelectedSale(sale);
        setEditModalOpen(true);
    };
    // Handler para nova venda
    const handleNewSale = () => {
        setIsModalOpen(true);
    };
    // Handler para atualização de venda
    const handleUpdateSale = async (updatedSale) => {
        try {
            if (!selectedSale?.id) {
                throw new Error('ID da venda não encontrado');
            }
            console.log('🔍 Updated sale data received:', updatedSale);
            const response = await api.put(`/sales/${selectedSale.id}`, updatedSale);
            console.log('✅ Response from backend:', response.data);
            // Atualizar lista de vendas
            setSales(prevSales => prevSales.map(s => s.id.toString() === selectedSale.id.toString() ? response.data : s));
            setEditModalOpen(false);
            setSelectedSale(null);
        }
        catch (error) {
            console.error('❌ Erro ao atualizar venda:', error);
            throw error;
        }
    };
    // Handler para exclusão de venda
    const handleDeleteSale = (saleId) => {
        const sale = sales.find(s => s.id.toString() === saleId.toString());
        if (sale) {
            setSelectedSale(sale);
            setDeleteModalOpen(true);
        }
    };
    // Handler para confirmação de exclusão
    const handleConfirmDelete = async (saleId) => {
        try {
            await api.delete(`/sales/${saleId}`);
            setSales(prevSales => prevSales.filter(s => s.id.toString() !== saleId.toString()));
            setDeleteModalOpen(false);
            setSelectedSale(null);
        }
        catch (error) {
            console.error('Erro ao excluir venda:', error);
        }
    };
    // Handler para salvar nova venda
    const handleSaveVenda = async (vendaData) => {
        try {
            console.log('\n🚀 === DEBUG HANDLESA_VENDA ===');
            console.log('🎯 Dados recebidos no handleSaveVenda:', JSON.stringify(vendaData, null, 2));
            console.log('🌐 URL da API:', '/sales');
            console.log('📡 Método:', 'POST');
            console.log('===============================\n');
            const response = await api.post('/sales', vendaData);
            console.log('\n✅ === RESPOSTA DA API ===');
            console.log('Status:', response.status);
            console.log('Data:', response.data);
            console.log('========================\n');
            alert('Venda salva com sucesso!');
            await fetchSales(); // Recarregar a lista
            // ✅ REMOVIDO: setShowModal(false) - modal será fechado pelo componente pai
        }
        catch (error) {
            console.error('\n❌ === ERRO COMPLETO ===');
            console.error('Error object:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
            }
            if (error.response) {
                console.error('Error response:', error.response);
                console.error('Error config:', error.config);
                console.error('Request data sent:', error.config?.data);
                console.error('Request headers:', error.config?.headers);
            }
            console.error('======================\n');
            console.error('❌ Erro ao salvar venda:', error);
            alert('Erro ao salvar venda: ' + (error.response?.data?.error || error.message));
        }
    };
    // Função para formatar data
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };
    // Função para formatar moeda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    // Função para obter a cor do status
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
    // Função para obter o texto do status
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
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-800", children: "Vendas" }), _jsxs("button", { onClick: handleNewSale, className: "flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: [_jsx(Plus, { size: 20, className: "mr-2" }), "Nova Venda"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(DollarSign, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Receita Hoje" }), _jsx("p", { className: "text-2xl font-semibold", children: formatCurrency(estatisticas.receitaHoje) })] })] }) }), _jsx("div", { className: "bg-white p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: _jsx(TrendingUp, { className: "w-6 h-6 text-purple-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Ticket M\u00E9dio" }), _jsx("p", { className: "text-2xl font-semibold", children: formatCurrency(estatisticas.ticketMedio) })] })] }) }), _jsx("div", { className: "bg-white p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(Calendar, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Vendas Hoje" }), _jsx("p", { className: "text-2xl font-semibold", children: estatisticas.vendasHoje })] })] }) }), _jsx("div", { className: "bg-white p-4 rounded-lg shadow", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-yellow-100 rounded-lg", children: _jsx(Users, { className: "w-6 h-6 text-yellow-600" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Total de Vendas" }), _jsx("p", { className: "text-2xl font-semibold", children: estatisticas.totalVendas })] })] }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6", children: [_jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", placeholder: "Buscar por cliente...", className: "w-full pl-10 pr-4 py-2 border rounded-lg", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }), _jsx(Search, { className: "absolute left-3 top-2.5 text-gray-400", size: 20 })] }), _jsxs("select", { value: filtroAvancado.paymentMethod, onChange: (e) => setFiltroAvancado((prev) => ({
                            ...prev,
                            paymentMethod: e.target.value,
                        })), className: "border rounded-lg px-4 py-2", children: [_jsx("option", { value: "", children: "M\u00E9todo de Pagamento" }), _jsx("option", { value: "pix", children: "PIX" }), _jsx("option", { value: "cartao_credito", children: "Cart\u00E3o de Cr\u00E9dito" }), _jsx("option", { value: "cartao_debito", children: "Cart\u00E3o de D\u00E9bito" }), _jsx("option", { value: "dinheiro", children: "Dinheiro" }), _jsx("option", { value: "transferencia", children: "Transfer\u00EAncia" })] }), _jsxs("select", { value: filtroAvancado.status, onChange: (e) => {
                            const newStatus = e.target.value;
                            setFiltroAvancado(prev => ({ ...prev, status: newStatus }));
                        }, className: "border rounded-lg px-4 py-2", children: [_jsx("option", { value: "", children: "Status" }), _jsx("option", { value: "completed", children: "Conclu\u00EDda" }), _jsx("option", { value: "pending", children: "Pendente" }), _jsx("option", { value: "cancelled", children: "Cancelada" })] }), _jsx("input", { type: "date", value: filtroAvancado.dateFrom, onChange: (e) => setFiltroAvancado((prev) => ({
                            ...prev,
                            dateFrom: e.target.value,
                        })), className: "border rounded-lg px-4 py-2", placeholder: "Data inicial" }), _jsx("input", { type: "date", value: filtroAvancado.dateTo, onChange: (e) => setFiltroAvancado((prev) => ({
                            ...prev,
                            dateTo: e.target.value,
                        })), className: "border rounded-lg px-4 py-2", placeholder: "Data final" }), _jsxs("button", { onClick: () => setFiltroAvancado({
                            paymentMethod: "",
                            status: "",
                            dateFrom: "",
                            dateTo: ""
                        }), className: "flex items-center px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50", children: [_jsx(Filter, { size: 20, className: "mr-2" }), "Limpar"] })] }), _jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Data" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Cliente" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Produtos" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Valor Total" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Pagamento" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "px-6 py-4 text-center", children: "Carregando..." }) })) : sales.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "px-6 py-4 text-center", children: "Nenhuma venda encontrada" }) })) : (sales.map((sale) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: formatDate(sale.sale_date) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: sale.customer_name }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-500", children: _jsx("div", { className: "max-w-xs overflow-hidden", children: sale.items && sale.items.length > 0 ? (_jsxs("span", { children: [sale.items.slice(0, 2).map(item => item.product_name).join(', '), sale.items.length > 2 && ` +${sale.items.length - 2} mais`] })) : ('Sem itens') }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold", children: formatCurrency(sale.total_amount) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: sale.payment_method }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sale.status)}`, children: getStatusText(sale.status) }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: [_jsx("button", { className: "text-blue-600 hover:text-blue-900 mr-3", onClick: () => handleViewSale(sale), title: "Ver Detalhes", children: _jsx(Eye, { size: 18 }) }), _jsx("button", { className: "text-blue-600 hover:text-blue-900 mr-3", onClick: () => handleEditSale(sale), title: "Editar Venda", children: _jsx(Edit, { size: 18 }) }), _jsx("button", { className: "text-red-600 hover:text-red-900", onClick: () => handleDeleteSale(sale.id), title: "Excluir Venda", children: _jsx(Trash2, { size: 18 }) })] })] }, sale.id)))) })] }) }) }), _jsxs("div", { className: "flex items-center justify-between px-6 py-3 bg-white border-t", children: [_jsx("div", { className: "flex items-center", children: _jsxs("span", { className: "text-sm text-gray-700", children: ["Mostrando", ' ', _jsx("span", { className: "font-medium", children: (page - 1) * 10 + 1 }), " at\u00E9", ' ', _jsx("span", { className: "font-medium", children: Math.min(page * 10, sales.length) }), ' ', "de ", _jsx("span", { className: "font-medium", children: estatisticas.totalVendas }), " resultados"] }) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1, className: "px-3 py-1 border rounded-md disabled:opacity-50", children: _jsx(ArrowLeft, { size: 16 }) }), _jsxs("span", { className: "text-sm text-gray-700", children: ["P\u00E1gina ", page, " de ", totalPages] }), _jsx("button", { onClick: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages, className: "px-3 py-1 border rounded-md disabled:opacity-50", children: _jsx(ArrowRight, { size: 16 }) })] })] }), _jsx(Modal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), title: "Nova Venda", size: "max-w-4xl", children: _jsx(FormularioVenda, { onClose: () => setIsModalOpen(false), onSave: handleSaveVenda }) }), selectedSale && detailsModalOpen && (_jsx(SaleDetailsModal, { isOpen: detailsModalOpen, onClose: () => {
                    setDetailsModalOpen(false);
                    setSelectedSale(null);
                }, sale: selectedSale })), selectedSale && editModalOpen && (_jsx(EditSaleModal, { isOpen: editModalOpen, onClose: () => {
                    setEditModalOpen(false);
                    setSelectedSale(null);
                }, onSave: handleUpdateSale, sale: selectedSale })), selectedSale && deleteModalOpen && (_jsx(DeleteSaleModal, { isOpen: deleteModalOpen, onClose: () => {
                    setDeleteModalOpen(false);
                    setSelectedSale(null);
                }, onConfirm: handleConfirmDelete, saleId: selectedSale.id, customerName: selectedSale.customer_name }))] }));
};
export default VendasPage;
