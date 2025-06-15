import React, { useState, useEffect, useRef } from 'react';
import { Search, Camera, FileBarChart, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface SearchResult {
  product: any;
  found: boolean;
  barcode_text?: string;
  barcode_created_at?: string;
}

interface AdvancedBarcodeSearchProps {
  onProductFound?: (product: any) => void;
  onSearch?: (searchTerm: string) => void;
}

const AdvancedBarcodeSearch: React.FC<AdvancedBarcodeSearchProps> = ({
  onProductFound,
  onSearch
}) => {
  const [searchBarcode, setSearchBarcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Carregar buscas recentes do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent_barcode_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar buscas recentes:', error);
      }
    }
  }, []);

  // Salvar busca recente
  const saveRecentSearch = (barcode: string) => {
    const updated = [barcode, ...recentSearches.filter(s => s !== barcode)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_barcode_searches', JSON.stringify(updated));
  };

  // Buscar produto por código de barras
  const handleSearchByBarcode = async (barcodeText: string) => {
    if (!barcodeText.trim()) return;

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

    } catch (error) {
      console.error('Erro ao buscar por código de barras:', error);
      setSearchResult({
        found: false,
        product: null
      });
    } finally {
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
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setCameraError('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  // Parar câmera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
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

  return (
    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
          <FileBarChart size={20} />
          Busca por Código de Barras
        </h3>
        {searchResult && (
          <button
            onClick={clearSearch}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Campo de busca principal */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Digite ou escaneie o código de barras..."
            value={searchBarcode}
            onChange={(e) => setSearchBarcode(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && searchBarcode.trim()) {
                handleSearchByBarcode(searchBarcode.trim());
              }
            }}
            disabled={isSearching}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader className="animate-spin text-blue-500" size={20} />
            </div>
          )}
        </div>
        
        <button
          onClick={() => handleSearchByBarcode(searchBarcode.trim())}
          disabled={!searchBarcode.trim() || isSearching}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Search size={16} />
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>

        <button
          onClick={showCamera ? stopCamera : startCamera}
          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          title="Usar câmera para escanear"
        >
          <Camera size={16} />
          {showCamera ? 'Parar' : 'Câmera'}
        </button>
      </div>

      {/* Câmera */}
      {showCamera && (
        <div className="mb-4 p-4 bg-white rounded-lg border">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Escaneamento de Código de Barras</h4>
            <button
              onClick={stopCamera}
              className="text-red-500 hover:text-red-700"
            >
              <X size={20} />
            </button>
          </div>
          
          {cameraError ? (
            <div className="text-red-600 text-center p-4">
              <AlertCircle className="mx-auto mb-2" size={24} />
              {cameraError}
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-md mx-auto rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-red-500 w-64 h-16 rounded-lg opacity-50"></div>
              </div>
              <button
                onClick={captureFrame}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Capturar e Analisar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Resultado da busca */}
      {searchResult && (
        <div className="mb-4">
          {searchResult.found ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-800 mb-2">Produto Encontrado!</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Código:</span>
                      <div className="font-mono">{searchResult.product.code}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Nome:</span>
                      <div>{searchResult.product.name}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Preço:</span>
                      <div className="text-green-600 font-semibold">
                        R$ {Number(searchResult.product.base_price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  {searchResult.barcode_created_at && (
                    <div className="mt-2 text-xs text-gray-500">
                      Código de barras criado em: {new Date(searchResult.barcode_created_at).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-semibold text-red-800">Produto Não Encontrado</h4>
                  <p className="text-red-600 text-sm">
                    Nenhum produto foi encontrado com o código de barras "{searchBarcode}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Buscas recentes */}
      {recentSearches.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Buscas Recentes:</h4>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchBarcode(search);
                  handleSearchByBarcode(search);
                }}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors"
              >
                {search}
              </button>
            ))}
            <button
              onClick={() => {
                setRecentSearches([]);
                localStorage.removeItem('recent_barcode_searches');
              }}
              className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Dica */}
      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Dica:</strong> Você pode usar um leitor de código de barras conectado ao computador. 
          Simplesmente foque no campo de busca e escaneie o código.
        </p>
      </div>
    </div>
  );
};

export default AdvancedBarcodeSearch;