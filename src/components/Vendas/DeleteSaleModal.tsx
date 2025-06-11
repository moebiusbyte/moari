import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Calendar, CreditCard } from 'lucide-react';

// Tipos
interface DeleteSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (saleId: string) => Promise<void>;
  saleId: string;
  customerName: string;
  saleAmount?: number;
  saleDate?: string;
  paymentMethod?: string;
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

// Modal de Confirmação de Exclusão
const DeleteSaleModal: React.FC<DeleteSaleModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  saleId, 
  customerName,
  saleAmount,
  saleDate,
  paymentMethod
}) => {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(saleId);
      onClose();
      setConfirmText(''); // Limpar campo de confirmação
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      alert('Erro ao excluir venda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
      year: 'numeric'
    });
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
        return method || 'Não informado';
    }
  };

  // Validar se o usuário digitou "EXCLUIR" para confirmar
  const canConfirm = confirmText.toUpperCase() === 'EXCLUIR';

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Confirmar Exclusão" size="max-w-md">
      <div className="space-y-6">
        {/* Ícone de Alerta */}
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Título e Descrição */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Excluir Venda
          </h3>
          <p className="text-sm text-gray-600">
            Esta ação não pode ser desfeita. A venda será permanentemente removida do sistema.
          </p>
        </div>

        {/* Informações da Venda */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-600 mt-1" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-sm font-medium text-red-900">
                  Venda para: <span className="font-semibold">{customerName}</span>
                </p>
                <p className="text-xs text-red-700">ID: #{saleId}</p>
              </div>
              
              {/* Detalhes da Venda */}
              {(saleAmount || saleDate || paymentMethod) && (
                <div className="border-t border-red-200 pt-2 space-y-1">
                  {saleAmount && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-red-700">Valor:</span>
                      <span className="text-xs font-medium text-red-900">
                        {formatCurrency(saleAmount)}
                      </span>
                    </div>
                  )}
                  
                  {saleDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-red-700 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Data:
                      </span>
                      <span className="text-xs font-medium text-red-900">
                        {formatDate(saleDate)}
                      </span>
                    </div>
                  )}
                  
                  {paymentMethod && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-red-700 flex items-center">
                        <CreditCard className="w-3 h-3 mr-1" />
                        Pagamento:
                      </span>
                      <span className="text-xs font-medium text-red-900">
                        {getPaymentMethodText(paymentMethod)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Campo de Confirmação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Para confirmar, digite <span className="font-semibold text-red-600">"EXCLUIR"</span> abaixo:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Digite EXCLUIR para confirmar"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            disabled={loading}
          />
        </div>

        {/* Aviso Adicional */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <p className="font-medium">Atenção:</p>
              <ul className="mt-1 space-y-1">
                <li>• A venda será removida permanentemente</li>
                <li>• Os produtos não retornarão ao estoque automaticamente</li>
                <li>• Relatórios e estatísticas serão atualizados</li>
                <li>• Esta ação não pode ser desfeita</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !canConfirm}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {loading ? 'Excluindo...' : 'Excluir Venda'}
          </button>
        </div>

        {/* Indicador de Progresso */}
        {loading && (
          <div className="text-center">
            <div className="inline-flex items-center text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
              Processando exclusão...
            </div>
          </div>
        )}
      </div>
    </ModalBase>
  );
};

export default DeleteSaleModal;