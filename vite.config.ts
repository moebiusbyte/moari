import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.join(__dirname, "certs", "key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "certs", "cert.pem")),
      rejectUnauthorized: false,
    },
    proxy: {
      "/api": {
        target: "https://localhost:3001",
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
