import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "localhost",
      "v3rks3-5173.csb.app",
      ".csb.app", // Isso permitirá todos os subdomínios do csb.app
    ],
  },
});
