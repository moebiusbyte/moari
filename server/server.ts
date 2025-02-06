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
    origin:  [
      "https://v3rks3-5173.csb.app",
      "http://172.17.0.2:5173",
      "http://localhost:5173",
      "http://192.168.241.2:5173",
      "http://192.168.16.1:5173",
      /\.csb\.app$/
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());

app.use((req, res, next) => {
  console.log('Debug - Request recebida:');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('IP do cliente:', req.ip);
  next();
});

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
app.post("/auth/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("1. Recebida requisição de registro:", {
      body: req.body,
      headers: req.headers
    });

    const { name, email, password } = req.body;

    // Validações
    if (!name || !email || !password) {
      console.log("2. Erro de validação - campos faltando:", { name: !!name, email: !!email, password: !!password });
      const error: ApiError = new Error("Todos os campos são obrigatórios");
      error.status = 400;
      throw error;
    }

    console.log("3. Verificando se usuário já existe");
    // Verificar se o usuário já existe
    const existingUser = await sql`
      SELECT email FROM users WHERE email = ${email}
    `.catch(err => {
      console.error("4. Erro ao consultar banco:", err);
      throw err;
    });

    console.log("5. Resultado da verificação:", existingUser);

    if (existingUser.length > 0) {
      console.log("6. Usuário já existe");
      const error: ApiError = new Error("Email já cadastrado");
      error.status = 400;
      throw error;
    }

    console.log("7. Gerando hash da senha");
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("8. Inserindo usuário no banco");
    // Inserir usuário
    const result = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING id, name, email
    `.catch(err => {
      console.error("9. Erro ao inserir no banco:", err);
      throw err;
    });

    console.log("10. Usuário inserido com sucesso:", result[0]);

    res.status(201).json({
      message: "Usuário registrado com sucesso",
      user: result[0],
    });
  } catch (error) {
    console.error("11. Erro no processo de registro:", error);
    next(error);
  }
});

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

const PORT = Number(process.env.PORT) || 3001;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
  console.log('Configurações do servidor:');
  console.log(`- PORT: ${PORT}`);
  console.log(`- HOST: ${HOST}`);
  console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
});
