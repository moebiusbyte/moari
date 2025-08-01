import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

// Em CommonJS, __dirname já está disponível automaticamente

// ✅ CORREÇÃO: Imports para CommonJS
import productsRoutes from './routes/productRoutes';
import fornecedoresRoutes from './routes/fornecedoresRoutes';
import salesRoutes from './routes/vendasRoutes'; 
import relatoriosRoutes from './routes/relatoriosRoutes';
import { pool, setupDatabase } from './database';
import consignadosRoutes from './routes/consignadosRoutes';

// ✅ ADICIONADO: Tipagem para PKG
declare global {
  namespace NodeJS {
    interface Process {
      pkg?: any;
    }
  }
}


dotenv.config();

// Definição das constantes de configuração
const PORT = Number(process.env.PORT) || 3001;
const HOST = "0.0.0.0";

const app = express();

console.log("🚀 Inicializando servidor...");

// ✅ ADICIONADO: Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ === ERRO NÃO CAPTURADO ===');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  console.error('==============================\n');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ === PROMISE REJEITADA ===');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  console.error('============================\n');
  process.exit(1);
});

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

console.log("📋 NODE_ENV:", process.env.NODE_ENV);
console.log("📋 Database URL exists:", !!process.env.DATABASE_URL);
console.log("📋 GitHub Token exists:", !!process.env.GITHUB_TOKEN);

const databaseUrl = process.env.DATABASE_URL;
let sql: any = null;

// ✅ CORREÇÃO: Permitir inicialização sem banco em desenvolvimento
if (!databaseUrl) {
  console.warn("⚠️ DATABASE_URL não está definida - rodando sem banco de dados");
  // Criar mock do sql para desenvolvimento
  sql = () => Promise.resolve([]);
} else {
  // Conexão com o banco de dados
  sql = neon(databaseUrl);
}

// Middlewares
app.use(express.json({ limit: '10mb' })); // ✅ AUMENTADO: Para upload de imagens base64
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ ADICIONADO: Servir arquivos estáticos do frontend em produção
// Quando rodando como PKG, os arquivos estão em um diretório diferente
let distPath: string;
if (process.pkg) {
  // Rodando como PKG executável - arquivos estão no mesmo diretório do executável
  distPath = path.join(path.dirname(process.execPath), 'dist');
} else {
  // Desenvolvimento normal - subir dois níveis: server/dist -> moari2/dist
  distPath = path.join(__dirname, '..', '..', 'dist');
}

console.log('📁 Servindo arquivos estáticos de:', distPath);
console.log('🎯 NODE_ENV:', process.env.NODE_ENV);
console.log('📁 __dirname:', __dirname);
console.log('📁 process.pkg:', !!process.pkg);
console.log('📁 process.execPath:', process.execPath);
console.log('📁 Caminho completo do dist:', distPath);

// Sempre servir arquivos estáticos (independente do NODE_ENV)
app.use(express.static(distPath));

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
  console.error("❌ Erro detalhado no middleware:", {
    message: err.message,
    status: err.status,
    url: req.url,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor";
  res.status(status).json({
    error: message,
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

// ✅ CORREÇÃO: Mover errorHandler para o final
// app.use(errorHandler); // ← Movido para o final

// Rotas
console.log("📋 Registrando rotas...");

try {
  app.use('/api', productsRoutes);
  console.log("✅ Rotas de produtos registradas");
} catch (error) {
  console.error("❌ Erro ao registrar rotas de produtos:", error);
}

try{
  app.use('/api', consignadosRoutes);
  console.log("✅ Rotas de consignados registradas");
} catch (error) {
  console.error("❌ Erro ao registrar rotas de consignados:", error);
}

try {
  app.use('/api', fornecedoresRoutes);
  console.log("✅ Rotas de fornecedores registradas");
} catch (error) {
  console.error("❌ Erro ao registrar rotas de fornecedores:", error);
}

try {
  app.use('/api', salesRoutes);
  console.log("✅ Rotas de vendas registradas");
} catch (error) {
  console.error("❌ Erro ao registrar rotas de vendas:", error);
}

try {
  app.use('/api', relatoriosRoutes);
  console.log("✅ Rotas de relatórios registradas");
} catch (error) {
  console.error("❌ Erro ao registrar rotas de relatórios:", error);
}

// Rota de registro
app.post("/api/auth/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("📝 Recebida requisição de registro");

    const { name, email, password } = req.body;

    // Validações
    if (!name || !email || !password) {
      console.log("❌ Erro de validação - campos faltando");
      const error: ApiError = new Error("Todos os campos são obrigatórios");
      error.status = 400;
      throw error;
    }

    console.log("🔍 Verificando se usuário já existe");
    const existingUser = await sql`
      SELECT email FROM moari.users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      console.log("❌ Usuário já existe");
      const error: ApiError = new Error("Email já cadastrado");
      error.status = 400;
      throw error;
    }

    console.log("🔒 Gerando hash da senha");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("💾 Inserindo usuário no banco");
    const result = await sql`
      INSERT INTO moari.users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING id, name, email
    `;

    console.log("✅ Usuário registrado com sucesso");

    res.status(201).json({
      message: "Usuário registrado com sucesso",
      user: result[0],
    });
  } catch (error) {
    console.error("❌ Erro no processo de registro:", error);
    next(error);
  }
});

// Rota de login
app.post("/api/auth/login", async (req: Request, res: Response, next: NextFunction) => {
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
      server: "Maira Backend v1.0"
    });
  } catch (error) {
    next(error);
  }
});

// ✅ NOVA: Rota de health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      port: PORT,
      databaseConnected: !!process.env.DATABASE_URL
    }
  });
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
    message: "Rotas registradas",
    routes: routes,
    totalRoutes: routes.length,
    barcodeRoutes: routes.filter(r => r.path.includes('barcode'))
  });
});

// ✅ ADICIONADO: Rota catch-all para servir o frontend
app.get('*', (req: Request, res: Response) => {
  // Verificar se é uma requisição de API
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      error: "Rota da API não encontrada",
      path: req.path,
      method: req.method
    });
    return;
  }
  
  // Usar o mesmo caminho definido anteriormente
  let indexPath: string;
  if (process.pkg) {
    // Rodando como PKG executável
    indexPath = path.join(path.dirname(process.execPath), 'dist', 'index.html');
  } else {
    // Desenvolvimento normal
    indexPath = path.join(__dirname, '..', '..', 'dist', 'index.html');
  }
  
  console.log('📄 Servindo index.html para:', req.path);
  console.log('📁 Caminho do index.html:', indexPath);
  
  // Verificar se o arquivo existe
  if (fs.existsSync(indexPath)) {
    console.log('✅ Arquivo index.html encontrado');
    res.sendFile(indexPath);
  } else {
    console.log('❌ Arquivo index.html não encontrado');
    res.status(404).send('Frontend não encontrado');
  }
});

// ✅ MOVIDO: Middleware de erro no final
app.use(errorHandler);

// ✅ ADICIONADO: Rota 404 para APIs não encontradas
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    error: "Rota não encontrada",
    path: req.path,
    method: req.method,
    suggestion: "Verifique se a rota está correta ou acesse /api/debug-routes para ver todas as rotas disponíveis"
  });
});

// Função de inicialização do servidor
async function startServer() {
  try {
    console.log("🔧 Configurando banco de dados...");
    await setupDatabase();
    console.log("✅ Banco de dados configurado");
    
    const server = app.listen(PORT, HOST, () => {
      console.log(`\n🚀 === SERVIDOR INICIADO ===`);
      console.log(`📍 URL: http://${HOST}:${PORT}`);
      console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: ${process.env.DATABASE_URL ? 'CONECTADO' : 'NÃO CONFIGURADO'}`);
      console.log(`🔑 GitHub Token: ${process.env.GITHUB_TOKEN ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}`);
      console.log(`==============================\n`);
      
      // Log das rotas de código de barras
      console.log('📊 === ROTAS DE CÓDIGO DE BARRAS ===');
      console.log('GET  /api/setup-barcode-table');
      console.log('GET  /api/search-by-barcode/:barcode');
      console.log('POST /api/products/:id/generate-barcode');
      console.log('GET  /api/products/:id/barcodes');
      console.log('GET  /api/barcode-stats');
      console.log('DEL  /api/barcodes/:barcodeId');
      console.log('===================================\n');
    });

    // ✅ ADICIONADO: Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM recebido, encerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor encerrado');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT recebido, encerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor encerrado');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Inicia o servidor
startServer().catch((error) => {
  console.error('❌ Erro fatal ao iniciar servidor:', error);
  process.exit(1);
});

export default app;