import React, { useRef, useEffect, useState } from 'react';
import { Download, BarChart3, Copy, Check, Settings, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface BarcodeConfig {
  includeCode: boolean;
  includeName: boolean;
  includePrice: boolean;
  maxNameLength: number;
  useOriginalPrice: boolean;
  customPrefix: string;
  customSuffix: string;
}

interface BarcodeGeneratorProps {
  productCode: string;
  productName: string;
  productPrice: number;
  onClose: () => void;
}

const ProfessionalBarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({
  productCode,
  productName,
  productPrice,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [barcodeText, setBarcodeText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [config, setConfig] = useState<BarcodeConfig>({
    includeCode: true,
    includeName: true,
    includePrice: true,
    maxNameLength: 12,
    useOriginalPrice: false,
    customPrefix: '',
    customSuffix: ''
  });

  // Função para limpar texto
  const cleanText = (text: string, maxLength?: number): string => {
    const cleaned = text
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^A-Z0-9]/g, ''); // Remove espaços e caracteres especiais
    
    return maxLength ? cleaned.substring(0, maxLength) : cleaned;
  };

  // Gerar texto do código de barras baseado na configuração
  useEffect(() => {
    let parts: string[] = [];

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
  const generateProfessionalBarcode = (text: string, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
  const generateCharPattern = (charCode: number): number[] => {
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
    if (!canvasRef.current) return;
    
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
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Validações
  const isValid = barcodeText.length >= 3 && barcodeText.length <= 50;
  const warnings = [];
  if (barcodeText.length > 30) warnings.push('Código muito longo pode ser difícil de ler');
  if (barcodeText.length < 5) warnings.push('Código muito curto pode causar conflitos');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Gerador de Código de Barras</h2>
              <p className="text-sm text-gray-600">Personalize e gere códigos de barras profissionais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações do produto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-600">Código do Produto</label>
              <div className="text-lg font-mono bg-white p-2 rounded border">{productCode}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Nome do Produto</label>
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
                <span className="font-medium">Configurações Avançadas</span>
              </div>
              <span className={`transform transition-transform ${showConfig ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {showConfig && (
              <div className="p-4 border-t bg-gray-50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.includeCode}
                      onChange={(e) => setConfig(prev => ({...prev, includeCode: e.target.checked}))}
                      className="rounded"
                    />
                    <span className="text-sm">Incluir código do produto</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.includeName}
                      onChange={(e) => setConfig(prev => ({...prev, includeName: e.target.checked}))}
                      className="rounded"
                    />
                    <span className="text-sm">Incluir nome do produto</span>
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
                      Tamanho máximo do nome ({config.maxNameLength} caracteres)
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
                    <span className="text-sm">Usar preço em centavos (mais preciso)</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Prefixo personalizado</label>
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
                    <label className="block text-sm font-medium text-gray-600 mb-1">Sufixo personalizado</label>
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
            <h3 className="font-medium mb-3 flex items-center gap-2">
              Código de Barras Gerado
              {!isValid && <AlertTriangle size={16} className="text-red-500" />}
            </h3>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <code className={`text-lg font-mono flex-1 select-all p-2 bg-white rounded border ${
                isValid ? 'border-green-200' : 'border-red-200'
              }`}>
                {barcodeText || 'Configure os campos acima'}
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
            
            {warnings.length > 0 && (
              <div className="mt-2 space-y-1">
                {warnings.map((warning, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-yellow-600">
                    <AlertTriangle size={14} />
                    {warning}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
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
            
            {showPreview && barcodeText && (
              <div className="flex justify-center p-6 bg-white border-2 border-gray-200 rounded-lg">
                <canvas 
                  ref={canvasRef} 
                  className="max-w-full h-auto border border-gray-100 rounded shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-500">
              Comprimento: {barcodeText.length} caracteres
              {isValid ? (
                <span className="text-green-600 ml-2">✓ Válido</span>
              ) : (
                <span className="text-red-600 ml-2">✗ Inválido</span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={handleDownload}
                disabled={!isValid || !barcodeText}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Download size={16} />
                Baixar PNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalBarcodeGenerator;