import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
const EditProductModal = ({ isOpen, onClose, onSave, product, suppliers }) => {
    const [formData, setFormData] = useState({});
    const [newImages, setNewImages] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validationMessage, setValidationMessage] = useState(null);
    // Atualizar o useEffect para incluir o supplier_id
    useEffect(() => {
        if (product) {
            console.log('🔍 Product data received in modal:', product);
            console.log('🏢 Supplier ID from product:', product.supplier_id);
            setFormData({
                id: product.id,
                code: product.code,
                name: product.name,
                category: product.category,
                material_type: product.material_type,
                size: product.size,
                base_price: product.base_price,
                profit_margin: product.profit_margin,
                description: product.description,
                status: product.status,
                quantity: product.quantity,
                buy_date: product.buy_date,
                supplier_id: product.supplier_id || '' // Garantir que não seja undefined
            });
        }
    }, [product]);
    // Validação para campos numéricos
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
    const handleChange = (e) => {
        const { name, value } = e.target;
        let validatedValue = value;
        // Validação de campos numéricos
        if (name === "base_price") {
            validatedValue = validateNumberInput(value, 99999.99);
            if (parseFloat(value) > 99999.99) {
                setValidationMessage("O preço base não pode exceder R$ 99.999,99");
            }
            else {
                setValidationMessage(null);
            }
        }
        else if (name === "profit_margin") {
            validatedValue = validateNumberInput(value, 999.99);
            if (parseFloat(value) > 999.99) {
                setValidationMessage("A margem de lucro não pode exceder 999,99%");
            }
            else {
                setValidationMessage(null);
            }
        }
        else if (name === "quantity") {
            const intValue = parseInt(value);
            if (isNaN(intValue) || intValue < 0) {
                validatedValue = "1";
            }
            else if (intValue > 9999) {
                validatedValue = "9999";
                setValidationMessage("A quantidade não pode exceder 9.999 unidades");
            }
            else {
                validatedValue = value;
                setValidationMessage(null);
            }
        }
        setFormData(prev => ({
            ...prev,
            [name]: validatedValue
        }));
    };
    const handleImageChange = (e) => {
        if (e.target.files) {
            setNewImages(Array.from(e.target.files));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            console.log('📤 Form data being sent:', formData);
            console.log('🏢 Supplier ID being sent:', formData.supplier_id);
            await onSave(formData, newImages);
            onClose();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar produto');
        }
        finally {
            setLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg w-full max-w-2xl m-4 flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "flex justify-between items-center p-6 border-b", children: [_jsx("h2", { className: "text-2xl font-semibold", children: "Editar Produto" }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-full", children: _jsx(X, { size: 24 }) })] }), _jsx("div", { className: "overflow-y-auto flex-1 p-6", children: _jsxs("form", { id: "edit-product-form", onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "C\u00F3digo" }), _jsx("input", { type: "text", name: "code", value: formData.code || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 bg-gray-200 p-2", readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Nome" }), _jsx("input", { type: "text", name: "name", value: formData.name || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Categoria" }), _jsxs("select", { name: "category", value: formData.category || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", children: [_jsx("option", { value: "", children: "Selecione..." }), _jsx("option", { value: "colares", children: "Colares" }), _jsx("option", { value: "brincos", children: "Brincos" }), _jsx("option", { value: "aneis", children: "An\u00E9is" }), _jsx("option", { value: "pulseiras", children: "Pulseiras" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Fornecedor" }), _jsxs("select", { name: "supplier_id", value: formData.supplier_id || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", children: [_jsx("option", { value: "", children: "Selecione um fornecedor..." }), suppliers.map(supplier => (_jsx("option", { value: supplier.id, children: supplier.nome || `Fornecedor ${supplier.id}` }, supplier.id)))] }), _jsx("span", { className: "text-xs text-gray-500", children: "Associe este produto a um fornecedor existente" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Pre\u00E7o Base" }), _jsx("input", { type: "number", name: "base_price", value: formData.base_price || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", step: "0.01", max: "99999.99", min: "0" }), _jsx("span", { className: "text-xs text-gray-500", children: "M\u00E1ximo: R$ 99.999,99" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Margem de Lucro" }), _jsx("input", { type: "number", name: "profit_margin", value: formData.profit_margin || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", step: "0.01", max: "999.99", min: "0" }), _jsx("span", { className: "text-xs text-gray-500", children: "M\u00E1ximo: 999,99%" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { name: "status", value: formData.status || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", children: [_jsx("option", { value: "active", children: "Ativo" }), _jsx("option", { value: "consigned", children: "Consignado" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Quantidade em Estoque" }), _jsx("input", { type: "number", name: "quantity", value: formData.quantity || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2", min: "0", max: "9999", step: "1" }), _jsx("span", { className: "text-xs text-gray-500", children: "M\u00E1ximo: 9.999 unidades" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Data de Compra" }), _jsx("input", { type: "date", name: "buy_date", value: formData.buy_date || '', onChange: handleChange, className: "w-full rounded-lg border border-gray-300 p-2" }), _jsx("span", { className: "text-xs text-gray-500", children: "Data de entrada no estoque" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { name: "description", value: formData.description || '', onChange: handleChange, rows: 4, className: "w-full rounded-lg border border-gray-300 p-2" })] }), formData.buy_date && (_jsx("div", { className: "bg-blue-50 p-3 rounded-lg", children: _jsxs("div", { className: "text-sm text-blue-800", children: [_jsx("strong", { children: "Tempo em Estoque:" }), " ", (() => {
                                            const buyDate = new Date(formData.buy_date);
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
                                        })()] }) })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Novas Imagens" }), _jsx("input", { type: "file", onChange: handleImageChange, multiple: true, accept: "image/*", className: "w-full rounded-lg border border-gray-300 p-2" })] }), validationMessage && (_jsx(Alert, { className: "mt-4", children: _jsx(AlertDescription, { children: validationMessage }) })), error && (_jsx(Alert, { className: "mt-4", children: _jsx(AlertDescription, { children: error }) }))] }) }), _jsxs("div", { className: "border-t p-6 flex justify-end gap-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50", disabled: loading, children: "Cancelar" }), _jsxs("button", { type: "submit", form: "edit-product-form", className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50", disabled: loading, children: [_jsx(Save, { size: 20, className: "mr-2" }), loading ? 'Salvando...' : 'Salvar Alterações'] })] })] }) }));
};
export default EditProductModal;
