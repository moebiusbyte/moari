import express from "express";
import cors from "cors";
import https from "https";
import fs from "fs";
import path from "path";
import { Request, Response } from "express";

const app = express();

const corsOptions = {
  origin: [
    "https://v3rks3-5173.csb.app",
    "https://localhost:5173",
    /\.csb\.app$/,
    "http://localhost:5173",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();

  console.log("\n=== Nova Requisição ===");
  console.log("URL:", req.url);
  console.log("Método:", req.method);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));

  res.on("finish", () => {
    console.log("Status:", res.statusCode);
    console.log("Tempo:", Date.now() - start, "ms");
    console.log("=== Fim da Requisição ===\n");
  });

  next();
});

// SSL config
const options = {
  key: fs.readFileSync(path.join(__dirname, "certs", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "certs", "cert.pem")),
};

// Middleware para logging
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log("Headers:", req.headers);
  next();
});

// Rota de teste
app.get("/ping", (req: Request, res: Response) => {
  console.log("Ping recebido de:", req.headers.origin);
  res.json({ message: "pong", timestamp: new Date().toISOString() });
});

// Usuário de teste
const testUser = {
  id: 1,
  name: "Administrador",
  email: "admin@moari.com",
  password: "senha123",
};

// Rota de login
app.post("/auth/login", (req: Request, res: Response) => {
  console.log("Requisição de login recebida:", {
    body: req.body,
    origin: req.headers.origin,
  });

  const { email, password } = req.body;

  if (email === testUser.email && password === testUser.password) {
    console.log("Login bem-sucedido para:", email);

    res.json({
      token: "fake-jwt-token",
      user: {
        id: testUser.id,
        name: testUser.name,
        email: testUser.email,
      },
    });
  } else {
    console.log("Login falhou para:", email);
    res.status(401).json({
      message: "Email ou senha inválidos",
      debug: {
        receivedEmail: email,
        correctEmail: testUser.email,
      },
    });
  }
});

// Middleware de erro
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error("Erro no servidor:", err);
  res.status(500).json({
    message: "Erro interno do servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 3001;

// Inicia o servidor HTTPS
https.createServer(options, app).listen(PORT, () => {
  console.log(`Servidor HTTPS rodando em https://localhost:${PORT}`);
  console.log("Credenciais válidas:", {
    email: testUser.email,
    password: testUser.password,
  });
});
