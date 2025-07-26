import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from '../../../server/api/axiosConfig';
const consignadoInicial = {
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
const CadastroConsignados = ({ isOpen, onClose, onSave, }) => {
    const [consignado, setConsignado] = useState(consignadoInicial);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [produtos, setProdutos] = useState([]);
    const [produtosSelecionados, setProdutosSelecionados] = useState([]);
    useEffect(() => {
        const fetchProdutos = async () => {
            setLoading(true);
            try {
                const response = await api.get('/products');
                console.log("Produtos recebidos:", response.data.products);
                // Para ver os nomes:
                response.data.products.forEach((p) => console.log("Produto:", p.name, p.nome, p.code));
                // Remova qualquer filtro restritivo aqui!
                setProdutos(response.data.products); // Use o array completo
            }
            catch (err) {
                setError("Erro ao carregar produtos.");
            }
            finally {
                setLoading(false);
            }
        };
        if (isOpen)
            fetchProdutos();
    }, [isOpen]);
    const handleProdutoSelect = (product_id) => {
        if (produtosSelecionados.some(p => p.product_id === product_id)) {
            setProdutosSelecionados(produtosSelecionados.filter(p => p.product_id !== product_id));
        }
        else {
            setProdutosSelecionados([...produtosSelecionados, { product_id, quantidade: 1, valor_combinado: 0 }]);
        }
    };
    const handleProdutoChange = (product_id, field, value) => {
        setProdutosSelecionados(produtosSelecionados.map(p => p.product_id === product_id ? { ...p, [field]: value } : p));
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-bold", children: "Cadastro de Consignados" }), _jsx("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700", children: _jsx(X, { size: 24 }) })] }), loading && _jsx("p", { children: "Carregando..." }), error && _jsx(Alert, { children: _jsx(AlertDescription, { children: error }) }), _jsxs("form", { onSubmit: e => {
                        e.preventDefault();
                        onSave(consignado, produtosSelecionados);
                    }, children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block font-medium mb-1", children: "Nome" }), _jsx("input", { type: "text", className: "w-full border rounded px-3 py-2", value: consignado.nome, onChange: e => setConsignado({ ...consignado, nome: e.target.value }), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block font-medium mb-1", children: "Telefone" }), _jsx("input", { type: "text", className: "w-full border rounded px-3 py-2", value: consignado.telefone, onChange: e => setConsignado({ ...consignado, telefone: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block font-medium mb-1", children: "Email" }), _jsx("input", { type: "email", className: "w-full border rounded px-3 py-2", value: consignado.email, onChange: e => setConsignado({ ...consignado, email: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block font-medium mb-1", children: "Cidade" }), _jsx("input", { type: "text", className: "w-full border rounded px-3 py-2", value: consignado.cidade, onChange: e => setConsignado({ ...consignado, cidade: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block font-medium mb-1", children: "Endere\u00E7o" }), _jsx("input", { type: "text", className: "w-full border rounded px-3 py-2", value: consignado.endereco, onChange: e => setConsignado({ ...consignado, endereco: e.target.value }) })] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Produtos para Consignar" }), _jsx("div", { className: "overflow-y-auto border rounded p-2", style: { maxHeight: 250 }, children: produtos.length === 0 ? (_jsx("p", { className: "text-gray-500", children: "Nenhum produto dispon\u00EDvel." })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex gap-2 mb-2 font-semibold text-sm items-center", children: [_jsx("span", { className: "w-10 text-center" }), _jsx("span", { className: "flex-1 text-left", children: "Produto" }), _jsx("span", { className: "w-24 text-right", children: "Quantidade" })] }), _jsx("div", { style: { maxHeight: 180, overflowY: "auto" }, children: produtos.map(produto => (_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("input", { type: "checkbox", className: "w-10", checked: produtosSelecionados.some(p => p.product_id === produto.id), onChange: () => handleProdutoSelect(produto.id) }), _jsx("span", { className: "flex-1", children: produto.name || produto.nome || "Sem nome" }), produtosSelecionados.some(p => p.product_id === produto.id) ? (_jsx("input", { type: "number", min: 1, className: "w-24 border rounded px-2 py-1", value: produtosSelecionados.find(p => p.product_id === produto.id)?.quantidade || 1, onChange: e => handleProdutoChange(produto.id, "quantidade", Number(e.target.value)), placeholder: "Qtd" })) : (_jsx("input", { type: "number", className: "w-24 border rounded px-2 py-1 bg-gray-100", disabled: true }))] }, produto.id))) })] })) })] }), _jsx("button", { type: "submit", className: "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700", children: "Salvar" })] })] }) }));
};
export default CadastroConsignados;
