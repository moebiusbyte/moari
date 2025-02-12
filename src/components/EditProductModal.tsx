import React, { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Product } from '../types/product';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string, updatedData: Partial<Product>) => Promise<void>;
  product: Product;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code,
        name: product.name,
        category: product.category,
        quality: product.quality,
        material_type: product.material_type,
        size: product.size,
        base_price: product.base_price,
        profit_margin: product.profit_margin,
        description: product.description,
        status: product.status
      });
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(product.id, formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar produto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-2xl m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold">Editar Produto</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                <option value="">Selecione...</option>
                <option value="colares">Colares</option>
                <option value="brincos">Brincos</option>
                <option value="aneis">Anéis</option>
                <option value="pulseiras">Pulseiras</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualidade
              </label>
              <select
                name="quality"
                value={formData.quality || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                <option value="">Selecione...</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Base
              </label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margem de Lucro
              </label>
              <input
                type="number"
                name="profit_margin"
                value={formData.profit_margin || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 p-2"
            />
          </div>

          {error && (
            <Alert className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
              disabled={loading}
            >
              <Save size={20} className="mr-2" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;