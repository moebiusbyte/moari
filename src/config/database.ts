// src/config/database.ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:************@ep-red-dawn-a55csj1y-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
});

// Função para testar a conexão
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Conexão com banco de dados estabelecida com sucesso!");
    client.release();
    return true;
  } catch (error) {
    console.error("Erro ao conectar com banco de dados:", error);
    return false;
  }
};

export default pool;
