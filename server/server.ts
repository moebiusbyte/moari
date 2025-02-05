import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcrypt";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL não está definida no arquivo .env");
}

console.log("Inicializando servidor...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Database URL exists:", !!process.env.DATABASE_URL);

const app = express();

// Configuração do CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// Conexão com o banco de dados
const sql = neon(databaseUrl);

// Função para criar a tabela users se não existir
async function setupDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("Banco de dados inicializado com sucesso");
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error);
  }
}

// Inicializa o banco de dados quando o servidor inicia
setupDatabase();

// Middleware para logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`\n=== ${new Date().toISOString()} ===`);
  console.log(`${req.method} ${req.url}`);
  console.log("Body:", req.body);
  next();
});

// Interface para tratamento de erros
interface ApiError extends Error {
  status?: number;
}

// Middleware de tratamento de erros
const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor";
  res.status(status).json({
    error: message,
    details: process.env.NODE_ENV === "development" ? err : undefined,
  });
};

// Rota de registro
app.post(
  "/auth/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      // Validações
      if (!name || !email || !password) {
        const error: ApiError = new Error("Todos os campos são obrigatórios");
        error.status = 400;
        throw error;
      }

      // Verificar se o usuário já existe
      const existingUser = await sql`
      SELECT email FROM users WHERE email = ${email}
    `;

      if (existingUser.length > 0) {
        const error: ApiError = new Error("Email já cadastrado");
        error.status = 400;
        throw error;
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Inserir usuário
      const result = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING id, name, email
    `;

      res.status(201).json({
        message: "Usuário registrado com sucesso",
        user: result[0],
      });
    } catch (error) {
      next(error);
    }
  }
);

// Rota de login
app.post(
  "/auth/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Validações
      if (!email || !password) {
        const error: ApiError = new Error("Email e senha são obrigatórios");
        error.status = 400;
        throw error;
      }

      // Buscar usuário
      const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

      if (users.length === 0) {
        const error: ApiError = new Error("Email ou senha inválidos");
        error.status = 401;
        throw error;
      }

      const user = users[0];

      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        const error: ApiError = new Error("Email ou senha inválidos");
        error.status = 401;
        throw error;
      }

      // Remover senha do objeto antes de enviar
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        token: "fake-jwt-token", // Implementar JWT posteriormente
        user: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Rota de teste
app.get("/ping", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({
      message: "pong",
      timestamp: result[0].now,
    });
  } catch (error) {
    next(error);
  }
});

// Adiciona o middleware de tratamento de erros
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
