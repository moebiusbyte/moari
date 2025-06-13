import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Filter,
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  X,
  Eye
} from "lucide-react";
import FormularioVenda from "./FormularioVenda";
import EditSaleModal from './EditSaleModal';
import DeleteSaleModal from './DeleteSaleModal';
import SaleDetailsModal from './SaleDetailsModal';
import api from "../../../server/api/axiosConfig";

// Tipos
interface SaleItem {
  product_id: string;
  product_name: string;
  product_code?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Sale {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  payment_method: string;
  total_amount: number;
  discount_amount: number;
  notes?: string;
  status: 'completed' | 'pending' | 'cancelled';
  sale_date: string;
  created_at: string;
  updated_at?: string;
  items: SaleItem[];
}

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: string;
}

const Modal = ({ isOpen, onClose, title, children, size = "max-w-xl" }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`bg-white rounded-lg p-6 ${size} w-full mx-4 max-h-[90vh] overflow-y-auto`}>
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
  // Estados para modais
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para dados e paginação
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para filtros avançados
  const [filtroAvancado, setFiltroAvancado] = useState({
    paymentMethod: "",
    status: "",
    dateFrom: "",
    dateTo: ""
  });

  // Estado para ordenação
  const [ordenacao, setOrdenacao] = useState({
    campo: "sale_date",
    ordem: "desc" as "asc" | "desc"
  });

  // Estado para estatísticas
  const [estatisticas, setEstatisticas] = useState({
    totalVendas: 0,
    vendasConcluidas: 0,
    vendasPendentes: 0,
    vendasCanceladas: 0,
    receitaTotal: 0,
    ticketMedio: 0,
    vendasHoje: 0,
    receitaHoje: 0
  });

  // Função para buscar vendas
  const fetchSales = async () => {
    try {
      setLoading(true);
      
      console.log('\n🚀 === DEBUG FILTROS VENDAS ===');
      console.log('Estado filtroAvancado:', JSON.stringify(filtroAvancado, null, 2));
      console.log('================================\n');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: searchTerm,
        orderBy: ordenacao.campo,
        orderDirection: ordenacao.ordem,
        paymentMethod: filtroAvancado.paymentMethod,
        status: filtroAvancado.status,
        dateFrom: filtroAvancado.dateFrom,
        dateTo: filtroAvancado.dateTo
      });

      console.log('📤 Parâmetros enviados para a API:', {
        page: page.toString(),
        limit: "10", 
        search: searchTerm,
        orderBy: ordenacao.campo,
        orderDirection: ordenacao.ordem,
        paymentMethod: filtroAvancado.paymentMethod,
        status: filtroAvancado.status,
        dateFrom: filtroAvancado.dateFrom,
        dateTo: filtroAvancado.dateTo
      });

      const fullUrl = `/sales?${params}`;
      console.log('🌐 URL completa:', fullUrl);
    
      const response = await api.get(fullUrl);
      
      console.log('\n📥 === RESPOSTA DA API ===');
      console.log('Total de vendas retornadas:', response.data.sales?.length);
      console.log('Estatísticas recebidas:', response.data.statistics);
      console.log('Total filtrado:', response.data.total);
      console.log('==========================\n');
      
      if (response.data && response.data.sales) {
        setSales(response.data.sales);
        setTotalPages(Math.ceil(response.data.total / 10));
        if (response.data.statistics) {
          console.log('✅ Atualizando estatísticas:', response.data.statistics);
          setEstatisticas(response.data.statistics);
        }
      } else {
        console.error("Resposta da API em formato inesperado:", response.data);
        setSales([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
      setSales([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };
    
  // Atualizar vendas quando mudar página, busca ou filtros
  useEffect(() => {
    console.log('\n🔄 === useEffect TRIGGERED ===');
    console.log('Page changed:', page);
    console.log('SearchTerm changed:', searchTerm);
    console.log('FiltroAvancado changed:', filtroAvancado);
    console.log('Ordenacao changed:', ordenacao);
    console.log('Calling fetchSales...');
    console.log('==============================\n');
    
    fetchSales();
  }, [page, searchTerm, filtroAvancado, ordenacao]);

  // Handler para visualizar detalhes da venda
  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setDetailsModalOpen(true);
  };

  // Handler para edição de venda
  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setEditModalOpen(true);
  };

  // Handler para nova venda
  const handleNewSale = () => {
    setIsModalOpen(true);
  };

  // Handler para atualização de venda
  const handleUpdateSale = async (updatedSale: Partial<Sale>) => {
    try {
      if (!selectedSale?.id) {
        throw new Error('ID da venda não encontrado');
      }

      console.log('🔍 Updated sale data received:', updatedSale);

      const response = await api.put(`/sales/${selectedSale.id}`, updatedSale);

      console.log('✅ Response from backend:', response.data);

      // Atualizar lista de vendas
      setSales(prevSales =>
        prevSales.map(s =>
          s.id.toString() === selectedSale.id.toString() ? response.data : s
        )
      );

      setEditModalOpen(false);
      setSelectedSale(null);
    } catch (error) {
      console.error('❌ Erro ao atualizar venda:', error);
      throw error;
    }
  };

  // Handler para exclusão de venda
  const handleDeleteSale = (saleId: string) => {
    const sale = sales.find(s => s.id.toString() === saleId.toString());
    if (sale) {
      setSelectedSale(sale);
      setDeleteModalOpen(true);
    }
  };

  // Handler para confirmação de exclusão
  const handleConfirmDelete = async (saleId: string) => {
    try {
      await api.delete(`/sales/${saleId}`);
      setSales(prevSales => prevSales.filter(s => s.id.toString() !== saleId.toString()));
      setDeleteModalOpen(false);
      setSelectedSale(null);
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
    }
  };

  // Handler para salvar nova venda
  const handleSaveVenda = async (vendaData: any) => {
    try {
      console.log('\n🚀 === DEBUG HANDLESA_VENDA ===');
      console.log('🎯 Dados recebidos no handleSaveVenda:', JSON.stringify(vendaData, null, 2));
      console.log('🌐 URL da API:', '/sales');
      console.log('📡 Método:', 'POST');
      console.log('===============================\n');

      const response = await api.post('/sales', vendaData);
      
      console.log('\n✅ === RESPOSTA DA API ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.log('========================\n');
      
      alert('Venda salva com sucesso!');
      await fetchSales(); // Recarregar a lista
      // ✅ REMOVIDO: setShowModal(false) - modal será fechado pelo componente pai
    } catch (error: any) {
      console.error('\n❌ === ERRO COMPLETO ===');
      console.error('Error object:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      
      if (error.response) {
        console.error('Error response:', error.response);
        console.error('Error config:', error.config);
        console.error('Request data sent:', error.config?.data);
        console.error('Request headers:', error.config?.headers);
      }
      
      console.error('======================\n');
      console.error('❌ Erro ao salvar venda:', error);
      alert('Erro ao salvar venda: ' + (error.response?.data?.error || error.message));
    }
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter o texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="p-6">
      {/* Header e Estatísticas */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Vendas</h1>
          <button
            onClick={handleNewSale}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={20} className="mr-2" />
            Nova Venda
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Receita Hoje</h3>
                <p className="text-2xl font-semibold">{formatCurrency(estatisticas.receitaHoje)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Ticket Médio</h3>
                <p className="text-2xl font-semibold">{formatCurrency(estatisticas.ticketMedio)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Vendas Hoje</h3>
                <p className="text-2xl font-semibold">{estatisticas.vendasHoje}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Total de Vendas</h3>
                <p className="text-2xl font-semibold">{estatisticas.totalVendas}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por cliente..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}/>
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20}/>
        </div>

        <select
          value={filtroAvancado.paymentMethod}
          onChange={(e) =>
            setFiltroAvancado((prev) => ({
              ...prev,
              paymentMethod: e.target.value,
            }))
          }
          className="border rounded-lg px-4 py-2">
          <option value="">Método de Pagamento</option>
          <option value="pix">PIX</option>
          <option value="cartao_credito">Cartão de Crédito</option>
          <option value="cartao_debito">Cartão de Débito</option>
          <option value="dinheiro">Dinheiro</option>
          <option value="transferencia">Transferência</option>
        </select>

        <select
          value={filtroAvancado.status}
          onChange={(e) => {
            const newStatus = e.target.value;
            setFiltroAvancado(prev => ({...prev, status: newStatus}));
          }}
          className="border rounded-lg px-4 py-2">
          <option value="">Status</option>
          <option value="completed">Concluída</option>
          <option value="pending">Pendente</option>
          <option value="cancelled">Cancelada</option>
        </select>

        <input
          type="date"
          value={filtroAvancado.dateFrom}
          onChange={(e) =>
            setFiltroAvancado((prev) => ({
              ...prev,
              dateFrom: e.target.value,
            }))
          }
          className="border rounded-lg px-4 py-2"
          placeholder="Data inicial"
        />

        <input
          type="date"
          value={filtroAvancado.dateTo}
          onChange={(e) =>
            setFiltroAvancado((prev) => ({
              ...prev,
              dateTo: e.target.value,
            }))
          }
          className="border rounded-lg px-4 py-2"
          placeholder="Data final"
        />

        <button
          onClick={() => setFiltroAvancado({
            paymentMethod: "",
            status: "",
            dateFrom: "",
            dateTo: ""
          })}
          className="flex items-center px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
          <Filter size={20} className="mr-2" />
          Limpar
        </button>
      </div>

      {/* Tabela de Vendas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produtos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    Carregando...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    Nenhuma venda encontrada
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(sale.sale_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.customer_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs overflow-hidden">
                        {sale.items && sale.items.length > 0 ? (
                          <span>
                            {sale.items.slice(0, 2).map(item => item.product_name).join(', ')}
                            {sale.items.length > 2 && ` +${sale.items.length - 2} mais`}
                          </span>
                        ) : (
                          'Sem itens'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                      {formatCurrency(sale.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.payment_method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sale.status)}`}>
                        {getStatusText(sale.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => handleViewSale(sale)}
                        title="Ver Detalhes">
                        <Eye size={18} />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => handleEditSale(sale)}
                        title="Editar Venda">
                        <Edit size={18} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteSale(sale.id)}
                        title="Excluir Venda">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t">
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">{(page - 1) * 10 + 1}</span> até{' '}
            <span className="font-medium">
              {Math.min(page * 10, sales.length)}
            </span>{' '}
            de <span className="font-medium">{estatisticas.totalVendas}</span> resultados
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50">
            <ArrowLeft size={16}/>
          </button>
          <span className="text-sm text-gray-700">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-md disabled:opacity-50">
            <ArrowRight size={16}/>
          </button>
        </div>
      </div>

      {/* Modal de Nova Venda */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Venda"
        size="max-w-4xl"
      >
        <FormularioVenda
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveVenda}
        />
      </Modal>

      {/* Modal de Detalhes da Venda */}
      {selectedSale && detailsModalOpen && (
        <SaleDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedSale(null);
          }}
          sale={selectedSale}
        />
      )}

      {/* Modal de Edição */}
      {selectedSale && editModalOpen && (
        <EditSaleModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedSale(null);
          }}
          onSave={handleUpdateSale}
          sale={selectedSale}
        />
      )}

      {/* Modal de Exclusão */}
      {selectedSale && deleteModalOpen && (
        <DeleteSaleModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedSale(null);
          }}
          onConfirm={handleConfirmDelete}
          saleId={selectedSale.id}
          customerName={selectedSale.customer_name}
        />
      )}
    </div>
  );
};

export default VendasPage;