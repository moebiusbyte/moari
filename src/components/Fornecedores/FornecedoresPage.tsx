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

const FornecedoresPage = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Função para buscar fornecedores da API
  const fetchFornecedores = async () => {
    try {
      setLoading(true);
      const response = await api.get("/suppliers", {
        params: { search: searchTerm },
      });
      setFornecedores(response.data);
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar lista de fornecedores ao carregar a página ou ao alterar o termo de busca
  useEffect(() => {
    fetchFornecedores();
  }, [searchTerm]);

  // Função para salvar um novo fornecedor
  const handleSaveFornecedor = async (fornecedor: Fornecedor) => {
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
        <p>Carregando...</p>
      ) : fornecedores.length === 0 ? (
        <p>Nenhum fornecedor encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fornecedores.map((fornecedor) => (
            <div key={fornecedor.id} className="bg-white rounded-lg shadow">
              {/* Card Header */}
              <div className="p-6 border-b">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {fornecedor.nome}
                    </h3>
                    <p className="text-sm text-gray-500">{fornecedor.contato}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone size={16} className="mr-2" />
                    {fornecedor.telefone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail size={16} className="mr-2" />
                    {fornecedor.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    {fornecedor.cidade}, {fornecedor.estado}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    Última compra:{" "}
                    {fornecedor.ultima_compra
                      ? new Date(fornecedor.ultima_compra).toLocaleDateString(
                          "pt-BR"
                        )
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <CadastroFornecedores
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveFornecedor}
        />
      )}
    </div>
  );
};

export default FornecedoresPage;
