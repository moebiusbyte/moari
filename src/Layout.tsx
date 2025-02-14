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
import VendasPage from "./components/VendasPage";
import ProductsPage from "./components/ProductsPage";
import FornecedoresPage from "./components/FornecedoresPage";
import RelatoriosPage from "./components/RelatoriosPage";
import SignUpPage from "./components/SignUpPage";
import Saudacao from "./components/Saudacao";
import DataAtual from "./components/DataAtual";
import FotoPerfil from "./components/FotoPerfil";

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
      <div key={card} className="p-6 bg-white rounded-lg shadow-sm">
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

//salvar FotoPerfil
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFotoPerfil(base64String);
      setPreviewUrl(base64String);
      localStorage.setItem('fotoPerfil', base64String);
    };
    reader.readAsDataURL(file);
  }
};

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
    <div className="min-h-screen bg-gray-100">
      {/* Cabeçalho da aplicação */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-1">
          <div className="flex items-center">
            {/* Botão para controlar a visibilidade da sidebar */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-lg hover:bg-red-300">{/* Alteração de fundo 3 barras*/}
              {isSidebarOpen ? <X size={36} /> : <Menu size={36} />}{/* Definição tamanho 3 barras e X ao lado Moari*/}
            </button>
            {/* Logo/Nome da aplicação */}
            <h1 className="ml-4 text-4xl font-semibold text-pink-500">MoAri</h1>
          </div>
          {/*Relogio*/}
          <div className="flex items-center">
            <DataAtual />
          </div>
          {/* Área do perfil do usuário */}
          <div className="display-flex items-center space-x-1">
            <div className="flex items-center">
              <span className="mr-4 text-lg-2 text-gray-900">{/*user.name*/}</span>
              <div className="h-13 w-39 rounded-full bg-red-400">
                <FotoPerfil />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Container principal com sidebar e conteúdo */}
      <div className="flex">
        {/* Sidebar com menu de navegação */}
        <aside
          className={`${
            isSidebarOpen ? "w-48" : "w-20"
          } transition-width duration-300 ease-in-out bg-white shadow-sm min-h-screen`}
        >
          <nav className="mt-0">
            {/* Links de navegação */}
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex items-center px-5 py-3 text-gray-700 hover:bg-blue-100 hover:text-blue-500">{/* Alteração de cor MENU*/}
                <item.icon size={28} />
                {isSidebarOpen && <span className="ml-4">{item.text}</span>}
              </Link>
            ))}
            {/* Botão de logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-5 py-3 mt-12 text-red-500 hover:bg-red-100">
              <LogOut size={28} />
              {isSidebarOpen && <span className="ml-3 font-semibold">Sair</span>}
            </button>
          </nav>
        </aside>

        {/* Área principal de conteúdo */}
        <main className="flex-1 p-6">
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
        </main>
      </div>
    </div>
  );
};

export default Layout;
