import { jsx as _jsx } from "react/jsx-runtime";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./Layout";
//import DataAtual from ",/DataAtual.tsx"
export default function App() {
    return (
    // AuthProvider envolve toda a aplicação para que o estado de autenticação
    // esteja disponível em todos os componentes
    _jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsx(Layout, {}) }) }));
}
