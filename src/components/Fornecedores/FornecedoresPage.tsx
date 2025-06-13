import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";
import EditFornecedorModal from './EditFornecedoresModal';
import CadastroFornecedores from "./CadastroFornecedores";
import api from "../../../server/api/axiosConfig";

interface Fornecedor {
  id: number;
  nome: string;
  contato: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  endereco: string;
  ultima_compra: string | null;
}

interface FornecedorFormData {
  nome: string;
  contato: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  endereco: string;
}

const FornecedoresPage = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);

  // Função para buscar fornecedores da API
  const fetchFornecedores = async () => {
    try {
      setLoading(true);
      const response = await api.get("/suppliers", {
        params: { search: searchTerm },
      });
      setFornecedores(response.data as Fornecedor[]);
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler para edição de fornecedor
  const handleEditFornecedor = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setEditModalOpen(true);
  };

  // Handler para atualização de fornecedor
  const handleUpdateFornecedor = async (updatedData: Partial<Fornecedor>) => {
    try {
      if (!selectedFornecedor) return;
      
      await api.put(`/suppliers/${selectedFornecedor.id}`, updatedData);
      await fetchFornecedores(); // Recarrega a lista
      setEditModalOpen(false);
      setSelectedFornecedor(null);
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error);
      throw error;
    }
  };

  // Handler para exclusão de fornecedor
  const handleDeleteFornecedor = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este fornecedor?")) {
      try {
        await api.delete(`/suppliers/${id}`);
        await fetchFornecedores(); // Recarrega a lista
      } catch (error) {
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
  const handleSaveFornecedor = async (fornecedor: FornecedorFormData, imagens: File[]) => {
    try {
      await api.post("/suppliers", fornecedor);
      fetchFornecedores(); // Atualiza a lista após salvar
      setIsModalOpen(false); // Fecha o modal
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Fornecedores</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} className="mr-2" />
          Novo Fornecedor
        </button>
      </div>

      {/* Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar fornecedores..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {/* Lista de Fornecedores */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : fornecedores.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Nenhum fornecedor encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fornecedores.map((fornecedor) => (
            <div key={fornecedor.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="p-6 border-b">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {fornecedor.nome}
                    </h3>
                    <p className="text-sm text-gray-500">{fornecedor.contato}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditFornecedor(fornecedor)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar fornecedor"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteFornecedor(fornecedor.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir fornecedor"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone size={16} className="mr-2 flex-shrink-0" />
                    <span>{fornecedor.telefone || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail size={16} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{fornecedor.email || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={16} className="mr-2 flex-shrink-0" />
                    <span>{fornecedor.cidade && fornecedor.estado ? 
                      `${fornecedor.cidade}, ${fornecedor.estado}` : 
                      'Não informado'
                    }</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2 flex-shrink-0" />
                    <span>
                      Última compra:{" "}
                      {fornecedor.ultima_compra
                        ? new Date(fornecedor.ultima_compra).toLocaleDateString("pt-BR")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <CadastroFornecedores
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveFornecedor}
        />
      )}

      {/* Modal de Edição */}
      {selectedFornecedor && editModalOpen && (
        <EditFornecedorModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedFornecedor(null);
          }}
          onSave={handleUpdateFornecedor}
          fornecedor={selectedFornecedor}
        />
      )}
    </div>
  );
};

export default FornecedoresPage;