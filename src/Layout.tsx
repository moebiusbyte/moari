// Layout.tsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
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
} from "lucide-react";
import VendasPage from "./components/VendasPage";

// Componente Dashboard (placeholder)
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

// Componentes placeholder para as outras páginas
const Produtos = () => <div>Página de Produtos</div>;
const Fornecedores = () => <div>Página de Fornecedores</div>;
const Relatorios = () => <div>Página de Relatórios</div>;
const Configuracoes = () => <div>Página de Configurações</div>;

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, text: "Dashboard", path: "/dashboard" },
    { icon: Package, text: "Produtos", path: "/produtos" },
    { icon: Users, text: "Fornecedores", path: "/fornecedores" },
    { icon: ShoppingCart, text: "Vendas", path: "/vendas" },
    { icon: FileText, text: "Relatórios", path: "/relatorios" },
    { icon: Settings, text: "Configurações", path: "/config" },
  ];

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-800">
                MoAri
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-600">Admin</span>
                <div className="w-8 h-8 rounded-full bg-blue-500"></div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`${
              isSidebarOpen ? "w-64" : "w-20"
            } transition-width duration-300 ease-in-out bg-white shadow-sm min-h-screen`}
          >
            <nav className="mt-4">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  <item.icon size={20} />
                  {isSidebarOpen && <span className="ml-3">{item.text}</span>}
                </Link>
              ))}
              <Link
                to="/logout"
                className="flex items-center px-4 py-3 mt-4 text-red-600 hover:bg-red-50"
              >
                <LogOut size={20} />
                {isSidebarOpen && <span className="ml-3">Sair</span>}
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/fornecedores" element={<Fornecedores />} />
              <Route path="/vendas" element={<VendasPage />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/config" element={<Configuracoes />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default Layout;
