import React, { useState } from "react";
import { Search, Plus, Filter, Edit, Trash2, Download } from "lucide-react";
import CadastroProdutos from "./CadastroProdutos";

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroAvancado, setFiltroAvancado] = useState({
    categoria: "",
    qualidade: "",
    fornecedor: "",
    origem: "",
  });

  // Dados de exemplo expandidos
  const produtos = [
    {
      id: 1,
      codigo: "CLR-001",
      nome: "Colar Pérolas Delicado",
      categoria: "Colares",
      preco: 159.9,
      precoBase: 80.0,
      margemLucro: 100,
      estoque: 15,
      fornecedor: "Joias Elegance",
      qualidade: "Alta",
      origem: "Nacional",
      status: "Ativo",
      materiaisComponentes: ["Pérola", "Metal banhado a ouro"],
      formato: "Gota",
      ultimaAtualizacao: "02/02/2025",
    },
    // ... outros produtos
  ];

  const handleSaveProduto = (produto: ProdutoFormData, imagens: File[]) => {
    console.log("Produto salvo:", produto);
    console.log("Imagens:", imagens);
    setIsModalOpen(false);
  };

  const handleNewProduct = () => {
    console.log("Estado atual do modal:", isModalOpen);
    setIsModalOpen(true);
    console.log("Novo estado do modal:", true);
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

      {/* Products Table */}
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
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estoque
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
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
              {produtos.map((produto) => (
                <tr key={produto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {produto.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {produto.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {produto.categoria}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {produto.qualidade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {produto.preco.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {produto.estoque}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {produto.fornecedor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        produto.status === "Ativo"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {produto.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Edit size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <CadastroProdutos
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduto}
        />
      )}
    </div>
  );
};

export default ProductsPage;
