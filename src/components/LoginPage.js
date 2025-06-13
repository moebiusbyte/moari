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
// src/components/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
var LoginPage = function () {
    // Estados para controlar os campos do formulário e erros
    var _a = useState(""), email = _a[0], setEmail = _a[1];
    var _b = useState(""), password = _b[0], setPassword = _b[1];
    var _c = useState(""), error = _c[0], setError = _c[1];
    // Hooks para navegação e gerenciamento de autenticação
    var navigate = useNavigate();
    var setUser = useAuth().setUser;
    var handleLogin = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var response, errorData, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError(""); // Limpa mensagens de erro anteriores
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch("/api/auth/login", {
                            method: "POST",
                            credentials: "include", // Adicionando esta linha
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                email: email,
                                password: password,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    // Adicionar log para debug
                    console.log("Status da resposta:", response.status);
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json().catch(function () { return null; })];
                case 3:
                    errorData = _a.sent();
                    console.log("Erro recebido:", errorData);
                    throw new Error((errorData === null || errorData === void 0 ? void 0 : errorData.message) || "Credenciais inválidas");
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    console.log("Login bem-sucedido:", data);
                    // Armazena o token e informações do usuário no localStorage
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    // Atualiza o contexto de autenticação com os dados do usuário
                    setUser(data.user);
                    // Redireciona para o dashboard após login bem-sucedido
                    navigate("/dashboard");
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    console.error("Erro durante o login:", err_1);
                    // Em caso de erro, exibe mensagem para o usuário
                    setError(err_1 instanceof Error ? err_1.message : "Email ou senha inválidos");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Interface do formulário de login
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-100", children: _jsxs("div", { className: "max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-center text-3xl font-bold text-gray-900", children: "MoAri" }), _jsx("p", { className: "mt-2 text-center text-sm text-gray-600", children: "Fa\u00E7a login para acessar o sistema" })] }), _jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleLogin, children: [error && (_jsx("div", { className: "text-red-500 text-sm text-center", children: error })), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700", children: "Email" }), _jsx("input", { id: "email", type: "email", required: true, className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md", value: email, onChange: function (e) { return setEmail(e.target.value); } })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Senha" }), _jsx("input", { id: "password", type: "password", required: true, className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md", value: password, onChange: function (e) { return setPassword(e.target.value); } })] })] }), _jsx("button", { type: "submit", className: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700", children: "Entrar" })] })] }) }));
};
export default LoginPage;
