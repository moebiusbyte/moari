import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import productsRoutes from './routes/productRoutes';
import fornecedoresRoutes from './routes/fornecedoresRoutes';
import salesRoutes from './routes/VendasRoutes'; // ← ADICIONAR ESTA LINHA
import { pool, setupDatabase } from '../database';

dotenv.config();

// Definição das constantes de configuração
const PORT = Number(process.env.PORT) || 3001;
const HOST = "0.0.0.0";

const app = express();

console.log("Inicializando servidor...");

// Configuração do CORS
app.use(
  cors({
    origin: [
      "https://v3rks3-5173.csb.app",
      "http://172.17.0.2:5173",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://192.168.241.2:5173",
      "http://192.168.16.1:5173",
      /\.csb\.app$/
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Database URL exists:", !!process.env.DATABASE_URL);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL não está definida no arquivo .env");
}

// Conexão com o banco de dados
const sql = neon(databaseUrl);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  console.error("Erro detalhado no middleware:", {
    message: err.message,
    status: err.status,
    stack: err.stack, 
    details: err
  });

  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor";
  res.status(status).json({
    error: message,
    details: process.env.NODE_ENV === "development" ? err : undefined,
  });
};

app.use(errorHandler);

// Rotas
app.use('/api', productsRoutes);
app.use('/api', fornecedoresRoutes);
app.use('/api', salesRoutes); // ← ADICIONAR ESTA LINHA

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
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("8. Inserindo usuário no banco");
    const result = await sql`
      INSERT INTO moari.users (name, email, password)
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
app.post("/auth/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error: ApiError = new Error("Email e senha são obrigatórios");
      error.status = 400;
      throw error;
    }

    const users = await sql`
      SELECT * FROM moari.users WHERE email = ${email}
    `;

    if (users.length === 0) {
      const error: ApiError = new Error("Email ou senha inválidos");
      error.status = 401;
      throw error;
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      const error: ApiError = new Error("Email ou senha inválidos");
      error.status = 401;
      throw error;
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token: "fake-jwt-token", // Implementar JWT posteriormente
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
});

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

// Rota de debug para listar todas as rotas registradas
app.get("/api/debug-routes", (req: Request, res: Response) => {
  const routes: any[] = [];
  
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      // Rotas diretas
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      // Rotas de router (como as nossas /api)
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          routes.push({
            path: `/api${handler.route.path}`,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json({ 
    message: "Rotas registradas:",
    routes: routes,
    totalRoutes: routes.length
  });
});

app._router.stack.forEach((r: any) => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods)} ${r.route.path}`);
  }
});

// Função de inicialização do servidor
async function startServer() {
  try {
    await setupDatabase();
    
    app.listen(PORT, HOST, () => {
      console.log(`Servidor rodando em http://${HOST}:${PORT}`);
      console.log('Configurações do servidor:');
      console.log(`- PORT: ${PORT}`);
      console.log(`- HOST: ${HOST}`);
      console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
      
      // Log das rotas registradas
      console.log('\n🚀 === ROTAS REGISTRADAS ===');
      app._router.stack.forEach((r: any) => {
        if (r.route && r.route.path) {
          console.log(`${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
        } else if (r.name === 'router') {
          console.log('Router middleware encontrado - verificando rotas internas...');
          r.handle.stack.forEach((handler: any) => {
            if (handler.route) {
              console.log(`${Object.keys(handler.route.methods).join(', ').toUpperCase()} /api${handler.route.path}`);
            }
          });
        }
      });
      console.log('==========================\n');
    });

  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Inicia o servidor
startServer();