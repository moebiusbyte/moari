import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
const LoginPage = () => {
    // Estados para controlar os campos do formulário e erros
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    // Hooks para navegação e gerenciamento de autenticação
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Limpa mensagens de erro anteriores
        try {
            // Realiza a requisição para o servidor de autenticação
            const response = await fetch("/api/auth/login", {
                method: "POST",
                credentials: "include", // Adicionando esta linha
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });
            // Adicionar log para debug
            console.log("Status da resposta:", response.status);
            // Se a resposta não for ok (status 200-299), tenta ler o erro
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.log("Erro recebido:", errorData);
                throw new Error(errorData?.message || "Credenciais inválidas");
            }
            // Converte a resposta para JSON
            const data = await response.json();
            console.log("Login bem-sucedido:", data);
            // Armazena o token e informações do usuário no localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            // Atualiza o contexto de autenticação com os dados do usuário
            setUser(data.user);
            // Redireciona para o dashboard após login bem-sucedido
            navigate("/dashboard");
        }
        catch (err) {
            console.error("Erro durante o login:", err);
            // Em caso de erro, exibe mensagem para o usuário
            setError(err instanceof Error ? err.message : "Email ou senha inválidos");
        }
    };
    // Interface do formulário de login
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-100", children: _jsxs("div", { className: "max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-center text-3xl font-bold text-gray-900", children: "MoAri" }), _jsx("p", { className: "mt-2 text-center text-sm text-gray-600", children: "Fa\u00E7a login para acessar o sistema" })] }), _jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleLogin, children: [error && (_jsx("div", { className: "text-red-500 text-sm text-center", children: error })), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700", children: "Email" }), _jsx("input", { id: "email", type: "email", required: true, className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md", value: email, onChange: (e) => setEmail(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Senha" }), _jsx("input", { id: "password", type: "password", required: true, className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md", value: password, onChange: (e) => setPassword(e.target.value) })] })] }), _jsx("button", { type: "submit", className: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700", children: "Entrar" })] })] }) }));
};
export default LoginPage;
