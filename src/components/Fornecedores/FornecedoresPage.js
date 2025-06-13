import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Search, Plus, Phone, Mail, MapPin, Calendar, Edit, Trash2, } from "lucide-react";
import EditFornecedorModal from './EditFornecedoresModal';
import CadastroFornecedores from "./CadastroFornecedores";
import api from "../../../server/api/axiosConfig";
const FornecedoresPage = () => {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fornecedores, setFornecedores] = useState([]);
    const [selectedFornecedor, setSelectedFornecedor] = useState(null);
    // Função para buscar fornecedores da API
    const fetchFornecedores = async () => {
        try {
            setLoading(true);
            const response = await api.get("/suppliers", {
                params: { search: searchTerm },
            });
            setFornecedores(response.data);
        }
        catch (error) {
            console.error("Erro ao buscar fornecedores:", error);
        }
        finally {
            setLoading(false);
        }
    };
    // Handler para edição de fornecedor
    const handleEditFornecedor = (fornecedor) => {
        setSelectedFornecedor(fornecedor);
        setEditModalOpen(true);
    };
    // Handler para atualização de fornecedor
    const handleUpdateFornecedor = async (updatedData) => {
        try {
            if (!selectedFornecedor)
                return;
            await api.put(`/suppliers/${selectedFornecedor.id}`, updatedData);
            await fetchFornecedores(); // Recarrega a lista
            setEditModalOpen(false);
            setSelectedFornecedor(null);
        }
        catch (error) {
            console.error("Erro ao atualizar fornecedor:", error);
            throw error;
        }
    };
    // Handler para exclusão de fornecedor
    const handleDeleteFornecedor = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este fornecedor?")) {
            try {
                await api.delete(`/suppliers/${id}`);
                await fetchFornecedores(); // Recarrega a lista
            }
            catch (error) {
                console.error("Erro ao excluir fornecedor:", error);
                alert("Erro ao excluir fornecedor. Verifique se não há produtos associados.");
            }
        }
    };
    // Atualizar lista de fornecedores ao carregar a página ou ao alterar o termo de busca
    useEffect(() => {
        fetchFornecedores();
    }, [searchTerm]);
    // Função para salvar um novo fornecedor
    const handleSaveFornecedor = async (fornecedor, imagens) => {
        try {
            await api.post("/suppliers", fornecedor);
            fetchFornecedores(); // Atualiza a lista após salvar
            setIsModalOpen(false); // Fecha o modal
        }
        catch (error) {
            console.error("Erro ao salvar fornecedor:", error);
        }
    };
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-800", children: "Fornecedores" }), _jsxs("button", { onClick: () => setIsModalOpen(true), className: "flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: [_jsx(Plus, { size: 20, className: "mr-2" }), "Novo Fornecedor"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", placeholder: "Buscar fornecedores...", className: "w-full pl-10 pr-4 py-2 border rounded-lg", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }), _jsx(Search, { className: "absolute left-3 top-2.5 text-gray-400", size: 20 })] }) }), loading ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsx("p", { className: "text-gray-500", children: "Carregando..." }) })) : fornecedores.length === 0 ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsx("p", { className: "text-gray-500", children: "Nenhum fornecedor encontrado." }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: fornecedores.map((fornecedor) => (_jsx("div", { className: "bg-white rounded-lg shadow hover:shadow-md transition-shadow", children: _jsxs("div", { className: "p-6 border-b", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: fornecedor.nome }), _jsx("p", { className: "text-sm text-gray-500", children: fornecedor.contato })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleEditFornecedor(fornecedor), className: "p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors", title: "Editar fornecedor", children: _jsx(Edit, { size: 16 }) }), _jsx("button", { onClick: () => handleDeleteFornecedor(fornecedor.id), className: "p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors", title: "Excluir fornecedor", children: _jsx(Trash2, { size: 16 }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Phone, { size: 16, className: "mr-2 flex-shrink-0" }), _jsx("span", { children: fornecedor.telefone || 'Não informado' })] }), _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Mail, { size: 16, className: "mr-2 flex-shrink-0" }), _jsx("span", { className: "truncate", children: fornecedor.email || 'Não informado' })] }), _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(MapPin, { size: 16, className: "mr-2 flex-shrink-0" }), _jsx("span", { children: fornecedor.cidade && fornecedor.estado ?
                                                    `${fornecedor.cidade}, ${fornecedor.estado}` :
                                                    'Não informado' })] }), _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Calendar, { size: 16, className: "mr-2 flex-shrink-0" }), _jsxs("span", { children: ["\u00DAltima compra:", " ", fornecedor.ultima_compra
                                                        ? new Date(fornecedor.ultima_compra).toLocaleDateString("pt-BR")
                                                        : "N/A"] })] })] })] }) }, fornecedor.id))) })), isModalOpen && (_jsx(CadastroFornecedores, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), onSave: handleSaveFornecedor })), selectedFornecedor && editModalOpen && (_jsx(EditFornecedorModal, { isOpen: editModalOpen, onClose: () => {
                    setEditModalOpen(false);
                    setSelectedFornecedor(null);
                }, onSave: handleUpdateFornecedor, fornecedor: selectedFornecedor }))] }));
};
export default FornecedoresPage;
