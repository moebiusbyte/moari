import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from '../../../server/api/axiosConfig';

interface Produto {
  id: number;
  name: string;
  nome: string;
  status: string;
  preco: number;
  quantity: number; // Adicionar campo de quantidade
}

interface ProdutoConsignado {
  product_id: number;
  quantidade: number;
  valor_combinado: number;
}

interface ConsignadoFormData {
  codigo: string;
  nome: string;
  contato: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  endereco: string;
  cnpj: string;
  comissao: number;
  ultimaentrega: Date | null;
  status: string;
}

interface CadastroConsignadosProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (consignado: ConsignadoFormData, produtos: ProdutoConsignado[]) => void;
}

const consignadoInicial: ConsignadoFormData = {
  codigo: "",
  nome: "",
  contato: "",
  telefone: "",
  email: "",
  cidade: "",
  estado: "",
  endereco: "",
  cnpj: "",
  comissao: 0,
  ultimaentrega: null,
  status: "ativo",
};

const estadosBrasil = [
  { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' }, { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' }, { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' }, { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' }, { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' }, { uf: 'RN', nome: 'Rio Grande do Norte' }, { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' }, { uf: 'RR', nome: 'Roraima' }, { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' }, { uf: 'TO', nome: 'Tocantins' }
];

const CadastroConsignados: React.FC<CadastroConsignadosProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [consignado, setConsignado] = useState<ConsignadoFormData>(consignadoInicial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoConsignado[]>([]);

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      try {
        const response = await api.get('/products');
        console.log("Produtos recebidos:", response.data.products);
        
        // Filtrar apenas produtos ativos e com quantidade disponível
        const produtosDisponiveis = response.data.products.filter((p: any) => 
          p.status === 'active' && (p.quantity || 0) > 0
        );
        
        console.log("Produtos disponíveis para consignação:", produtosDisponiveis);
        setProdutos(produtosDisponiveis);
      } catch (err) {
        setError("Erro ao carregar produtos.");
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) fetchProdutos();
  }, [isOpen]);

  const handleProdutoSelect = (product_id: number) => {
    if (produtosSelecionados.some(p => p.product_id === product_id)) {
      setProdutosSelecionados(produtosSelecionados.filter(p => p.product_id !== product_id));
    } else {
      setProdutosSelecionados([...produtosSelecionados, { product_id, quantidade: 1, valor_combinado: 0 }]);
    }
  };

  const handleProdutoChange = (product_id: number, field: keyof ProdutoConsignado, value: number) => {
    const produto = produtos.find(p => p.id === product_id);
    
    // Validar quantidade máxima
    if (field === 'quantidade' && produto && value > (produto.quantity || 0)) {
      alert(`Quantidade máxima disponível para "${produto.name || produto.nome}": ${produto.quantity || 0}`);
      return;
    }
    
    setProdutosSelecionados(
      produtosSelecionados.map(p =>
        p.product_id === product_id ? { ...p, [field]: value } : p
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cadastro de Consignados</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        {loading && <p>Carregando...</p>}
        {error && <Alert><AlertDescription>{error}</AlertDescription></Alert>}
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave(consignado, produtosSelecionados);
          }}
        >
          {/* Campos do consignado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block font-medium mb-1">Nome</label>
              <input type="text" className="w-full border rounded px-3 py-2"
                value={consignado.nome}
                onChange={e => setConsignado({ ...consignado, nome: e.target.value })}
                required />
            </div>
            <div>
              <label className="block font-medium mb-1">Telefone</label>
              <input type="text" className="w-full border rounded px-3 py-2"
                value={consignado.telefone}
                onChange={e => setConsignado({ ...consignado, telefone: e.target.value })} />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input type="email" className="w-full border rounded px-3 py-2"
                value={consignado.email}
                onChange={e => setConsignado({ ...consignado, email: e.target.value })} />
            </div>
            <div>
              <label className="block font-medium mb-1">Cidade</label>
              <input type="text" className="w-full border rounded px-3 py-2"
                value={consignado.cidade}
                onChange={e => setConsignado({ ...consignado, cidade: e.target.value })} />
            </div>
            <div>
              <label className="block font-medium mb-1">Endereço</label>
              <input type="text" className="w-full border rounded px-3 py-2"
                value={consignado.endereco}
                onChange={e => setConsignado({ ...consignado, endereco: e.target.value })} />
            </div>
          </div>

          {/* Seleção de produtos para consignar */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Produtos para Consignar</h3>
            <div className="overflow-y-auto border rounded p-2" style={{ maxHeight: 250 }}>
              {produtos.length === 0 ? (
                <p className="text-gray-500">Nenhum produto disponível.</p>
              ) : (
                <>
                  {/* Legenda */}
                  <div className="flex gap-2 mb-2 font-semibold text-sm items-center">
                    <span className="w-10 text-center"></span>
                    <span className="flex-1 text-left">Produto</span>
                    <span className="w-20 text-center">Disponível</span>
                    <span className="w-24 text-right">Quantidade</span>
                  </div>
                  {/* Lista de produtos */}
                  <div style={{ maxHeight: 180, overflowY: "auto" }}>
                    {produtos.map(produto => {
                      const quantidadeDisponivel = produto.quantity || 0;
                      const produtoSelecionado = produtosSelecionados.find(p => p.product_id === produto.id);
                      
                      return (
                        <div key={produto.id} className={`flex items-center gap-2 mb-2 ${quantidadeDisponivel === 0 ? 'opacity-50' : ''}`}>
                          <input
                            type="checkbox"
                            className="w-10"
                            checked={produtoSelecionado !== undefined}
                            onChange={() => handleProdutoSelect(produto.id)}
                            disabled={quantidadeDisponivel === 0}
                            title={quantidadeDisponivel === 0 ? "Produto sem estoque" : ""}
                          />
                          <span className="flex-1">{produto.name || produto.nome || "Sem nome"}</span>
                          <span className={`w-20 text-center text-sm ${quantidadeDisponivel === 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {quantidadeDisponivel}
                          </span>
                          {produtoSelecionado ? (
                            <input
                              type="number"
                              min={1}
                              max={quantidadeDisponivel}
                              className="w-24 border rounded px-2 py-1"
                              value={produtoSelecionado.quantidade}
                              onChange={e => handleProdutoChange(produto.id, "quantidade", Number(e.target.value))}
                              placeholder="Qtd"
                              title={`Máximo: ${quantidadeDisponivel}`}
                            />
                          ) : (
                            <input 
                              type="number" 
                              className="w-24 border rounded px-2 py-1 bg-gray-100" 
                              disabled 
                              title="Selecione o produto primeiro"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
};

export default CadastroConsignados;