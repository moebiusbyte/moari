import axios from "axios";

// Função para obter a URL base correta
const getBaseUrl = () => {
  const currentUrl = window.location.origin;
  let baseUrl; // Declare baseUrl here

  // Se estamos no CodeSandbox, ajusta a URL
  if (currentUrl.includes("csb.app")) {
    baseUrl = currentUrl.replace("-5173", "-3001") + "/api";
  }
  // Caso contrário, usa o hostname atual com a porta do backend (3001)
  // Prioriza VITE_API_URL se definido
  else if (import.meta.env.VITE_API_URL) {
    baseUrl = import.meta.env.VITE_API_URL;
  }
  else {
    baseUrl = `${window.location.protocol}//${window.location.hostname}:3001/api`;
  }

  console.log("Generated Base URL:", baseUrl);
  return baseUrl;
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

// Supondo que combinacoes seja um array com todas as combinações (ex: ["01 02 03 04 05 06", ...])
interface CombinacaoList {
  combinacoes: string[];
}

const combinacoes: string[] = []; // Certifique-se de que este array esteja definido em algum lugar do seu código
const totalArquivos = 50;
const tamanhoPorArquivo = Math.ceil(combinacoes.length / totalArquivos);

for (let i = 0; i < totalArquivos; i++) {
  const inicio = i * tamanhoPorArquivo;
  const fim = inicio + tamanhoPorArquivo;
  const parte = combinacoes.slice(inicio, fim);
  const blob = new Blob([parte.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  // Cria um link para download automático
  const a = document.createElement('a');
  a.href = url;
  a.download = `combinacoes_parte_${i + 1}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default api;
