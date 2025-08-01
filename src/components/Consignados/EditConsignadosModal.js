import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
const EditConsignadoModal = ({ isOpen, onClose, onSave, consignado }) => {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validationMessage, setValidationMessage] = useState(null);
    // Atualizar o useEffect para incluir todos os campos do consignado
    useEffect(() => {
        if (consignado) {
            setFormData({
                id: consignado.id,
                nome: consignado.nome,
                contato: consignado.contato,
                telefone: consignado.telefone,
                email: consignado.email,
                endereco: consignado.endereco,
                cidade: consignado.cidade,
                estado: consignado.estado,
                cnpj: consignado.cnpj,
                comissao: consignado.comissao,
                ultima_entrega: consignado.ultima_entrega,
                status: consignado.status
            });
        }
    }, [consignado]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Validação especial para comissão (porcentagem)
        if (name === 'comissao') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                setFormData(prev => ({
                    ...prev,
                    [name]: numValue
                }));
            }
            return;
        }
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onSave(formData);
            onClose();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar consignado');
        }
        finally {
            setLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg w-full max-w-2xl m-4 flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b", children: [_jsx("h2", { className: "text-2xl font-semibold", children: "Editar Consignado" }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-full", children: _jsx(X, { size: 24 }) })] }), _jsx("div", { className: "overflow-y-auto flex-1 p-6", children: _jsxs("form", { id: "edit-consignado-form", onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "ID" }), _jsx("input", { type: "text", name: "id", value: formData.id || '', className: "w-full rounded-lg border border-gray-300 bg-gray-200 p-2", readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nome do Consignado *" }), _jsx("input", { type: "text", name: "nome", value: formData.nome || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Contato" }), _jsx("input", { type: "text", name: "contato", value: formData.contato || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Telefone" }), _jsx("input", { type: "text", name: "telefone", value: formData.telefone || '', onChange: handleChange, placeholder: "(11) 99999-9999", className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "E-mail" }), _jsx("input", { type: "email", name: "email", value: formData.email || '', onChange: handleChange, placeholder: "exemplo@email.com", className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "CNPJ" }), _jsx("input", { type: "text", name: "cnpj", value: formData.cnpj || '', onChange: handleChange, placeholder: "00.000.000/0000-00", className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Comiss\u00E3o (%)" }), _jsx("input", { type: "number", name: "comissao", value: formData.comissao || '', onChange: handleChange, min: "0", max: "100", step: "0.01", placeholder: "0.00", className: "w-full rounded-lg border border-gray-300 p-2" }), _jsx("span", { className: "text-xs text-gray-500", children: "Porcentagem de comiss\u00E3o sobre vendas" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Endere\u00E7o" }), _jsx("input", { type: "text", name: "endereco", value: formData.endereco || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Cidade" }), _jsx("input", { type: "text", name: "cidade", value: formData.cidade || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Estado" }), _jsxs("select", { name: "estado", value: formData.estado || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", children: [_jsx("option", { value: "", children: "Selecione..." }), _jsx("option", { value: "AC", children: "Acre (AC)" }), _jsx("option", { value: "AL", children: "Alagoas (AL)" }), _jsx("option", { value: "AP", children: "Amap\u00E1 (AP)" }), _jsx("option", { value: "AM", children: "Amazonas (AM)" }), _jsx("option", { value: "BA", children: "Bahia (BA)" }), _jsx("option", { value: "CE", children: "Cear\u00E1 (CE)" }), _jsx("option", { value: "DF", children: "Distrito Federal (DF)" }), _jsx("option", { value: "ES", children: "Esp\u00EDrito Santo (ES)" }), _jsx("option", { value: "GO", children: "Goi\u00E1s (GO)" }), _jsx("option", { value: "MA", children: "Maranh\u00E3o (MA)" }), _jsx("option", { value: "MT", children: "Mato Grosso (MT)" }), _jsx("option", { value: "MS", children: "Mato Grosso do Sul (MS)" }), _jsx("option", { value: "MG", children: "Minas Gerais (MG)" }), _jsx("option", { value: "PA", children: "Par\u00E1 (PA)" }), _jsx("option", { value: "PB", children: "Para\u00EDba (PB)" }), _jsx("option", { value: "PR", children: "Paran\u00E1 (PR)" }), _jsx("option", { value: "PE", children: "Pernambuco (PE)" }), _jsx("option", { value: "PI", children: "Piau\u00ED (PI)" }), _jsx("option", { value: "RJ", children: "Rio de Janeiro (RJ)" }), _jsx("option", { value: "RN", children: "Rio Grande do Norte (RN)" }), _jsx("option", { value: "RS", children: "Rio Grande do Sul (RS)" }), _jsx("option", { value: "RO", children: "Rond\u00F4nia (RO)" }), _jsx("option", { value: "RR", children: "Roraima (RR)" }), _jsx("option", { value: "SC", children: "Santa Catarina (SC)" }), _jsx("option", { value: "SP", children: "S\u00E3o Paulo (SP)" }), _jsx("option", { value: "SE", children: "Sergipe (SE)" }), _jsx("option", { value: "TO", children: "Tocantins (TO)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { name: "status", value: formData.status || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", children: [_jsx("option", { value: "", children: "Selecione..." }), _jsx("option", { value: "ativo", children: "Ativo" }), _jsx("option", { value: "inativo", children: "Inativo" }), _jsx("option", { value: "suspenso", children: "Suspenso" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u00DAltima Entrega" }), _jsx("input", { type: "date", name: "ultima_entrega", value: formData.ultima_entrega ? formData.ultima_entrega.split('T')[0] : '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" }), _jsx("span", { className: "text-xs text-gray-500", children: "Data da \u00FAltima entrega realizada" })] }), formData.ultima_entrega && (_jsx("div", { className: "bg-green-50 p-3 rounded-lg", children: _jsxs("div", { className: "text-sm text-green-800", children: [_jsx("strong", { children: "Tempo desde a \u00FAltima entrega:" }), " ", (() => {
                                            const deliveryDate = new Date(formData.ultima_entrega);
                                            const today = new Date();
                                            const diffTime = Math.abs(today.getTime() - deliveryDate.getTime());
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
                                        })()] }) })), validationMessage && (_jsx(Alert, { className: "mt-4", children: _jsx(AlertDescription, { children: validationMessage }) })), error && (_jsx(Alert, { className: "mt-4", children: _jsx(AlertDescription, { children: error }) }))] }) }), _jsxs("div", { className: "border-t p-6 flex justify-end gap-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50", disabled: loading, children: "Cancelar" }), _jsxs("button", { type: "submit", form: "edit-consignado-form", className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50", disabled: loading, children: [_jsx(Save, { size: 20, className: "mr-2" }), loading ? 'Salvando...' : 'Salvar Alterações'] })] })] }) }));
};
export default EditConsignadoModal;
