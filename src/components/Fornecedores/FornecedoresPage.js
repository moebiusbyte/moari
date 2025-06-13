var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Search, Plus, Phone, Mail, MapPin, Calendar, Edit, Trash2, } from "lucide-react";
import EditFornecedorModal from './EditFornecedoresModal';
import CadastroFornecedores from "./CadastroFornecedores";
import api from "../../../server/api/axiosConfig";
var FornecedoresPage = function () {
    var _a = useState(false), editModalOpen = _a[0], setEditModalOpen = _a[1];
    var _b = useState(""), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = useState(false), isModalOpen = _c[0], setIsModalOpen = _c[1];
    var _d = useState(true), loading = _d[0], setLoading = _d[1];
    var _e = useState([]), fornecedores = _e[0], setFornecedores = _e[1];
    var _f = useState(null), selectedFornecedor = _f[0], setSelectedFornecedor = _f[1];
    // Função para buscar fornecedores da API
    var fetchFornecedores = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, api.get("/suppliers", {
                            params: { search: searchTerm },
                        })];
                case 1:
                    response = _a.sent();
                    setFornecedores(response.data);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error("Erro ao buscar fornecedores:", error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Handler para edição de fornecedor
    var handleEditFornecedor = function (fornecedor) {
        setSelectedFornecedor(fornecedor);
        setEditModalOpen(true);
    };
    // Handler para atualização de fornecedor
    var handleUpdateFornecedor = function (updatedData) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    if (!selectedFornecedor)
                        return [2 /*return*/];
                    return [4 /*yield*/, api.put("/suppliers/".concat(selectedFornecedor.id), updatedData)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fetchFornecedores()];
                case 2:
                    _a.sent(); // Recarrega a lista
                    setEditModalOpen(false);
                    setSelectedFornecedor(null);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error("Erro ao atualizar fornecedor:", error_2);
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Handler para exclusão de fornecedor
    var handleDeleteFornecedor = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm("Tem certeza que deseja excluir este fornecedor?")) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, api.delete("/suppliers/".concat(id))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fetchFornecedores()];
                case 3:
                    _a.sent(); // Recarrega a lista
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    console.error("Erro ao excluir fornecedor:", error_3);
                    alert("Erro ao excluir fornecedor. Verifique se não há produtos associados.");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Atualizar lista de fornecedores ao carregar a página ou ao alterar o termo de busca
    useEffect(function () {
        fetchFornecedores();
    }, [searchTerm]);
    // Função para salvar um novo fornecedor
    var handleSaveFornecedor = function (fornecedor) { return __awaiter(void 0, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api.post("/suppliers", fornecedor)];
                case 1:
                    _a.sent();
                    fetchFornecedores(); // Atualiza a lista após salvar
                    setIsModalOpen(false); // Fecha o modal
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error("Erro ao salvar fornecedor:", error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-800", children: "Fornecedores" }), _jsxs("button", { onClick: function () { return setIsModalOpen(true); }, className: "flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: [_jsx(Plus, { size: 20, className: "mr-2" }), "Novo Fornecedor"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", placeholder: "Buscar fornecedores...", className: "w-full pl-10 pr-4 py-2 border rounded-lg", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); } }), _jsx(Search, { className: "absolute left-3 top-2.5 text-gray-400", size: 20 })] }) }), loading ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsx("p", { className: "text-gray-500", children: "Carregando..." }) })) : fornecedores.length === 0 ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsx("p", { className: "text-gray-500", children: "Nenhum fornecedor encontrado." }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: fornecedores.map(function (fornecedor) { return (_jsx("div", { className: "bg-white rounded-lg shadow hover:shadow-md transition-shadow", children: _jsxs("div", { className: "p-6 border-b", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: fornecedor.nome }), _jsx("p", { className: "text-sm text-gray-500", children: fornecedor.contato })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: function () { return handleEditFornecedor(fornecedor); }, className: "p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors", title: "Editar fornecedor", children: _jsx(Edit, { size: 16 }) }), _jsx("button", { onClick: function () { return handleDeleteFornecedor(fornecedor.id); }, className: "p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors", title: "Excluir fornecedor", children: _jsx(Trash2, { size: 16 }) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Phone, { size: 16, className: "mr-2 flex-shrink-0" }), _jsx("span", { children: fornecedor.telefone || 'Não informado' })] }), _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Mail, { size: 16, className: "mr-2 flex-shrink-0" }), _jsx("span", { className: "truncate", children: fornecedor.email || 'Não informado' })] }), _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(MapPin, { size: 16, className: "mr-2 flex-shrink-0" }), _jsx("span", { children: fornecedor.cidade && fornecedor.estado ?
                                                    "".concat(fornecedor.cidade, ", ").concat(fornecedor.estado) :
                                                    'Não informado' })] }), _jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Calendar, { size: 16, className: "mr-2 flex-shrink-0" }), _jsxs("span", { children: ["\u00DAltima compra:", " ", fornecedor.ultima_compra
                                                        ? new Date(fornecedor.ultima_compra).toLocaleDateString("pt-BR")
                                                        : "N/A"] })] })] })] }) }, fornecedor.id)); }) })), isModalOpen && (_jsx(CadastroFornecedores, { isOpen: isModalOpen, onClose: function () { return setIsModalOpen(false); }, onSave: handleSaveFornecedor })), selectedFornecedor && editModalOpen && (_jsx(EditFornecedorModal, { isOpen: editModalOpen, onClose: function () {
                    setEditModalOpen(false);
                    setSelectedFornecedor(null);
                }, onSave: handleUpdateFornecedor, fornecedor: selectedFornecedor }))] }));
};
export default FornecedoresPage;
