var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
var SignUpPage = function () {
    var navigate = useNavigate();
    var setUser = useAuth().setUser;
    var _a = useState(false), isLoading = _a[0], setIsLoading = _a[1];
    var _b = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    }), formData = _b[0], setFormData = _b[1];
    var _c = useState(""), error = _c[0], setError = _c[1];
    var handleChange = function (e) {
        var _a;
        setFormData(__assign(__assign({}, formData), (_a = {}, _a[e.target.name] = e.target.value, _a)));
        setError("");
    };
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var response, errorData, data, loginResponse, errorData, loginData, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError("");
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, 11, 12]);
                    console.log("1. Iniciando processo de registro com dados:", {
                        name: formData.name,
                        email: formData.email,
                        passwordLength: formData.password.length
                    });
                    if (formData.password.length < 6) {
                        throw new Error("A senha deve ter pelo menos 6 caracteres");
                    }
                    if (formData.password !== formData.confirmPassword) {
                        throw new Error("As senhas não conferem");
                    }
                    console.log("2. Iniciando chamada para /api/auth/register");
                    return [4 /*yield*/, fetch("/api/auth/register", {
                            method: "POST",
                            credentials: "include",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                name: formData.name,
                                email: formData.email,
                                password: formData.password,
                            }),
                        }).catch(function (error) {
                            console.error("3. Erro na chamada fetch:", error);
                            throw error;
                        })];
                case 2:
                    response = _a.sent();
                    console.log("4. Resposta recebida:", {
                        status: response.status,
                        statusText: response.statusText
                    });
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json().catch(function () { return null; })];
                case 3:
                    errorData = _a.sent();
                    console.log("Erro recebido:", errorData);
                    throw new Error((errorData === null || errorData === void 0 ? void 0 : errorData.message) || "Erro ao registrar usuário");
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    console.log("Dados recebidos:", data);
                    // Login automático após registro bem-sucedido
                    console.log("Iniciando login automático...");
                    return [4 /*yield*/, fetch("/api/auth/login", {
                            method: "POST",
                            credentials: "include", // Adicione esta linha
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                email: formData.email,
                                password: formData.password,
                            }),
                        })];
                case 6:
                    loginResponse = _a.sent();
                    if (!!loginResponse.ok) return [3 /*break*/, 8];
                    return [4 /*yield*/, loginResponse.json().catch(function () { return null; })];
                case 7:
                    errorData = _a.sent();
                    throw new Error((errorData === null || errorData === void 0 ? void 0 : errorData.message) || "Erro ao fazer login após registro");
                case 8: return [4 /*yield*/, loginResponse.json()];
                case 9:
                    loginData = _a.sent();
                    console.log("Login bem-sucedido:", loginData);
                    setUser(loginData.user);
                    navigate("/dashboard");
                    return [3 /*break*/, 12];
                case 10:
                    err_1 = _a.sent();
                    console.error("Erro durante o processo:", err_1);
                    setError(err_1 instanceof Error ? err_1.message : "Erro ao registrar usuário");
                    return [3 /*break*/, 12];
                case 11:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    }); };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "max-w-md w-full space-y-8", children: [_jsx("div", { children: _jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Criar nova conta" }) }), error && (_jsx("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative", children: error })), _jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [_jsxs("div", { className: "rounded-md shadow-sm space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Nome completo" }), _jsx("input", { id: "name", name: "name", type: "text", required: true, className: "appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", value: formData.name, onChange: handleChange })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700", children: "Email" }), _jsx("input", { id: "email", name: "email", type: "email", required: true, className: "appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", value: formData.email, onChange: handleChange })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Senha" }), _jsx("input", { id: "password", name: "password", type: "password", required: true, className: "appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", value: formData.password, onChange: handleChange })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirmPassword", className: "block text-sm font-medium text-gray-700", children: "Confirmar Senha" }), _jsx("input", { id: "confirmPassword", name: "confirmPassword", type: "password", required: true, className: "appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", value: formData.confirmPassword, onChange: handleChange })] })] }), _jsx("div", { children: _jsx("button", { type: "submit", disabled: isLoading, className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ".concat(isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700", " focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"), children: isLoading ? "Criando conta..." : "Criar conta" }) })] })] }) }));
};
export default SignUpPage;
