import axios from "axios";
// Função para obter a URL base correta
var getBaseUrl = function () {
    var currentUrl = window.location.origin;
    var baseUrl; // Declare baseUrl here
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
        baseUrl = "".concat(window.location.protocol, "//").concat(window.location.hostname, ":3001/api");
    }
    console.log("Generated Base URL:", baseUrl);
    return baseUrl;
};
var api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 10000, // 10 segundos
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Importante para CORS
});
// Interceptor para logs de debug
api.interceptors.request.use(function (request) {
    console.log("Request:", {
        url: request.url,
        method: request.method,
        baseURL: request.baseURL,
        headers: request.headers,
    });
    return request;
});
api.interceptors.response.use(function (response) { return response; }, function (error) {
    console.error("API Error:", error.message);
    if (error.response) {
        console.error("API Response Status:", error.response.status);
        console.error("API Response Data:", error.response.data);
    }
    return Promise.reject(error);
});
var combinacoes = []; // Certifique-se de que este array esteja definido em algum lugar do seu código
var totalArquivos = 50;
var tamanhoPorArquivo = Math.ceil(combinacoes.length / totalArquivos);
for (var i = 0; i < totalArquivos; i++) {
    var inicio = i * tamanhoPorArquivo;
    var fim = inicio + tamanhoPorArquivo;
    var parte = combinacoes.slice(inicio, fim);
    var blob = new Blob([parte.join('\n')], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    // Cria um link para download automático
    var a = document.createElement('a');
    a.href = url;
    a.download = "combinacoes_parte_".concat(i + 1, ".txt");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
export default api;
