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
var PrivateRoute = function (_a) {
    var element = _a.element;
    var isAuthenticated = useAuth().isAuthenticated;
    return isAuthenticated ? element : _jsx(Navigate, { to: "/login", replace: true });
};
// Componente Dashboard
var Dashboard = function () { return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [1, 2, 3].map(function (card) { return (_jsxs("div", { className: "p-6 bg-white rounded-lg shadow-sm", children: [_jsxs("h3", { className: "text-lg font-semibold mb-2", children: ["Card ", card] }), _jsx("p", { className: "text-gray-600", children: "Conte\u00FAdo exemplo para demonstra\u00E7\u00E3o do layout" })] }, card)); }) })); };
// Componentes das páginas
var Configuracoes = function () { return _jsx("div", { children: "P\u00E1gina de Configura\u00E7\u00F5es" }); };
//salvar FotoPerfil
var handleImageUpload = function (event) {
    var file = event.target.files[0];
    if (file) {
        var reader_1 = new FileReader();
        reader_1.onloadend = function () {
            var base64String = reader_1.result;
            setFotoPerfil(base64String);
            setPreviewUrl(base64String);
            localStorage.setItem('fotoPerfil', base64String);
        };
        reader_1.readAsDataURL(file);
    }
};
// Componente principal do Layout
var Layout = function () {
    // Estado para controlar a visibilidade da sidebar
    var _a = useState(true), isSidebarOpen = _a[0], setIsSidebarOpen = _a[1];
    // Obtém as funções e estados de autenticação do contexto
    var _b = useAuth(), user = _b.user, logout = _b.logout;
    var navigate = useNavigate();
    // Função para realizar o logout
    var handleLogout = function () {
        logout();
        navigate("/login");
    };
    // Itens do menu principal
    var menuItems = [
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-100", children: [_jsx("header", { className: "bg-white shadow-sm", children: _jsxs("div", { className: "flex items-center justify-between px-4 py-1", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("button", { onClick: function () { return setIsSidebarOpen(!isSidebarOpen); }, className: "p-1 rounded-lg hover:bg-red-300", children: isSidebarOpen ? _jsx(X, { size: 36 }) : _jsx(Menu, { size: 36 }) }), _jsx("h1", { className: "ml-4 text-4xl font-semibold text-pink-500", children: "MoAri" })] }), _jsx("div", { className: "flex items-center", children: _jsx(DataAtual, {}) }), _jsx("div", { className: "display-flex items-center space-x-1", children: _jsx("div", { className: "flex items-center", children: _jsx("span", { className: "mr-4 text-lg-2 text-gray-900" }) }) })] }) }), _jsxs("div", { className: "flex", children: [_jsx("aside", { className: "".concat(isSidebarOpen ? "w-48" : "w-20", " transition-width duration-300 ease-in-out bg-white shadow-sm min-h-screen"), children: _jsxs("nav", { className: "mt-0", children: [menuItems.map(function (item, index) { return (_jsxs(Link, { to: item.path, className: "flex items-center px-5 py-3 text-gray-700 hover:bg-blue-100 hover:text-blue-500", children: [_jsx(item.icon, { size: 28 }), isSidebarOpen && _jsx("span", { className: "ml-4", children: item.text })] }, index)); }), _jsxs("button", { onClick: handleLogout, className: "w-full flex items-center px-5 py-3 mt-12 text-red-500 hover:bg-red-100", children: [_jsx(LogOut, { size: 28 }), isSidebarOpen && _jsx("span", { className: "ml-3 font-semibold", children: "Sair" })] })] }) }), _jsx("main", { className: "flex-1 p-6", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "/dashboard", element: _jsx(PrivateRoute, { element: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/produtos", element: _jsx(PrivateRoute, { element: _jsx(ProductsPage, {}) }) }), _jsx(Route, { path: "/fornecedores", element: _jsx(PrivateRoute, { element: _jsx(FornecedoresPage, {}) }) }), _jsx(Route, { path: "/vendas", element: _jsx(PrivateRoute, { element: _jsx(VendasPage, {}) }) }), _jsx(Route, { path: "/relatorios", element: _jsx(PrivateRoute, { element: _jsx(RelatoriosPage, {}) }) }), _jsx(Route, { path: "/config", element: _jsx(PrivateRoute, { element: _jsx(SignUpPage, {}) }) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) })] }) })] })] }));
};
export default Layout;
