import { jsx as _jsx } from "react/jsx-runtime";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./Layout";
export default function App() {
    return (_jsx("div", { children: _jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsx(Layout, {}) }) }) }));
}
