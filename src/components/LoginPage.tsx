// src/components/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Interface para tipar a resposta da API
interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const LoginPage = () => {
  // Estados para controlar os campos do formulário e erros
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Hooks para navegação e gerenciamento de autenticação
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Limpa mensagens de erro anteriores
    setIsLoading(true); // Ativa o estado de carregamento
  
    try {
      // Realiza a requisição para o servidor de autenticação
      const fullUrl = `${API_URL}/auth/login`; // Sem o '/api' se a rota no backend não tiver este prefixo
      console.log("Fazendo requisição para:", fullUrl);
      
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
        // Permitir credenciais (cookies) nas requisições cross-origin se necessário
        credentials: "include",
      });
  
      // Adicionar log para debug
      console.log("Status da resposta:", response.status);
  
      // Se a resposta não for ok (status 200-299), tenta ler o erro
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log("Erro recebido:", errorData);
        throw new Error(errorData?.error || errorData?.message || "Credenciais inválidas");
      }
  
      // Converte a resposta para JSON
      const data: LoginResponse = await response.json();
      console.log("Login bem-sucedido:", data);
  
      // Armazena o token e informações do usuário no localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
  
      // Atualiza o contexto de autenticação com os dados do usuário
      setUser(data.user);
  
      // Redireciona para o dashboard após login bem-sucedido
      navigate("/dashboard");
    } catch (err) {
      console.error("Erro durante o login:", err);
      // Em caso de erro, exibe mensagem para o usuário
      setError(err instanceof Error ? err.message : "Email ou senha inválidos. Verifique suas credenciais.");
    } finally {
      setIsLoading(false); // Desativa o estado de carregamento
    }
  };

  // Interface do formulário de login
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            MoAri
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Faça login para acessar o sistema
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {/* Exibe mensagem de erro se houver */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Campo de email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}/>
            </div>

            {/* Campo de senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}/>
            </div>
          </div>

          {/* Botão de login */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}>
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;