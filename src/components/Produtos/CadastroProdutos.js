import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from "react";
import { X, Upload, Trash2, Plus, Tag, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from '../../../server/api/axiosConfig';
const produtoInicial = {
    codigo: "",
    nome: "",
    categoria: "",
    formato: "",
    tipoMaterial: [], // ATUALIZADO: inicia como array vazio
    modoUso: "",
    tamanho: "",
    materiaisComponentes: [],
    origem: "",
    garantia: "false",
    fornecedor: "",
    precoBase: "",
    margemLucro: "",
    descricao: "",
    dataCompra: "",
    quantidade: "1",
};
const CadastroProdutos = ({ isOpen, onClose, onSave, }) => {
    const [produto, setProduto] = useState(produtoInicial);
    const [imagens, setImagens] = useState([]);
    const [previewImagens, setPreviewImagens] = useState([]);
    const [novoMaterial, setNovoMaterial] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [alertaPreco, setAlertaPreco] = useState(null);
    const [fornecedores, setFornecedores] = useState([]);
    // LISTA DE MATERIAIS DISPONÍVEIS
    const materiaisDisponiveis = [
        'Inox',
        'Ouro',
        'Platina',
        'Prata',
        'Prata 925',
        'Ródio Branco',
        'Ródio Negro'
    ];
    useEffect(() => {
        if (isOpen) {
            console.log("Modal está aberto:", isOpen);
            generateProductCode();
        }
    }, [isOpen]);
    // Função para buscar fornecedores
    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/suppliers');
            setFornecedores(response.data);
        }
        catch (error) {
            console.error('Erro ao buscar fornecedores:', error);
        }
    };
    useEffect(() => {
        fetchSuppliers();
    }, []);
    const generateProductCode = async () => {
        try {
            setLoading(true);
            setAlertaPreco(null);
            const response = await api.get('/next-product-id');
            console.log('Resposta da API de código de produto:', response.data);
            if (!response.data || response.data.nextId === undefined) {
                throw new Error('Resposta da API inválida - campo nextId ausente');
            }
            const { nextId } = response.data;
            let formattedCode;
            if (typeof nextId === 'string') {
                formattedCode = nextId.match(/^\d+$/)
                    ? nextId.padStart(7, '0')
                    : '0000001';
            }
            else if (typeof nextId === 'number') {
                formattedCode = nextId.toString().padStart(7, '0');
            }
            else {
                console.warn('Tipo de nextId inesperado:', typeof nextId);
                formattedCode = '0000001';
            }
            console.log('Código formatado para uso:', formattedCode);
            setProduto(prev => ({
                ...prev,
                codigo: formattedCode,
            }));
        }
        catch (error) {
            console.error('Erro ao gerar código do produto:', error);
            setProduto((prev) => ({
                ...prev,
                codigo: '0000001',
            }));
            setAlertaPreco({
                tipo: 'warning',
                mensagem: 'Erro ao gerar código do produto. Usando código padrão.',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const validateNumberInput = (value, maxValue) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue))
            return "";
        if (numValue < 0)
            return "0";
        if (numValue > maxValue)
            return maxValue.toString();
        return value;
    };
    const calcularPrecoSugerido = useCallback(() => {
        const precoBase = parseFloat(produto.precoBase);
        const margem = parseFloat(produto.margemLucro);
        if (!isNaN(precoBase) && !isNaN(margem)) {
            const precoSugerido = precoBase * (1 + margem / 100);
            const precoFinal = Math.ceil(precoSugerido * 100) / 100;
            setAlertaPreco({
                tipo: "info",
                mensagem: `Preço sugerido: R$ ${precoFinal.toFixed(2)}`,
            });
        }
    }, [produto.precoBase, produto.margemLucro]);
    // NOVA FUNÇÃO PARA LIDAR COM SELEÇÃO DE MATERIAIS
    const handleMaterialChange = (material) => {
        const materiaisAtuais = Array.isArray(produto.tipoMaterial)
            ? produto.tipoMaterial
            : [];
        let novosMateriais;
        if (materiaisAtuais.includes(material)) {
            // Remove o material se já estiver selecionado
            novosMateriais = materiaisAtuais.filter(m => m !== material);
        }
        else {
            // Adiciona o material se não estiver selecionado
            novosMateriais = [...materiaisAtuais, material];
        }
        setProduto(prev => ({
            ...prev,
            tipoMaterial: novosMateriais
        }));
    };
    const handleImageUpload = (e) => {
        if (!e.target.files)
            return;
        const files = Array.from(e.target.files);
        if (files.length + imagens.length > 5) {
            setAlertaPreco({
                tipo: "warning",
                mensagem: "Máximo de 5 imagens permitido",
            });
            return;
        }
        files.forEach((file) => {
            if (file.size > 5 * 1024 * 1024) {
                setAlertaPreco({
                    tipo: "error",
                    mensagem: "Imagens devem ter no máximo 5MB",
                });
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setPreviewImagens((prev) => [...prev, e.target.result]);
                }
            };
            reader.readAsDataURL(file);
        });
        setImagens((prev) => [...prev, ...files]);
    };
    const handleRemoveImage = (index) => {
        setImagens((prev) => prev.filter((_, i) => i !== index));
        setPreviewImagens((prev) => prev.filter((_, i) => i !== index));
    };
    const handleAddMaterial = () => {
        if (novoMaterial.trim()) {
            setProduto((prev) => ({
                ...prev,
                materiaisComponentes: [
                    ...prev.materiaisComponentes,
                    novoMaterial.trim(),
                ],
            }));
            setNovoMaterial("");
        }
    };
    const handleRemoveMaterial = (index) => {
        setProduto((prev) => ({
            ...prev,
            materiaisComponentes: prev.materiaisComponentes.filter((_, i) => i !== index),
        }));
    };
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let validatedValue = value;
        // Lidar com checkboxes
        if (type === "checkbox" && e.target instanceof HTMLInputElement) {
            validatedValue = e.target.checked ? "true" : "false";
        }
        // Validação para campos numéricos
        if (["precoBase", "margemLucro"].includes(name)) {
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue < 0) {
                validatedValue = "0";
            }
            else {
                validatedValue = numValue.toString();
            }
        }
        // NOVA VALIDAÇÃO: para quantidade
        if (name === "quantidade") {
            const intValue = parseInt(value);
            if (isNaN(intValue) || intValue < 0) {
                validatedValue = "1";
            }
            else if (intValue > 9999) {
                validatedValue = "9999";
                setAlertaPreco({
                    tipo: "warning",
                    mensagem: "A quantidade não pode exceder 9.999 unidades"
                });
            }
            else {
                validatedValue = value;
                setAlertaPreco(null);
            }
        }
        setProduto((prev) => ({
            ...prev,
            [name]: validatedValue,
        }));
        if (["precoBase", "margemLucro"].includes(name)) {
            calcularPrecoSugerido();
        }
    };
    const handleSave = async () => {
        if (!produto.nome || !produto.codigo || !produto.categoria) {
            setAlertaPreco({
                tipo: "error",
                mensagem: "Por favor, preencha todos os campos obrigatórios",
            });
            return;
        }
        try {
            setLoading(true);
            setError(null);
            console.log("Tentando salvar produto com ID:", produto.codigo);
            await onSave({ ...produto, fornecedor: produto.fornecedor }, imagens);
            onClose();
        }
        catch (err) {
            console.error("Erro ao salvar produto:", {
                codigo: produto.codigo,
                error: err,
            });
            let errorMessage = "Erro ao salvar produto. Por favor, tente novamente.";
            if (err?.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            setAlertaPreco({
                tipo: "error",
                mensagem: errorMessage,
            });
        }
        finally {
            setLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg w-full max-w-4xl m-4", children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b", children: [_jsx("h2", { className: "text-2xl font-semibold", children: "Cadastro de Produto" }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-full", children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "p-6 max-h-[calc(100vh-200px)] overflow-y-auto", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "C\u00F3digo *" }), _jsx("input", { type: "text", name: "codigo", value: loading ? "Carregando..." : produto.codigo, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 bg-gray-200 p-2", required: true, readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nome *" }), _jsx("input", { type: "text", name: "nome", value: produto.nome, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Categoria *" }), _jsxs("select", { name: "categoria", value: produto.categoria, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", required: true, children: [_jsx("option", { value: "", children: "Selecione..." }), _jsx("option", { value: "colares", children: "Colares" }), _jsx("option", { value: "brincos", children: "Brincos" }), _jsx("option", { value: "aneis", children: "An\u00E9is" }), _jsx("option", { value: "pulseiras", children: "Pulseiras" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Fornecedor" }), _jsxs("select", { name: "fornecedor", value: produto.fornecedor, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", children: [_jsx("option", { value: "", children: "Selecione o fornecedor..." }), fornecedores.map((fornecedor) => (_jsx("option", { value: fornecedor.id, children: fornecedor.nome }, fornecedor.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Quantidade em Estoque" }), _jsx("input", { type: "number", name: "quantidade", value: produto.quantidade, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", min: "0", max: "9999", step: "1" }), _jsx("span", { className: "text-xs text-gray-500", children: "M\u00E1ximo: 9.999 unidades" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Data de Compra" }), _jsx("input", { type: "date", name: "dataCompra", value: produto.dataCompra, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" }), _jsx("span", { className: "text-xs text-gray-500", children: "Data de entrada no estoque" })] }), produto.dataCompra && (_jsx("div", { className: "bg-blue-50 p-3 rounded-lg", children: _jsxs("div", { className: "text-sm text-blue-800", children: [_jsx("strong", { children: "Tempo em Estoque:" }), " ", (() => {
                                                        const buyDate = new Date(produto.dataCompra);
                                                        const today = new Date();
                                                        const diffTime = Math.abs(today.getTime() - buyDate.getTime());
                                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                        if (diffDays > 365) {
                                                            return `${Math.floor(diffDays / 365)} ano(s) e ${diffDays % 365} dias`;
                                                        }
                                                        else if (diffDays > 30) {
                                                            return `${Math.floor(diffDays / 30)} mês(es) e ${diffDays % 30} dias`;
                                                        }
                                                        else {
                                                            return `${diffDays} dias`;
                                                        }
                                                    })()] }) }))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Tipo de Material" }), _jsxs("select", { name: "tipoMaterial", value: produto.tipoMaterial, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", required: true, children: [_jsx("option", { value: "", children: "Selecione..." }), _jsx("option", { value: "Inox", children: "Inox" }), _jsx("option", { value: "Ouro", children: "Ouro" }), _jsx("option", { value: "Platina", children: "Platina" }), _jsx("option", { value: "Prata", children: "Prata" }), _jsx("option", { value: "Prata 925", children: "Prata 925" }), _jsx("option", { value: "R\u00F3dio Branco", children: "R\u00F3dio Branco" }), _jsx("option", { value: "R\u00F3dio Negro", children: "R\u00F3dio Negro" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Tamanho" }), _jsx("input", { type: "text", name: "tamanho", value: produto.tamanho, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Garantia" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", name: "garantia", checked: produto.garantia === "true", onChange: (e) => setProduto((prev) => ({
                                                                ...prev,
                                                                garantia: e.target.checked ? "true" : "false",
                                                            })), className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" }), _jsx("span", { children: "Produto com garantia" })] })] })] })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Materiais Componentes" }), _jsxs("div", { className: "flex gap-2 mb-2", children: [_jsx("input", { type: "text", value: novoMaterial, onChange: (e) => setNovoMaterial(e.target.value), className: "flex-1 rounded-lg border border-gray-300 p-2", placeholder: "Adicionar material..." }), _jsx("button", { onClick: handleAddMaterial, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: _jsx(Plus, { size: 20 }) })] }), _jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: produto.materiaisComponentes.map((material, index) => (_jsxs("span", { className: "inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full", children: [_jsx(Tag, { size: 14 }), material, _jsx("button", { onClick: () => handleRemoveMaterial(index), className: "ml-1 text-gray-500 hover:text-red-500", children: _jsx(X, { size: 14 }) })] }, index))) })] }), _jsxs("div", { className: "mt-6 p-4 bg-gray-50 rounded-lg", children: [_jsxs("h3", { className: "text-lg font-medium mb-4 flex items-center gap-2", children: [_jsx(Info, { size: 20 }), "Precifica\u00E7\u00E3o"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Pre\u00E7o Base (R$)" }), _jsx("input", { type: "number", name: "precoBase", value: produto.precoBase, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", step: "0.01" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Margem de Lucro (%)" }), _jsx("input", { type: "number", name: "margemLucro", value: produto.margemLucro, onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" })] })] }), alertaPreco && (_jsx(Alert, { className: "mt-4", children: _jsx(AlertDescription, { children: alertaPreco.mensagem }) }))] }), _jsxs("div", { className: "mt-6", children: [_jsx("h3", { className: "text-lg font-medium mb-4", children: "Imagens do Produto" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [previewImagens.map((preview, index) => (_jsxs("div", { className: "relative", children: [_jsx("img", { src: preview, alt: `Preview ${index + 1}`, className: "w-full h-32 object-cover rounded-lg" }), _jsx("button", { onClick: () => handleRemoveImage(index), className: "absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600", children: _jsx(Trash2, { size: 16 }) })] }, index))), previewImagens.length < 5 && (_jsxs("label", { className: "border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400", children: [_jsx(Upload, { size: 24, className: "text-gray-400" }), _jsx("span", { className: "mt-2 text-sm text-gray-500", children: "Adicionar Imagem" }), _jsx("span", { className: "mt-1 text-xs text-gray-400", children: "M\u00E1x. 5 imagens" }), _jsx("input", { type: "file", multiple: true, accept: "image/*", onChange: handleImageUpload, className: "hidden" })] }))] })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { name: "descricao", value: produto.descricao, onChange: handleChange, rows: 4, className: "w-full rounded-lg border border-gray-300 p-2" })] })] }), _jsxs("div", { className: "border-t p-6 flex justify-end gap-4", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50", children: "Cancelar" }), _jsx("button", { onClick: handleSave, className: `px-4 py-2 rounded-lg flex items-center ${loading
                                ? "bg-blue-400 text-white cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"}`, disabled: loading, children: loading ? (_jsx("span", { className: "inline-block", children: "Salvando..." })) : ("Salvar") })] })] }) }));
};
export default CadastroProdutos;
