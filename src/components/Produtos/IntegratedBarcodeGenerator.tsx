import React, { useRef, useEffect, useState } from 'react';
import { Download, BarChart3, Copy, Check, Settings, Eye, EyeOff, AlertTriangle, Save, History, Trash2, Building } from 'lucide-react';
import api from "../../../server/api/axiosConfig";

interface BarcodeConfig {
  includeCode: boolean;
  includeName: boolean;
  includePrice: boolean;
  maxNameLength: number;
  useOriginalPrice: boolean;
  customPrefix: string;
  customSuffix: string;
  supplierCode: string; // Novo campo para código do fornecedor
}

interface SavedBarcode {
  id: number;
  barcode_text: string;
  barcode_url?: string;
  config: BarcodeConfig;
  created_at: string;
}

interface BarcodeGeneratorProps {
  productId: string;
  productCode: string;
  productName: string;
  productPrice: number;
  supplierName?: string; // Nome do fornecedor (opcional)
  onClose: () => void;
  onBarcodeGenerated?: (barcode: SavedBarcode) => void;
}

const IntegratedBarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({
  productId,
  productCode,
  productName,
  productPrice,
  supplierName = '',
  onClose,
  onBarcodeGenerated
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [barcodeText, setBarcodeText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedBarcodes, setSavedBarcodes] = useState<SavedBarcode[]>([]);
  const [setupRequired, setSetupRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<BarcodeConfig>({
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
  function generateSupplierCode(name: string): string {
    if (!name || name.trim() === '') return '';
    
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
    } else {
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
    } catch (error: any) {
      console.error('❌ Erro no setup da tabela:', error);
      setSetupRequired(true);
      setError('Erro ao configurar tabela de códigos de barras');
    }
  };

  // Função para limpar texto
  const cleanText = (text: string, maxLength?: number): string => {
    const cleaned = text
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]/g, '');
    
    return maxLength ? cleaned.substring(0, maxLength) : cleaned;
  };

  // Gerar texto do código de barras
  useEffect(() => {
    let parts: string[] = [];

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
    if (!barcodeText || saving) return;

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
      
    } catch (error: any) {
      console.error('❌ === ERRO AO SALVAR ===');
      console.error('Error:', error);
      console.error('Response:', error?.response?.data);
      console.error('Status:', error?.response?.status);
      console.error('========================');
      
      let errorMessage = 'Erro ao salvar código de barras';
      
      if (error?.response?.status === 404) {
        errorMessage = 'Produto não encontrado';
      } else if (error?.response?.status === 400) {
        errorMessage = error?.response?.data?.error || 'Dados inválidos';
        if (error?.response?.data?.suggestion) {
          errorMessage += `. ${error.response.data.suggestion}`;
        }
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
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
      
    } catch (error: any) {
      console.error('❌ Erro ao carregar códigos salvos:', error);
      console.error('Response:', error?.response?.data);
      
      if (error?.response?.status === 400 && error?.response?.data?.suggestion) {
        setSetupRequired(true);
        setError(error.response.data.error);
      } else {
        setError('Erro ao carregar códigos salvos');
      }
      
      setSavedBarcodes([]);
    } finally {
      setLoading(false);
    }
  };

  // Deletar código de barras
  const handleDeleteBarcode = async (barcodeId: number) => {
    if (!confirm('Deseja realmente deletar este código de barras?')) return;

    try {
      console.log('🗑️ Deletando código:', barcodeId);
      
      await api.delete(`/barcodes/${barcodeId}`);
      
      await loadSavedBarcodes();
      alert('Código de barras deletado com sucesso!');
      
    } catch (error: any) {
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
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Download da imagem
  const handleDownload = () => {
    if (!canvasRef.current) return;
    
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
  const loadSavedConfig = (savedBarcode: SavedBarcode) => {
    if (savedBarcode.config) {
      setConfig(savedBarcode.config);
    }
    setBarcodeText(savedBarcode.barcode_text);
  };

  // Função para gerar código de barras visual
  const generateBarcodeCanvas = (text: string, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
    } else {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Gerador de Código de Barras</h2>
              <p className="text-sm text-gray-600">Gere, salve e gerencie códigos de barras com código do fornecedor</p>
              {setupRequired && (
                <p className="text-xs text-red-600 font-medium">⚠️ Configuração necessária</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <History size={16} />
              Histórico ({savedBarcodes.length})
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Alerta de erro */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={16} />
            <span className="text-red-700 text-sm">{error}</span>
            {setupRequired && (
              <button
                onClick={setupBarcodeTable}
                className="ml-auto px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Configurar Agora
              </button>
            )}
          </div>
        )}

        <div className="flex">
          {/* Área principal */}
          <div className={`${showHistory ? 'w-2/3' : 'w-full'} p-6 space-y-6`}>
            {/* Informações do produto e fornecedor */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-600">Fornecedor</label>
                <div className="text-lg font-mono bg-white p-2 rounded border flex items-center gap-2">
                  <Building size={16} className="text-blue-600" />
                  {config.supplierCode || 'N/A'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Código</label>
                <div className="text-lg font-mono bg-white p-2 rounded border">{productCode}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Nome</label>
                <div className="text-lg bg-white p-2 rounded border truncate">{productName}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Preço</label>
                <div className="text-lg font-semibold text-green-600 bg-white p-2 rounded border">
                  R$ {productPrice.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Configurações */}
            <div className="border rounded-lg">
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings size={20} />
                  <span className="font-medium">Configurações</span>
                </div>
                <span className={`transform transition-transform ${showConfig ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {showConfig && (
                <div className="p-4 border-t bg-gray-50 space-y-4">
                  {/* Código do fornecedor - Nova seção destacada */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-medium text-blue-800 mb-2">
                      <Building size={16} className="inline mr-1" />
                      Código do Fornecedor (4 caracteres)
                    </label>
                    <input
                      type="text"
                      value={config.supplierCode}
                      onChange={(e) => setConfig(prev => ({...prev, supplierCode: e.target.value.toUpperCase()}))}
                      placeholder="Ex: COCA, NEST, FORD..."
                      className="w-full p-2 border rounded font-mono text-center"
                      maxLength={4}
                    />
                    {supplierName && (
                      <p className="text-xs text-blue-600 mt-1">
                        Sugestão baseada em "{supplierName}": {generateSupplierCode(supplierName)}
                        <button
                          onClick={() => setConfig(prev => ({...prev, supplierCode: generateSupplierCode(supplierName)}))}
                          className="ml-2 text-blue-700 underline"
                        >
                          Usar
                        </button>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.includeCode}
                        onChange={(e) => setConfig(prev => ({...prev, includeCode: e.target.checked}))}
                        className="rounded"
                      />
                      <span className="text-sm">Incluir código</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.includeName}
                        onChange={(e) => setConfig(prev => ({...prev, includeName: e.target.checked}))}
                        className="rounded"
                      />
                      <span className="text-sm">Incluir nome</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.includePrice}
                        onChange={(e) => setConfig(prev => ({...prev, includePrice: e.target.checked}))}
                        className="rounded"
                      />
                      <span className="text-sm">Incluir preço</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Tamanho máximo do nome ({config.maxNameLength})
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        value={config.maxNameLength}
                        onChange={(e) => setConfig(prev => ({...prev, maxNameLength: parseInt(e.target.value)}))}
                        className="w-full"
                      />
                    </div>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.useOriginalPrice}
                        onChange={(e) => setConfig(prev => ({...prev, useOriginalPrice: e.target.checked}))}
                        className="rounded"
                      />
                      <span className="text-sm">Preço em centavos</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Prefixo Adicional</label>
                      <input
                        type="text"
                        value={config.customPrefix}
                        onChange={(e) => setConfig(prev => ({...prev, customPrefix: e.target.value}))}
                        placeholder="Ex: LOJ, PROD..."
                        className="w-full p-2 border rounded"
                        maxLength={10}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Sufixo</label>
                      <input
                        type="text"
                        value={config.customSuffix}
                        onChange={(e) => setConfig(prev => ({...prev, customSuffix: e.target.value}))}
                        placeholder="Ex: BRA, 2025..."
                        className="w-full p-2 border rounded"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Código gerado */}
            <div>
              <h3 className="font-medium mb-3">Código Gerado</h3>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <code className={`text-lg font-mono flex-1 select-all p-2 bg-white rounded border ${
                  isValid ? 'border-green-200' : 'border-red-200'
                }`}>
                  {barcodeText || 'Configure os campos'}
                </code>
                <button
                  onClick={handleCopyCode}
                  disabled={!barcodeText}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              {config.supplierCode && (
                <p className="text-xs text-gray-500 mt-2">
                  Estrutura: <span className="font-mono bg-blue-100 px-1 rounded">{config.supplierCode}</span> (Fornecedor) + Código + Nome + Preço
                </p>
              )}
            </div>

            {/* Preview */}
            {showPreview && barcodeText && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Visualização</h3>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showPreview ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                
                <div className="flex justify-center p-6 bg-white border-2 border-gray-200 rounded-lg">
                  <canvas 
                    ref={canvasRef} 
                    className="max-w-full h-auto border border-gray-100 rounded shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-500">
                Comprimento: {barcodeText.length} caracteres
                {config.supplierCode && (
                  <span className="ml-2 text-blue-600">• Fornecedor: {config.supplierCode}</span>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  disabled={!isValid || !barcodeText}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                >
                  <Download size={16} />
                  Baixar
                </button>
                
                <button
                  onClick={handleSaveBarcode}
                  disabled={!isValid || !barcodeText || saving || setupRequired}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Save size={16} />
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>

          {/* Histórico lateral */}
          {showHistory && (
            <div className="w-1/3 border-l bg-gray-50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Códigos Salvos</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {setupRequired ? (
                <div className="text-center text-red-500 space-y-2">
                  <AlertTriangle className="mx-auto" size={24} />
                  <p className="text-sm">Configuração necessária</p>
                  <button
                    onClick={setupBarcodeTable}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  >
                    Configurar Tabela
                  </button>
                </div>
              ) : loading ? (
                <div className="text-center text-gray-500">Carregando...</div>
              ) : savedBarcodes.length === 0 ? (
                <div className="text-center text-gray-500">
                  <BarChart3 className="mx-auto mb-2" size={24} />
                  <p className="text-sm">Nenhum código salvo</p>
                  <p className="text-xs text-gray-400">Salve seu primeiro código de barras</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {savedBarcodes.map((barcode) => (
                    <div key={barcode.id} className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono text-blue-600 flex-1 truncate">
                          {barcode.barcode_text}
                        </code>
                        <button
                          onClick={() => handleDeleteBarcode(barcode.id)}
                          className="text-red-400 hover:text-red-600 ml-2"
                          title="Deletar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      {/* Mostrar código do fornecedor se disponível */}
                      {barcode.config?.supplierCode && (
                        <div className="flex items-center gap-1 mb-2">
                          <Building size={12} className="text-blue-500" />
                          <span className="text-xs text-blue-600 font-medium">
                            {barcode.config.supplierCode}
                          </span>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mb-2">
                        {new Date(barcode.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <button
                        onClick={() => loadSavedConfig(barcode)}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                      >
                        Carregar configuração
                      </button>
                      {barcode.barcode_url && (
                        <a
                          href={barcode.barcode_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors ml-2"
                        >
                          Ver imagem
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegratedBarcodeGenerator;