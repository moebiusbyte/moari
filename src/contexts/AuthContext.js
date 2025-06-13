import { jsx as _jsx } from "react/jsx-runtime";
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
var AuthContext = createContext(undefined);
export var AuthProvider = function (_a) {
    var children = _a.children;
    var _b = useState(null), user = _b[0], setUser = _b[1];
    // Quando o componente montar, tenta recuperar o usuário do localStorage
    useEffect(function () {
        var storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);
    var logout = function () {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: {
            user: user,
            setUser: setUser,
            isAuthenticated: !!user,
            logout: logout,
        }, children: children }));
};
// Hook personalizado para usar o contexto de autenticação
export var useAuth = function () {
    var context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
};
