import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Star,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";

const FornecedoresPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const fornecedores = [
    {
      id: 1,
      nome: "Joias Elegance",
      contato: "Maria Silva",
      email: "maria@joiaselegance.com.br",
      telefone: "(11) 98765-4321",
      endereco: "São Paulo - SP",
      avaliacao: 4.8,
      status: "Ativo",
      ultimaCompra: "15/01/2025",
      problemas: 0,
      pedidosEntregues: 45,
      valorTotal: 25000.0,
    },
    {
      id: 2,
      nome: "Acessórios Shine",
      contato: "João Santos",
      email: "joao@shine.com.br",
      telefone: "(11) 91234-5678",
      endereco: "Guarulhos - SP",
      avaliacao: 3.5,
      status: "Alerta",
      ultimaCompra: "05/01/2025",
      problemas: 2,
      pedidosEntregues: 28,
      valorTotal: 15800.0,
    },
    {
      id: 3,
      nome: "Distribuidora Crystal",
      contato: "Ana Oliveira",
      email: "ana@crystal.com.br",
      telefone: "(11) 99876-5432",
      endereco: "Campinas - SP",
      avaliacao: 4.2,
      status: "Ativo",
      ultimaCompra: "20/01/2025",
      problemas: 1,
      pedidosEntregues: 32,
      valorTotal: 18500.0,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Fornecedores</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={20} className="mr-2" />
          Novo Fornecedor
        </button>
      </div>

      {/* Search and Filters */}
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

        <button className="flex items-center px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
          <Filter size={20} className="mr-2" />
          Filtros
        </button>
      </div>

      {/* Cards Grid */}
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
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    fornecedor.status === "Ativo"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {fornecedor.status}
                </span>
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
                  {fornecedor.endereco}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Pedidos Entregues</p>
                  <p className="text-lg font-semibold">
                    {fornecedor.pedidosEntregues}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor Total</p>
                  <p className="text-lg font-semibold">
                    R$ {fornecedor.valorTotal.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 text-yellow-400 mr-2" />
                  <span>{fornecedor.avaliacao} / 5.0</span>
                </div>

                <div className="flex items-center text-sm">
                  <AlertCircle
                    className={`w-4 h-4 mr-2 ${
                      fornecedor.problemas > 0
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  />
                  <span>{fornecedor.problemas} problemas reportados</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Última compra: {fornecedor.ultimaCompra}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
              <div className="space-x-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Edit size={18} />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 size={18} />
                </button>
              </div>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Nova Compra
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FornecedoresPage;
