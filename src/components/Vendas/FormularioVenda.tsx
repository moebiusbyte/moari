import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, User, CreditCard, Package, Calculator } from 'lucide-react';
import api from "../../../server/api/axiosConfig";

// Tipos
interface Product {
  id: string;
  code: string;
  name: string;
  base_price: number;
  profit_margin: number;
  final_price?: number;
  category: string;
  status: string;
  quantity: number; 
}

interface SaleItem {
  product_id: string;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  max_quantity?: number; 
}

interface FormularioVendaProps {
  onClose: () => void;
  onSave: (venda: any) => Promise<void>;
}

const FormularioVenda: React.FC<FormularioVendaProps> = ({ onClose, onSave }) => {
  // Estados do formulário
  const [formData, setFormData] = useState({
    cliente: '',
    email: '',
    telefone: '',
    metodoPagamento: '',
    desconto: 0,
    observacoes: '',
    status: 'completed'
  });

  // Estados para produtos
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  // Buscar produtos
  const fetchProducts = async (search = '') => {
    try {
      // ✅ USAR ENDPOINT ESPECÍFICO PARA VENDAS
      const params = new URLSearchParams({
        search,
        limit: '50'
      });

      console.log('🔍 Buscando produtos para venda (apenas com estoque)');

      const response = await api.get(`/products-for-sale?${params}`);
      
      if (response.data && response.data.products) {
        interface ApiProduct {
          final_price?: number;
          base_price: number;
          profit_margin: number;
        }

        const availableProducts: Product[] = response.data.products.map((product: ApiProduct) => ({
          ...product,
          final_price: product.final_price || Number(product.base_price) * ((Number(product.profit_margin) / 100) + 1)
        }));
        
        console.log(`✅ ${availableProducts.length} produtos com estoque disponíveis`);
        setProducts(availableProducts);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      
      // ✅ FALLBACK: Se endpoint específico não existir
      try {
        console.log('🔄 Usando fallback com filtro forSale=true');
        
        const params = new URLSearchParams({
          page: '1',
          limit: '50',
          search,
          fstatus: 'active',
          forSale: 'true' // ✅ PARÂMETRO IMPORTANTE
        });

        const fallbackResponse = await api.get(`/products?${params}`);
        
        if (fallbackResponse.data && fallbackResponse.data.products) {
            interface FallbackProduct {
            name: string;
            quantity: number;
            status: string;
            base_price: number;
            profit_margin: number;
            }

            interface ProductWithFinalPrice extends Product {
            final_price: number;
            }

            const productsWithStock: ProductWithFinalPrice[] = fallbackResponse.data.products
            .filter((product: FallbackProduct) => {
              const hasStock = product.quantity > 0;
              const isActive = product.status === 'active';
              
              if (!hasStock) {
              console.log(`⚠️ Produto ${product.name} excluído: sem estoque`);
              }
              
              return hasStock && isActive;
            })
            .map((product: FallbackProduct) => ({
              ...product,
              final_price: Number(product.base_price) * ((Number(product.profit_margin) / 100) + 1)
            }));
          
          console.log(`✅ ${productsWithStock.length} produtos válidos no fallback`);
          setProducts(productsWithStock);
        }
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
        setProducts([]);
      }
    }
  };


  // Carregar produtos ao montar o componente
  useEffect(() => {
    fetchProducts();
  }, []);

  // Buscar produtos quando o termo de busca mudar
  useEffect(() => {
    if (showProductSearch) {
      fetchProducts(searchTerm);
    }
  }, [searchTerm, showProductSearch]);

  // Handler para mudanças no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Adicionar produto à venda
 const addProduct = (product: Product) => {
    if (!product.quantity || product.quantity <= 0) {
      alert(`O produto "${product.name}" está sem estoque disponível.`);
      return;
    }

    const existingItem = selectedItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      // Verificar se pode incrementar a quantidade
      const newQuantity = existingItem.quantity + 1;
      
      if (newQuantity > product.quantity) {
        alert(`Não é possível adicionar mais unidades. Estoque disponível: ${product.quantity}, Já selecionado: ${existingItem.quantity}`);
        return;
      }
      
      // Incrementar quantidade se o produto já existe
      setSelectedItems(prev =>
        prev.map(item =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: newQuantity,
                total_price: newQuantity * item.unit_price
              }
            : item
        )
      );
    } else {
      // Adicionar novo produto
      const newItem: SaleItem = {
        product_id: product.id,
        product_name: product.name,
        product_code: product.code,
        quantity: 1,
        unit_price: product.final_price || product.base_price,
        total_price: product.final_price || product.base_price,
        max_quantity: product.quantity 
      };
      setSelectedItems(prev => [...prev, newItem]);
    }
    
    setShowProductSearch(false);
    setSearchTerm('');
  };

  // Remover produto da venda
  const removeProduct = (productId: string) => {
    setSelectedItems(prev => prev.filter(item => item.product_id !== productId));
  };

  // Atualizar quantidade do produto
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId);
      return;
    }

    const selectedItem = selectedItems.find(item => item.product_id === productId);
    if (!selectedItem) return;

    // ✅ Buscar estoque atual do produto
    const product = products.find(p => p.id === productId);
    
    if (product && quantity > product.quantity) {
      alert(`Quantidade solicitada (${quantity}) excede o estoque disponível (${product.quantity}).`);
      return;
    }

    setSelectedItems(prev =>
      prev.map(item =>
        item.product_id === productId
          ? {
              ...item,
              quantity,
              total_price: quantity * item.unit_price
            }
          : item
      )
    );
  };

  // Atualizar preço unitário do produto
  const updateUnitPrice = (productId: string, unitPrice: number) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.product_id === productId
          ? {
              ...item,
              unit_price: unitPrice,
              total_price: item.quantity * unitPrice
            }
          : item
      )
    );
  };

  // Calcular totais
  const subtotal = selectedItems.reduce((sum, item) => sum + item.total_price, 0);
  const valorDesconto = Number(formData.desconto) || 0;
  const valorTotal = subtotal - valorDesconto;

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Submeter formulário - CORRIGIDO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 === DEBUG SUBMIT ===');
    console.log('selectedItems:', selectedItems);
    console.log('formData:', formData);
    console.log('valorTotal:', valorTotal);
    console.log('======================');
    
    if (selectedItems.length === 0) {
      alert('Adicione pelo menos um produto à venda');
      return;
    }

    if (!formData.cliente.trim()) {
      alert('O nome do cliente é obrigatório');
      return;
    }

    if (!formData.metodoPagamento) {
      alert('Selecione um método de pagamento');
      return;
    }

    for (const item of selectedItems) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) {
        alert(`Produto ${item.product_name} não encontrado. Recarregue a página.`);
        return;
      }
      
      if (product.quantity < item.quantity) {
        alert(`Estoque insuficiente para ${item.product_name}. Disponível: ${product.quantity}, Solicitado: ${item.quantity}`);
        return;
      }
    }

    setLoading(true);
    
    try {
      // ✅ MAPEAMENTO CORRETO DOS CAMPOS
      const vendaData = {
        customer_name: formData.cliente,  // ✅ Corrigido: cliente -> customer_name
        customer_email: formData.email,   // ✅ Corrigido: email -> customer_email  
        customer_phone: formData.telefone, // ✅ Corrigido: telefone -> customer_phone
        payment_method: formData.metodoPagamento, // ✅ Corrigido: metodoPagamento -> payment_method
        total_amount: valorTotal,         // ✅ Mantido
        discount_amount: valorDesconto,   // ✅ Corrigido: desconto -> discount_amount
        notes: formData.observacoes,      // ✅ Corrigido: observacoes -> notes
        status: formData.status,          // ✅ Mantido
        items: selectedItems.map(item => ({  // ✅ Corrigido: produtos -> items
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          update_stock: true  // ✅ Adicionado para controle de estoque
        }))
      };

      console.log('📦 === DADOS ENVIADOS PARA API ===');
      console.log('vendaData:', JSON.stringify(vendaData, null, 2));
      console.log('==================================');

      // ✅ FORÇA SERIALIZAÇÃO CORRETA
      const serializedData = JSON.parse(JSON.stringify(vendaData));
      console.log('📦 === DADOS SERIALIZADOS ===');
      console.log('serializedData:', serializedData);
      console.log('=============================');

      await onSave(serializedData);
      
      // ✅ FECHAR MODAL AUTOMATICAMENTE APÓS SUCESSO
      onClose();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao salvar venda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
              name="cliente"
              value={formData.cliente}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome completo do cliente"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(11) 99999-9999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pagamento *
            </label>
            <select
              name="metodoPagamento"
              value={formData.metodoPagamento}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              <option value="pix">PIX</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="transferencia">Transferência</option>
            </select>
          </div>
        </div>
      </div>

      {/* Produtos */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Package className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold">Produtos</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowProductSearch(!showProductSearch)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Produto
          </button>
        </div>

        {/* Busca de Produtos */}
        {showProductSearch && (
          <div className="mb-4 p-3 bg-white rounded-md border">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum produto disponível para venda</p>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => addProduct(product)}
                      className={`flex justify-between items-center p-3 rounded-md cursor-pointer transition-colors ${
                        product.quantity <= 5
                          ? 'bg-yellow-50 border border-yellow-200 hover:bg-yellow-100'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{product.name}</p>
                          {product.quantity <= 5 && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              ESTOQUE BAIXO
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Cód: {product.code} | Estoque: {product.quantity} unidades
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(product.final_price || product.base_price)}
                        </p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lista de Produtos Selecionados */}
        {selectedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhum produto adicionado</p>
            <p className="text-sm">Clique em "Adicionar Produto" para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedItems.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-md border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product_name}</h4>
                    <p className="text-sm text-gray-500">Cód: {item.product_code}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProduct(item.product_id)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Quantidade
                      {(() => {
                        const product = products.find(p => p.id === item.product_id);
                        return product ? ` (máx: ${product.quantity})` : '';
                      })()}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={(() => {
                        const product = products.find(p => p.id === item.product_id);
                        return product ? product.quantity : undefined;
                      })()}
                      value={item.quantity}
                      onChange={(e) => {
                        const newQty = parseInt(e.target.value) || 0;
                        const product = products.find(p => p.id === item.product_id);
                        
                        if (product && newQty > product.quantity) {
                          alert(`Máximo disponível: ${product.quantity}`);
                          return;
                        }
                        updateQuantity(item.product_id, newQty);
                      }}
                      className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 ${
                        (() => {
                          const product = products.find(p => p.id === item.product_id);
                          return product && item.quantity > product.quantity 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500';
                        })()
                      }`}
                    />
                    {(() => {
                      const product = products.find(p => p.id === item.product_id);
                      if (product && item.quantity > product.quantity) {
                        return (
                          <p className="text-xs text-red-600 mt-1">
                            Excede estoque disponível ({product.quantity})
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Preço Unitário
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateUnitPrice(item.product_id, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Total
                    </label>
                    <div className="px-2 py-1 bg-gray-100 rounded text-sm font-semibold text-green-600">
                      {formatCurrency(item.total_price)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo Financeiro */}
      {selectedItems.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <Calculator className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold">Resumo Financeiro</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-gray-600">Desconto:</label>
              <div className="flex items-center">
                <span className="mr-2">R$</span>
                <input
                  type="number"
                  name="desconto"
                  value={formData.desconto}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max={subtotal}
                  className="w-24 px-2 py-1 border rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(valorTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Informações Adicionais */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center mb-3">
          <CreditCard className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold">Informações Adicionais</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status da Venda
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="completed">Concluída</option>
              <option value="pending">Pendente</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observações sobre a venda..."
            />
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || selectedItems.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : 'Salvar Venda'}
        </button>
      </div>
    </form>
  );
};

export default FormularioVenda;