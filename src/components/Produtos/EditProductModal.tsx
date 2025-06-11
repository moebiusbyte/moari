import React, { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Product } from '../../types/product';
import type { Supplier } from '../../types/supplier';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: Partial<Product>, newImages: File[]) => Promise<void>;
  product: Product;
  suppliers: Supplier[]; // Nova prop para lista de fornecedores
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  suppliers
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [newImages, setNewImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

// Atualizar o useEffect para incluir o supplier_id
useEffect(() => {
  if (product) {
    console.log('🔍 Product data received in modal:', product);
    console.log('🏢 Supplier ID from product:', product.supplier_id);
    
    setFormData({
      id: product.id,
      code: product.code,
      name: product.name,
      category: product.category,
      material_type: product.material_type,
      size: product.size,
      base_price: product.base_price,
      profit_margin: product.profit_margin,
      description: product.description,
      status: product.status,
      quantity: product.quantity,
      buy_date: product.buy_date,
      supplier_id: product.supplier_id || '' // Garantir que não seja undefined
    });
  }
}, [product]);

// Validação para campos numéricos
const validateNumberInput = (value: string, maxValue: number) => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "";
  if (numValue < 0) return "0";
  if (numValue > maxValue) return maxValue.toString();
  return value;
};

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  let validatedValue = value;
  
  // Validação de campos numéricos
  if (name === "base_price") {
    validatedValue = validateNumberInput(value, 99999.99);
    if (parseFloat(value) > 99999.99) {
      setValidationMessage("O preço base não pode exceder R$ 99.999,99");
    } else {
      setValidationMessage(null);
    }
  } else if (name === "profit_margin") {
    validatedValue = validateNumberInput(value, 999.99);
    if (parseFloat(value) > 999.99) {
      setValidationMessage("A margem de lucro não pode exceder 999,99%");
    } else {
      setValidationMessage(null);
    }
  } else if (name === "quantity") {
    const intValue = parseInt(value);
    if (isNaN(intValue) || intValue < 0) {
      validatedValue = "1";
    } else if (intValue > 9999) {
      validatedValue = "9999";
      setValidationMessage("A quantidade não pode exceder 9.999 unidades");
    } else {
      validatedValue = value;
      setValidationMessage(null);
    }
  }

  setFormData(prev => ({
    ...prev,
    [name]: validatedValue
  }));
};

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('📤 Form data being sent:', formData);
      console.log('🏢 Supplier ID being sent:', formData.supplier_id);
      
      await onSave(formData, newImages);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar produto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-2xl m-4 flex flex-col max-h-[90vh]">
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
  
        {/* Conteúdo com scroll */}
        <div className="overflow-y-auto flex-1 p-6">
          <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-4">

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-gray-200 p-2"
                readOnly
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

            {/* NOVO CAMPO: Fornecedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornecedor
              </label>
              <select
                name="supplier_id"
                value={formData.supplier_id || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                <option value="">Selecione um fornecedor...</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.nome || `Fornecedor ${supplier.id}`}
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-500">
                Associe este produto a um fornecedor existente
              </span>
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
                max="99999.99"
                min="0"
              />
              <span className="text-xs text-gray-500">Máximo: R$ 99.999,99</span>
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
                max="999.99"
                min="0"
              />
              <span className="text-xs text-gray-500">Máximo: 999,99%</span>
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
                <option value="consigned">Consignado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade em Estoque
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2"
                min="0"
                max="9999"
                step="1"
              />
              <span className="text-xs text-gray-500">Máximo: 9.999 unidades</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Compra
            </label>
            <input
              type="date"
              name="buy_date"
              value={formData.buy_date || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 p-2"
            />
            <span className="text-xs text-gray-500">Data de entrada no estoque</span>
            </div>
  
            <div>
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

            {formData.buy_date && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Tempo em Estoque:</strong> {
                  (() => {
                    const buyDate = new Date(formData.buy_date);
                    const today = new Date();
                    const diffTime = Math.abs(today.getTime() - buyDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                    if (diffDays > 365) {
                      return `${Math.floor(diffDays / 365)} ano(s) e ${diffDays % 365} dias`;
                    } else if (diffDays > 30) {
                      return `${Math.floor(diffDays / 30)} mês(es) e ${diffDays % 30} dias`;
                    } else {
                      return `${diffDays} dias`;
                    }
                  })()
                }
              </div>
            </div>
            )}
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Novas Imagens
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                multiple
                accept="image/*"
                className="w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            {validationMessage && (
              <Alert className="mt-4">
                <AlertDescription>{validationMessage}</AlertDescription>
              </Alert>
            )}
  
            {error && (
              <Alert className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

          </form>
        </div>
  
        {/* Footer */}
        <div className="border-t p-6 flex justify-end gap-4">
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
            form="edit-product-form"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
            disabled={loading}
          >
            <Save size={20} className="mr-2" />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProductModal;