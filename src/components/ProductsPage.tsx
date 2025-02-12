import React, { useEffect, useState } from "react";
import { Search, Plus, Filter, Edit, Trash2, Download } from "lucide-react";
import CadastroProdutos from "./CadastroProdutos";
import EditProductModal from './EditProductModal';
import DeleteProductModal from './DeleteProductModal';
import api from "../../server/api/axiosConfig";
import type { Product } from "../types/product";

const ProductsPage = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filtroAvancado, setFiltroAvancado] = useState({
    categoria: "",
    qualidade: "",
    origem: "",
  });

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    // Encontra o produto completo usando o ID
    const product = products.find(p => p.id === productId);
    
    if (product) {
      setSelectedProduct(product);
      setDeleteModalOpen(true);
    }
  };

  const handleNewProduct = () => {
    setIsModalOpen(true);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: searchTerm,
        category: filtroAvancado.categoria,
        quality: filtroAvancado.qualidade,
      });

      const response = await api.get(`/products?${params}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm, filtroAvancado]);

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
          if (key === "materials") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      imagens.forEach((imagem) => {
        formData.append(`images`, imagem);
      });

      const response = await api.post("/products", formData, {
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Produtos</h1>
        <button
          onClick={handleNewProduct}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} className="mr-2" />
          Novo Produto
        </button>
      </div>

      {/* Filtros Avançados */}
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
          value={filtroAvancado.origem}
          onChange={(e) =>
            setFiltroAvancado((prev) => ({ ...prev, origem: e.target.value }))
          }
          className="border rounded-lg px-4 py-2"
        >
          <option value="">Origem</option>
          <option value="nacional">Nacional</option>
          <option value="importado">Importado</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Compra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Venda</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
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
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {product.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => handleEditProduct(product.id)}>
                        <Edit size={18} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteProduct(product.id)}>{/*Certifique-se de usar product.id*/}
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

      {/* Modais */}
      {isModalOpen && (
        <CadastroProdutos
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduto}
        />
      )}

      {selectedProduct && deleteModalOpen && (
        <DeleteProductModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedProduct(null);
          }}
          onConfirm={async (productId) => {
            try {
              // Use o ID diretamente do selectedProduct para garantir
              const response = await api.delete(`/products/${selectedProduct.id}`);
              
              if (response.status >= 200 && response.status < 300) {
                setProducts(prevProducts => prevProducts.filter(p => p.id !== selectedProduct.id));
                setDeleteModalOpen(false);
                setSelectedProduct(null);
              } else {
                throw new Error('Falha ao excluir produto');
              }
            } catch (error: any) {
              console.error('Detalhes do erro:', {
                id: selectedProduct.id,
                status: error?.response?.status,
                data: error?.response?.data,
                message: error?.message
              });
              throw error;
            }
          }}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
        />
      )}
    </div>
  );
};

export default ProductsPage;