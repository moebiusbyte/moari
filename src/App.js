import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./Layout";
//import DataAtual from ",/DataAtual.tsx"
export default function App() {
    return (_jsxs("div", { children: [_jsx("div", { className: "bg-red-500 p-8 text-white text-center text-xl font-bold", children: "\uD83C\uDF89 TESTE TAILWIND \uD83C\uDF89" }), _jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsx(Layout, {}) }) })] }));
}
