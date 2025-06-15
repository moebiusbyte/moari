import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, ArrowLeft, ArrowRight, Eye, BarChart3, // ← CORRIGIDO: era "Barchart3" (minúsculo)
FileBarChart } from "lucide-react";
import CadastroProdutos from "./CadastroProdutos";
import EditProductModal from './EditProductModal';
import DeleteProductModal from './DeleteProductModal';
import ViewProductModal from './ViewProductModal';
import api from "../../../server/api/axiosConfig";
import IntegratedBarcodeGenerator from './IntegratedBarcodeGenerator';
// import BarcodeGenerator from './BarCodeGenerator'; // ← REMOVIDO: não usado
// import AdvancedBarcodeSearch from "./AdvancedBarcodeSearch"; // ← REMOVIDO: implementado inline
// import BarcodeStatisticsComponent from "./BarcodeStatisticsComponent"; // ← REMOVIDO: não usado
const ProductsPage = () => {
    // Estados para modais
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
    const [selectedProductForBarcode, setSelectedProductForBarcode] = useState(null);
    // Estados para dados e paginação
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    // Estado para fornecedores (para o filtro)
    const [suppliers, setSuppliers] = useState([]);
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
        ordem: "desc"
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
            console.log('\n🚀 === FRONTEND DEBUG ===');
            console.log('🔗 URL completa:', fullUrl);
            console.log('🔍 Search term:', searchTerm);
            console.log('📋 Todos os parâmetros:', Object.fromEntries(params));
            console.log('========================\n');
            const response = await api.get(fullUrl);
            console.log('\n📦 === RESPONSE DEBUG ===');
            console.log('📊 Status:', response.status);
            console.log('📋 Data structure:', Object.keys(response.data));
            if (response.data.products) {
                console.log('🎯 Products found:', response.data.products.length);
                console.log('📝 First product:', response.data.products[0]);
            }
            console.log('=========================\n');
            if (response.data && response.data.products) {
                setProducts(response.data.products);
                setTotalPages(Math.ceil(response.data.total / 10));
                if (response.data.statistics) {
                    setEstatisticas(response.data.statistics);
                }
            }
            else {
                console.error("Resposta da API em formato inesperado:", response.data);
                setProducts([]);
                setTotalPages(0);
            }
        }
        catch (error) {
            console.error("❌ Erro ao buscar produtos:", error);
            if (error?.response) {
                console.log('📊 Error status:', error.response.status);
                console.log('📋 Error data:', error.response.data);
            }
            setProducts([]);
            setTotalPages(0);
        }
        finally {
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
            }
            else {
                console.error("API response for suppliers is not an array:", response.data);
                setSuppliers([]);
            }
        }
        catch (error) {
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
    const getMonthsInStock = (createdAt) => {
        const createdDate = new Date(createdAt);
        return Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    };
    // Buscar fornecedores ao carregar a página
    useEffect(() => {
        fetchSuppliers();
    }, []);
    // Handler para visualização
    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setViewModalOpen(true);
    };
    // Handler para edição de produto
    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setEditModalOpen(true);
    };
    // Handler para geração de código de barras
    const handleGenerateBarcode = (product) => {
        setSelectedProductForBarcode(product);
        setBarcodeModalOpen(true);
    };
    const handleBarcodeGenerated = (barcode) => {
        console.log('Código de barras gerado:', barcode);
        // Opcional: recarregar a lista de produtos se necessário
        // fetchProducts();
    };
    const handleUpdateProduct = async (updatedProduct, newImages = []) => {
        try {
            const formData = new FormData();
            if (!selectedProduct?.id) {
                throw new Error('ID do produto não encontrado');
            }
            console.log('🔍 Updated product data received:', updatedProduct);
            console.log('🏢 Supplier ID from form:', updatedProduct.supplier_id);
            Object.entries(updatedProduct).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (key === 'materials' || key === 'images') {
                        formData.append(key, JSON.stringify(value));
                    }
                    else {
                        formData.append(key, value.toString());
                    }
                }
            });
            newImages.forEach((image) => {
                formData.append('images', image);
            });
            const response = await api.put(`/products/${selectedProduct.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setProducts(prevProducts => prevProducts.map(p => p.id.toString() === selectedProduct.id.toString() ? response.data : p));
            setEditModalOpen(false);
            setSelectedProduct(null);
        }
        catch (error) {
            console.error('❌ Erro ao atualizar produto:', error);
            throw error;
        }
    };
    // Handler para exclusão de produto
    const handleDeleteProduct = (productId) => {
        const product = products.find(p => p.id.toString() === productId.toString());
        if (product) {
            setSelectedProduct(product);
            setDeleteModalOpen(true);
        }
    };
    // Handler para confirmação de exclusão
    const handleConfirmDelete = async (productId) => {
        try {
            await api.delete(`/products/${productId}`);
            setProducts(prevProducts => prevProducts.filter(p => p.id.toString() !== productId.toString()));
            setDeleteModalOpen(false);
            setSelectedProduct(null);
        }
        catch (error) {
            console.error('Erro ao excluir produto:', error);
        }
    };
    const handleSaveProduto = async (produto, imagens) => {
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
                    }
                    else {
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
        }
        catch (error) {
            console.error("❌ Erro ao salvar produto:", error);
            throw error;
        }
    };
    // ← COMPONENTE DE BUSCA POR CÓDIGO DE BARRAS (CORRIGIDO)
    const BarcodeSearchComponent = () => {
        const [searchBarcode, setSearchBarcode] = useState('');
        const handleSearchByBarcode = async (barcodeText) => {
            try {
                const response = await api.get(`/search-by-barcode/${barcodeText}`);
                if (response.data.found) {
                    const product = response.data.product;
                    // Destacar o produto encontrado na lista
                    setProducts(prevProducts => {
                        const updatedProducts = prevProducts.map(p => p.id === product.id ? { ...p, highlightedByBarcode: true } : { ...p, highlightedByBarcode: false });
                        return updatedProducts;
                    });
                    // Scroll para o produto
                    setTimeout(() => {
                        const element = document.getElementById(`product-row-${product.id}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 100);
                    alert(`Produto encontrado: ${product.name}`);
                }
                else {
                    alert('Produto não encontrado para este código de barras');
                }
            }
            catch (error) {
                console.error('Erro ao buscar por código de barras:', error);
                alert('Erro ao buscar produto por código de barras');
            }
        };
        return (_jsxs("div", { className: "mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg", children: [_jsxs("h3", { className: "font-medium text-blue-800 mb-2 flex items-center gap-2", children: [_jsx(FileBarChart, { size: 16 }), "Buscar por C\u00F3digo de Barras"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Digite ou escaneie o c\u00F3digo de barras...", value: searchBarcode, onChange: (e) => setSearchBarcode(e.target.value), className: "flex-1 p-2 border rounded-lg", onKeyPress: (e) => {
                                if (e.key === 'Enter' && searchBarcode.trim()) {
                                    handleSearchByBarcode(searchBarcode.trim());
                                    setSearchBarcode('');
                                }
                            } }), _jsx("button", { onClick: () => {
                                if (searchBarcode.trim()) {
                                    handleSearchByBarcode(searchBarcode.trim());
                                    setSearchBarcode('');
                                }
                            }, disabled: !searchBarcode.trim(), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors", children: "Buscar" })] })] }));
    };
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-800", children: "Produtos" }), _jsxs("button", { onClick: () => setIsModalOpen(true), className: "flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: [_jsx(Plus, { size: 20, className: "mr-2" }), "Novo Produto"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Total de Produtos" }), _jsx("p", { className: "text-2xl font-semibold", children: estatisticas.totalProdutos })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Valor em Estoque" }), _jsxs("p", { className: "text-2xl font-semibold", children: ["R$ ", estatisticas.valorTotalEstoque.toLocaleString()] })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Produtos Ativos" }), _jsx("p", { className: "text-2xl font-semibold", children: estatisticas.produtosAtivos })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-600", children: "Produtos Consignados" }), _jsx("p", { className: "text-2xl font-semibold", children: estatisticas.produtosInativos })] })] }), _jsx(BarcodeSearchComponent, {})] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-5", children: [_jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", placeholder: "Buscar por nome, c\u00F3digo ou material...", className: "w-full pl-10 pr-4 py-2 border rounded-lg", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }), _jsx(Search, { className: "absolute left-3 top-2.5 text-gray-400", size: 20 })] }), _jsxs("select", { value: filtroAvancado.categoria, onChange: (e) => setFiltroAvancado((prev) => ({
                            ...prev,
                            categoria: e.target.value,
                        })), className: "border rounded-lg px-6 py-2", children: [_jsx("option", { value: "", children: "Categoria" }), _jsx("option", { value: "colares", children: "Colares" }), _jsx("option", { value: "brincos", children: "Brincos" }), _jsx("option", { value: "aneis", children: "An\u00E9is" }), _jsx("option", { value: "pulseiras", children: "Pulseiras" })] }), _jsxs("select", { value: filtroAvancado.tempoEstoque, onChange: (e) => setFiltroAvancado((prev) => ({
                            ...prev,
                            tempoEstoque: e.target.value,
                        })), className: "border rounded-lg px-6 py-2", children: [_jsx("option", { value: "", children: "Tempo em Estoque" }), _jsx("option", { value: "0-1", children: "Menos de 1 m\u00EAs" }), _jsx("option", { value: "1-3", children: "1-3 meses" }), _jsx("option", { value: "3-6", children: "3-6 meses" }), _jsx("option", { value: "6+", children: "Mais de 6 meses" })] }), _jsxs("select", { value: filtroAvancado.fornecedor, onChange: (e) => setFiltroAvancado(prev => ({ ...prev, fornecedor: e.target.value })), className: "border rounded-lg px-6 py-2", children: [_jsx("option", { value: "", children: "Fornecedor" }), suppliers.map(supplier => (_jsx("option", { value: supplier.id, children: supplier.nome || 'Fornecedor Desconhecido' }, supplier.id)))] }), _jsxs("select", { value: filtroAvancado.status, onChange: (e) => {
                            const newStatus = e.target.value;
                            setFiltroAvancado(prev => ({ ...prev, status: newStatus }));
                        }, className: "border rounded-lg px-6 py-2", children: [_jsx("option", { value: "", children: "Status" }), _jsx("option", { value: "active", children: "Ativo" }), _jsx("option", { value: "consigned", children: "Consignado" })] })] }), _jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "C\u00F3digo" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Produto" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Categoria" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Materiais" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Pre\u00E7o Base" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Margem" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Pre\u00E7o Final" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Estoque" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 10, className: "px-6 py-4 text-center", children: "Carregando..." }) })) : products.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 10, className: "px-6 py-4 text-center", children: searchTerm ?
                                            `Nenhum produto encontrado para "${searchTerm}"` :
                                            "Nenhum produto encontrado" }) })) : (products.map((product) => (_jsxs("tr", { id: `product-row-${product.id}`, className: `hover:bg-gray-50 transition-colors ${product.found_by_material ? 'bg-blue-50 border-l-4 border-blue-400' : ''} ${product.highlightedByBarcode ? 'bg-green-50 border-l-4 border-green-400 animate-pulse' : ''}`, children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: _jsxs("div", { className: "flex items-center gap-2", children: [product.code, product.found_by_material && (_jsx("span", { className: "px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium", children: "Material" }))] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: product.name }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: product.category }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-500", children: _jsxs("div", { className: "flex flex-wrap gap-1 max-w-48", children: [product.materials && product.materials.length > 0 ? (product.materials.slice(0, 3).map((material, index) => (_jsx("span", { className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${searchTerm && material.toLowerCase().includes(searchTerm.toLowerCase())
                                                            ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300'
                                                            : 'bg-gray-100 text-gray-800'}`, children: material }, index)))) : (_jsx("span", { className: "text-gray-400 text-xs", children: "Sem materiais" })), product.materials && product.materials.length > 3 && (_jsxs("span", { className: "text-xs text-gray-500", children: ["+", product.materials.length - 3, " mais"] }))] }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-green-900", children: ["R$ ", Number(product.base_price).toFixed(2)] }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-green-600", children: ["% ", Number(product.profit_margin).toFixed(2)] }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-green-600", children: ["R$ ", (Number(product.base_price) * ((Number(product.profit_margin) / 100) + 1)).toFixed(2)] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm", children: _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: `font-medium ${Number(product.quantity) <= 0
                                                            ? "text-red-600"
                                                            : Number(product.quantity) <= 5
                                                                ? "text-yellow-600"
                                                                : "text-green-600"}`, children: product.quantity || 0 }), Number(product.quantity) <= 0 && (_jsx("span", { className: "text-xs text-red-500 font-medium", children: "SEM ESTOQUE" })), Number(product.quantity) > 0 && Number(product.quantity) <= 5 && (_jsx("span", { className: "text-xs text-yellow-500 font-medium", children: "ESTOQUE BAIXO" }))] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${product.status === "active"
                                                            ? "bg-green-100 text-green-800"
                                                            : product.status === "consigned"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-yellow-100 text-yellow-800"}`, children: product.status === "active"
                                                            ? "Ativo"
                                                            : product.status === "consigned"
                                                                ? "Consignado"
                                                                : "Inativo" }), getMonthsInStock(product.created_at) > 6 && (_jsx("span", { className: "px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full", children: "+6 Meses em Estoque" }))] }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: [_jsx("button", { className: "text-gray-600 hover:text-gray-900 mr-3", onClick: () => handleViewProduct(product), title: "Visualizar Produto", children: _jsx(Eye, { size: 18 }) }), _jsx("button", { className: "text-green-600 hover:text-green-900 mr-3", onClick: () => handleGenerateBarcode(product), title: "Gerar C\u00F3digo de Barras", children: _jsx(BarChart3, { size: 18 }) }), _jsx("button", { className: "text-blue-600 hover:text-blue-900 mr-3", onClick: () => handleEditProduct(product), title: "Editar Produto", children: _jsx(Edit, { size: 18 }) }), _jsx("button", { className: "text-red-600 hover:text-red-900", onClick: () => handleDeleteProduct(product.id.toString()), title: "Excluir Produto", children: _jsx(Trash2, { size: 18 }) })] })] }, product.id)))) })] }) }) }), _jsxs("div", { className: "flex items-center justify-between px-6 py-3 bg-white border-t", children: [_jsx("div", { className: "flex items-center", children: _jsxs("span", { className: "text-sm text-gray-700", children: ["Mostrando", ' ', _jsx("span", { className: "font-medium", children: (page - 1) * 10 + 1 }), " at\u00E9", ' ', _jsx("span", { className: "font-medium", children: Math.min(page * 10, products.length) }), ' ', "de ", _jsx("span", { className: "font-medium", children: products.length }), " resultados"] }) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1, className: "px-3 py-1 border rounded-md disabled:opacity-50", children: _jsx(ArrowLeft, { size: 16 }) }), _jsxs("span", { className: "text-sm text-gray-700", children: ["P\u00E1gina ", page, " de ", totalPages] }), _jsx("button", { onClick: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages, className: "px-3 py-1 border rounded-md disabled:opacity-50", children: _jsx(ArrowRight, { size: 16 }) })] })] }), isModalOpen && (_jsx(CadastroProdutos, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), onSave: handleSaveProduto })), selectedProduct && viewModalOpen && (_jsx(ViewProductModal, { isOpen: viewModalOpen, onClose: () => {
                    setViewModalOpen(false);
                    setSelectedProduct(null);
                }, product: selectedProduct })), selectedProduct && editModalOpen && (_jsx(EditProductModal, { isOpen: editModalOpen, onClose: () => {
                    setEditModalOpen(false);
                    setSelectedProduct(null);
                }, onSave: (formData, newImages) => handleUpdateProduct(formData, newImages), product: selectedProduct, suppliers: suppliers })), selectedProduct && deleteModalOpen && (_jsx(DeleteProductModal, { isOpen: deleteModalOpen, onClose: () => {
                    setDeleteModalOpen(false);
                    setSelectedProduct(null);
                }, onConfirm: handleConfirmDelete, productId: selectedProduct.id.toString(), productName: selectedProduct.name })), selectedProductForBarcode && barcodeModalOpen && (_jsx(IntegratedBarcodeGenerator, { productId: selectedProductForBarcode.id.toString(), productCode: selectedProductForBarcode.code, productName: selectedProductForBarcode.name, productPrice: Number(selectedProductForBarcode.base_price) * ((Number(selectedProductForBarcode.profit_margin) / 100) + 1), onClose: () => {
                    setBarcodeModalOpen(false);
                    setSelectedProductForBarcode(null);
                }, onBarcodeGenerated: handleBarcodeGenerated }))] }));
};
export default ProductsPage;
