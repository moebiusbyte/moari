import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
} from "lucide-react";

const RelatoriosPage = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes");

  // Dados de exemplo para os gráficos
  const vendasPorMes = [
    { name: "Jan", vendas: 12500 },
    { name: "Fev", vendas: 15800 },
    { name: "Mar", vendas: 18200 },
    { name: "Abr", vendas: 16900 },
    { name: "Mai", vendas: 19500 },
    { name: "Jun", vendas: 21000 },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Relatórios</h1>
        <div className="flex gap-3">
          <select
            className="px-4 py-2 border rounded-lg text-gray-600"
            value={periodoSelecionado}
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
          >
            <option value="semana">Última Semana</option>
            <option value="mes">Último Mês</option>
            <option value="trimestre">Último Trimestre</option>
            <option value="ano">Último Ano</option>
          </select>
          <button className="flex items-center px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
            <Download className="w-5 h-5 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Faturamento Total</p>
              <p className="text-xl font-semibold">R$ 125.890,00</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Crescimento</p>
              <p className="text-xl font-semibold">+15.3%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total de Produtos</p>
              <p className="text-xl font-semibold">387</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Meta Mensal</p>
              <p className="text-xl font-semibold">85%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Vendas por Mês</h2>
        <div className="h-80">
          <BarChart width={800} height={300} data={vendasPorMes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="vendas" fill="#4F46E5" />
          </BarChart>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosPage;
