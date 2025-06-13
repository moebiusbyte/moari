import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Layout.tsx
import { useState } from "react";
import { Routes, Route, Link, Navigate, useNavigate, } from "react-router-dom";
import { LayoutDashboard, Users, Package, ShoppingCart, FileText, Settings, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./components/LoginPage";
import VendasPage from "./components/Vendas/VendasPage";
import ProductsPage from "./components/Produtos/ProductsPage";
import FornecedoresPage from "./components/Fornecedores/FornecedoresPage";
import SignUpPage from "./components/SignUpPage";
import DataAtual from "./components/DataAtual";
import RelatoriosPage from "./components/Relatorio/RelatoriosPage";
// Componente que controla o acesso às rotas protegidas
const PrivateRoute = ({ element, }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? element : _jsx(Navigate, { to: "/login", replace: true });
};
// Componente Dashboard
const Dashboard = () => (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [1, 2, 3].map((card) => (_jsxs("div", { className: "dashboard-card fade-in", children: [_jsxs("h3", { className: "text-lg font-semibold mb-2", children: ["Card ", card] }), _jsx("p", { className: "text-gray-600", children: "Conte\u00FAdo exemplo para demonstra\u00E7\u00E3o do layout" })] }, card))) }));
// Componentes das páginas
const Configuracoes = () => _jsx("div", { children: "P\u00E1gina de Configura\u00E7\u00F5es" });
// Componente principal do Layout
const Layout = () => {
    // Estado para controlar a visibilidade da sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    // Obtém as funções e estados de autenticação do contexto
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    // Função para realizar o logout
    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    // Itens do menu principal
    const menuItems = [
        { icon: LayoutDashboard, text: "Dashboard", path: "/dashboard" },
        { icon: Package, text: "Produtos", path: "/produtos" },
        { icon: Users, text: "Fornecedores", path: "/fornecedores" },
        { icon: ShoppingCart, text: "Vendas", path: "/vendas" },
        { icon: FileText, text: "Relatórios", path: "/relatorios" },
        { icon: Settings, text: "Configurações", path: "/config" },
    ];
    // Se não houver usuário autenticado, mostra apenas a página de login
    if (!user) {
        return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/signup", element: _jsx(SignUpPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/login", replace: true }) })] }));
    }
    // Layout principal da aplicação (mostrado apenas para usuários autenticados)
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white shadow-lg border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between px-6 py-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("button", { onClick: () => setIsSidebarOpen(!isSidebarOpen), className: "p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200", children: isSidebarOpen ? _jsx(X, { size: 24 }) : _jsx(Menu, { size: 24 }) }), _jsx("h1", { className: "ml-4 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500", children: "MoAri" })] }), _jsx("div", { className: "flex items-center", children: _jsx(DataAtual, {}) }), _jsx("div", { className: "flex items-center space-x-4", children: _jsx("div", { className: "flex items-center", children: _jsx("span", { className: "text-gray-700 font-medium", children: user?.name || "Usuário" }) }) })] }) }), _jsxs("div", { className: "flex", children: [_jsx("aside", { className: `${isSidebarOpen ? "w-64" : "w-16"} transition-all duration-300 ease-in-out bg-white shadow-lg min-h-screen border-r border-gray-200`, children: _jsxs("nav", { className: "mt-4", children: [menuItems.map((item, index) => (_jsxs(Link, { to: item.path, className: "sidebar-link", children: [_jsx(item.icon, { size: 20 }), isSidebarOpen && _jsx("span", { className: "ml-3 font-medium", children: item.text })] }, index))), _jsxs("button", { onClick: handleLogout, className: "w-full flex items-center px-6 py-3 mt-8 text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-lg mx-2", children: [_jsx(LogOut, { size: 20 }), isSidebarOpen && _jsx("span", { className: "ml-3 font-semibold", children: "Sair" })] })] }) }), _jsx("main", { className: "flex-1 p-6 bg-gray-50", children: _jsx("div", { className: "max-w-7xl mx-auto", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "/dashboard", element: _jsx(PrivateRoute, { element: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/produtos", element: _jsx(PrivateRoute, { element: _jsx(ProductsPage, {}) }) }), _jsx(Route, { path: "/fornecedores", element: _jsx(PrivateRoute, { element: _jsx(FornecedoresPage, {}) }) }), _jsx(Route, { path: "/vendas", element: _jsx(PrivateRoute, { element: _jsx(VendasPage, {}) }) }), _jsx(Route, { path: "/relatorios", element: _jsx(PrivateRoute, { element: _jsx(RelatoriosPage, {}) }) }), _jsx(Route, { path: "/config", element: _jsx(PrivateRoute, { element: _jsx(SignUpPage, {}) }) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) })] }) }) })] })] }));
};
export default Layout;
