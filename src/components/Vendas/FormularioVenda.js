import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, User, CreditCard, Package, Calculator } from 'lucide-react';
import api from "../../../server/api/axiosConfig";
const FormularioVenda = ({ onClose, onSave }) => {
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
    const [products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
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
                const availableProducts = response.data.products.map(product => ({
                    ...product,
                    final_price: product.final_price || Number(product.base_price) * ((Number(product.profit_margin) / 100) + 1)
                }));
                console.log(`✅ ${availableProducts.length} produtos com estoque disponíveis`);
                setProducts(availableProducts);
            }
        }
        catch (error) {
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
                    const productsWithStock = fallbackResponse.data.products
                        .filter(product => {
                        const hasStock = product.quantity > 0;
                        const isActive = product.status === 'active';
                        if (!hasStock) {
                            console.log(`⚠️ Produto ${product.name} excluído: sem estoque`);
                        }
                        return hasStock && isActive;
                    })
                        .map(product => ({
                        ...product,
                        final_price: Number(product.base_price) * ((Number(product.profit_margin) / 100) + 1)
                    }));
                    console.log(`✅ ${productsWithStock.length} produtos válidos no fallback`);
                    setProducts(productsWithStock);
                }
            }
            catch (fallbackError) {
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
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Adicionar produto à venda
    const addProduct = (product) => {
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
            setSelectedItems(prev => prev.map(item => item.product_id === product.id
                ? {
                    ...item,
                    quantity: newQuantity,
                    total_price: newQuantity * item.unit_price
                }
                : item));
        }
        else {
            // Adicionar novo produto
            const newItem = {
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
    const removeProduct = (productId) => {
        setSelectedItems(prev => prev.filter(item => item.product_id !== productId));
    };
    // Atualizar quantidade do produto
    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeProduct(productId);
            return;
        }
        const selectedItem = selectedItems.find(item => item.product_id === productId);
        if (!selectedItem)
            return;
        // ✅ Buscar estoque atual do produto
        const product = products.find(p => p.id === productId);
        if (product && quantity > product.quantity) {
            alert(`Quantidade solicitada (${quantity}) excede o estoque disponível (${product.quantity}).`);
            return;
        }
        setSelectedItems(prev => prev.map(item => item.product_id === productId
            ? {
                ...item,
                quantity,
                total_price: quantity * item.unit_price
            }
            : item));
    };
    // Atualizar preço unitário do produto
    const updateUnitPrice = (productId, unitPrice) => {
        setSelectedItems(prev => prev.map(item => item.product_id === productId
            ? {
                ...item,
                unit_price: unitPrice,
                total_price: item.quantity * unitPrice
            }
            : item));
    };
    // Calcular totais
    const subtotal = selectedItems.reduce((sum, item) => sum + item.total_price, 0);
    const valorDesconto = Number(formData.desconto) || 0;
    const valorTotal = subtotal - valorDesconto;
    // Formatar moeda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    // Submeter formulário - CORRIGIDO
    const handleSubmit = async (e) => {
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
                customer_name: formData.cliente, // ✅ Corrigido: cliente -> customer_name
                customer_email: formData.email, // ✅ Corrigido: email -> customer_email  
                customer_phone: formData.telefone, // ✅ Corrigido: telefone -> customer_phone
                payment_method: formData.metodoPagamento, // ✅ Corrigido: metodoPagamento -> payment_method
                total_amount: valorTotal, // ✅ Mantido
                discount_amount: valorDesconto, // ✅ Corrigido: desconto -> discount_amount
                notes: formData.observacoes, // ✅ Corrigido: observacoes -> notes
                status: formData.status, // ✅ Mantido
                items: selectedItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total_price: item.total_price,
                    update_stock: true // ✅ Adicionado para controle de estoque
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
        }
        catch (error) {
            console.error('Erro ao salvar venda:', error);
            alert('Erro ao salvar venda. Tente novamente.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(User, { className: "w-5 h-5 text-gray-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Informa\u00E7\u00F5es do Cliente" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nome do Cliente *" }), _jsx("input", { type: "text", name: "cliente", value: formData.cliente, onChange: handleInputChange, required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Nome completo do cliente" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", name: "email", value: formData.email, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "email@exemplo.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Telefone" }), _jsx("input", { type: "tel", name: "telefone", value: formData.telefone, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "(11) 99999-9999" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "M\u00E9todo de Pagamento *" }), _jsxs("select", { name: "metodoPagamento", value: formData.metodoPagamento, onChange: handleInputChange, required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "Selecione..." }), _jsx("option", { value: "pix", children: "PIX" }), _jsx("option", { value: "cartao_credito", children: "Cart\u00E3o de Cr\u00E9dito" }), _jsx("option", { value: "cartao_debito", children: "Cart\u00E3o de D\u00E9bito" }), _jsx("option", { value: "dinheiro", children: "Dinheiro" }), _jsx("option", { value: "transferencia", children: "Transfer\u00EAncia" })] })] })] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Package, { className: "w-5 h-5 text-gray-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Produtos" })] }), _jsxs("button", { type: "button", onClick: () => setShowProductSearch(!showProductSearch), className: "flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700", children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), "Adicionar Produto"] })] }), showProductSearch && (_jsxs("div", { className: "mb-4 p-3 bg-white rounded-md border", children: [_jsxs("div", { className: "relative mb-3", children: [_jsx("input", { type: "text", placeholder: "Buscar produtos...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx(Search, { className: "absolute left-3 top-2.5 text-gray-400", size: 20 })] }), _jsx("div", { className: "max-h-60 overflow-y-auto", children: products.length === 0 ? (_jsx("p", { className: "text-gray-500 text-center py-4", children: "Nenhum produto dispon\u00EDvel para venda" })) : (_jsx("div", { className: "space-y-2", children: products.map((product) => (_jsxs("div", { onClick: () => addProduct(product), className: `flex justify-between items-center p-3 rounded-md cursor-pointer transition-colors ${product.quantity <= 5
                                            ? 'bg-yellow-50 border border-yellow-200 hover:bg-yellow-100'
                                            : 'bg-gray-50 hover:bg-gray-100'}`, children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-medium", children: product.name }), product.quantity <= 5 && (_jsx("span", { className: "px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full", children: "ESTOQUE BAIXO" }))] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["C\u00F3d: ", product.code, " | Estoque: ", product.quantity, " unidades"] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold text-green-600", children: formatCurrency(product.final_price || product.base_price) }), _jsx("p", { className: "text-sm text-gray-500", children: product.category })] })] }, product.id))) })) })] })), selectedItems.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(Package, { className: "w-12 h-12 mx-auto mb-2 text-gray-300" }), _jsx("p", { children: "Nenhum produto adicionado" }), _jsx("p", { className: "text-sm", children: "Clique em \"Adicionar Produto\" para come\u00E7ar" })] })) : (_jsx("div", { className: "space-y-3", children: selectedItems.map((item, index) => (_jsxs("div", { className: "bg-white p-4 rounded-md border", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium", children: item.product_name }), _jsxs("p", { className: "text-sm text-gray-500", children: ["C\u00F3d: ", item.product_code] })] }), _jsx("button", { type: "button", onClick: () => removeProduct(item.product_id), className: "text-red-600 hover:text-red-800 ml-2", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3 mt-3", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: ["Quantidade", (() => {
                                                            const product = products.find(p => p.id === item.product_id);
                                                            return product ? ` (máx: ${product.quantity})` : '';
                                                        })()] }), _jsx("input", { type: "number", min: "1", max: (() => {
                                                        const product = products.find(p => p.id === item.product_id);
                                                        return product ? product.quantity : undefined;
                                                    })(), value: item.quantity, onChange: (e) => {
                                                        const newQty = parseInt(e.target.value) || 0;
                                                        const product = products.find(p => p.id === item.product_id);
                                                        if (product && newQty > product.quantity) {
                                                            alert(`Máximo disponível: ${product.quantity}`);
                                                            return;
                                                        }
                                                        updateQuantity(item.product_id, newQty);
                                                    }, className: `w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 ${(() => {
                                                        const product = products.find(p => p.id === item.product_id);
                                                        return product && item.quantity > product.quantity
                                                            ? 'border-red-500 focus:ring-red-500'
                                                            : 'border-gray-300 focus:ring-blue-500';
                                                    })()}` }), (() => {
                                                    const product = products.find(p => p.id === item.product_id);
                                                    if (product && item.quantity > product.quantity) {
                                                        return (_jsxs("p", { className: "text-xs text-red-600 mt-1", children: ["Excede estoque dispon\u00EDvel (", product.quantity, ")"] }));
                                                    }
                                                    return null;
                                                })()] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Pre\u00E7o Unit\u00E1rio" }), _jsx("input", { type: "number", step: "0.01", min: "0", value: item.unit_price, onChange: (e) => updateUnitPrice(item.product_id, parseFloat(e.target.value) || 0), className: "w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Total" }), _jsx("div", { className: "px-2 py-1 bg-gray-100 rounded text-sm font-semibold text-green-600", children: formatCurrency(item.total_price) })] })] })] }, index))) }))] }), selectedItems.length > 0 && (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(Calculator, { className: "w-5 h-5 text-gray-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Resumo Financeiro" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Subtotal:" }), _jsx("span", { className: "font-semibold", children: formatCurrency(subtotal) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("label", { className: "text-gray-600", children: "Desconto:" }), _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "mr-2", children: "R$" }), _jsx("input", { type: "number", name: "desconto", value: formData.desconto, onChange: handleInputChange, step: "0.01", min: "0", max: subtotal, className: "w-24 px-2 py-1 border rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500" })] })] }), _jsxs("div", { className: "flex justify-between text-lg font-bold border-t pt-3", children: [_jsx("span", { children: "Total:" }), _jsx("span", { className: "text-green-600", children: formatCurrency(valorTotal) })] })] })] })), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(CreditCard, { className: "w-5 h-5 text-gray-600 mr-2" }), _jsx("h3", { className: "text-lg font-semibold", children: "Informa\u00E7\u00F5es Adicionais" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status da Venda" }), _jsxs("select", { name: "status", value: formData.status, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "completed", children: "Conclu\u00EDda" }), _jsx("option", { value: "pending", children: "Pendente" }), _jsx("option", { value: "cancelled", children: "Cancelada" })] })] }), _jsxs("div", { className: "md:col-span-1", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Observa\u00E7\u00F5es" }), _jsx("textarea", { name: "observacoes", value: formData.observacoes, onChange: handleInputChange, rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Observa\u00E7\u00F5es sobre a venda..." })] })] })] }), _jsxs("div", { className: "flex justify-end space-x-3 pt-4 border-t", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300", children: "Cancelar" }), _jsx("button", { type: "submit", disabled: loading || selectedItems.length === 0, className: "px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Salvando...' : 'Salvar Venda' })] })] }));
};
export default FormularioVenda;
