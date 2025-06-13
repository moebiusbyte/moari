// App.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./Layout";
//import DataAtual from ",/DataAtual.tsx"

export default function App() {
  return (
    <div>
      <div className="bg-red-500 p-8 text-white text-center text-xl font-bold">
        🎉 TESTE TAILWIND 🎉
      </div>
      <AuthProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}