import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ["v3rks3-5173.csb.app", ".csb.app", "localhost"],
    proxy: {
      "/api": {
        target: "http://localhost:3001", // Voltando para localhost
        changeOrigin: true,
        secure: false,
        ws: true, // Adicionando suporte a WebSocket
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
            console.log('proxy options', options);
            // Tentar reconectar em caso de erro
            if (err.code === 'ECONNREFUSED') {
              console.log('Tentando reconectar...');
            }
          });
        }
      },
    },
  },
});
