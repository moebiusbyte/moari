import React, { useState } from 'react';
import { Search, Filter, Plus, TrendingUp, Calendar, DollarSign } from 'lucide-react';


const SalesDashboard = () => {

  const [showFilterAlert, setFilterAlert] = useState(false);
  const [showSaleAlert, setSaleAlert] = useState(false);


  const handleNovaVenda = () => {
    setSaleAlert(true);
    setTimeout(() => setSaleAlert(false), 3000);
  };

  const handleFiltros = () => {
    setFilterAlert(true);
    setTimeout(() => setFilterAlert(false), 3000);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="space-y-6 max-w-5xl mx-auto">
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

          {/* Meta Mensal */}
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
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-lg p-4 shadow-md ring-1 ring-black ring-opacity-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar vendas..."
                className="w-full px-4 py-2 border rounded-lg pl-10"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <div className="flex gap-2">
              <button 
               onClick={handleFiltros}
               className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
                <Filter className="w-5 h-5" />
                Filtros
              </button>
              <button 
                onClick={handleNovaVenda}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
                <Plus className="w-5 h-5" />
                Nova Venda
              </button>
            </div>
          </div>

          {/* Table */}
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

        {showFilterAlert && (
          <div className="fixed bottom-15 right-25 p-4 bg-green-100 text-green-800 rounded-lg shadow-lg border border-green-200 animate-fade-in">
             Filtro aplicado com sucesso!
          </div>
        )}

        {showSaleAlert && (
          <div className="fixed bottom-15 right-25 p-4 bg-green-100 text-green-800 rounded-lg shadow-lg border border-green-200 animate-fade-in">
             Nova venda abfdlksfdklsjfklds com sucesso!
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesDashboard;