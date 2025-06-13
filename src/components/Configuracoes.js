import { jsx as _jsx } from "react/jsx-runtime";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, useNavigate, } from "react-router-dom";
// Componente que controla o acesso às rotas protegidas
const PrivateRoute = ({ element, }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? element : _jsx(Navigate, { to: "/login", replace: true });
};
const navigate = useNavigate();
_jsx("div", { className: "text-center mt-4", children: _jsx("button", { type: "button", onClick: () => navigate("/signup"), className: "text-sm text-blue-600 hover:text-blue-500", children: "Inserir novo colaborador" }) });
