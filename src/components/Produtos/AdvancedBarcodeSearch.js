import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Search, Camera, FileBarChart, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
const AdvancedBarcodeSearch = ({ onProductFound, onSearch }) => {
    const [searchBarcode, setSearchBarcode] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [recentSearches, setRecentSearches] = useState([]);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    // Carregar buscas recentes do localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recent_barcode_searches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            }
            catch (error) {
                console.error('Erro ao carregar buscas recentes:', error);
            }
        }
    }, []);
    // Salvar busca recente
    const saveRecentSearch = (barcode) => {
        const updated = [barcode, ...recentSearches.filter(s => s !== barcode)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recent_barcode_searches', JSON.stringify(updated));
    };
    // Buscar produto por código de barras
    const handleSearchByBarcode = async (barcodeText) => {
        if (!barcodeText.trim())
            return;
        try {
            setIsSearching(true);
            setSearchResult(null);
            const response = await fetch(`/api/search-by-barcode/${encodeURIComponent(barcodeText.trim())}`);
            const data = await response.json();
            setSearchResult(data);
            if (data.found) {
                saveRecentSearch(barcodeText.trim());
                onProductFound?.(data.product);
                onSearch?.(barcodeText.trim());
            }
        }
        catch (error) {
            console.error('Erro ao buscar por código de barras:', error);
            setSearchResult({
                found: false,
                product: null
            });
        }
        finally {
            setIsSearching(false);
        }
    };
    // Iniciar câmera para leitura de código de barras
    const startCamera = async () => {
        try {
            setCameraError('');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment' // Câmera traseira
                }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setShowCamera(true);
            }
        }
        catch (error) {
            console.error('Erro ao acessar câmera:', error);
            setCameraError('Não foi possível acessar a câmera. Verifique as permissões.');
        }
    };
    // Parar câmera
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setShowCamera(false);
        setCameraError('');
    };
    // Capturar frame da câmera (para implementação futura de OCR)
    const captureFrame = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                // Aqui você poderia integrar uma biblioteca de OCR/leitura de código de barras
                alert('Funcionalidade de leitura automática será implementada em versão futura. Por favor, digite o código manualmente.');
            }
        }
        stopCamera();
    };
    const clearSearch = () => {
        setSearchBarcode('');
        setSearchResult(null);
    };
    return (_jsxs("div", { className: "mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-blue-800 flex items-center gap-2", children: [_jsx(FileBarChart, { size: 20 }), "Busca por C\u00F3digo de Barras"] }), searchResult && (_jsx("button", { onClick: clearSearch, className: "text-gray-500 hover:text-gray-700 transition-colors", children: _jsx(X, { size: 20 }) }))] }), _jsxs("div", { className: "flex gap-3 mb-4", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx("input", { type: "text", placeholder: "Digite ou escaneie o c\u00F3digo de barras...", value: searchBarcode, onChange: (e) => setSearchBarcode(e.target.value), className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all", onKeyPress: (e) => {
                                    if (e.key === 'Enter' && searchBarcode.trim()) {
                                        handleSearchByBarcode(searchBarcode.trim());
                                    }
                                }, disabled: isSearching }), isSearching && (_jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2", children: _jsx(Loader, { className: "animate-spin text-blue-500", size: 20 }) }))] }), _jsxs("button", { onClick: () => handleSearchByBarcode(searchBarcode.trim()), disabled: !searchBarcode.trim() || isSearching, className: "px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2", children: [_jsx(Search, { size: 16 }), isSearching ? 'Buscando...' : 'Buscar'] }), _jsxs("button", { onClick: showCamera ? stopCamera : startCamera, className: "px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2", title: "Usar c\u00E2mera para escanear", children: [_jsx(Camera, { size: 16 }), showCamera ? 'Parar' : 'Câmera'] })] }), showCamera && (_jsxs("div", { className: "mb-4 p-4 bg-white rounded-lg border", children: [_jsxs("div", { className: "flex justify-between items-center mb-3", children: [_jsx("h4", { className: "font-medium", children: "Escaneamento de C\u00F3digo de Barras" }), _jsx("button", { onClick: stopCamera, className: "text-red-500 hover:text-red-700", children: _jsx(X, { size: 20 }) })] }), cameraError ? (_jsxs("div", { className: "text-red-600 text-center p-4", children: [_jsx(AlertCircle, { className: "mx-auto mb-2", size: 24 }), cameraError] })) : (_jsxs("div", { className: "relative", children: [_jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, className: "w-full max-w-md mx-auto rounded-lg" }), _jsx("canvas", { ref: canvasRef, className: "hidden" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: _jsx("div", { className: "border-2 border-red-500 w-64 h-16 rounded-lg opacity-50" }) }), _jsx("button", { onClick: captureFrame, className: "mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors", children: "Capturar e Analisar" })] }))] })), searchResult && (_jsx("div", { className: "mb-4", children: searchResult.found ? (_jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(CheckCircle, { className: "text-green-600 flex-shrink-0 mt-0.5", size: 20 }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-semibold text-green-800 mb-2", children: "Produto Encontrado!" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-600", children: "C\u00F3digo:" }), _jsx("div", { className: "font-mono", children: searchResult.product.code })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-600", children: "Nome:" }), _jsx("div", { children: searchResult.product.name })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-600", children: "Pre\u00E7o:" }), _jsxs("div", { className: "text-green-600 font-semibold", children: ["R$ ", Number(searchResult.product.base_price).toFixed(2)] })] })] }), searchResult.barcode_created_at && (_jsxs("div", { className: "mt-2 text-xs text-gray-500", children: ["C\u00F3digo de barras criado em: ", new Date(searchResult.barcode_created_at).toLocaleDateString('pt-BR')] }))] })] }) })) : (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(AlertCircle, { className: "text-red-600 flex-shrink-0", size: 20 }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-red-800", children: "Produto N\u00E3o Encontrado" }), _jsxs("p", { className: "text-red-600 text-sm", children: ["Nenhum produto foi encontrado com o c\u00F3digo de barras \"", searchBarcode, "\""] })] })] }) })) })), recentSearches.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-600 mb-2", children: "Buscas Recentes:" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [recentSearches.map((search, index) => (_jsx("button", { onClick: () => {
                                    setSearchBarcode(search);
                                    handleSearchByBarcode(search);
                                }, className: "px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors", children: search }, index))), _jsx("button", { onClick: () => {
                                    setRecentSearches([]);
                                    localStorage.removeItem('recent_barcode_searches');
                                }, className: "px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200 transition-colors", children: "Limpar" })] })] })), _jsx("div", { className: "mt-4 p-3 bg-blue-100 rounded-lg", children: _jsxs("p", { className: "text-sm text-blue-800", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Dica:" }), " Voc\u00EA pode usar um leitor de c\u00F3digo de barras conectado ao computador. Simplesmente foque no campo de busca e escaneie o c\u00F3digo."] }) })] }));
};
export default AdvancedBarcodeSearch;
