// src/components/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
} from "lucide-react";

// Componente que controla o acesso às rotas protegidas
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

// Interface para tipar a resposta da API
interface LoginResponse {
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }

  <div className="text-center mt-4">
    <button
      type="button"
      onClick={() => navigate("/signup")}
      className="text-sm text-blue-600 hover:text-blue-500">
      Inserir novo colaborador
    </button>
  </div>