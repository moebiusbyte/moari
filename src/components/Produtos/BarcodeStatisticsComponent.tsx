import React, { useState, useEffect } from 'react';
import { BarChart3, FileBarChart, TrendingUp, Package, Database } from 'lucide-react';

interface BarcodeStats {
  products_with_barcodes: number;
  total_barcodes: number;
  barcodes_with_images: number;
  avg_barcode_length: number;
}

const BarcodeStatisticsComponent: React.FC = () => {
  const [stats, setStats] = useState<BarcodeStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBarcodeStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/barcode-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.statistics);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas de códigos de barras:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarcodeStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <BarChart3 size={20} />
        Estatísticas de Códigos de Barras
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-600">Produtos com Código</h4>
              <p className="text-2xl font-semibold text-blue-600">
                {stats.products_with_barcodes || 0}
              </p>
            </div>
            <Package className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-600">Total de Códigos</h4>
              <p className="text-2xl font-semibold text-green-600">
                {stats.total_barcodes || 0}
              </p>
            </div>
            <FileBarChart className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-600">Com Imagens</h4>
              <p className="text-2xl font-semibold text-purple-600">
                {stats.barcodes_with_images || 0}
              </p>
            </div>
            <Database className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-600">Tamanho Médio</h4>
              <p className="text-2xl font-semibold text-orange-600">
                {Math.round(stats.avg_barcode_length || 0)} chars
              </p>
            </div>
            <TrendingUp className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* Indicadores de progresso */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between text-sm mb-1">
            <span>Produtos com códigos de barras</span>
            <span>{stats.products_with_barcodes} produtos</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(100, (stats.products_with_barcodes / Math.max(stats.total_barcodes, 1)) * 100)}%` 
              }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between text-sm mb-1">
            <span>Códigos com imagens salvas</span>
            <span>{stats.barcodes_with_images} de {stats.total_barcodes}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(100, (stats.barcodes_with_images / Math.max(stats.total_barcodes, 1)) * 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeStatisticsComponent;