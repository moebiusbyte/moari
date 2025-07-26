import React, { useState, useEffect } from 'react';
import { X, Calendar, Package, DollarSign, Info, Tag, MapPin, Shield, Camera, ExternalLink, User, Phone, Mail, Clock } from 'lucide-react';
import type { Product } from '../../types/product';
import api from '../../../server/api/axiosConfig';

interface ViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

interface ConsignacaoInfo {
  hasConsignacao: boolean;
  consignacao?: {
    id: number;
    dataConsignacao: string;
    quantidadeConsignada: number;
    valorCombinado: number;
    observacoes?: string;
    consignado: {
      id: number;
      nome: string;
      contato?: string;
      telefone?: string;
      email?: string;
      cidade?: string;
      estado?: string;
      endereco?: string;
      ultimaEntrega?: string;
    };
    produto: {
      nome: string;
      codigo: string;
    };
  };
}

const ViewProductModal: React.FC<ViewProductModalProps> = ({ isOpen, onClose, product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [consignacaoInfo, setConsignacaoInfo] = useState<ConsignacaoInfo | null>(null);
  const [loadingConsignacao, setLoadingConsignacao] = useState(false);

  // Buscar informações de consignação quando o modal abrir e o produto estiver consignado
  useEffect(() => {
    const fetchConsignacaoInfo = async () => {
      if (!isOpen || !product || product.status !== 'consigned') {
        setConsignacaoInfo(null);
        return;
      }

      setLoadingConsignacao(true);
      try {
        console.log(`🔍 Buscando informações de consignação para produto ID: ${product.id}`);
        const response = await api.get(`/products/${product.id}/consignacao-info`);
        
        console.log('📦 Resposta da API de consignação:', response.data);
        setConsignacaoInfo(response.data);
      } catch (error) {
        console.error('❌ Erro ao buscar informações de consignação:', error);
        setConsignacaoInfo({ hasConsignacao: false });
      } finally {
        setLoadingConsignacao(false);
      }
    };

    fetchConsignacaoInfo();
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // Filtrar apenas URLs válidas
  const rawImages = Array.isArray(product.images) ? product.images : [];
  const images = rawImages.filter(img => img && typeof img === 'string' && img.trim() !== '');

  // DEBUG MELHORADO - Vamos ver exatamente o que está vindo
  console.log('🔍 DEBUG ViewProductModal DETALHADO:');
  console.log('Product ID/Code:', product.code);
  console.log('Supplier ID:', product.supplier_id);
  console.log('Supplier Name:', product.supplier_name);
  console.log('Full product object:', product);
  console.log('Raw images array:', rawImages);
  console.log('Raw images length:', rawImages.length);
  
  // Vamos verificar se há duplicatas
  const imageSet = new Set(rawImages);
  console.log('Images únicas (Set):', Array.from(imageSet));
  console.log('Há duplicatas?', rawImages.length !== imageSet.size);
  
  // Vamos ver cada imagem individualmente
  rawImages.forEach((img, index) => {
    console.log(`Imagem ${index}:`, img);
    console.log(`Tipo da imagem ${index}:`, typeof img);
    console.log(`Length da imagem ${index}:`, img?.length);
  });
  
  console.log('Final filtered images:', images);
  console.log('Final images length:', images.length);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return { text: 'SEM ESTOQUE', color: 'text-red-600 bg-red-100' };
    if (quantity <= 5) return { text: 'ESTOQUE BAIXO', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'ESTOQUE OK', color: 'text-green-600 bg-green-100' };
  };

  const finalPrice = Number(product.base_price) * ((Number(product.profit_margin) / 100) + 1);
  const stockStatus = getStockStatus(Number(product.quantity));

  // Remover duplicatas das imagens (caso existam)
  const uniqueImages = [...new Set(images)];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-6xl m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
            <p className="text-gray-600">Código: {product.code}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            title="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Seção de Imagens com Preview Visual */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Package size={20} />
                Imagens do Produto ({uniqueImages.length})
              </h3>
              
              {uniqueImages.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {uniqueImages.map((imageUrl, index) => (
                    <div 
                      key={`${imageUrl}-${index}`}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Camera size={24} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Imagem {index + 1}</p>
                            <p className="text-sm text-gray-500">Clique para visualizar</p>
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(imageUrl, '_blank')}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                        >
                          <ExternalLink size={16} />
                          Abrir
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Informação adicional */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Camera size={16} />
                      <span className="text-sm font-medium">
                        As imagens abrem em uma nova aba para melhor visualização
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhuma imagem disponível</p>
                </div>
              )}
            </div>

            {/* Seção de Informações */}
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Info size={20} />
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Categoria:</span>
                    <p className="text-gray-800 capitalize">{product.category || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Tamanho:</span>
                    <p className="text-gray-800">{product.size || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Fornecedor:</span>
                    <p className="text-gray-800 flex items-center gap-1">
                      <MapPin size={14} />
                      {product.supplier_name || 
                       (product.supplier_id ? `Fornecedor ${product.supplier_id}` : 'Não informado')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Garantia:</span>
                    <p className="text-gray-800 flex items-center gap-1">
                      <Shield size={14} />
                      {product.warranty === 'true' ? 'Sim' : 'Não'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações Financeiras */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <DollarSign size={20} />
                  Precificação
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Preço Base</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(Number(product.base_price))}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Margem</p>
                    <p className="text-xl font-bold text-blue-600">{Number(product.profit_margin).toFixed(1)}%</p>
                  </div>
                  <div className="col-span-2 text-center border-t pt-3">
                    <p className="text-sm font-medium text-gray-600">Preço Final</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(finalPrice)}</p>
                  </div>
                </div>
              </div>

              {/* Estoque */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Package size={20} />
                  Controle de Estoque
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Quantidade</p>
                    <p className="text-2xl font-bold text-blue-600">{product.quantity || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-600">Data de Compra</p>
                    <p className="text-gray-800 flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(product.buy_date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Materiais */}
              {Array.isArray(product.materials) && product.materials.filter(mat => mat).length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Tag size={20} />
                    Materiais
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.materials.filter(mat => mat).map((material, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        <Tag size={12} />
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Status do Produto</h3>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  product.status === "active"
                    ? "bg-green-100 text-green-800"
                    : product.status === "consigned"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {product.status === "active" 
                    ? "Ativo" 
                    : product.status === "consigned"
                    ? "Consignado"
                    : "Inativo"}
                </span>
              </div>

              {/* Informações de Consignação */}
              {product.status === "consigned" && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Informações de Consignação
                  </h3>
                  
                  {loadingConsignacao ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <p className="text-blue-600 mt-2">Carregando informações...</p>
                    </div>
                  ) : consignacaoInfo?.hasConsignacao ? (
                    <div className="space-y-4">
                      {/* Informações do Consignado */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                          <User size={16} />
                          Consignado para:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Nome:</span>
                            <p className="text-gray-800 font-medium">{consignacaoInfo.consignacao?.consignado.nome}</p>
                          </div>
                          {consignacaoInfo.consignacao?.consignado.telefone && (
                            <div>
                              <span className="font-medium text-gray-600">Telefone:</span>
                              <p className="text-gray-800 flex items-center gap-1">
                                <Phone size={14} />
                                {consignacaoInfo.consignacao.consignado.telefone}
                              </p>
                            </div>
                          )}
                          {consignacaoInfo.consignacao?.consignado.email && (
                            <div>
                              <span className="font-medium text-gray-600">Email:</span>
                              <p className="text-gray-800 flex items-center gap-1">
                                <Mail size={14} />
                                {consignacaoInfo.consignacao.consignado.email}
                              </p>
                            </div>
                          )}
                          {(consignacaoInfo.consignacao?.consignado.cidade || consignacaoInfo.consignacao?.consignado.estado) && (
                            <div>
                              <span className="font-medium text-gray-600">Localização:</span>
                              <p className="text-gray-800 flex items-center gap-1">
                                <MapPin size={14} />
                                {consignacaoInfo.consignacao?.consignado.cidade}
                                {consignacaoInfo.consignacao?.consignado.cidade && consignacaoInfo.consignacao?.consignado.estado && ', '}
                                {consignacaoInfo.consignacao?.consignado.estado}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Detalhes da Consignação */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                          <Package size={16} />
                          Detalhes da Consignação:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Data da Consignação:</span>
                            <p className="text-gray-800 flex items-center gap-1">
                              <Clock size={14} />
                              {formatDate(consignacaoInfo.consignacao?.dataConsignacao)}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Quantidade:</span>
                            <p className="text-gray-800">{consignacaoInfo.consignacao?.quantidadeConsignada}</p>
                          </div>
                          {consignacaoInfo.consignacao?.valorCombinado && consignacaoInfo.consignacao.valorCombinado > 0 && (
                            <div>
                              <span className="font-medium text-gray-600">Valor Combinado:</span>
                              <p className="text-gray-800 flex items-center gap-1">
                                <DollarSign size={14} />
                                {formatCurrency(Number(consignacaoInfo.consignacao.valorCombinado))}
                              </p>
                            </div>
                          )}
                          {consignacaoInfo.consignacao?.observacoes && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-600">Observações:</span>
                              <p className="text-gray-800">{consignacaoInfo.consignacao.observacoes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-yellow-600 bg-yellow-100 rounded-lg p-3">
                        <p className="font-medium">⚠️ Produto marcado como consignado</p>
                        <p className="text-sm mt-1">Mas não foram encontradas informações de consignação ativa</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Descrição */}
              {product.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Descrição</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;