import React, { useState, useEffect } from "react";
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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";
import {
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  CreditCard,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import api from "../../../server/api/axiosConfig";

// Interfaces para tipagem
interface Overview {
  periodo: {
    inicio: string;
    fim: string;
    tipo: string;
  };
  vendas: {
    total: number;
    concluidas: number;
    pendentes: number;
    canceladas: number;
    hoje: number;
  };
  receita: {
    total: number;
    hoje: number;
    ticketMedio: number;
    crescimento: number;
    meta: {
      valor: number;
      percentual: number;
      atingida: boolean;
    };
  };
  produtos: {
    total: number;
    ativos: number;
    consignados: number;
    semEstoque: number;
    estoqueBaixo: number;
    estoqueAntigo: number;
    valorTotalEstoque: number;
  };
}

interface SalesEvolution {
  periodo: string;
  totalVendas: number;
  vendasConcluidas: number;
  receita: number;
  ticketMedio: number;
}

interface ProductPerformance {
  produto: {
    id: string;
    codigo: string;
    nome: string;
    categoria: string;
  };
  vendas: {
    unidadesVendidas: number;
    receitaGerada: number;
  };
}

interface PaymentMethod {
  metodo: string;
  quantidadeVendas: number;
  receitaTotal: number;
  percentualReceita: number;
}

const RelatoriosPage = () => {
  // Estados
  const [periodoSelecionado, setPeriodoSelecionado] = useState("month");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [salesEvolution, setSalesEvolution] = useState<SalesEvolution[]>([]);
  const [topProducts, setTopProducts] = useState<ProductPerformance[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Cores para gráficos
  const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#EF4444', '#F59E0B'];

  // Função para buscar dados de overview
  const fetchOverview = async () => {
    try {
      const response = await api.get(`/reports/overview?period=${periodoSelecionado}`);
      setOverview(response.data);
      console.log('📊 Overview carregado:', response.data);
    } catch (error) {
      console.error('❌ Erro ao carregar overview:', error);
    }
  };

  // Função para buscar evolução das vendas
  const fetchSalesEvolution = async () => {
    try {
      const groupBy = periodoSelecionado === 'week' ? 'day' : 
                     periodoSelecionado === 'month' ? 'day' : 'month';
      
      const response = await api.get(`/reports/sales-evolution?period=${periodoSelecionado}&groupBy=${groupBy}`);
      setSalesEvolution(response.data.dados || []);
      console.log('📈 Evolução de vendas carregada:', response.data);
    } catch (error) {
      console.error('❌ Erro ao carregar evolução de vendas:', error);
      setSalesEvolution([]);
    }
  };

  // Função para buscar performance dos produtos
  const fetchProductsPerformance = async () => {
    try {
      const response = await api.get(`/reports/products-performance?period=${periodoSelecionado}&limit=10`);
      setTopProducts(response.data.topProdutos || []);
      console.log('🏆 Performance de produtos carregada:', response.data);
    } catch (error) {
      console.error('❌ Erro ao carregar performance de produtos:', error);
      setTopProducts([]);
    }
  };

  // Função para buscar métodos de pagamento
  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get(`/reports/payment-methods?period=${periodoSelecionado}`);
      setPaymentMethods(response.data.metodosPageamento || []);
      console.log('💳 Métodos de pagamento carregados:', response.data);
    } catch (error) {
      console.error('❌ Erro ao carregar métodos de pagamento:', error);
      setPaymentMethods([]);
    }
  };

  // Função para carregar todos os dados
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOverview(),
        fetchSalesEvolution(),
        fetchProductsPerformance(),
        fetchPaymentMethods()
      ]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ Erro ao carregar dados dos relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando mudar o período
  useEffect(() => {
    loadAllData();
  }, [periodoSelecionado]);

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar números
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  // Função para exportar relatório (placeholder)
  const handleExport = () => {
    alert('Funcionalidade de exportação será implementada em breve!');
  };

  // Preparar dados para gráfico de pizza dos métodos de pagamento
  const paymentChartData = paymentMethods.map((method, index) => ({
    name: method.metodo,
    value: method.receitaTotal,
    percentage: method.percentualReceita,
    color: COLORS[index % COLORS.length]
  }));

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-lg">
          <RefreshCw className="w-6 h-6 animate-spin" />
          Carregando relatórios...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Relatórios</h1>
          <p className="text-sm text-gray-600 mt-1">
            Última atualização: {lastUpdate.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-3">
          <select
            className="px-4 py-2 border rounded-lg text-gray-600"
            value={periodoSelecionado}
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
          >
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="quarter">Último Trimestre</option>
            <option value="year">Último Ano</option>
          </select>
          <button 
            onClick={loadAllData}
            className="flex items-center px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Faturamento Total */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Faturamento Total</p>
              <p className="text-2xl font-semibold text-green-700">
                {formatCurrency(overview?.receita.total || 0)}
              </p>
              {overview?.receita.crescimento !== undefined && (
                <p className={`text-sm ${overview.receita.crescimento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overview.receita.crescimento >= 0 ? '+' : ''}{overview.receita.crescimento.toFixed(1)}% vs período anterior
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Crescimento / Ticket Médio */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-semibold text-blue-700">
                {formatCurrency(overview?.receita.ticketMedio || 0)}
              </p>
              <p className="text-sm text-gray-500">
                {formatNumber(overview?.vendas.concluidas || 0)} vendas concluídas
              </p>
            </div>
          </div>
        </div>

        {/* Total de Produtos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-semibold text-gray-700">
                {formatNumber(overview?.produtos.total || 0)}
              </p>
              {overview?.produtos.semEstoque ? (
                <p className="text-sm text-red-600">
                  {overview.produtos.semEstoque} sem estoque
                </p>
              ) : (
                <p className="text-sm text-green-600">Todos com estoque</p>
              )}
            </div>
          </div>
        </div>

        {/* Meta Mensal */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Meta Mensal</p>
              <p className="text-2xl font-semibold text-yellow-700">
                {overview?.receita.meta.percentual || 0}%
              </p>
              <p className="text-sm text-gray-500">
                {formatCurrency(overview?.receita.meta.valor || 0)} meta
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Evolução das Vendas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Evolução das Vendas</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'receita' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                    name === 'receita' ? 'Receita' : name === 'vendasConcluidas' ? 'Vendas' : name
                  ]}
                />
                <Legend />
                <Bar dataKey="receita" fill="#4F46E5" name="Receita" />
                <Bar dataKey="vendasConcluidas" fill="#7C3AED" name="Vendas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Métodos de Pagamento */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Métodos de Pagamento</h2>
          <div className="h-80">
            {paymentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage?.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Nenhum dado de pagamento disponível
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Produtos Mais Vendidos */}
      {topProducts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Produtos Mais Vendidos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidades Vendidas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receita Gerada
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.slice(0, 10).map((product, index) => (
                  <tr key={product.produto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          #{index + 1} {product.produto.nome}
                        </div>
                        <div className="text-sm text-gray-500 ml-2">
                          ({product.produto.codigo})
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.produto.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(product.vendas.unidadesVendidas)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                      {formatCurrency(product.vendas.receitaGerada)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resumo de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status das Vendas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Status das Vendas
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-green-600">Concluídas:</span>
              <span className="font-semibold">{overview?.vendas.concluidas || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-600">Pendentes:</span>
              <span className="font-semibold">{overview?.vendas.pendentes || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Canceladas:</span>
              <span className="font-semibold">{overview?.vendas.canceladas || 0}</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>{overview?.vendas.total || 0}</span>
            </div>
          </div>
        </div>

        {/* Status dos Produtos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Status dos Produtos
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-green-600">Ativos:</span>
              <span className="font-semibold">{overview?.produtos.ativos || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Consignados:</span>
              <span className="font-semibold">{overview?.produtos.consignados || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Sem Estoque:</span>
              <span className="font-semibold">{overview?.produtos.semEstoque || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-600">Estoque Baixo:</span>
              <span className="font-semibold">{overview?.produtos.estoqueBaixo || 0}</span>
            </div>
          </div>
        </div>

        {/* Receita Hoje */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Performance Hoje
          </h3>
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-600">Receita Hoje</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(overview?.receita.hoje || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Vendas Hoje</p>
              <p className="text-xl font-semibold text-blue-600">
                {overview?.vendas.hoje || 0}
              </p>
            </div>
            {overview?.produtos.valorTotalEstoque && (
              <div className="text-center pt-2 border-t">
                <p className="text-xs text-gray-500">Valor em Estoque</p>
                <p className="text-lg font-semibold text-purple-600">
                  {formatCurrency(overview.produtos.valorTotalEstoque)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 

export default RelatoriosPage;