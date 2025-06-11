import React, { useState, useEffect } from 'react';
import { X, User, CreditCard, Save } from 'lucide-react';

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

interface EditSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Partial<Sale>) => Promise<void>;
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

// Modal de Edição da Venda
const EditSaleModal: React.FC<EditSaleModalProps> = ({ isOpen, onClose, onSave, sale }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    payment_method: '',
    total_amount: 0,
    discount_amount: 0,
    notes: '',
    status: 'completed' as 'completed' | 'pending' | 'cancelled'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (sale) {
      setFormData({
        customer_name: sale.customer_name || '',
        customer_email: sale.customer_email || '',
        customer_phone: sale.customer_phone || '',
        payment_method: sale.payment_method || '',
        total_amount: sale.total_amount || 0,
        discount_amount: sale.discount_amount || 0,
        notes: sale.notes || '',
        status: sale.status || 'completed'
      });
      setErrors({}); // Limpar erros quando um novo sale é carregado
    }
  }, [sale]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Nome do cliente é obrigatório';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Método de pagamento é obrigatório';
    }

    if (formData.total_amount <= 0) {
      newErrors.total_amount = 'Valor total deve ser maior que zero';
    }

    if (formData.discount_amount < 0) {
      newErrors.discount_amount = 'Desconto não pode ser negativo';
    }

    if (formData.discount_amount > formData.total_amount + formData.discount_amount) {
      newErrors.discount_amount = 'Desconto não pode ser maior que o subtotal';
    }

    if (formData.customer_email && !isValidEmail(formData.customer_email)) {
      newErrors.customer_email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      alert('Erro ao atualizar venda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_amount' || name === 'discount_amount' 
        ? parseFloat(value) || 0 
        : value
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const subtotal = formData.total_amount + formData.discount_amount;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Editar Venda" size="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações do Cliente */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <User className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold">Informações do Cliente</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Cliente *
              </label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customer_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome completo do cliente"
              />
              {errors.customer_name && (
                <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email do Cliente
              </label>
              <input
                type="email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customer_email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="email@exemplo.com"
              />
              {errors.customer_email && (
                <p className="text-red-500 text-xs mt-1">{errors.customer_email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone do Cliente
              </label>
              <input
                type="tel"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status da Venda *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="completed">Concluída</option>
                <option value="pending">Pendente</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Informações de Pagamento */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <CreditCard className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold">Informações de Pagamento</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pagamento *
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.payment_method ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione...</option>
                <option value="pix">PIX</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="transferencia">Transferência</option>
              </select>
              {errors.payment_method && (
                <p className="text-red-500 text-xs mt-1">{errors.payment_method}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Total *
              </label>
              <input
                type="number"
                name="total_amount"
                value={formData.total_amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.total_amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0,00"
              />
              {errors.total_amount && (
                <p className="text-red-500 text-xs mt-1">{errors.total_amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desconto
              </label>
              <input
                type="number"
                name="discount_amount"
                value={formData.discount_amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                max={subtotal}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.discount_amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0,00"
              />
              {errors.discount_amount && (
                <p className="text-red-500 text-xs mt-1">{errors.discount_amount}</p>
              )}
            </div>

            {/* Resumo dos Valores */}
            <div className="bg-white p-3 rounded border">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Resumo</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desconto:</span>
                  <span className="text-red-600">-{formatCurrency(formData.discount_amount)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Total:</span>
                  <span className="text-green-600">{formatCurrency(formData.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Observações sobre a venda..."
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </ModalBase>
  );
};

export default EditSaleModal;