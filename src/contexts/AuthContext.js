import { jsx as _jsx } from "react/jsx-runtime";
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children, }) => {
    const [user, setUser] = useState(null);
    // Quando o componente montar, tenta recuperar o usuário do localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            setUser,
            isAuthenticated: !!user,
            logout,
        }, children: children }));
};
// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
};
