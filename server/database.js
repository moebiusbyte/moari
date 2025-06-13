import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;
dotenv.config();
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não está definida');
}
// Criar pool de conexões
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // necessário para Neon DB
    },
    max: 5, // máximo de conexões no pool
    idleTimeoutMillis: 30000 // tempo máximo que uma conexão pode ficar ociosa
});
// Evento para logs de erro
pool.on('error', (err) => {
    console.error('Erro inesperado no pool de conexões:', err);
});
export async function setupDatabase() {
    try {
        console.log("Iniciando setup do banco de dados...");
        // Testar conexão
        const client = await pool.connect();
        try {
            console.log("Conexão estabelecida com sucesso!");
            // Criar schema
            await client.query('CREATE SCHEMA IF NOT EXISTS moari');
            console.log("Schema verificado/criado com sucesso");
            // Criar tabela users
            await client.query(`
        CREATE TABLE IF NOT EXISTS moari.users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`);
            console.log("Tabela users verificada/criada com sucesso");
            // Criar tabela products
            await client.query(`
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
      )`);
            console.log("Tabela products verificada/criada com sucesso");
            // Criar tabela product_materials
            await client.query(`
      CREATE TABLE IF NOT EXISTS moari.product_materials (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES moari.products(id) ON DELETE CASCADE,
        material_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`);
            console.log("Tabela product_materials verificada/criada com sucesso");
            // Criar tabela product_images
            await client.query(`
      CREATE TABLE IF NOT EXISTS moari.product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES moari.products(id) ON DELETE CASCADE,
        image_url VARCHAR(500) NOT NULL,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`);
            console.log("Tabela product_images verificada/criada com sucesso");
            // Criar índices
            await client.query(`CREATE INDEX IF NOT EXISTS idx_products_code ON moari.products(code)`);
            await client.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON moari.products(category)`);
            await client.query(`CREATE INDEX IF NOT EXISTS idx_products_status ON moari.products(status)`);
            await client.query(`CREATE INDEX IF NOT EXISTS idx_product_materials_product_id ON moari.product_materials(product_id)`);
            await client.query(`CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON moari.product_images(product_id)`);
            console.log("Índices verificados/criados com sucesso");
            // Criar função para atualizar updated_at
            await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'`);
            // Criar trigger para updated_at
            await client.query(`DROP TRIGGER IF EXISTS update_products_updated_at ON moari.products`);
            await client.query(`
      CREATE TRIGGER update_products_updated_at
          BEFORE UPDATE ON moari.products
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()`);
            console.log("Função e trigger para updated_at criados com sucesso");
            // Criar função para validação de preço
            await client.query(`
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
      $$ language 'plpgsql'`);
            // Criar trigger para validação de preço
            await client.query(`DROP TRIGGER IF EXISTS validate_product_price_trigger ON moari.products`);
            await client.query(`
      CREATE TRIGGER validate_product_price_trigger
          BEFORE INSERT OR UPDATE ON moari.products
          FOR EACH ROW
          EXECUTE FUNCTION validate_product_price()`);
            console.log("Função e trigger para validação de preços criados com sucesso");
        }
        finally {
            client.release();
        }
        console.log("Setup do banco de dados concluído com sucesso!");
    }
    catch (error) {
        console.error("Erro durante o setup do banco de dados:", error);
        throw error;
    }
}
// Função auxiliar para queries com retry
export async function query(text, params) {
    const start = Date.now();
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
        const client = await pool.connect();
        try {
            const res = await client.query(text, params);
            const duration = Date.now() - start;
            console.log('Query executada:', { text, duration, rows: res.rowCount });
            return res.rows;
        }
        catch (error) {
            attempts++;
            console.error(`Tentativa ${attempts} falhou:`, error);
            if (attempts === maxAttempts) {
                console.error('Erro na execução da query após todas as tentativas:', error);
                throw error;
            }
            // Espera um pouco antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
        finally {
            client.release();
        }
    }
}
export { pool };
