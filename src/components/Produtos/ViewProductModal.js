import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Calendar, Package, DollarSign, Info, Tag, MapPin, Shield, Camera, ExternalLink } from 'lucide-react';
const ViewProductModal = ({ isOpen, onClose, product }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    if (!isOpen || !product)
        return null;
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
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    const formatDate = (dateString) => {
        if (!dateString)
            return 'Não informado';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };
    const getStockStatus = (quantity) => {
        if (quantity <= 0)
            return { text: 'SEM ESTOQUE', color: 'text-red-600 bg-red-100' };
        if (quantity <= 5)
            return { text: 'ESTOQUE BAIXO', color: 'text-yellow-600 bg-yellow-100' };
        return { text: 'ESTOQUE OK', color: 'text-green-600 bg-green-100' };
    };
    const finalPrice = Number(product.base_price) * ((Number(product.profit_margin) / 100) + 1);
    const stockStatus = getStockStatus(Number(product.quantity));
    // Remover duplicatas das imagens (caso existam)
    const uniqueImages = [...new Set(images)];
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg w-full max-w-6xl m-4 max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b bg-gray-50", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800", children: product.name }), _jsxs("p", { className: "text-gray-600", children: ["C\u00F3digo: ", product.code] })] }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-200 rounded-full transition-colors", children: _jsx(X, { size: 24 }) })] }), _jsx("div", { className: "p-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-800 flex items-center gap-2", children: [_jsx(Package, { size: 20 }), "Imagens do Produto (", uniqueImages.length, ")"] }), uniqueImages.length > 0 ? (_jsxs("div", { className: "grid grid-cols-1 gap-3", children: [uniqueImages.map((imageUrl, index) => (_jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(Camera, { size: 24, className: "text-blue-600" }) }), _jsxs("div", { children: [_jsxs("p", { className: "font-medium text-gray-800", children: ["Imagem ", index + 1] }), _jsx("p", { className: "text-sm text-gray-500", children: "Clique para visualizar" })] })] }), _jsxs("button", { onClick: () => window.open(imageUrl, '_blank'), className: "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm", children: [_jsx(ExternalLink, { size: 16 }), "Abrir"] })] }) }, `${imageUrl}-${index}`))), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3", children: _jsxs("div", { className: "flex items-center gap-2 text-blue-800", children: [_jsx(Camera, { size: 16 }), _jsx("span", { className: "text-sm font-medium", children: "As imagens abrem em uma nova aba para melhor visualiza\u00E7\u00E3o" })] }) })] })) : (_jsxs("div", { className: "bg-gray-100 rounded-lg p-8 text-center", children: [_jsx(Package, { size: 48, className: "mx-auto text-gray-400 mb-4" }), _jsx("p", { className: "text-gray-500", children: "Nenhuma imagem dispon\u00EDvel" })] }))] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2", children: [_jsx(Info, { size: 20 }), "Informa\u00E7\u00F5es B\u00E1sicas"] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-600", children: "Categoria:" }), _jsx("p", { className: "text-gray-800 capitalize", children: product.category || 'Não informado' })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-600", children: "Tamanho:" }), _jsx("p", { className: "text-gray-800", children: product.size || 'Não informado' })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-600", children: "Fornecedor:" }), _jsxs("p", { className: "text-gray-800 flex items-center gap-1", children: [_jsx(MapPin, { size: 14 }), product.supplier_name ||
                                                                        (product.supplier_id ? `Fornecedor ${product.supplier_id}` : 'Não informado')] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-600", children: "Garantia:" }), _jsxs("p", { className: "text-gray-800 flex items-center gap-1", children: [_jsx(Shield, { size: 14 }), product.warranty === 'true' ? 'Sim' : 'Não'] })] })] })] }), _jsxs("div", { className: "bg-green-50 rounded-lg p-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2", children: [_jsx(DollarSign, { size: 20 }), "Precifica\u00E7\u00E3o"] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Pre\u00E7o Base" }), _jsx("p", { className: "text-xl font-bold text-green-600", children: formatCurrency(Number(product.base_price)) })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Margem" }), _jsxs("p", { className: "text-xl font-bold text-blue-600", children: [Number(product.profit_margin).toFixed(1), "%"] })] }), _jsxs("div", { className: "col-span-2 text-center border-t pt-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Pre\u00E7o Final" }), _jsx("p", { className: "text-2xl font-bold text-green-700", children: formatCurrency(finalPrice) })] })] })] }), _jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2", children: [_jsx(Package, { size: 20 }), "Controle de Estoque"] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Quantidade" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: product.quantity || 0 })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Status" }), _jsx("span", { className: `inline-block px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`, children: stockStatus.text })] }), _jsxs("div", { className: "col-span-2", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Data de Compra" }), _jsxs("p", { className: "text-gray-800 flex items-center gap-1", children: [_jsx(Calendar, { size: 14 }), formatDate(product.buy_date)] })] })] })] }), Array.isArray(product.materials) && product.materials.filter(mat => mat).length > 0 && (_jsxs("div", { className: "bg-purple-50 rounded-lg p-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2", children: [_jsx(Tag, { size: 20 }), "Materiais"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: product.materials.filter(mat => mat).map((material, index) => (_jsxs("span", { className: "inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm", children: [_jsx(Tag, { size: 12 }), material] }, index))) })] })), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Status do Produto" }), _jsx("span", { className: `inline-block px-4 py-2 rounded-full text-sm font-medium ${product.status === "active"
                                                    ? "bg-green-100 text-green-800"
                                                    : product.status === "consigned"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-yellow-100 text-yellow-800"}`, children: product.status === "active"
                                                    ? "Ativo"
                                                    : product.status === "consigned"
                                                        ? "Consignado"
                                                        : "Inativo" })] }), product.description && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Descri\u00E7\u00E3o" }), _jsx("p", { className: "text-gray-700 leading-relaxed", children: product.description })] }))] })] }) }), _jsx("div", { className: "border-t p-4 bg-gray-50 text-center", children: _jsx("button", { onClick: onClose, className: "px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors", children: "Fechar" }) })] }) }));
};
export default ViewProductModal;
