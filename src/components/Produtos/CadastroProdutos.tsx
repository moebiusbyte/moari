import React, { useEffect, useState, useCallback } from "react";
import { X, Upload, Trash2, Save, Plus, Tag, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from '../../../server/api/axiosConfig';
import { Supplier } from "@/types/supplier";

interface ProdutoFormData {
  codigo: string;
  nome: string;
  categoria: string;
  formato: string;
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
  dataCompra: string;    // CORRIGIDO: renomeado de dataCompra para buy_date
  quantidade: string;    // CORRIGIDO: renomeado de quantidade para quantity
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
  tipoMaterial: "",
  modoUso: "",
  tamanho: "",
  materiaisComponentes: [] as string[],
  origem: "",
  garantia: "false",
  fornecedor: "",
  precoBase: "",
  margemLucro: "",
  descricao: "",
  dataCompra: "",        // CORRIGIDO
  quantidade: "1",       // CORRIGIDO: valor padrão 1
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertaPreco, setAlertaPreco] = useState<{
    tipo: string;
    mensagem: string;
  } | null>(null);
  const [fornecedores, setFornecedores] = useState<Supplier[]>([]);

  useEffect(() => {
    if (isOpen) {
      console.log("Modal está aberto:", isOpen);
      generateProductCode();
    }
  }, [isOpen]);

  // Função para buscar fornecedores
  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setFornecedores(response.data);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const generateProductCode = async () => {
    try {
      setLoading(true);
      setAlertaPreco(null);
  
      const response = await api.get('/next-product-id');
      console.log('Resposta da API de código de produto:', response.data);
  
      if (!response.data || response.data.nextId === undefined) {
        throw new Error('Resposta da API inválida - campo nextId ausente');
      }
  
      const { nextId } = response.data;
      let formattedCode;
      
      if (typeof nextId === 'string') {
        formattedCode = nextId.match(/^\d+$/) 
          ? nextId.padStart(7, '0')
          : '0000001';
      } else if (typeof nextId === 'number') {
        formattedCode = nextId.toString().padStart(7, '0');
      } else {
        console.warn('Tipo de nextId inesperado:', typeof nextId);
        formattedCode = '0000001';
      }
      
      console.log('Código formatado para uso:', formattedCode);
      
      setProduto(prev => ({
        ...prev,
        codigo: formattedCode,
      }));
    } catch (error) {
      console.error('Erro ao gerar código do produto:', error);
  
      setProduto((prev) => ({
        ...prev,
        codigo: '0000001',
      }));
  
      setAlertaPreco({
        tipo: 'warning',
        mensagem: 'Erro ao gerar código do produto. Usando código padrão.',
      });
    } finally {
      setLoading(false);
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
    const { name, value, type } = e.target;
  
    let validatedValue = value;
  
    // Lidar com checkboxes
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      validatedValue = e.target.checked ? "true" : "false";
    }
  
    // Validação para campos numéricos
    if (["precoBase", "margemLucro"].includes(name)) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        validatedValue = "0";
      } else {
        validatedValue = numValue.toString();
      }
    }

    // NOVA VALIDAÇÃO: para quantidade
    if (name === "quantidade") {
      const intValue = parseInt(value);
      if (isNaN(intValue) || intValue < 0) {
        validatedValue = "1";
      } else if (intValue > 9999) {
        validatedValue = "9999";
        setAlertaPreco({
          tipo: "warning",
          mensagem: "A quantidade não pode exceder 9.999 unidades"
        });
      } else {
        validatedValue = value;
        setAlertaPreco(null);
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

  const handleSave = async () => {
    if (!produto.nome || !produto.codigo || !produto.categoria) {
      setAlertaPreco({
        tipo: "error",
        mensagem: "Por favor, preencha todos os campos obrigatórios",
      });
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
  
      console.log("Tentando salvar produto com ID:", produto.codigo);
  
      await onSave({ ...produto, fornecedor: produto.fornecedor }, imagens);
  
      onClose();
    } catch (err: any) {
      console.error("Erro ao salvar produto:", {
        codigo: produto.codigo,
        error: err,
      });
  
      let errorMessage = "Erro ao salvar produto. Por favor, tente novamente.";
  
      if (err?.message) {
        errorMessage = err.message;
      }
  
      setError(errorMessage);
  
      setAlertaPreco({
        tipo: "error",
        mensagem: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
                  value={loading ? "Carregando..." : produto.codigo}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-gray-200 p-2"
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

              {/* Dropdown de Fornecedores */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor
                </label>
                <select
                  name="fornecedor"
                  value={produto.fornecedor}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2"
                >
                  <option value="">Selecione o fornecedor...</option>
                  {fornecedores.map((fornecedor) => (
                    <option key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* NOVOS CAMPOS: Quantidade e Data de Compra */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade em Estoque
                </label>
                <input
                  type="number"
                  name="quantidade"
                  value={produto.quantidade}
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
                  name="dataCompra"
                  value={produto.dataCompra}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2"
                />
                <span className="text-xs text-gray-500">Data de entrada no estoque</span>
              </div>

              {/* Mostrar tempo em estoque se dataCompra estiver preenchido */}
              {produto.dataCompra && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Tempo em Estoque:</strong> {
                      (() => {
                        const buyDate = new Date(produto.dataCompra);
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
            </div>

            {/* Características */}
            <div className="space-y-4">

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Garantia
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="garantia"
                    checked={produto.garantia === "true"}
                    onChange={(e) =>
                      setProduto((prev) => ({
                        ...prev,
                        garantia: e.target.checked ? "true" : "false",
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span>Produto com garantia</span>
                </div>
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
            className={`px-4 py-2 rounded-lg flex items-center ${
              loading
                ? "bg-blue-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="inline-block">Salvando...</span>
            ) : (
              "Salvar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CadastroProdutos;