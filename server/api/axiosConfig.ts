import axios from "axios";

// Função para obter a URL base correta
const getBaseUrl = () => {
  const currentUrl = window.location.origin;
  // Se estamos no CodeSandbox, ajusta a URL
  if (currentUrl.includes("csb.app")) {
    // Substitui a porta 5173 por 3001 mantendo o mesmo domínio
    return currentUrl.replace("-5173", "-3001") + "/api";
  }
  // Caso contrário, usa o hostname atual com a porta do backend (3001)
  // Prioriza VITE_API_URL se definido
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return `${window.location.protocol}//${window.location.hostname}:3001/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000, // 10 segundos
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Importante para CORS
});

// Interceptor para logs de debug
api.interceptors.request.use((request) => {
  console.log("Request:", {
    url: request.url,
    method: request.method,
    baseURL: request.baseURL,
    headers: request.headers,
  });
  return request;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.message);
    if (error.response) {
      console.error("API Response Status:", error.response.status);
      console.error("API Response Data:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
