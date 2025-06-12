import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Eye  // ← NOVO ÍCONE
} from "lucide-react";
import CadastroProdutos from "./CadastroProdutos";
import EditProductModal from './EditProductModal';
import DeleteProductModal from './DeleteProductModal';
import ViewProductModal from './ViewProductModal';  // ← NOVO IMPORT
import api from "../../../server/api/axiosConfig";
import type { Product } from "../../types/product";
import type { Supplier } from "../../types/supplier";

const ProductsPage = () => {
  // Estados para modais
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);  // ← NOVO ESTADO
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para dados e paginação
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para fornecedores (para o filtro)
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Estado para filtros avançados
  const [filtroAvancado, setFiltroAvancado] = useState({
    categoria: "",
    origem: "",
    status: "",
    fornecedor: "",
    tempoEstoque: "",
    precoRange: ""
  });

  // Estado para ordenação
  const [ordenacao, setOrdenacao] = useState({
    campo: "created_at",
    ordem: "desc" as "asc" | "desc"
  });

  // Estado para estatísticas
  const [estatisticas, setEstatisticas] = useState({
    totalProdutos: 0,
    valorTotalEstoque: 0,
    produtosAtivos: 0,
    produtosInativos: 0,
    produtosAlerta: 0,
    produtosConsignados: 0
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: searchTerm,
        orderBy: ordenacao.campo,
        orderDirection: ordenacao.ordem,
        category: filtroAvancado.categoria,
        tempoestoque: filtroAvancado.tempoEstoque,
        fstatus: filtroAvancado.status,
        ffornecedor: filtroAvancado.fornecedor
      });

      const fullUrl = `/products?${params}`;
      
      // 🔍 DEBUG: Log da URL e parâmetros
      console.log('\n🚀 === FRONTEND DEBUG ===');
      console.log('🔗 URL completa:', fullUrl);
      console.log('🔍 Search term:', searchTerm);
      console.log('📋 Todos os parâmetros:', Object.fromEntries(params));
      console.log('========================\n');
      
      const response = await api.get(fullUrl);
      
      // 🔍 DEBUG: Log da resposta
      console.log('\n📦 === RESPONSE DEBUG ===');
      console.log('📊 Status:', response.status);
      console.log('📋 Data structure:', Object.keys(response.data));
      if (response.data.products) {
        console.log('🎯 Products found:', response.data.products.length);
        console.log('📝 First product:', response.data.products[0]);
      }
      console.log('=========================\n');
      
      // Verifica se a resposta tem a estrutura esperada
      if (response.data && response.data.products) {
        setProducts(response.data.products);
        setTotalPages(Math.ceil(response.data.total / 10));
        if (response.data.statistics) {
          setEstatisticas(response.data.statistics);
        }
      } else {
        console.error("Resposta da API em formato inesperado:", response.data);
        setProducts([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar produtos:", error);
      
      // 🔍 DEBUG: Log detalhado do erro
      if (error.response) {
        console.log('📊 Error status:', error.response.status);
        console.log('📋 Error data:', error.response.data);
      }
      
      setProducts([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };
      
  // Função para buscar fornecedores para o filtro
  const fetchSuppliers = async () => {
    try {
      const response = await api.get("/suppliers");
      const suppliersData = response.data.suppliers || response.data;
      if (Array.isArray(suppliersData)) {
        setSuppliers(suppliersData);
      } else {
        console.error("API response for suppliers is not an array:", response.data);
        setSuppliers([]);
      }
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
      setSuppliers([]);
    }
  };

  // Atualizar produtos quando mudar página, busca ou filtros
  useEffect(() => {
    console.log('\n🔄 === useEffect TRIGGERED ===');
    console.log('📄 Page:', page);
    console.log('🔍 Search term:', searchTerm);
    console.log('🎛️ Filtros:', filtroAvancado);
    console.log('📊 Ordenação:', ordenacao);
    console.log('==============================\n');
    
    fetchProducts();
  }, [page, searchTerm, filtroAvancado, ordenacao]);

  const getMonthsInStock = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    return Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  };

  // Buscar fornecedores ao carregar a página
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // ← NOVO HANDLER PARA VISUALIZAÇÃO
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewModalOpen(true);
  };

  // Handler para edição de produto
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleNewProduct = () => {
    setIsModalOpen(true);
  };

  const handleUpdateProduct = async (updatedProduct: Partial<Product>, newImages: File[] = []) => {
    try {
      const formData = new FormData();

      // Garantir que temos o ID do produto
      if (!selectedProduct?.id) {
        throw new Error('ID do produto não encontrado');
      }

      console.log('🔍 Updated product data received:', updatedProduct);
      console.log('🏢 Supplier ID from form:', updatedProduct.supplier_id);

      // Adicionar campos do produto - INCLUINDO supplier_id
      Object.entries(updatedProduct).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'materials' || key === 'images') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Adicionar novas imagens
      newImages.forEach((image) => {
        formData.append('images', image);
      });

      const response = await api.put(`/products/${selectedProduct.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Atualizar lista de produtos
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id.toString() === selectedProduct.id.toString() ? response.data : p
        )
      );

      setEditModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      throw error;
    }
  };

  // Handler para exclusão de produto
  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id.toString() === productId.toString());
    if (product) {
      setSelectedProduct(product);
      setDeleteModalOpen(true);
    }
  };

  // Handler para confirmação de exclusão
  const handleConfirmDelete = async (productId: string) => {
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prevProducts => prevProducts.filter(p => p.id.toString() !== productId.toString()));
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  const handleSaveProduto = async (produto: any, imagens: File[]) => {
    try {
      console.log('📦 Dados recebidos do formulário:', produto);
      
      const formData = new FormData();

      const apiData = {
        code: produto.codigo,
        name: produto.nome,
        category: produto.categoria,
        format: produto.formato,
        material_type: produto.tipoMaterial,
        usage_mode: produto.modoUso,
        size: produto.tamanho,
        origin: produto.origem,
        warranty: produto.garantia,
        base_price: produto.precoBase,
        profit_margin: produto.margemLucro,
        description: produto.descricao,
        materials: produto.materiaisComponentes,
        supplier_id: produto.fornecedor,
        buy_date: produto.dataCompra || null,
        quantity: parseInt(produto.quantidade) || 1
      };

      Object.entries(apiData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'materials') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      imagens.forEach((imagem) => {
        formData.append('images', imagem);
      });

      const response = await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log('✅ Produto salvo com sucesso:', response.data);

      await fetchProducts();
      setIsModalOpen(false);
    } catch (error) {
      console.error("❌ Erro ao salvar produto:", error);
      throw error;
    }
  };

  return (
    <div className="p-6">
      {/* Header e Estatísticas */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Produtos</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={20} className="mr-2" />
            Novo Produto
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-600">Total de Produtos</h3>
            <p className="text-2xl font-semibold">{estatisticas.totalProdutos}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-600">Valor em Estoque</h3>
            <p className="text-2xl font-semibold">
              R$ {estatisticas.valorTotalEstoque.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-600">Produtos Ativos</h3>
            <p className="text-2xl font-semibold">{estatisticas.produtosAtivos}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-600">Produtos Consignados</h3>
            <p className="text-2xl font-semibold">{estatisticas.produtosInativos}</p>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nome, código ou material..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20}/>
        </div>

        {/* Resto dos filtros permanecem iguais */}
        <select
          value={filtroAvancado.categoria}
          onChange={(e) =>
            setFiltroAvancado((prev) => ({
              ...prev,
              categoria: e.target.value,
            }))
          }
          className="border rounded-lg px-6 py-2">
          <option value="">Categoria</option>
          <option value="colares">Colares</option>
          <option value="brincos">Brincos</option>
          <option value="aneis">Anéis</option>
          <option value="pulseiras">Pulseiras</option>
        </select>

        <select
          value={filtroAvancado.tempoEstoque}
          onChange={(e) =>
            setFiltroAvancado((prev) => ({
              ...prev,
              tempoEstoque: e.target.value,
            }))
          }
          className="border rounded-lg px-6 py-2">
          <option value="">Tempo em Estoque</option>
          <option value="0-1">Menos de 1 mês</option>
          <option value="1-3">1-3 meses</option>
          <option value="3-6">3-6 meses</option>
          <option value="6+">Mais de 6 meses</option>
        </select>

        <select
          value={filtroAvancado.fornecedor}
          onChange={(e) => setFiltroAvancado(prev => ({...prev, fornecedor: e.target.value}))}
          className="border rounded-lg px-6 py-2">
          <option value="">Fornecedor</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>{supplier.nome || 'Fornecedor Desconhecido'}</option>
          ))}
        </select>

        <select
          value={filtroAvancado.status}
          onChange={(e) => {
            const newStatus = e.target.value;
            setFiltroAvancado(prev => ({...prev, status: newStatus}));
          }}
          className="border rounded-lg px-6 py-2">
          <option value="">Status</option>
          <option value="active">Ativo</option>
          <option value="consigned">Consignado</option>
        </select>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materiais</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Base</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Final</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center">
                    Carregando...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center">
                    {searchTerm ? 
                      `Nenhum produto encontrado para "${searchTerm}"` : 
                      "Nenhum produto encontrado"
                    }
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50 ${
                    product.found_by_material ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {product.code}
                        {product.found_by_material && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                            Material
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.name}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    
                    {/* NOVA COLUNA DE MATERIAIS */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1 max-w-48">
                        {product.materials && product.materials.length > 0 ? (
                          product.materials.slice(0, 3).map((material, index) => (
                            <span
                              key={index}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                searchTerm && material.toLowerCase().includes(searchTerm.toLowerCase())
                                  ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {material}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">Sem materiais</span>
                        )}
                        {product.materials && product.materials.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{product.materials.length - 3} mais
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                      R$ {Number(product.base_price).toFixed(2)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      % {Number(product.profit_margin).toFixed(2)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      R$ {(Number(product.base_price) * ((Number(product.profit_margin) / 100) + 1)).toFixed(2)}
                    </td>
                    
                    {/* COLUNA DE ESTOQUE */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-1">
                        <span className={`font-medium ${
                          Number(product.quantity) <= 0
                            ? "text-red-600"
                            : Number(product.quantity) <= 5
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}>
                          {product.quantity || 0}
                        </span>
                        {Number(product.quantity) <= 0 && (
                          <span className="text-xs text-red-500 font-medium">SEM ESTOQUE</span>
                        )}
                        {Number(product.quantity) > 0 && Number(product.quantity) <= 5 && (
                          <span className="text-xs text-yellow-500 font-medium">ESTOQUE BAIXO</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                        {getMonthsInStock(product.created_at) > 6 && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            +6 Meses em Estoque
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* COLUNA DE AÇÕES */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-gray-600 hover:text-gray-900 mr-3"
                        onClick={() => handleViewProduct(product)}
                        title="Visualizar Produto">
                        <Eye size={18} />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => handleEditProduct(product)}
                        title="Editar Produto">
                        <Edit size={18} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteProduct(product.id)}
                        title="Excluir Produto">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-3 bg-white border-t">
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">{(page - 1) * 10 + 1}</span> até{' '}
            <span className="font-medium">
              {Math.min(page * 10, products.length)}
            </span>{' '}
            de <span className="font-medium">{products.length}</span> resultados
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50">
            <ArrowLeft size={16}/>
          </button>
          <span className="text-sm text-gray-700">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-md disabled:opacity-50">
            <ArrowRight size={16}/>
          </button>
        </div>
      </div>

      {/* MODAIS */}
      {isModalOpen && (
        <CadastroProdutos
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduto}/>
      )}

      {selectedProduct && viewModalOpen && (
        <ViewProductModal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}

      {selectedProduct && editModalOpen && (
        <EditProductModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedProduct(null);
          }}
          onSave={(formData, newImages) => handleUpdateProduct(formData, newImages)}
          product={selectedProduct}
          suppliers={suppliers}
        />
      )}

      {selectedProduct && deleteModalOpen && (
        <DeleteProductModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedProduct(null);
          }}
          onConfirm={handleConfirmDelete}
          productId={selectedProduct.id}
          productName={selectedProduct.name}/>
      )}
    </div>
  );
};

export default ProductsPage;