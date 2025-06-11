import React from 'react';
import { X, User, CreditCard, Calendar, Package } from 'lucide-react';

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

interface SaleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
}

// Modal base component
const ModalBase = ({ isOpen, onClose, title, children, size = "max-w-xl" }) => {
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

// Modal de Detalhes da Venda
const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({ isOpen, onClose, sale }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'pix':
        return 'PIX';
      case 'cartao_credito':
        return 'Cartão de Crédito';
      case 'cartao_debito':
        return 'Cartão de Débito';
      case 'dinheiro':
        return 'Dinheiro';
      case 'transferencia':
        return 'Transferência';
      default:
        return method;
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Detalhes da Venda" size="max-w-3xl">
      <div className="space-y-6">
        {/* Informações do Cliente */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <User className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold">Informações do Cliente</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Nome</label>
              <p className="text-gray-900">{sale.customer_name}</p>
            </div>
            {sale.customer_email && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{sale.customer_email}</p>
              </div>
            )}
            {sale.customer_phone && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Telefone</label>
                <p className="text-gray-900">{sale.customer_phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Informações da Venda */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <Calendar className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold">Informações da Venda</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Data da Venda</label>
              <p className="text-gray-900">{formatDate(sale.sale_date)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Status</label>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sale.status)}`}>
                {getStatusText(sale.status)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Método de Pagamento</label>
              <p className="text-gray-900">{getPaymentMethodText(sale.payment_method)}</p>
            </div>
          </div>
        </div>

        {/* Produtos */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <Package className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold">Produtos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Produto</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Qtd</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Preço Unit.</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items && sale.items.length > 0 ? (
                  sale.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 text-sm text-gray-900">
                        {item.product_name}
                        {item.product_code && (
                          <span className="block text-xs text-gray-500">Cód: {item.product_code}</span>
                        )}
                      </td>
                      <td className="py-2 text-sm text-gray-900 text-center">{item.quantity}</td>
                      <td className="py-2 text-sm text-gray-900 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="py-2 text-sm font-semibold text-gray-900 text-right">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">
                      Nenhum item encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <CreditCard className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold">Resumo Financeiro</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">{formatCurrency(sale.total_amount + (sale.discount_amount || 0))}</span>
            </div>
            {sale.discount_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Desconto:</span>
                <span className="text-red-600">-{formatCurrency(sale.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(sale.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Observações */}
        {sale.notes && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Observações</h3>
            <p className="text-gray-700">{sale.notes}</p>
          </div>
        )}

        {/* Informações de Sistema */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Informações do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-gray-600">ID da Venda:</label>
              <p className="text-gray-900">#{sale.id}</p>
            </div>
            <div>
              <label className="block text-gray-600">Criado em:</label>
              <p className="text-gray-900">{formatDate(sale.created_at)}</p>
            </div>
            {sale.updated_at && (
              <div>
                <label className="block text-gray-600">Última atualização:</label>
                <p className="text-gray-900">{formatDate(sale.updated_at)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalBase>
  );
};

export default SaleDetailsModal;