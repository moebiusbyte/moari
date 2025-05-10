import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { pool } from '../database';
import { resolve } from 'path';

// Função para importar dados de login a partir de um arquivo CSV
async function importLoginFromCSV(filePath: string) {
  const client = await pool.connect();
  
  try {
    console.log(`Iniciando importação do arquivo ${filePath}...`);
    
    // Criar a tabela users se ainda não existir
    await client.query(`
      CREATE TABLE IF NOT EXISTS moari.users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Configurar o parser CSV
    const parser = parse({
      columns: true, // Usar a primeira linha como cabeçalhos
      skip_empty_lines: true,
      trim: true
    });
    
    // Array para armazenar os dados lidos do CSV
    const records: any[] = [];
    
    // Configurar o stream para ler o arquivo
    const csvStream = createReadStream(resolve(filePath)).pipe(parser);
    
    // Processar os registros
    csvStream.on('data', (record) => {
      // Validar o registro antes de adicioná-lo ao array
      if (record.name && record.email && record.password) {
        records.push(record);
      } else {
        console.warn('Registro inválido encontrado (campos faltando):', record);
      }
    });
    
    // Esperar pelo fim do processo de leitura
    await new Promise<void>((resolve, reject) => {
      csvStream.on('end', () => {
        console.log(`Leitura do CSV concluída. ${records.length} registros encontrados.`);
        resolve();
      });
      
      csvStream.on('error', (error) => {
        reject(error);
      });
    });
    
    // Iniciar uma transação
    await client.query('BEGIN');
    
    // Inserir os registros no banco de dados
    for (const record of records) {
      // Verificar se o usuário já existe
      const checkResult = await client.query(
        'SELECT id FROM moari.users WHERE email = $1',
        [record.email]
      );
      
      if (checkResult.rowCount > 0) {
        console.log(`Usuário com email ${record.email} já existe. Pulando.`);
        continue;
      }
      
      // Inserir o novo usuário
      await client.query(
        'INSERT INTO moari.users (name, email, password) VALUES ($1, $2, $3)',
        [record.name, record.email, record.password]
      );
      
      console.log(`Usuário ${record.name} (${record.email}) importado com sucesso.`);
    }
    
    // Confirmar a transação
    await client.query('COMMIT');
    
    console.log('Importação concluída com sucesso!');
    
  } catch (error) {
    // Reverter a transação em caso de erro
    await client.query('ROLLBACK');
    console.error('Erro durante a importação:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Executar a função se este arquivo for chamado diretamente
if (require.main === module) {
  // Verificar se o caminho do arquivo foi fornecido
  if (process.argv.length < 3) {
    console.error('Uso: node importLogin.js <caminho-do-arquivo-csv>');
    process.exit(1);
  }
  
  const filePath = process.argv[2];
  
  importLoginFromCSV(filePath)
    .then(() => {
      console.log('Programa finalizado com sucesso.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro no programa:', error);
      process.exit(1);
    });
}

export { importLoginFromCSV };
