import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productId: string) => Promise<void>;
  productId: string;
  productName: string;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productId,
  productName
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!productId) {
      setError('ID do produto inválido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Log para debug
      console.log('Tentando excluir produto com ID:', productId);
      
      await onConfirm(productId);
      
      // Se chegou aqui, deu tudo certo
      onClose();
    } catch (err: any) {
      // Log detalhado do erro
      console.error('Erro ao excluir:', {
        productId,
        error: err
      });

      // Tratamento mais específico do erro
      let errorMessage = 'Erro ao excluir produto. Por favor, tente novamente.';
      
      if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md m-4">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center text-red-600">
            <AlertTriangle size={24} className="mr-2" />
            <h2 className="text-xl font-semibold">Confirmar Exclusão</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Você tem certeza que deseja excluir o produto{' '}
            <span className="font-semibold">{productName}</span>?
          </p>
          
          <p className="text-sm text-gray-500 mb-6">
            Esta ação não pode ser desfeita e todos os dados associados a este produto serão permanentemente removidos.
          </p>

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-block">Excluindo...</span>
              ) : (
                'Confirmar Exclusão'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;