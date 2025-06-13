import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
const SignUpPage = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError("");
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
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
            const response = await fetch("/api/auth/register", {
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
            }).catch(error => {
                console.error("3. Erro na chamada fetch:", error);
                throw error;
            });
            console.log("4. Resposta recebida:", {
                status: response.status,
                statusText: response.statusText
            });
            // Se a resposta não for ok, tenta ler o erro
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.log("Erro recebido:", errorData);
                throw new Error(errorData?.message || "Erro ao registrar usuário");
            }
            const data = await response.json();
            console.log("Dados recebidos:", data);
            // Login automático após registro bem-sucedido
            console.log("Iniciando login automático...");
            const loginResponse = await fetch("/api/auth/login", {
                method: "POST",
                credentials: "include", // Adicione esta linha
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });
            if (!loginResponse.ok) {
                const errorData = await loginResponse.json().catch(() => null);
                throw new Error(errorData?.message || "Erro ao fazer login após registro");
            }
            const loginData = await loginResponse.json();
            console.log("Login bem-sucedido:", loginData);
            setUser(loginData.user);
            navigate("/dashboard");
        }
        catch (err) {
            console.error("Erro durante o processo:", err);
            setError(err instanceof Error ? err.message : "Erro ao registrar usuário");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "max-w-md w-full space-y-8", children: [_jsx("div", { children: _jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Criar nova conta" }) }), error && (_jsx("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative", children: error })), _jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [_jsxs("div", { className: "rounded-md shadow-sm space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Nome completo" }), _jsx("input", { id: "name", name: "name", type: "text", required: true, className: "appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", value: formData.name, onChange: handleChange })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700", children: "Email" }), _jsx("input", { id: "email", name: "email", type: "email", required: true, className: "appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", value: formData.email, onChange: handleChange })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Senha" }), _jsx("input", { id: "password", name: "password", type: "password", required: true, className: "appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", value: formData.password, onChange: handleChange })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirmPassword", className: "block text-sm font-medium text-gray-700", children: "Confirmar Senha" }), _jsx("input", { id: "confirmPassword", name: "confirmPassword", type: "password", required: true, className: "appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", value: formData.confirmPassword, onChange: handleChange })] })] }), _jsx("div", { children: _jsx("button", { type: "submit", disabled: isLoading, className: `group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`, children: isLoading ? "Criando conta..." : "Criar conta" }) })] })] }) }));
};
export default SignUpPage;
