import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useState } from 'react';
import { Download, BarChart3, Copy, Check, Settings, Eye, EyeOff, AlertTriangle, Save, History, Trash2, Building } from 'lucide-react';
import api from "../../../server/api/axiosConfig";
const IntegratedBarcodeGenerator = ({ productId, productCode, productName, productPrice, supplierName = '', onClose, onBarcodeGenerated }) => {
    const canvasRef = useRef(null);
    const [barcodeText, setBarcodeText] = useState('');
    const [copied, setCopied] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [savedBarcodes, setSavedBarcodes] = useState([]);
    const [setupRequired, setSetupRequired] = useState(false);
    const [error, setError] = useState(null);
    const [config, setConfig] = useState({
        includeCode: true,
        includeName: true,
        includePrice: true,
        maxNameLength: 12,
        useOriginalPrice: false,
        customPrefix: '',
        customSuffix: '',
        supplierCode: generateSupplierCode(supplierName) // Gera código automático
    });
    // Função para gerar código do fornecedor automaticamente
    function generateSupplierCode(name) {
        if (!name || name.trim() === '')
            return '';
        // Remove acentos e caracteres especiais
        const cleaned = name
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9\s]/g, '');
        // Pega as primeiras letras de cada palavra (máximo 4)
        const words = cleaned.split(/\s+/).filter(word => word.length > 0);
        let code = '';
        if (words.length === 1) {
            // Se for uma palavra só, pega as 4 primeiras letras
            code = words[0].substring(0, 4);
        }
        else {
            // Se forem múltiplas palavras, pega a primeira letra de cada uma
            for (const word of words) {
                if (code.length < 4) {
                    code += word.charAt(0);
                }
            }
        }
        // Completa com zeros se necessário
        return code.padEnd(4, '0');
    }
    // Configurar tabela na inicialização
    useEffect(() => {
        setupBarcodeTable();
    }, []);
    // Carregar códigos de barras salvos
    useEffect(() => {
        if (!setupRequired) {
            loadSavedBarcodes();
        }
    }, [productId, setupRequired]);
    // Atualizar código do fornecedor quando supplierName mudar
    useEffect(() => {
        setConfig(prev => ({
            ...prev,
            supplierCode: generateSupplierCode(supplierName)
        }));
    }, [supplierName]);
    // Configurar tabela de códigos de barras
    const setupBarcodeTable = async () => {
        try {
            console.log('🔧 Configurando tabela de códigos de barras...');
            const response = await api.get('/setup-barcode-table');
            console.log('✅ Setup response:', response.data);
            if (response.data.success) {
                setSetupRequired(false);
                console.log('✅ Tabela configurada com sucesso');
            }
        }
        catch (error) {
            console.error('❌ Erro no setup da tabela:', error);
            setSetupRequired(true);
            setError('Erro ao configurar tabela de códigos de barras');
        }
    };
    // Função para limpar texto
    const cleanText = (text, maxLength) => {
        const cleaned = text
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9]/g, '');
        return maxLength ? cleaned.substring(0, maxLength) : cleaned;
    };
    // Gerar texto do código de barras
    useEffect(() => {
        let parts = [];
        // SEMPRE adiciona o código do fornecedor no início (4 caracteres)
        if (config.supplierCode && config.supplierCode.trim()) {
            const supplierCodeClean = cleanText(config.supplierCode, 4).padEnd(4, '0');
            parts.push(supplierCodeClean);
        }
        if (config.customPrefix) {
            parts.push(cleanText(config.customPrefix));
        }
        if (config.includeCode) {
            const cleanCode = productCode.replace(/^0+/, '') || '0';
            parts.push(cleanCode);
        }
        if (config.includeName) {
            const cleanName = cleanText(productName, config.maxNameLength);
            if (cleanName) {
                parts.push(cleanName);
            }
        }
        if (config.includePrice) {
            const price = config.useOriginalPrice
                ? Math.round(productPrice * 100)
                : Math.round(productPrice);
            parts.push(price.toString());
        }
        if (config.customSuffix) {
            parts.push(cleanText(config.customSuffix));
        }
        const generatedBarcode = parts.join('');
        setBarcodeText(generatedBarcode);
    }, [productCode, productName, productPrice, config]);
    // Salvar código de barras no backend
    const handleSaveBarcode = async () => {
        if (!barcodeText || saving)
            return;
        try {
            setSaving(true);
            setError(null);
            console.log('🚀 === SALVANDO CÓDIGO DE BARRAS ===');
            console.log('🆔 Product ID:', productId);
            console.log('📋 Barcode Text:', barcodeText);
            console.log('🏢 Supplier Code:', config.supplierCode);
            console.log('⚙️ Config:', config);
            console.log('===================================');
            // Validar dados antes de enviar
            if (!barcodeText.trim()) {
                throw new Error('Texto do código de barras não pode estar vazio');
            }
            if (!productId || productId.trim() === '') {
                throw new Error('ID do produto é obrigatório');
            }
            // Capturar imagem do canvas
            const imageData = canvasRef.current?.toDataURL('image/png', 1.0);
            const requestData = {
                barcodeText: barcodeText.trim(),
                config,
                imageData
            };
            console.log('📤 Enviando dados:', requestData);
            const response = await api.post(`/products/${productId}/generate-barcode`, requestData);
            console.log('✅ Sucesso! Response:', response.data);
            // Recarregar lista
            await loadSavedBarcodes();
            // Callback para o componente pai
            if (onBarcodeGenerated) {
                onBarcodeGenerated(response.data.barcode);
            }
            // Mostrar mensagem de sucesso
            alert('Código de barras salvo com sucesso!');
        }
        catch (error) {
            console.error('❌ === ERRO AO SALVAR ===');
            console.error('Error:', error);
            console.error('Response:', error?.response?.data);
            console.error('Status:', error?.response?.status);
            console.error('========================');
            let errorMessage = 'Erro ao salvar código de barras';
            if (error?.response?.status === 404) {
                errorMessage = 'Produto não encontrado';
            }
            else if (error?.response?.status === 400) {
                errorMessage = error?.response?.data?.error || 'Dados inválidos';
                if (error?.response?.data?.suggestion) {
                    errorMessage += `. ${error.response.data.suggestion}`;
                }
            }
            else if (error?.response?.data?.error) {
                errorMessage = error.response.data.error;
            }
            else if (error.message) {
                errorMessage = error.message;
            }
            setError(errorMessage);
            alert(errorMessage);
        }
        finally {
            setSaving(false);
        }
    };
    // Carregar códigos de barras salvos
    const loadSavedBarcodes = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('📡 Carregando códigos salvos para produto:', productId);
            const response = await api.get(`/products/${productId}/barcodes`);
            console.log('✅ Códigos carregados:', response.data);
            const barcodes = response.data.barcodes || [];
            setSavedBarcodes(barcodes);
        }
        catch (error) {
            console.error('❌ Erro ao carregar códigos salvos:', error);
            console.error('Response:', error?.response?.data);
            if (error?.response?.status === 400 && error?.response?.data?.suggestion) {
                setSetupRequired(true);
                setError(error.response.data.error);
            }
            else {
                setError('Erro ao carregar códigos salvos');
            }
            setSavedBarcodes([]);
        }
        finally {
            setLoading(false);
        }
    };
    // Deletar código de barras
    const handleDeleteBarcode = async (barcodeId) => {
        if (!confirm('Deseja realmente deletar este código de barras?'))
            return;
        try {
            console.log('🗑️ Deletando código:', barcodeId);
            await api.delete(`/barcodes/${barcodeId}`);
            await loadSavedBarcodes();
            alert('Código de barras deletado com sucesso!');
        }
        catch (error) {
            console.error('❌ Erro ao deletar:', error);
            console.error('Response:', error?.response?.data);
            const errorMessage = error?.response?.data?.error || error.message || 'Erro ao deletar código de barras';
            alert(errorMessage);
        }
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
    // Download da imagem
    const handleDownload = () => {
        if (!canvasRef.current)
            return;
        const timestamp = new Date().toISOString().slice(0, 10);
        const cleanProductName = productName.replace(/[^a-zA-Z0-9]/g, '_');
        const supplierPrefix = config.supplierCode ? `${config.supplierCode}_` : '';
        const filename = `barcode_${supplierPrefix}${productCode}_${cleanProductName}_${timestamp}.png`;
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvasRef.current.toDataURL('image/png', 1.0);
        link.click();
    };
    // Carregar configuração salva
    const loadSavedConfig = (savedBarcode) => {
        if (savedBarcode.config) {
            setConfig(savedBarcode.config);
        }
        setBarcodeText(savedBarcode.barcode_text);
    };
    // Função para gerar código de barras visual
    const generateBarcodeCanvas = (text, canvas) => {
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        // Dimensões otimizadas
        const barHeight = 60;
        const fontSize = 12;
        const descriptionFontSize = 10;
        const textHeight = 35;
        const padding = 15;
        // Largura das barras
        const minBarWidth = 1;
        const maxBarWidth = 2.5;
        const idealWidth = 350;
        const barWidth = Math.max(minBarWidth, Math.min(maxBarWidth, idealWidth / text.length));
        // Cálculo de dimensões
        const barsPerChar = 8;
        const totalBars = text.length * barsPerChar;
        const barsWidth = totalBars * barWidth;
        const totalWidth = Math.max(300, barsWidth + (padding * 2));
        const totalHeight = barHeight + textHeight + (padding * 2);
        // Configurar canvas
        canvas.width = totalWidth;
        canvas.height = totalHeight;
        // Fundo branco
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, totalWidth, totalHeight);
        // Desenhar barras centralizadas
        ctx.fillStyle = 'black';
        const startX = (totalWidth - barsWidth) / 2;
        let x = startX;
        // Padrão de código de barras
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            const pattern = (charCode % 7) + 1;
            for (let j = 0; j < barsPerChar; j++) {
                const shouldDrawBar = (pattern & (1 << (j % 3))) !== 0;
                if (shouldDrawBar) {
                    ctx.fillRect(x, padding, barWidth, barHeight);
                }
                x += barWidth;
            }
        }
        // Textos centralizados
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        const centerX = totalWidth / 2;
        // Código do produto (principal)
        ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
        ctx.fillText(text, centerX, padding + barHeight + fontSize + 8);
        // Descrição do produto (incluindo fornecedor)
        ctx.font = `${descriptionFontSize}px Arial`;
        const supplierInfo = config.supplierCode ? `[${config.supplierCode}] ` : '';
        const description = `${supplierInfo}${productCode} • ${productName} • R$ ${productPrice.toFixed(2)}`;
        // Quebrar texto longo se necessário
        const maxDescriptionWidth = totalWidth - 20;
        ctx.fillStyle = '#666666';
        if (ctx.measureText(description).width > maxDescriptionWidth) {
            // Quebrar em duas linhas se necessário
            const parts = description.split(' • ');
            const line1 = `${parts[0]} • ${parts[1]}`;
            const line2 = parts[2] || '';
            ctx.fillText(line1, centerX, padding + barHeight + fontSize + 20);
            if (line2) {
                ctx.fillText(line2, centerX, padding + barHeight + fontSize + 32);
            }
        }
        else {
            ctx.fillText(description, centerX, padding + barHeight + fontSize + 20);
        }
        // Bordas sutis
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, totalWidth - 1, totalHeight - 1);
    };
    // Atualizar canvas
    useEffect(() => {
        if (barcodeText && canvasRef.current && showPreview) {
            generateBarcodeCanvas(barcodeText, canvasRef.current);
        }
    }, [barcodeText, showPreview, config.supplierCode]);
    const isValid = barcodeText.length >= 3 && barcodeText.length <= 50;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(BarChart3, { className: "text-blue-600", size: 24 }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-800", children: "Gerador de C\u00F3digo de Barras" }), _jsx("p", { className: "text-sm text-gray-600", children: "Gere, salve e gerencie c\u00F3digos de barras com c\u00F3digo do fornecedor" }), setupRequired && (_jsx("p", { className: "text-xs text-red-600 font-medium", children: "\u26A0\uFE0F Configura\u00E7\u00E3o necess\u00E1ria" }))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => setShowHistory(!showHistory), className: "flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors", children: [_jsx(History, { size: 16 }), "Hist\u00F3rico (", savedBarcodes.length, ")"] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors", children: "\u00D7" })] })] }), error && (_jsxs("div", { className: "mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "text-red-600", size: 16 }), _jsx("span", { className: "text-red-700 text-sm", children: error }), setupRequired && (_jsx("button", { onClick: setupBarcodeTable, className: "ml-auto px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700", children: "Configurar Agora" }))] })), _jsxs("div", { className: "flex", children: [_jsxs("div", { className: `${showHistory ? 'w-2/3' : 'w-full'} p-6 space-y-6`, children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Fornecedor" }), _jsxs("div", { className: "text-lg font-mono bg-white p-2 rounded border flex items-center gap-2", children: [_jsx(Building, { size: 16, className: "text-blue-600" }), config.supplierCode || 'N/A'] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "C\u00F3digo" }), _jsx("div", { className: "text-lg font-mono bg-white p-2 rounded border", children: productCode })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Nome" }), _jsx("div", { className: "text-lg bg-white p-2 rounded border truncate", children: productName })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Pre\u00E7o" }), _jsxs("div", { className: "text-lg font-semibold text-green-600 bg-white p-2 rounded border", children: ["R$ ", productPrice.toFixed(2)] })] })] }), _jsxs("div", { className: "border rounded-lg", children: [_jsxs("button", { onClick: () => setShowConfig(!showConfig), className: "w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Settings, { size: 20 }), _jsx("span", { className: "font-medium", children: "Configura\u00E7\u00F5es" })] }), _jsx("span", { className: `transform transition-transform ${showConfig ? 'rotate-180' : ''}`, children: "\u25BC" })] }), showConfig && (_jsxs("div", { className: "p-4 border-t bg-gray-50 space-y-4", children: [_jsxs("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg", children: [_jsxs("label", { className: "block text-sm font-medium text-blue-800 mb-2", children: [_jsx(Building, { size: 16, className: "inline mr-1" }), "C\u00F3digo do Fornecedor (4 caracteres)"] }), _jsx("input", { type: "text", value: config.supplierCode, onChange: (e) => setConfig(prev => ({ ...prev, supplierCode: e.target.value.toUpperCase() })), placeholder: "Ex: COCA, NEST, FORD...", className: "w-full p-2 border rounded font-mono text-center", maxLength: 4 }), supplierName && (_jsxs("p", { className: "text-xs text-blue-600 mt-1", children: ["Sugest\u00E3o baseada em \"", supplierName, "\": ", generateSupplierCode(supplierName), _jsx("button", { onClick: () => setConfig(prev => ({ ...prev, supplierCode: generateSupplierCode(supplierName) })), className: "ml-2 text-blue-700 underline", children: "Usar" })] }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: config.includeCode, onChange: (e) => setConfig(prev => ({ ...prev, includeCode: e.target.checked })), className: "rounded" }), _jsx("span", { className: "text-sm", children: "Incluir c\u00F3digo" })] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: config.includeName, onChange: (e) => setConfig(prev => ({ ...prev, includeName: e.target.checked })), className: "rounded" }), _jsx("span", { className: "text-sm", children: "Incluir nome" })] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: config.includePrice, onChange: (e) => setConfig(prev => ({ ...prev, includePrice: e.target.checked })), className: "rounded" }), _jsx("span", { className: "text-sm", children: "Incluir pre\u00E7o" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: ["Tamanho m\u00E1ximo do nome (", config.maxNameLength, ")"] }), _jsx("input", { type: "range", min: "5", max: "20", value: config.maxNameLength, onChange: (e) => setConfig(prev => ({ ...prev, maxNameLength: parseInt(e.target.value) })), className: "w-full" })] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: config.useOriginalPrice, onChange: (e) => setConfig(prev => ({ ...prev, useOriginalPrice: e.target.checked })), className: "rounded" }), _jsx("span", { className: "text-sm", children: "Pre\u00E7o em centavos" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Prefixo Adicional" }), _jsx("input", { type: "text", value: config.customPrefix, onChange: (e) => setConfig(prev => ({ ...prev, customPrefix: e.target.value })), placeholder: "Ex: LOJ, PROD...", className: "w-full p-2 border rounded", maxLength: 10 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Sufixo" }), _jsx("input", { type: "text", value: config.customSuffix, onChange: (e) => setConfig(prev => ({ ...prev, customSuffix: e.target.value })), placeholder: "Ex: BRA, 2025...", className: "w-full p-2 border rounded", maxLength: 10 })] })] })] }))] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-3", children: "C\u00F3digo Gerado" }), _jsxs("div", { className: "flex items-center gap-3 p-4 bg-gray-50 rounded-lg", children: [_jsx("code", { className: `text-lg font-mono flex-1 select-all p-2 bg-white rounded border ${isValid ? 'border-green-200' : 'border-red-200'}`, children: barcodeText || 'Configure os campos' }), _jsxs("button", { onClick: handleCopyCode, disabled: !barcodeText, className: "flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg transition-colors", children: [copied ? _jsx(Check, { size: 16, className: "text-green-600" }) : _jsx(Copy, { size: 16 }), copied ? 'Copiado!' : 'Copiar'] })] }), config.supplierCode && (_jsxs("p", { className: "text-xs text-gray-500 mt-2", children: ["Estrutura: ", _jsx("span", { className: "font-mono bg-blue-100 px-1 rounded", children: config.supplierCode }), " (Fornecedor) + C\u00F3digo + Nome + Pre\u00E7o"] }))] }), showPreview && barcodeText && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-medium", children: "Visualiza\u00E7\u00E3o" }), _jsxs("button", { onClick: () => setShowPreview(!showPreview), className: "flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800", children: [showPreview ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }), showPreview ? 'Ocultar' : 'Mostrar'] })] }), _jsx("div", { className: "flex justify-center p-6 bg-white border-2 border-gray-200 rounded-lg", children: _jsx("canvas", { ref: canvasRef, className: "max-w-full h-auto border border-gray-100 rounded shadow-sm" }) })] })), _jsxs("div", { className: "flex justify-between items-center pt-4 border-t", children: [_jsxs("div", { className: "text-sm text-gray-500", children: ["Comprimento: ", barcodeText.length, " caracteres", config.supplierCode && (_jsxs("span", { className: "ml-2 text-blue-600", children: ["\u2022 Fornecedor: ", config.supplierCode] }))] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("button", { onClick: handleDownload, disabled: !isValid || !barcodeText, className: "flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors", children: [_jsx(Download, { size: 16 }), "Baixar"] }), _jsxs("button", { onClick: handleSaveBarcode, disabled: !isValid || !barcodeText || saving || setupRequired, className: "flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors", children: [_jsx(Save, { size: 16 }), saving ? 'Salvando...' : 'Salvar'] }), _jsx("button", { onClick: onClose, className: "px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors", children: "Fechar" })] })] })] }), showHistory && (_jsxs("div", { className: "w-1/3 border-l bg-gray-50 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-medium", children: "C\u00F3digos Salvos" }), _jsx("button", { onClick: () => setShowHistory(false), className: "text-gray-400 hover:text-gray-600", children: "\u00D7" })] }), setupRequired ? (_jsxs("div", { className: "text-center text-red-500 space-y-2", children: [_jsx(AlertTriangle, { className: "mx-auto", size: 24 }), _jsx("p", { className: "text-sm", children: "Configura\u00E7\u00E3o necess\u00E1ria" }), _jsx("button", { onClick: setupBarcodeTable, className: "px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700", children: "Configurar Tabela" })] })) : loading ? (_jsx("div", { className: "text-center text-gray-500", children: "Carregando..." })) : savedBarcodes.length === 0 ? (_jsxs("div", { className: "text-center text-gray-500", children: [_jsx(BarChart3, { className: "mx-auto mb-2", size: 24 }), _jsx("p", { className: "text-sm", children: "Nenhum c\u00F3digo salvo" }), _jsx("p", { className: "text-xs text-gray-400", children: "Salve seu primeiro c\u00F3digo de barras" })] })) : (_jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto", children: savedBarcodes.map((barcode) => (_jsxs("div", { className: "bg-white p-3 rounded-lg border", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("code", { className: "text-sm font-mono text-blue-600 flex-1 truncate", children: barcode.barcode_text }), _jsx("button", { onClick: () => handleDeleteBarcode(barcode.id), className: "text-red-400 hover:text-red-600 ml-2", title: "Deletar", children: _jsx(Trash2, { size: 14 }) })] }), barcode.config?.supplierCode && (_jsxs("div", { className: "flex items-center gap-1 mb-2", children: [_jsx(Building, { size: 12, className: "text-blue-500" }), _jsx("span", { className: "text-xs text-blue-600 font-medium", children: barcode.config.supplierCode })] })), _jsx("div", { className: "text-xs text-gray-500 mb-2", children: new Date(barcode.created_at).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) }), _jsx("button", { onClick: () => loadSavedConfig(barcode), className: "text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors", children: "Carregar configura\u00E7\u00E3o" }), barcode.barcode_url && (_jsx("a", { href: barcode.barcode_url, target: "_blank", rel: "noopener noreferrer", className: "text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors ml-2", children: "Ver imagem" }))] }, barcode.id))) }))] }))] })] }) }));
};
export default IntegratedBarcodeGenerator;
