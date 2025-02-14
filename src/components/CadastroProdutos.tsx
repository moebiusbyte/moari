import React, { useEffect, useState, useCallback } from "react";
import { X, Upload, Trash2, Save, Plus, Tag, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from '../../server/api/axiosConfig';

interface ProdutoFormData {
  codigo: string;
  nome: string;
  categoria: string;
  formato: string;
  qualidade: string;
  tipoMaterial: string;
  modoUso: string;
  tamanho: string;
  materiaisComponentes: string[];
  origem: string;
  garantia: string;
  fornecedor: string;
  precoBase: string;
  margemLucro: string;
  descricao: string;
}

interface CadastroProdutosProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (produto: ProdutoFormData, imagens: File[]) => void;
}

const produtoInicial: ProdutoFormData = {
  codigo: "",
  nome: "",
  categoria: "",
  formato: "",
  qualidade: "",
  tipoMaterial: "",
  modoUso: "",
  tamanho: "",
  materiaisComponentes: [] as string[],
  origem: "",
  garantia: "",
  fornecedor: "",
  precoBase: "",
  margemLucro: "",
  descricao: "",
};


const CadastroProdutos: React.FC<CadastroProdutosProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [produto, setProduto] = useState<ProdutoFormData>(produtoInicial);
  const [imagens, setImagens] = useState<File[]>([]);
  const [previewImagens, setPreviewImagens] = useState<string[]>([]);
  const [novoMaterial, setNovoMaterial] = useState("");
  const [alertaPreco, setAlertaPreco] = useState<{
    tipo: string;
    mensagem: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      console.log("Modal está aberto:", isOpen);
      generateProductCode();
      // ... outras inicializações
    }    
  }, [isOpen]);

  const generateProductCode = async () => {
    try {
      // Usar o cliente Axios configurado ao invés de fetch
      const response = await api.get('/next-product-id');
      const { nextId } = response.data;
      
      // Formatar o código com zeros à esquerda (7 dígitos)
      const formattedCode = nextId.toString().padStart(7, '0');
      
      // Atualizar o estado do produto
      setProduto(prev => ({
        ...prev,
        codigo: formattedCode
      }));
    } catch (error) {
      console.error('Erro ao gerar código do produto:', error);
      setAlertaPreco({
        tipo: 'error',
        mensagem: 'Erro ao gerar código do produto'
      });
    }
  };

  const validateNumberInput = (value: string, maxValue: number) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "";
    if (numValue < 0) return "0";
    if (numValue > maxValue) return maxValue.toString();
    return value;
  };

  const calcularPrecoSugerido = useCallback(() => {
    const precoBase = parseFloat(produto.precoBase);
    const margem = parseFloat(produto.margemLucro);

    if (!isNaN(precoBase) && !isNaN(margem)) {
      const precoSugerido = precoBase * (1 + margem / 100);
      const precoFinal = Math.ceil(precoSugerido * 100) / 100;

      setAlertaPreco({
        tipo: "info",
        mensagem: `Preço sugerido: R$ ${precoFinal.toFixed(2)}`,
      });
    }
  }, [produto.precoBase, produto.margemLucro]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    if (files.length + imagens.length > 5) {
      setAlertaPreco({
        tipo: "warning",
        mensagem: "Máximo de 5 imagens permitido",
      });
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setAlertaPreco({
          tipo: "error",
          mensagem: "Imagens devem ter no máximo 5MB",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewImagens((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImagens((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setImagens((prev) => prev.filter((_, i) => i !== index));
    setPreviewImagens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMaterial = () => {
    if (novoMaterial.trim()) {
      setProduto((prev) => ({
        ...prev,
        materiaisComponentes: [
          ...prev.materiaisComponentes,
          novoMaterial.trim(),
        ],
      }));
      setNovoMaterial("");
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setProduto((prev) => ({
      ...prev,
      materiaisComponentes: prev.materiaisComponentes.filter(
        (_, i) => i !== index
      ),
    }));
  };

    const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    
    let validatedValue = value;
    
    // Validate numeric inputs
    if (name === "precoBase") {
      validatedValue = validateNumberInput(value, 99999.99); // Max 5 digits before decimal
      if (parseFloat(value) > 99999.99) {
        setAlertaPreco({
          tipo: "warning",
          mensagem: "O preço base não pode exceder R$ 99.999,99"
        });
      }
    } else if (name === "margemLucro") {
      validatedValue = validateNumberInput(value, 999.99); // Max 3 digits before decimal
      if (parseFloat(value) > 999.99) {
        setAlertaPreco({
          tipo: "warning",
          mensagem: "A margem de lucro não pode exceder 999,99%"
        });
      }
    }

    setProduto((prev) => ({
      ...prev,
      [name]: validatedValue,
    }));

    if (["precoBase", "margemLucro"].includes(name)) {
      calcularPrecoSugerido();
    }
  };

  const handleSave = () => {
    if (!produto.nome || !produto.codigo || !produto.categoria) {
      setAlertaPreco({
        tipo: "error",
        mensagem: "Por favor, preencha todos os campos obrigatórios",
      });
      return;
    }
    onSave(produto, imagens);
  };

  //if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl m-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold">Cadastro de Produto</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={produto.codigo}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300  bg-gray-200  p-2"
                  required
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={produto.nome}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  name="categoria"
                  value={produto.categoria}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="colares">Colares</option>
                  <option value="brincos">Brincos</option>
                  <option value="aneis">Anéis</option>
                  <option value="pulseiras">Pulseiras</option>
                </select>
              </div>
            </div>

            {/* Características */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualidade
                </label>
                <select
                  name="qualidade"
                  value={produto.qualidade}
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
                  Tipo de Material
                </label>
                <input
                  type="text"
                  name="tipoMaterial"
                  value={produto.tipoMaterial}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamanho
                </label>
                <input
                  type="text"
                  name="tamanho"
                  value={produto.tamanho}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2"
                />
              </div>
            </div>
          </div>

          {/* Materiais Componentes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Materiais Componentes
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={novoMaterial}
                onChange={(e) => setNovoMaterial(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 p-2"
                placeholder="Adicionar material..."
              />
              <button
                onClick={handleAddMaterial}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {produto.materiaisComponentes.map((material, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full"
                >
                  <Tag size={14} />
                  {material}
                  <button
                    onClick={() => handleRemoveMaterial(index)}
                    className="ml-1 text-gray-500 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Precificação */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Info size={20} />
              Precificação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Base (R$)
                </label>
                <input
                  type="number"
                  name="precoBase"
                  value={produto.precoBase}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Margem de Lucro (%)
                </label>
                <input
                  type="number"
                  name="margemLucro"
                  value={produto.margemLucro}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2"
                />
              </div>
            </div>

            {alertaPreco && (
              <Alert className="mt-4">
                <AlertDescription>{alertaPreco.mensagem}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Upload de Imagens */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Imagens do Produto</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewImagens.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {previewImagens.length < 5 && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
                  <Upload size={24} className="text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">
                    Adicionar Imagem
                  </span>
                  <span className="mt-1 text-xs text-gray-400">
                    Máx. 5 imagens
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              name="descricao"
              value={produto.descricao}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 p-2"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Save size={20} className="mr-2" />
            Salvar Produto
          </button>
        </div>
      </div>
    </div>
  );
};

export default CadastroProdutos;
