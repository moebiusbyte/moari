import React, { useEffect, useState } from "react";
import { Search, Plus, Filter, Edit, Trash2, Download, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import CadastroProdutos from "./CadastroProdutos";
import EditProductModal from './EditProductModal';
import DeleteProductModal from './DeleteProductModal';
import api from "../../server/api/axiosConfig";
import type { Product } from "../types/product";

const ProductsPage = () => {
  // Estados para modais
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para dados e paginação
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para filtros avançados
  const [filtroAvancado, setFiltroAvancado] = useState({
    categoria: "",
    qualidade: "",
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
    produtosProblemasQualidade: 0,
    produtosConsignados: 0
  });

   // Função para buscar produtos
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
        quality: filtroAvancado.qualidade,
        tempoestoque: filtroAvancado.tempoEstoque,
        fstatus: filtroAvancado.status,
        ffornecedor: filtroAvancado.fornecedor,
        ...filtroAvancado
      });
  
      const response = await api.get(`/products?${params}`);
      
      // Verifica se a resposta tem a estrutura esperada
      if (response.data && response.data.products) {
        setProducts(response.data.products);
        setTotalPages(Math.ceil(response.data.total / 10));
        if (response.data.statistics) {
          setEstatisticas(response.data.statistics);
        }
      } else {
        console.error("Resposta da API em formato inesperado:", response.data);
        setProducts([]);  // Define um array vazio em caso de erro
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setProducts([]);  // Define um array vazio em caso de erro
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar produtos quando mudar página, busca ou filtros
  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm, filtroAvancado, ordenacao]);

  const handleQualityReport = async (productId: string) => {
    try {
      const response = await api.get(`/products/${productId}/quality-report`);
      // Implementar lógica de exibição do relatório
    } catch (error) {
      console.error('Erro ao buscar relatório de qualidade:', error);
    }
  };

  const getMonthsInStock = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    return Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  };

  // Handler para edição de produto
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleNewProduct = () => {
    setIsModalOpen(true);
  };

  // Handler para atualização de produto
  const handleUpdateProduct = async (updatedProduct: Partial<Product>, newImages: File[] = []) => {
    try {
      const formData = new FormData();
  
      // Garantir que temos o ID do produto
      if (!selectedProduct?.id) {
        throw new Error('ID do produto não encontrado');
      }
  
      // Adicionar campos do produto
      Object.entries(updatedProduct).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
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
          p.id === selectedProduct.id ? response.data : p
        )
      );
  
      setEditModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  };

  // Handler para exclusão de produto
  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setDeleteModalOpen(true);
    }
  };

  // Handler para confirmação de exclusão
  const handleConfirmDelete = async (productId: string) => {
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  // Handler para salvar novo produto
  const handleSaveProduto = async (produto: any, imagens: File[]) => {
    try {
      const formData = new FormData();

      const apiData = {
        code: produto.codigo,
        name: produto.nome,
        category: produto.categoria,
        format: produto.formato,
        quality: produto.qualidade,
        material_type: produto.tipoMaterial,
        usage_mode: produto.modoUso,
        size: produto.tamanho,
        origin: produto.origem,
        warranty: produto.garantia,
        base_price: produto.precoBase,
        profit_margin: produto.margemLucro,
        description: produto.descricao,
        materials: produto.materiaisComponentes,
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

      await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchProducts();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
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
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} className="mr-2" />
            Novo Produto
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Total de Produtos</h3>
            <p className="text-2xl font-semibold">{estatisticas.totalProdutos}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Valor em Estoque</h3>
            <p className="text-2xl font-semibold">
              R$ {estatisticas.valorTotalEstoque.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Produtos Ativos</h3>
            <p className="text-2xl font-semibold">{estatisticas.produtosAtivos}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Produtos Inativos</h3>
            <p className="text-2xl font-semibold">{estatisticas.produtosInativos}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Alertas</h3>
            <p className="text-2xl font-semibold text-yellow-600">
              {estatisticas.produtosAlerta}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Problemas de Qualidade</h3>
            <p className="text-2xl font-semibold text-red-600">
              {estatisticas.produtosProblemasQualidade}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar produtos..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        <select
          value={filtroAvancado.categoria}
          onChange={(e) =>
            setFiltroAvancado((prev) => ({
              ...prev,
              categoria: e.target.value,
            }))
          }
          className="border rounded-lg px-4 py-2"
        >
          <option value="">Categoria</option>
          <option value="colares">Colares</option>
          <option value="brincos">Brincos</option>
          <option value="aneis">Anéis</option>
          <option value="pulseiras">Pulseiras</option>
        </select>

        <select
          value={filtroAvancado.qualidade}
          onChange={(e) =>
            setFiltroAvancado((prev) => ({
              ...prev,
              qualidade: e.target.value,
            }))
          }
          className="border rounded-lg px-4 py-2"
        >
          <option value="">Qualidade</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>

        <select
          value={filtroAvancado.tempoEstoque}
          onChange={(e) =>
            setFiltroAvancado((prev) => ({
              ...prev,
              tempoEstoque: e.target.value,
            }))
          }
          className="border rounded-lg px-4 py-2"
        >
          <option value="">Tempo em Estoque</option>
          <option value="1-3">1-3 meses</option>
          <option value="3-6">3-6 meses</option>
          <option value="6+">Mais de 6 meses</option>
        </select>

        <select
          value={filtroAvancado.fornecedor}
          onChange={(e) => setFiltroAvancado(prev => ({...prev, fornecedor: e.target.value}))}
          className="border rounded-lg px-4 py-2"
        >
          <option value="">Fornecedor</option>
          {/* Opções dinâmicas de fornecedores */}
        </select>

        <select
          value={filtroAvancado.status}
          onChange={(e) => setFiltroAvancado(prev => ({...prev, status: e.target.value}))}
          className="border rounded-lg px-4 py-2"
        >
          <option value="">Status</option>
          <option value="active">Ativo</option>
          <option value="consigned">Consignado</option>
          <option value="quality_issue">Problema de Qualidade</option>
        </select>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qualidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço Base
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço Final
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center">
                    Carregando...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center">
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.quality}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                      R$ {Number(product.base_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      R$ {Number(product.profit_margin).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      -
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
                        {product.has_quality_issues && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Problema Qualidade
                          </span>
                        )}
                        {getMonthsInStock(product.created_at) > 6 && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            +6 Meses em Estoque
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => handleEditProduct(product)}
                        title="Editar Produto"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 mr-3"
                        onClick={() => handleDeleteProduct(product.id)}
                        title="Excluir Produto"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => handleQualityReport(product.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Relatório de Qualidade"
                      >
                        <AlertTriangle size={18} />
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
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-sm text-gray-700">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Modais */}
      {isModalOpen && (
        <CadastroProdutos
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduto}
        />
      )}

      {/* Modais */}
      {selectedProduct && editModalOpen && (
        <EditProductModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedProduct(null);
          }}
          onSave={(formData, newImages) => handleUpdateProduct(formData, newImages)}
          product={selectedProduct}
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
          productName={selectedProduct.name}
        />
      )}
    </div>
  );
};

export default ProductsPage;