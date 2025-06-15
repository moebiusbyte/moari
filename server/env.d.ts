/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly DATABASE_URL?: string;
    readonly PORT?: number;
    // Adicione outras variáveis de ambiente conforme necessário
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}