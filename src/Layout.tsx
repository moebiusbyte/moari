// Layout.tsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Image,
  Camera
} from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./components/LoginPage";
import VendasPage from "./components/Vendas/VendasPage";
import ProductsPage from "./components/Produtos/ProductsPage";
import FornecedoresPage from "./components/Fornecedores/FornecedoresPage";
import SignUpPage from "./components/SignUpPage";
import DataAtual from "./components/DataAtual";
import RelatoriosPage from "./components/Relatorio/RelatoriosPage";

// Componente que controla o acesso às rotas protegidas
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

// Componente Dashboard
const Dashboard = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((card) => (
      <div key={card} className="dashboard-card fade-in">
        <h3 className="text-lg font-semibold mb-2">Card {card}</h3>
        <p className="text-gray-600">
          Conteúdo exemplo para demonstração do layout
        </p>
      </div>
    ))}
  </div>
);

// Componentes das páginas
const Configuracoes = () => <div>Página de Configurações</div>;

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
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Layout principal da aplicação (mostrado apenas para usuários autenticados)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho da aplicação */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center">
            {/* Botão para controlar a visibilidade da sidebar */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {/* Logo/Nome da aplicação */}
            <h1 className="ml-4 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              MoAri
            </h1>
          </div>
          
          {/* Relógio */}
          <div className="flex items-center">
            <DataAtual />
          </div>
          
          {/* Área do perfil do usuário */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-gray-700 font-medium">{user?.name || "Usuário"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Container principal com sidebar e conteúdo */}
      <div className="flex">
        {/* Sidebar com menu de navegação */}
        <aside
          className={`${
            isSidebarOpen ? "w-64" : "w-16"
          } transition-all duration-300 ease-in-out bg-white shadow-lg min-h-screen border-r border-gray-200`}
        >
          <nav className="mt-4">
            {/* Links de navegação */}
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="sidebar-link">
                <item.icon size={20} />
                {isSidebarOpen && <span className="ml-3 font-medium">{item.text}</span>}
              </Link>
            ))}
            
            {/* Botão de logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-6 py-3 mt-8 text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-lg mx-2">
              <LogOut size={20} />
              {isSidebarOpen && <span className="ml-3 font-semibold">Sair</span>}
            </button>
          </nav>
        </aside>

        {/* Área principal de conteúdo */}
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Routes>
              {/* Rota padrão redireciona para o dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Rotas protegidas da aplicação */}
              <Route
                path="/dashboard"
                element={<PrivateRoute element={<Dashboard />} />}/>
              <Route
                path="/produtos"
                element={<PrivateRoute element={<ProductsPage />} />}/>
              <Route
                path="/fornecedores"
                element={<PrivateRoute element={<FornecedoresPage />} />}/>
              <Route
                path="/vendas"
                element={<PrivateRoute element={<VendasPage />} />}/>
              <Route
                path="/relatorios"
                element={<PrivateRoute element={<RelatoriosPage />} />}/>
              <Route
                path="/config"
                element={<PrivateRoute element={<SignUpPage />} />}/>

              {/* Rota de login */}
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;