import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { BarChart3, FileBarChart, TrendingUp, Package, Database } from 'lucide-react';
const BarcodeStatisticsComponent = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const fetchBarcodeStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/barcode-stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data.statistics);
            }
        }
        catch (error) {
            console.error('Erro ao carregar estatísticas de códigos de barras:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchBarcodeStats();
    }, []);
    if (loading || !stats) {
        return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4", children: [1, 2, 3, 4].map(i => (_jsxs("div", { className: "bg-white p-4 rounded-lg shadow animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded mb-2" }), _jsx("div", { className: "h-8 bg-gray-200 rounded" })] }, i))) }));
    }
    return (_jsxs("div", { className: "mb-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2", children: [_jsx(BarChart3, { size: 20 }), "Estat\u00EDsticas de C\u00F3digos de Barras"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white p-4 rounded-lg shadow border-l-4 border-blue-500", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-semibold text-gray-600", children: "Produtos com C\u00F3digo" }), _jsx("p", { className: "text-2xl font-semibold text-blue-600", children: stats.products_with_barcodes || 0 })] }), _jsx(Package, { className: "text-blue-500", size: 24 })] }) }), _jsx("div", { className: "bg-white p-4 rounded-lg shadow border-l-4 border-green-500", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-semibold text-gray-600", children: "Total de C\u00F3digos" }), _jsx("p", { className: "text-2xl font-semibold text-green-600", children: stats.total_barcodes || 0 })] }), _jsx(FileBarChart, { className: "text-green-500", size: 24 })] }) }), _jsx("div", { className: "bg-white p-4 rounded-lg shadow border-l-4 border-purple-500", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-semibold text-gray-600", children: "Com Imagens" }), _jsx("p", { className: "text-2xl font-semibold text-purple-600", children: stats.barcodes_with_images || 0 })] }), _jsx(Database, { className: "text-purple-500", size: 24 })] }) }), _jsx("div", { className: "bg-white p-4 rounded-lg shadow border-l-4 border-orange-500", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-semibold text-gray-600", children: "Tamanho M\u00E9dio" }), _jsxs("p", { className: "text-2xl font-semibold text-orange-600", children: [Math.round(stats.avg_barcode_length || 0), " chars"] })] }), _jsx(TrendingUp, { className: "text-orange-500", size: 24 })] }) })] }), _jsxs("div", { className: "mt-4 grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-gray-50 p-3 rounded-lg", children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Produtos com c\u00F3digos de barras" }), _jsxs("span", { children: [stats.products_with_barcodes, " produtos"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: {
                                        width: `${Math.min(100, (stats.products_with_barcodes / Math.max(stats.total_barcodes, 1)) * 100)}%`
                                    } }) })] }), _jsxs("div", { className: "bg-gray-50 p-3 rounded-lg", children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "C\u00F3digos com imagens salvas" }), _jsxs("span", { children: [stats.barcodes_with_images, " de ", stats.total_barcodes] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-600 h-2 rounded-full transition-all duration-300", style: {
                                        width: `${Math.min(100, (stats.barcodes_with_images / Math.max(stats.total_barcodes, 1)) * 100)}%`
                                    } }) })] })] })] }));
};
export default BarcodeStatisticsComponent;
