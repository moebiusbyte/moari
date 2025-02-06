// App.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./Layout";
import DataAtual from ",/DataAtual.tsx"

export default function App() {
  return (
    // AuthProvider envolve toda a aplicação para que o estado de autenticação
    // esteja disponível em todos os componentes
    <AuthProvider>
      {/* BrowserRouter deve estar fora do Layout mas dentro do AuthProvider */}
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}
