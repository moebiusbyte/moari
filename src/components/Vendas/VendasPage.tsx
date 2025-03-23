import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  TrendingUp,
  Calendar,
  DollarSign,
  X,
} from "lucide-react";
import FormularioVenda from "./FormularioVenda";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const VendasPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterAlert, setFilterAlert] = useState(false);
  const [showSaleAlert, setSaleAlert] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNovaVenda = () => {
    setIsModalOpen(true);
  };

  const handleFiltros = () => {
    setFilterAlert(true);
    setTimeout(() => setFilterAlert(false), 3000);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Vendas</h1>
        <button
          onClick={handleNovaVenda}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={20} className="mr-2" />
          Nova Venda
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar vendas..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}/>
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        <button
          onClick={handleFiltros}
          className="flex items-center px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
          <Filter size={20} className="mr-2" />
          Filtros
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total do Dia */}
        <div className="bg-white rounded-lg p-4 shadow-md ring-1 ring-black ring-opacity-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total do Dia</p>
              <p className="text-xl font-semibold">R$ 1.890,00</p>
            </div>
          </div>
        </div>

        {/* Média por Venda */}
        <div className="bg-white rounded-lg p-4 shadow-md ring-1 ring-black ring-opacity-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Média por Venda</p>
              <p className="text-xl font-semibold">R$ 157,50</p>
            </div>
          </div>
        </div>

        {isVisible && (
          /* Meta Mensal */
          <div className="bg-white rounded-lg p-4 shadow-md ring-1 ring-black ring-opacity-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Meta Mensal</p>
                <p className="text-xl font-semibold">85%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg p-4 shadow-md ring-1 ring-black ring-opacity-5 mt-6">
        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm">
                <th className="pb-3">DATA</th>
                <th className="pb-3">CLIENTE</th>
                <th className="pb-3">PRODUTOS</th>
                <th className="pb-3">VALOR</th>
                <th className="pb-3">PAGAMENTO</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-4">02/02/2025</td>
                <td>Ana Maria</td>
                <td>Colar Pérolas, Brinco Cristal</td>
                <td>R$ 289,80</td>
                <td>Cartão de Crédito</td>
              </tr>
              <tr className="border-t">
                <td className="py-4">02/02/2025</td>
                <td>Carolina Santos</td>
                <td>Anel Zircônia</td>
                <td>R$ 129,90</td>
                <td>PIX</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Nova Venda */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Venda"
      >
        <FormularioVenda
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setSaleAlert(true);
            setTimeout(() => setSaleAlert(false), 3000);
            setIsModalOpen(false);
          }}
        />
      </Modal>

      {/* Alertas */}
      {showFilterAlert && (
        <div className="fixed bottom-15 right-25 p-4 bg-green-100 text-green-800 rounded-lg shadow-lg border border-green-200 animate-fade-in">
          Filtro aplicado com sucesso!
        </div>
      )}

      {showSaleAlert && (
        <div className="fixed bottom-15 right-25 p-4 bg-green-100 text-green-800 rounded-lg shadow-lg border border-green-200 animate-fade-in">
          Nova venda criada com sucesso!
        </div>
      )}
    </div>
  );
};

export default VendasPage;
