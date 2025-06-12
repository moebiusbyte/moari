import React, { useEffect, useState, useCallback } from "react";
import { X, Upload, Trash2, Save, Plus, Tag, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from '../../../server/api/axiosConfig';
import { To } from "react-router-dom";

interface FornecedorFormData {
    codigo: string;
    nome: string;
    contato: string;
    telefone: string;
    email: string;
    cidade: string;
    estado: string;
    endereco: string;
    ultimacompra: Date | null;
  }

  interface CadastroFornecedoresProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (fornecedor: FornecedorFormData, imagens: File[]) => void;
  }
  
  const fornecedorInicial: FornecedorFormData = {
    codigo: "",
    nome: "",
    contato: "",
    telefone: "",
    email: "",
    cidade: "",
    estado: "",
    endereco: "",
    ultimacompra: null,
  };

  const estadosBrasil = [
      { uf: 'AC', nome: 'Acre' },
      { uf: 'AL', nome: 'Alagoas' },
      { uf: 'AP', nome: 'Amapá' },
      { uf: 'AM', nome: 'Amazonas' },
      { uf: 'BA', nome: 'Bahia' },
      { uf: 'CE', nome: 'Ceará' },
      { uf: 'DF', nome: 'Distrito Federal' },
      { uf: 'ES', nome: 'Espírito Santo' },
      { uf: 'GO', nome: 'Goiás' },
      { uf: 'MA', nome: 'Maranhão' },
      { uf: 'MT', nome: 'Mato Grosso' },
      { uf: 'MS', nome: 'Mato Grosso do Sul' },
      { uf: 'MG', nome: 'Minas Gerais' },
      { uf: 'PA', nome: 'Pará' },
      { uf: 'PB', nome: 'Paraíba' },
      { uf: 'PR', nome: 'Paraná' },
      { uf: 'PE', nome: 'Pernambuco' },
      { uf: 'PI', nome: 'Piauí' },
      { uf: 'RJ', nome: 'Rio de Janeiro' },
      { uf: 'RN', nome: 'Rio Grande do Norte' },
      { uf: 'RS', nome: 'Rio Grande do Sul' },
      { uf: 'RO', nome: 'Rondônia' },
      { uf: 'RR', nome: 'Roraima' },
      { uf: 'SC', nome: 'Santa Catarina' },
      { uf: 'SP', nome: 'São Paulo' },
      { uf: 'SE', nome: 'Sergipe' },
      { uf: 'TO', nome: 'Tocantins' }
  ];
  
  const CadastroFornecedores: React.FC<CadastroFornecedoresProps> = ({
    isOpen,
    onClose,
    onSave,
  }) => {
    const [fornecedor, setFornecedor] = useState<FornecedorFormData>(fornecedorInicial);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [alerta, setAlerta] = useState<{
      tipo: string;
      mensagem: string;
    } | null>(null);

    useEffect(() => {
      if (isOpen) {
        console.log("Modal está aberto:", isOpen);
        generateSupplierCode();
        // ... outras inicializações
      }    
    }, [isOpen]);
  
    
    const generateSupplierCode = async () => {
      try {
        setLoading(true); // Define o estado como "carregando"
    
        // Chamada à API para obter o próximo código de Fornecedor
        const response = await api.get('/next-Supplier-id');
        console.log('Resposta da API de código de Fornecedor:', response.data);

        // Verificar se a resposta contém o campo esperado
        if (!response.data || response.data.nextId === undefined) {
            throw new Error('Resposta da API inválida - campo nextId ausente');
        }
    
        const { nextId } = response.data;
    
        // Garantir que o código seja sempre uma string com 7 dígitos
        let formattedCode;
        
        if (typeof nextId === 'string') {
            // Se já for uma string, certificar-se de que tem o formato correto
            formattedCode = nextId.match(/^\d+$/) 
            ? nextId.padStart(7, '0')
            : '0000001'; // Fallback se não for numérico
        } else if (typeof nextId === 'number') {
            // Se for um número, converter para string com padding
            formattedCode = nextId.toString().padStart(7, '0');
        } else {
            // Tipo inesperado, usar fallback
            console.warn('Tipo de nextId inesperado:', typeof nextId);
            formattedCode = '0000001';
        }
        
        console.log('Código formatado para uso:', formattedCode);
        
        // Atualizar o estado do Fornecedor
        setFornecedor(prev => ({
            ...prev,
            codigo: formattedCode,
        }));
        } catch (error) {
        console.error('Erro ao gerar código do Fornecedor:', error);
    
        // Define um código padrão em caso de erro
        setFornecedor((prev) => ({
            ...prev,
            codigo: '0000001',
        }));
    
        setAlerta({
            tipo: 'warning',
            mensagem: 'Erro ao gerar código do Fornecedor. Usando código padrão.',
        });
        } finally {
        setLoading(false); // Finaliza o estado de "carregando"
        }
    };
    const validateNumberInput = (value: string, maxValue: number) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return "";
        if (numValue < 0) return "0";
        if (numValue > maxValue) return maxValue.toString();
        return value;
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
            validatedValue = "0"; // Define como 0 se o valor for inválido
          } else {
            validatedValue = numValue.toString();
          }
        }
      
        setFornecedor((prev) => ({
          ...prev,
          [name]: validatedValue,
        }));
      };
    
      const handleSave = async () => {
        if (!fornecedor.nome || !fornecedor.contato || !fornecedor.ultimacompra) {
          setAlerta({
            tipo: "error",
            mensagem: "Por favor, preencha todos os campos obrigatórios",
          });
          return;
        }
      
        try {
          setLoading(true);
          setError(null);
      
          // Formatar a data para o formato ISO 8601
          const fornecedorComDataFormatada: FornecedorFormData = {
            ...fornecedor,
            ultimacompra: fornecedor.ultimacompra instanceof Date
              ? fornecedor.ultimacompra
              : fornecedor.ultimacompra
              ? new Date(fornecedor.ultimacompra)
              : null,
          };

          // Salvar o fornecedor com a data formatada
          await onSave(fornecedorComDataFormatada, []);

          onClose();
        } catch (err: any) {
          console.error("Erro ao salvar fornecedor:", err);
          setError("Erro ao salvar fornecedor. Por favor, tente novamente.");
          setAlerta({
            tipo: "error",
            mensagem: "Erro ao salvar fornecedor. Por favor, tente novamente.",
          });
        } finally {
          setLoading(false);
        }
      };

 
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
        <div className="bg-white rounded-lg w-full max-w-4xl m-4">
            {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-semibold">Cadastro de Fornecedor</h2>
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

                        
                        {/* ID */}        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Código *
                            </label>
                            <input
                                type="text"
                                name="codigo"
                                value={loading ? "Carregando..." : fornecedor.codigo} // Mostra "Carregando..." enquanto `loading` for true
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 bg-gray-200 p-2"
                                required
                                readOnly
                            />
                        </div>

                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome *
                            </label>
                            <input
                                type="text"
                                name="nome"
                                value={fornecedor.nome}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 p-2"
                                required
                            />
                        </div>

                        
                        {/* Contato */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contato *
                            </label>
                            <input
                                type="text"
                                name="contato"
                                value={fornecedor.contato}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 p-2"
                                required
                            />
                        </div>
                    </div>

                    {/* Telefone */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefone
                        </label>
                        <input
                            type="text"
                            name="telefone"
                            value={fornecedor.telefone}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 p-2"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            E-mail
                        </label>
                        <input
                            type="text"
                            name="email"
                            value={fornecedor.email}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 p-2"
                            required
                        />
                    </div>

                    {/* Cidade*/}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cidade
                        </label>
                        <input
                            type="text"
                            name="cidade"
                            value={fornecedor.cidade}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 p-2"
                            required
                        />
                    </div>

                    {/* Estado*/}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                        </label>
                        <select
                            name="estado"
                            value={fornecedor.estado}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 p-2 bg-white"
                            required
                        >
                            <option value="">Selecione um estado</option>
                            {estadosBrasil.map((estado) => (
                                <option key={estado.uf} value={estado.uf}>
                                    {estado.uf} - {estado.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Endereco*/}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Endereço
                        </label>
                        <input
                            type="text"
                            name="endereco"
                            value={fornecedor.endereco}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 p-2"
                            required
                        />
                    </div>

                    {/* Data última compra */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data da última compra
                      </label>
                      <input
                        type="date"
                        name="ultimacompra"
                        value={
                          fornecedor.ultimacompra
                            ? new Date(fornecedor.ultimacompra).toISOString().slice(0, 10) // Pega apenas YYYY-MM-DD
                            : ""
                        }
                        onChange={(e) =>
                          setFornecedor((prev) => ({
                            ...prev,
                            ultimacompra: e.target.value ? new Date(e.target.value) : null,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 p-2"
                        required
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
                            ? "bg-blue-400 text-white cursor-not-allowed" // Azul claro quando carregando
                            : "bg-blue-600 text-white hover:bg-blue-700" // Azul padrão
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
    </div>
  );
};

export default CadastroFornecedores;
