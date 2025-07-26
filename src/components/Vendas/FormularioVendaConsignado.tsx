import React, { useState, useEffect } from 'react';
import { X, Search, Package, User, MapPin, DollarSign, Calendar } from 'lucide-react';
import api from '../../../server/api/axiosConfig';

interface ConsignadoDisponivel {
  consignacao_id: number;
  product_id: number;
  quantidade_consignada: number;
  quantidade_vendida: number;
  valor_combinado: number;
  data_consignacao: string;
  observacoes: string;
  quantidade_disponivel: number;
  product_name: string;
  product_code: string;
  base_price: number;
  category: string;
  consignado_id: number;
  consignado_nome: string;
  consignado_contato: string;
  consignado_telefone: string;
  consignado_cidade: string;
  consignado_estado: string;
  comissao: number;
  images: string[];
}

interface FormularioVendaConsignadoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vendaData: any) => Promise<void>;
}

const FormularioVendaConsignado: React.FC<FormularioVendaConsignadoProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  // Estados para busca e seleção de consignados
  const [consignadosDisponiveis, setConsignadosDisponiveis] = useState<ConsignadoDisponivel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedConsignado, setSelectedConsignado] = useState<ConsignadoDisponivel | null>(null);

  // Estados do formulário de venda
  const [formData, setFormData] = useState({
    quantidadeVendida: 1,
    precoVenda: 0,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    paymentMethod: 'dinheiro',
    notes: '',
    desconto: 0
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Buscar consignados disponíveis
  const fetchConsignadosDisponiveis = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando consignados disponíveis...');
      
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await api.get(`/consignados-vendas/disponiveis?${params}`);
      
      if (response.data.success) {
        setConsignadosDisponiveis(response.data.consignados);
        console.log(`✅ ${response.data.consignados.length} consignados encontrados`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar consignados:', error);
      setConsignadosDisponiveis([]);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar consignados ao abrir modal ou mudar busca
  useEffect(() => {
    if (isOpen) {
      fetchConsignadosDisponiveis();
    }
  }, [isOpen, searchTerm]);

  // Reset do formulário ao fechar
  useEffect(() => {
    if (!isOpen) {
      setSelectedConsignado(null);
      setSearchTerm('');
      setFormData({
        quantidadeVendida: 1,
        precoVenda: 0,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        paymentMethod: 'dinheiro',
        notes: '',
        desconto: 0
      });
      setErrors({});
    }
  }, [isOpen]);

  // Atualizar preço quando selecionar consignado
  useEffect(() => {
    if (selectedConsignado) {
      setFormData(prev => ({
        ...prev,
        precoVenda: Number(selectedConsignado.valor_combinado || selectedConsignado.base_price || 0),
        quantidadeVendida: Math.min(1, selectedConsignado.quantidade_disponivel)
      }));
    }
  }, [selectedConsignado]);

  // Função para selecionar consignado
  const handleSelectConsignado = (consignado: ConsignadoDisponivel) => {
    setSelectedConsignado(consignado);
    console.log('📦 Consignado selecionado:', consignado);
  };

  // Função para voltar à seleção
  const handleBackToSelection = () => {
    setSelectedConsignado(null);
  };

  // Validação do formulário
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedConsignado) {
      newErrors.consignado = 'Selecione um produto consignado';
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Nome do cliente é obrigatório';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Método de pagamento é obrigatório';
    }

    if (formData.quantidadeVendida < 1) {
      newErrors.quantidadeVendida = 'Quantidade deve ser maior que 0';
    }

    if (selectedConsignado && formData.quantidadeVendida > selectedConsignado.quantidade_disponivel) {
      newErrors.quantidadeVendida = `Quantidade máxima disponível: ${selectedConsignado.quantidade_disponivel}`;
    }

    if (formData.precoVenda <= 0) {
      newErrors.precoVenda = 'Preço deve ser maior que 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para submeter venda
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const vendaData = {
        consignacaoId: selectedConsignado!.consignacao_id,
        quantidadeVendida: formData.quantidadeVendida,
        precoVenda: formData.precoVenda,
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim() || null,
        customerPhone: formData.customerPhone.trim() || null,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes.trim() || null,
        desconto: formData.desconto || 0
      };

      console.log('💰 Submetendo venda de consignado:', vendaData);

      await onSave(vendaData);
      onClose();
      
    } catch (error) {
      console.error('❌ Erro ao salvar venda:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const valorTotal = (formData.precoVenda * formData.quantidadeVendida) - formData.desconto;
  const comissaoValue = selectedConsignado ? valorTotal * (Number(selectedConsignado.comissao || 0) / 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedConsignado ? 'Registrar Venda de Consignado' : 'Selecionar Produto Consignado'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Fechar modal"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {!selectedConsignado ? (
            // Tela de seleção de consignado
            <div>
              {/* Busca */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar produto consignado
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Busque por produto, código ou consignado..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Lista de consignados */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Carregando produtos...</p>
                </div>
              ) : consignadosDisponiveis.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-600">Nenhum produto consignado disponível para venda</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {consignadosDisponiveis.map((consignado) => (
                    <div
                      key={consignado.consignacao_id}
                      onClick={() => handleSelectConsignado(consignado)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{consignado.product_name}</h3>
                              <p className="text-sm text-gray-600">Código: {consignado.product_code || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                R$ {Number(consignado.valor_combinado || consignado.base_price || 0).toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">Comissão: {Number(consignado.comissao || 0)}%</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-2 gap-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="w-4 h-4 mr-2" />
                              <span>{consignado.consignado_nome}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{consignado.consignado_cidade}, {consignado.consignado_estado}</span>
                            </div>
                          </div>

                          <div className="mt-3 flex justify-between items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Disponível: {consignado.quantidade_disponivel} / {consignado.quantidade_consignada}
                            </span>
                            <span className="text-sm text-gray-500">
                              Consignado em: {new Date(consignado.data_consignacao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Formulário de venda
            <form onSubmit={handleSubmit}>
              {/* Produto selecionado */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-blue-900">{selectedConsignado.product_name}</h3>
                  <button
                    type="button"
                    onClick={handleBackToSelection}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Alterar produto
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Consignado:</span> {selectedConsignado.consignado_nome}
                  </div>
                  <div>
                    <span className="text-blue-700">Disponível:</span> {selectedConsignado.quantidade_disponivel} unidades
                  </div>
                  <div>
                    <span className="text-blue-700">Preço base:</span> R$ {Number(selectedConsignado.base_price || 0).toFixed(2)}
                  </div>
                  <div>
                    <span className="text-blue-700">Comissão:</span> {Number(selectedConsignado.comissao || 0)}%
                  </div>
                </div>
              </div>

              {/* Dados da venda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coluna esquerda - Dados do produto */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 mb-3">Dados da Venda</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade Vendida *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedConsignado.quantidade_disponivel}
                      value={formData.quantidadeVendida}
                      onChange={(e) => setFormData({...formData, quantidadeVendida: parseInt(e.target.value) || 1})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.quantidadeVendida ? 'border-red-300' : 'border-gray-300'
                      }`}
                      title="Quantidade a ser vendida"
                      placeholder="Quantidade"
                    />
                    {errors.quantidadeVendida && (
                      <p className="text-red-500 text-xs mt-1">{errors.quantidadeVendida}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço de Venda (unidade) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precoVenda}
                      onChange={(e) => setFormData({...formData, precoVenda: parseFloat(e.target.value) || 0})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.precoVenda ? 'border-red-300' : 'border-gray-300'
                      }`}
                      title="Preço unitário de venda"
                      placeholder="0.00"
                    />
                    {errors.precoVenda && (
                      <p className="text-red-500 text-xs mt-1">{errors.precoVenda}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Desconto
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.desconto}
                      onChange={(e) => setFormData({...formData, desconto: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Valor do desconto"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Resumo financeiro */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>R$ {(formData.precoVenda * formData.quantidadeVendida).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Desconto:</span>
                        <span>- R$ {formData.desconto.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-base border-t pt-2">
                        <span>Total:</span>
                        <span>R$ {valorTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-blue-600">
                        <span>Comissão ({Number(selectedConsignado.comissao || 0)}%):</span>
                        <span>R$ {comissaoValue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna direita - Dados do cliente */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 mb-3">Dados do Cliente</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.customerName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nome completo do cliente"
                    />
                    {errors.customerName && (
                      <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Método de Pagamento *
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.paymentMethod ? 'border-red-300' : 'border-gray-300'
                      }`}
                      title="Selecione o método de pagamento"
                    >
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="pix">PIX</option>
                      <option value="transferencia">Transferência</option>
                      <option value="cheque">Cheque</option>
                    </select>
                    {errors.paymentMethod && (
                      <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observações
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Observações sobre a venda..."
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Registrar Venda
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormularioVendaConsignado;
