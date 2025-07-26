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
  Building,
  Percent,
  AlertCircle,
} from "lucide-react";
import EditConsignadoModal from './EditConsignadosModal';
import CadastroConsignados from "./CadastroConsignados";
import api from "../../../server/api/axiosConfig";
import { ProdutoConsignado } from "../../types/consignados";

interface Consignado {
  id: number;
  nome: string;
  contato: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  endereco: string;
  cnpj: string;
  comissao: number;
  ultima_entrega: string | null;
  status: string;
}

interface ConsignadoFormData {
  nome: string;
  contato: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  endereco: string;
  cnpj: string;
  comissao: number;
  status: string;
}

interface CadastroConsignadosProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (consignado: ConsignadoFormData, produtos: ProdutoConsignado[]) => Promise<void>;
}

const ConsignadosPage = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [consignados, setConsignados] = useState<Consignado[]>([]);
  const [selectedConsignado, setSelectedConsignado] = useState<Consignado | null>(null);

  // Função para buscar consignados da API
  const fetchConsignados = async () => {
    try {
      setLoading(true);
      const response = await api.get("/consignados", {
        params: { search: searchTerm },
      });
      setConsignados(response.data as Consignado[]);
    } catch (error) {
      console.error("Erro ao buscar consignados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler para edição de consignado
  const handleEditConsignado = (consignado: Consignado) => {
    setSelectedConsignado(consignado);
    setEditModalOpen(true);
  };

  // Handler para atualização de consignado
  const handleUpdateConsignado = async (updatedData: Partial<Consignado>) => {
    try {
      if (!selectedConsignado) return;
      
      await api.put(`/consignados/${selectedConsignado.id}`, updatedData);
      await fetchConsignados(); // Recarrega a lista
      setEditModalOpen(false);
      setSelectedConsignado(null);
    } catch (error) {
      console.error("Erro ao atualizar consignado:", error);
      throw error;
    }
  };

  // Handler para exclusão de consignado
  const handleDeleteConsignado = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este consignado?")) {
      try {
        await api.delete(`/consignados/${id}`);
        await fetchConsignados(); // Recarrega a lista
      } catch (error) {
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
  const handleSaveConsignado = async (
    consignado: ConsignadoFormData,
    produtos: ProdutoConsignado[]
  ) => {
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
    } catch (error: any) {
      console.error("❌ Erro ao salvar consignado:", error);
      
      // Exibir erro específico do servidor
      if (error.response?.data?.error) {
        alert(`Erro: ${error.response.data.error}`);
      } else {
        alert("Erro ao salvar consignado. Tente novamente.");
      }
    }
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Consignados</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={20} className="mr-2" />
          Novo Consignado
        </button>
      </div>

      {/* Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar consignados..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {/* Lista de Consignados */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : consignados.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Nenhum consignado encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consignados.map((consignado) => (
            <div key={consignado.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="p-6 border-b">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {consignado.nome}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(consignado.status)}`}>
                        {consignado.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{consignado.contato}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditConsignado(consignado)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Editar consignado"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteConsignado(consignado.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir consignado"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone size={16} className="mr-2 flex-shrink-0" />
                    <span>{consignado.telefone || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail size={16} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{consignado.email || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Building size={16} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{consignado.cnpj || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Percent size={16} className="mr-2 flex-shrink-0" />
                    <span>Comissão: {consignado.comissao ? `${consignado.comissao}%` : 'Não informada'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={16} className="mr-2 flex-shrink-0" />
                    <span>{consignado.cidade && consignado.estado ? 
                      `${consignado.cidade}, ${consignado.estado}` : 
                      'Não informado'
                    }</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2 flex-shrink-0" />
                    <span>
                      Última entrega:{" "}
                      {consignado.ultima_entrega
                        ? new Date(consignado.ultima_entrega).toLocaleDateString("pt-BR")
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
        <CadastroConsignados
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveConsignado}
        />
      )}

      {/* Modal de Edição */}
      {selectedConsignado && editModalOpen && (
        <EditConsignadoModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedConsignado(null);
          }}
          onSave={handleUpdateConsignado}
          consignado={selectedConsignado}
        />
      )}
    </div>
  );
};

export default ConsignadosPage;