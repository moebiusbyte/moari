import { pool } from '../database';

export async function setupSuppliersTable() {
  const client = await pool.connect();
  
  try {
    console.log("Iniciando setup da tabela de fornecedores...");
    
    // Criar schema (caso ainda não exista)
    await client.query('CREATE SCHEMA IF NOT EXISTS moari');
    
    // Criar tabela suppliers
    await client.query(`
      CREATE TABLE IF NOT EXISTS moari.suppliers (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        contato VARCHAR(255),
        telefone VARCHAR(100),
        email VARCHAR(255),
        cidade VARCHAR(100),
        estado VARCHAR(50),
        endereco TEXT,
        ultima_compra TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Tabela suppliers verificada/criada com sucesso");

    // Criar índices para melhorar performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_suppliers_nome ON moari.suppliers(nome)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_suppliers_cidade ON moari.suppliers(cidade)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_suppliers_estado ON moari.suppliers(estado)`);
    
    console.log("Índices da tabela suppliers verificados/criados com sucesso");
    
  } catch (error) {
    console.error("Erro durante a criação da tabela de fornecedores:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute a função se este arquivo for executado diretamente
if (require.main === module) {
  setupSuppliersTable()
    .then(() => {
      console.log("Setup da tabela de fornecedores concluído com sucesso!");
      process.exit(0);
    })
    .catch(error => {
      console.error("Erro no setup da tabela de fornecedores:", error);
      process.exit(1);
    });
}