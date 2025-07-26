// App.tsx
import React from "react";
import { HashRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./Layout";

export default function App() {
  return (
    <div>
      <AuthProvider>
        <HashRouter>
          <Layout />
        </HashRouter>
      </AuthProvider>
    </div>
  );
}