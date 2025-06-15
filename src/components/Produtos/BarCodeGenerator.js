import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useState } from 'react';
import { Download, BarChart3, Copy, Check, Settings, Eye, EyeOff, AlertTriangle } from 'lucide-react';
const ProfessionalBarcodeGenerator = ({ productCode, productName, productPrice, onClose }) => {
    const canvasRef = useRef(null);
    const [barcodeText, setBarcodeText] = useState('');
    const [copied, setCopied] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [config, setConfig] = useState({
        includeCode: true,
        includeName: true,
        includePrice: true,
        maxNameLength: 12,
        useOriginalPrice: false,
        customPrefix: '',
        customSuffix: ''
    });
    // Função para limpar texto
    const cleanText = (text, maxLength) => {
        const cleaned = text
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^A-Z0-9]/g, ''); // Remove espaços e caracteres especiais
        return maxLength ? cleaned.substring(0, maxLength) : cleaned;
    };
    // Gerar texto do código de barras baseado na configuração
    useEffect(() => {
        let parts = [];
        // Adicionar prefixo personalizado
        if (config.customPrefix) {
            parts.push(cleanText(config.customPrefix));
        }
        // Adicionar código do produto
        if (config.includeCode) {
            const cleanCode = productCode.replace(/^0+/, '') || '0';
            parts.push(cleanCode);
        }
        // Adicionar nome do produto
        if (config.includeName) {
            const cleanName = cleanText(productName, config.maxNameLength);
            if (cleanName) {
                parts.push(cleanName);
            }
        }
        // Adicionar preço
        if (config.includePrice) {
            const price = config.useOriginalPrice
                ? Math.round(productPrice * 100) // Preço em centavos
                : Math.round(productPrice); // Preço em reais
            parts.push(price.toString());
        }
        // Adicionar sufixo personalizado
        if (config.customSuffix) {
            parts.push(cleanText(config.customSuffix));
        }
        const generatedBarcode = parts.join('');
        setBarcodeText(generatedBarcode);
    }, [productCode, productName, productPrice, config]);
    // Função para gerar código de barras avançado
    const generateProfessionalBarcode = (text, canvas) => {
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        // Configurações responsivas
        const barHeight = 100;
        const fontSize = 14;
        const textHeight = 40;
        const padding = 20;
        const barWidth = Math.max(1, Math.min(3, 400 / text.length)); // Largura adaptável
        // Calcular dimensões
        const barsPerChar = 11;
        const totalBars = (text.length * barsPerChar) + 35;
        const totalWidth = Math.max(300, (totalBars * barWidth) + (padding * 2));
        const totalHeight = barHeight + textHeight + (padding * 2);
        canvas.width = totalWidth;
        canvas.height = totalHeight;
        // Fundo branco
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, totalWidth, totalHeight);
        // Desenhar grade de fundo (opcional para debugging)
        if (showConfig) {
            ctx.strokeStyle = '#f0f0f0';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < totalWidth; i += 10) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, totalHeight);
                ctx.stroke();
            }
        }
        // Desenhar barras
        ctx.fillStyle = 'black';
        let x = padding;
        // Padrão de início mais realista
        const startBars = [2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1];
        startBars.forEach(width => {
            ctx.fillRect(x, padding, barWidth * width, barHeight);
            x += barWidth * width * 2; // Espaçamento entre barras
        });
        // Barras para cada caractere usando padrão mais sofisticado
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            const pattern = generateCharPattern(charCode);
            pattern.forEach((width, index) => {
                if (index % 2 === 0) { // Barras pretas nos índices pares
                    ctx.fillRect(x, padding, barWidth * width, barHeight);
                }
                x += barWidth * width;
            });
        }
        // Padrão de fim
        const endBars = [1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1];
        endBars.forEach(width => {
            ctx.fillRect(x, padding, barWidth * width, barHeight);
            x += barWidth * width * 2;
        });
        // Texto principal
        ctx.fillStyle = 'black';
        ctx.font = `${fontSize}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(text, totalWidth / 2, padding + barHeight + fontSize + 5);
        // Informações adicionais
        ctx.font = `${Math.max(10, fontSize - 4)}px Arial`;
        const infoText = `${productCode} • ${productName} • R$ ${productPrice.toFixed(2)}`;
        ctx.fillText(infoText, totalWidth / 2, padding + barHeight + fontSize + 20);
    };
    // Gerar padrão de barras para um caractere
    const generateCharPattern = (charCode) => {
        // Padrão baseado no código ASCII do caractere
        const base = charCode % 16;
        const patterns = [
            [2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1],
            [1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
            [1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1],
            [2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1],
            [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
            [1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2],
            [2, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1],
            [1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 1],
            [1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 2],
            [2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1],
            [1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1],
            [1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2],
            [2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1],
            [1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
            [1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2],
            [2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1]
        ];
        return patterns[base] || patterns[0];
    };
    // Gerar código de barras quando necessário
    useEffect(() => {
        if (barcodeText && canvasRef.current && showPreview) {
            generateProfessionalBarcode(barcodeText, canvasRef.current);
        }
    }, [barcodeText, showPreview, showConfig]);
    // Função para download
    const handleDownload = () => {
        if (!canvasRef.current)
            return;
        const timestamp = new Date().toISOString().slice(0, 10);
        const cleanProductName = productName.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `barcode_${productCode}_${cleanProductName}_${timestamp}.png`;
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvasRef.current.toDataURL('image/png', 1.0);
        link.click();
    };
    // Copiar código
    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(barcodeText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch (err) {
            console.error('Erro ao copiar:', err);
        }
    };
    // Validações
    const isValid = barcodeText.length >= 3 && barcodeText.length <= 50;
    const warnings = [];
    if (barcodeText.length > 30)
        warnings.push('Código muito longo pode ser difícil de ler');
    if (barcodeText.length < 5)
        warnings.push('Código muito curto pode causar conflitos');
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(BarChart3, { className: "text-blue-600", size: 24 }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-800", children: "Gerador de C\u00F3digo de Barras" }), _jsx("p", { className: "text-sm text-gray-600", children: "Personalize e gere c\u00F3digos de barras profissionais" })] })] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors", children: "\u00D7" })] }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "C\u00F3digo do Produto" }), _jsx("div", { className: "text-lg font-mono bg-white p-2 rounded border", children: productCode })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Nome do Produto" }), _jsx("div", { className: "text-lg bg-white p-2 rounded border truncate", children: productName })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Pre\u00E7o" }), _jsxs("div", { className: "text-lg font-semibold text-green-600 bg-white p-2 rounded border", children: ["R$ ", productPrice.toFixed(2)] })] })] }), _jsxs("div", { className: "border rounded-lg", children: [_jsxs("button", { onClick: () => setShowConfig(!showConfig), className: "w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Settings, { size: 20 }), _jsx("span", { className: "font-medium", children: "Configura\u00E7\u00F5es Avan\u00E7adas" })] }), _jsx("span", { className: `transform transition-transform ${showConfig ? 'rotate-180' : ''}`, children: "\u25BC" })] }), showConfig && (_jsxs("div", { className: "p-4 border-t bg-gray-50 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: config.includeCode, onChange: (e) => setConfig(prev => ({ ...prev, includeCode: e.target.checked })), className: "rounded" }), _jsx("span", { className: "text-sm", children: "Incluir c\u00F3digo do produto" })] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: config.includeName, onChange: (e) => setConfig(prev => ({ ...prev, includeName: e.target.checked })), className: "rounded" }), _jsx("span", { className: "text-sm", children: "Incluir nome do produto" })] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: config.includePrice, onChange: (e) => setConfig(prev => ({ ...prev, includePrice: e.target.checked })), className: "rounded" }), _jsx("span", { className: "text-sm", children: "Incluir pre\u00E7o" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: ["Tamanho m\u00E1ximo do nome (", config.maxNameLength, " caracteres)"] }), _jsx("input", { type: "range", min: "5", max: "20", value: config.maxNameLength, onChange: (e) => setConfig(prev => ({ ...prev, maxNameLength: parseInt(e.target.value) })), className: "w-full" })] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: config.useOriginalPrice, onChange: (e) => setConfig(prev => ({ ...prev, useOriginalPrice: e.target.checked })), className: "rounded" }), _jsx("span", { className: "text-sm", children: "Usar pre\u00E7o em centavos (mais preciso)" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Prefixo personalizado" }), _jsx("input", { type: "text", value: config.customPrefix, onChange: (e) => setConfig(prev => ({ ...prev, customPrefix: e.target.value })), placeholder: "Ex: LOJ, PROD...", className: "w-full p-2 border rounded", maxLength: 10 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Sufixo personalizado" }), _jsx("input", { type: "text", value: config.customSuffix, onChange: (e) => setConfig(prev => ({ ...prev, customSuffix: e.target.value })), placeholder: "Ex: BRA, 2025...", className: "w-full p-2 border rounded", maxLength: 10 })] })] })] }))] }), _jsxs("div", { children: [_jsxs("h3", { className: "font-medium mb-3 flex items-center gap-2", children: ["C\u00F3digo de Barras Gerado", !isValid && _jsx(AlertTriangle, { size: 16, className: "text-red-500" })] }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-gray-50 rounded-lg", children: [_jsx("code", { className: `text-lg font-mono flex-1 select-all p-2 bg-white rounded border ${isValid ? 'border-green-200' : 'border-red-200'}`, children: barcodeText || 'Configure os campos acima' }), _jsxs("button", { onClick: handleCopyCode, disabled: !barcodeText, className: "flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg transition-colors", children: [copied ? _jsx(Check, { size: 16, className: "text-green-600" }) : _jsx(Copy, { size: 16 }), copied ? 'Copiado!' : 'Copiar'] })] }), warnings.length > 0 && (_jsx("div", { className: "mt-2 space-y-1", children: warnings.map((warning, index) => (_jsxs("div", { className: "flex items-center gap-2 text-sm text-yellow-600", children: [_jsx(AlertTriangle, { size: 14 }), warning] }, index))) }))] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-medium", children: "Visualiza\u00E7\u00E3o" }), _jsxs("button", { onClick: () => setShowPreview(!showPreview), className: "flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800", children: [showPreview ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }), showPreview ? 'Ocultar' : 'Mostrar'] })] }), showPreview && barcodeText && (_jsx("div", { className: "flex justify-center p-6 bg-white border-2 border-gray-200 rounded-lg", children: _jsx("canvas", { ref: canvasRef, className: "max-w-full h-auto border border-gray-100 rounded shadow-sm" }) }))] }), _jsxs("div", { className: "flex justify-between items-center pt-4 border-t", children: [_jsxs("div", { className: "text-sm text-gray-500", children: ["Comprimento: ", barcodeText.length, " caracteres", isValid ? (_jsx("span", { className: "text-green-600 ml-2", children: "\u2713 V\u00E1lido" })) : (_jsx("span", { className: "text-red-600 ml-2", children: "\u2717 Inv\u00E1lido" }))] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors", children: "Fechar" }), _jsxs("button", { onClick: handleDownload, disabled: !isValid || !barcodeText, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors", children: [_jsx(Download, { size: 16 }), "Baixar PNG"] })] })] })] })] }) }));
};
export default ProfessionalBarcodeGenerator;
