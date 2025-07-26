import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Search, Plus, Phone, Mail, MapPin, Calendar, Edit, Trash2, Building, Percent, } from "lucide-react";
import EditConsignadoModal from './EditConsignadosModal';
import CadastroConsignados from "./CadastroConsignados";
import api from "../../../server/api/axiosConfig";
const ConsignadosPage = () => {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [consignados, setConsignados] = useState([]);
    const [selectedConsignado, setSelectedConsignado] = useState(null);
    // Função para buscar consignados da API
    const fetchConsignados = async () => {
        try {
            setLoading(true);
            const response = await api.get("/consignados", {
                params: { search: searchTerm },
            });
            setConsignados(response.data);
        }
        catch (error) {
            console.error("Erro ao buscar consignados:", error);
        }
        finally {
            setLoading(false);
        }
    };
    // Handler para edição de consignado
    const handleEditConsignado = (consignado) => {
        setSelectedConsignado(consignado);
        setEditModalOpen(true);
    };
    // Handler para atualização de consignado
    const handleUpdateConsignado = async (updatedData) => {
        try {
            if (!selectedConsignado)
                return;
            await api.put(`/consignados/${selectedConsignado.id}`, updatedData);
            await fetchConsignados(); // Recarrega a lista
            setEditModalOpen(false);
            setSelectedConsignado(null);
        }
        catch (error) {
            console.error("Erro ao atualizar consignado:", error);
            throw error;
        }
    };
    // Handler para exclusão de consignado
    const handleDeleteConsignado = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este consignado?")) {
            try {
                await api.delete(`/consignados/${id}`);
                await fetchConsignados(); // Recarrega a lista
            }
            catch (error) {
                console.error("Erro ao excluir consignado:", error);
                alert("Erro ao excluir consignado. Verifique se não há produtos associados.");
            }
        }
    };
    // Atualizar lista de consignados ao carregar a página ou ao alterar o termo de busca
    useEffect(() => {
        fetchConsignados();
    }, [searchTerm]);
    // Função para salvar um novo consignado
    const handleSaveConsignado = async (consignado, produtos) => {
        try {
            // Preparar dados para envio, incluindo os produtos
            const dadosCompletos = {
                ...consignado,
                produtos: produtos.map(p => ({
                    product_id: p.product_id,
                    quantidade: p.quantidade,
                    valor_combinado: p.valor_combinado,
                    observacoes: null // Pode adicionar observações se necessário
                }))
            };
            console.log('📤 Enviando dados do consignado:', dadosCompletos);
            const response = await api.post("/consignados", dadosCompletos);
            console.log('✅ Resposta do servidor:', response.data);
            // Exibir mensagem de sucesso
            if (response.data.message) {
                alert(response.data.message);
            }
            fetchConsignados(); // Atualiza a lista após salvar
            setIsModalOpen(false); // Fecha o modal
        }
        catch (error) {
            console.error("❌ Erro ao salvar consignado:", error);
            // Exibir erro específico do servidor
            if (error.response?.data?.error) {
                alert(`Erro: ${error.response.data.error}`);
            }
            else {
                alert("Erro ao salvar consignado. Tente novamente.");
            }
        }
    };
    // Função para obter cor do status
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'ativo':
                return 'bg-green-100 text-green-800';
            case 'inativo':
                return 'bg-gray-100 text-gray-800';
            case 'suspenso':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-800", children: "Consignados" }), _jsxs("button", { onClick: () => setIsModalOpen(true), className: "flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700", children: [_jsx(Plus, { size: 20, className: "mr-2" }), "Novo Consignado"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", placeholder: "Buscar consignados...", className: "w-full pl-10 pr-4 py-2 border rounded-lg", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }), _jsx(Search, { className: "absolute left-3 top-2.5 text-gray-400", size: 20 })] }) }), loading ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsx("p", { className: "text-gray-500", children: "Carregando..." }) })) : consignados.length === 0 ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsx("p", { className: "text-gray-500", children: "Nenhum consignado encontrado." }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: consignados.map((consignado) => (_jsx("div", { className: "bg-white rounded-lg shadow hover:shadow-md transition-shadow", children: _jsxs("div", { className: "p-6 border-b", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: consignado.nome }), _jsx("span", { className: `px-2 py-1 text-xs rounded-full ${getStatusColor(consignado.status)}`, children: consignado.status })] }), _jsx("p", { className: "text-sm text-gray-500", children: consignado.contato })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleEditConsignado(consignado), className: "p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors", title: "Editar consignado", children: _jsx(Edit, { size: 16 }) }), _jsx("button", { onClick: () => handleDeleteConsignado(consignado.id), className: "p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors", title: "Excluir consignado", children: _jsx(Trash2, { size: 16 }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Phone, { size: 16, className: "mr-2 flex-shrink-0" }), _jsx("span", { children: consignado.telefone || 'Não informado' })] }), _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Mail, { size: 16, className: "mr-2 flex-shrink-0" }), _jsx("span", { className: "truncate", children: consignado.email || 'Não informado' })] }), _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Building, { size: 16, className: "mr-2 flex-shrink-0" }), _jsx("span", { className: "truncate", children: consignado.cnpj || 'Não informado' })] }), _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Percent, { size: 16, className: "mr-2 flex-shrink-0" }), _jsxs("span", { children: ["Comiss\u00E3o: ", consignado.comissao ? `${consignado.comissao}%` : 'Não informada'] })] }), _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(MapPin, { size: 16, className: "mr-2 flex-shrink-0" }), _jsx("span", { children: consignado.cidade && consignado.estado ?
                                                    `${consignado.cidade}, ${consignado.estado}` :
                                                    'Não informado' })] }), _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Calendar, { size: 16, className: "mr-2 flex-shrink-0" }), _jsxs("span", { children: ["\u00DAltima entrega:", " ", consignado.ultima_entrega
                                                        ? new Date(consignado.ultima_entrega).toLocaleDateString("pt-BR")
                                                        : "N/A"] })] })] })] }) }, consignado.id))) })), isModalOpen && (_jsx(CadastroConsignados, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), onSave: handleSaveConsignado })), selectedConsignado && editModalOpen && (_jsx(EditConsignadoModal, { isOpen: editModalOpen, onClose: () => {
                    setEditModalOpen(false);
                    setSelectedConsignado(null);
                }, onSave: handleUpdateConsignado, consignado: selectedConsignado }))] }));
};
export default ConsignadosPage;
