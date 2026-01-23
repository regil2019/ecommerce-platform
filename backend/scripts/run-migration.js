import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar configuração do banco
const configPath = path.join(__dirname, '../config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Usar configuração de produção se disponível, senão desenvolvimento
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env] || config.development;

console.log(`🔄 Executando migrações no ambiente: ${env}`);
console.log(`📊 Banco: ${dbConfig.database} em ${dbConfig.host}:${dbConfig.port}`);

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: console.log
  }
);

async function runMigrations() {
  try {
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');

    // Executar migração específica para corrigir parent_id
    console.log('🔧 Executando migração: fix-parent-id-column');

    await sequelize.query(`
      ALTER TABLE categories
      CHANGE parentId parent_id INTEGER NULL;
    `);

    console.log('✅ Migração executada com sucesso!');

    // Verificar se a coluna foi alterada
    const [results] = await sequelize.query(`
      DESCRIBE categories;
    `);

    const parentIdColumn = results.find(col => col.Field === 'parent_id');
    if (parentIdColumn) {
      console.log('✅ Coluna parent_id criada corretamente');
    } else {
      console.log('❌ Coluna parent_id não encontrada');
    }

  } catch (error) {
    console.error('❌ Erro ao executar migração:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigrations();