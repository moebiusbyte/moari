import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
  
export default defineConfig({
  plugins: [react()],
  base: "./", // Importante para Electron
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Adiciona as flags do React Router para resolver os warnings
    __REACT_ROUTER_FUTURE_FLAGS__: JSON.stringify({
      v7_startTransition: true,
      v7_relativeSplatPath: true
    })
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  },
  server: {
    host: true,
    allowedHosts: ["v3rks3-5173.csb.app", ".csb.app", "localhost", "127.0.0.1"],
    proxy: {
      "/api": {
        target: "http://localhost:3001", // Voltando para localhost
        changeOrigin: true,
        secure: false,
        ws: true, // Adicionando suporte a WebSocket
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.log("proxy error", err);
            console.log("proxy options", options);
            // Tentar reconectar em caso de erro
            if (err.code === "ECONNREFUSED") {
              console.log("Tentando reconectar...");
            }
          });
        },
      },
    },
  },
});