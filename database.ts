import { neon, neonConfig } from '@neondatabase/serverless';
import WebSocket from 'isomorphic-ws';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configuração do WebSocket
neonConfig.webSocketConstructor = WebSocket;
// Forçar o uso de WSS (WebSocket Secure)
neonConfig.useSecureWebSocket = true;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não está definida');
}

// Criar conexão usando neon com retry manual
async function createNeonConnection() {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    try {
      console.log(`Tentativa ${attempts + 1} de conectar ao banco de dados...`);
      const connection = neon(process.env.DATABASE_URL!);
      // Teste a conexão
      await connection`SELECT 1 as test`;
      console.log("Conexão estabelecida com sucesso!");
      return connection;
    } catch (error) {
      attempts++;
      console.error(`Tentativa ${attempts} falhou:`, error);
      if (attempts === maxAttempts) {
        console.error('Todas as tentativas de conexão falharam');
        throw error;
      }
      // Espera um pouco antes de tentar novamente (tempo aumenta a cada tentativa)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }
  throw new Error('Não foi possível estabelecer conexão com o banco de dados');
}

// Inicializa a conexão com o valor padrão
let sql = neon(process.env.DATABASE_URL);

// Função para inicializar a conexão com retry
export async function initializeDatabase() {
  try {
    sql = await createNeonConnection();
  } catch (error) {
    console.error("Erro ao inicializar conexão com o banco:", error);
    throw error;
  }
}

export async function setupDatabase() {
  try {
    console.log("Iniciando setup do banco de dados...");
    
    // Inicializa a conexão com retry
    await initializeDatabase();

    // Criar schema
    await sql`CREATE SCHEMA IF NOT EXISTS moari`;
    console.log("Schema verificado/criado com sucesso");

    // Criar tabela users
    await sql`
      CREATE TABLE IF NOT EXISTS moari.users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`;
    console.log("Tabela users verificada/criada com sucesso");

    // Criar tabela products
    await sql`
      CREATE TABLE IF NOT EXISTS moari.products (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        format VARCHAR(100),
        quality VARCHAR(50),
        material_type VARCHAR(100),
        usage_mode VARCHAR(255),
        size VARCHAR(50),
        origin VARCHAR(100),
        warranty VARCHAR(255),
        base_price DECIMAL(10,2) NOT NULL,
        profit_margin DECIMAL(5,2),
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`;
    console.log("Tabela products verificada/criada com sucesso");

    // Criar tabela product_materials
    await sql`
      CREATE TABLE IF NOT EXISTS moari.product_materials (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES moari.products(id) ON DELETE CASCADE,
        material_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`;
    console.log("Tabela product_materials verificada/criada com sucesso");

    // Criar tabela product_images
    await sql`
      CREATE TABLE IF NOT EXISTS moari.product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES moari.products(id) ON DELETE CASCADE,
        image_url VARCHAR(500) NOT NULL,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`;
    console.log("Tabela product_images verificada/criada com sucesso");

    // Criar índices
    await sql`CREATE INDEX IF NOT EXISTS idx_products_code ON moari.products(code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON moari.products(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_status ON moari.products(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_materials_product_id ON moari.product_materials(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON moari.product_images(product_id)`;
    console.log("Índices verificados/criados com sucesso");

    // Criar função para atualizar updated_at
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'`;

    // Criar trigger para updated_at
    await sql`DROP TRIGGER IF EXISTS update_products_updated_at ON moari.products`;
    await sql`
      CREATE TRIGGER update_products_updated_at
          BEFORE UPDATE ON moari.products
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()`;
    console.log("Função e trigger para updated_at criados com sucesso");

    // Criar função para validação de preço
    await sql`
      CREATE OR REPLACE FUNCTION validate_product_price()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.base_price <= 0 THEN
              RAISE EXCEPTION 'O preço base deve ser maior que zero';
          END IF;
          
          IF NEW.profit_margin < 0 THEN
              RAISE EXCEPTION 'A margem de lucro não pode ser negativa';
          END IF;
          
          RETURN NEW;
      END;
      $$ language 'plpgsql'`;

    // Criar trigger para validação de preço
    await sql`DROP TRIGGER IF EXISTS validate_product_price_trigger ON moari.products`;
    await sql`
      CREATE TRIGGER validate_product_price_trigger
          BEFORE INSERT OR UPDATE ON moari.products
          FOR EACH ROW
          EXECUTE FUNCTION validate_product_price()`;
    console.log("Função e trigger para validação de preços criados com sucesso");

    console.log("Setup do banco de dados concluído com sucesso!");
  } catch (error) {
    console.error("Erro durante o setup do banco de dados:", error);
    throw error;
  }
}

// Função auxiliar para queries com retry
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const res = await sql(text, params);
      const duration = Date.now() - start;
      console.log('Query executada:', { text, duration, rows: res.length });
      return res;
    } catch (error) {
      attempts++;
      console.error(`Tentativa ${attempts} falhou:`, error);
      if (attempts === maxAttempts) {
        console.error('Erro na execução da query após todas as tentativas:', error);
        throw error;
      }
      // Espera um pouco antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }
}

export { sql };