const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'etropus@147258',
  server: '192.168.4.10',
  database: 'CRM_VENDAS',
  port: 1433,
  options: {
    encrypt: false,
    enableArithAbort: true,
    requestTimeout: 600000, // Tempo limite de 5 minutos (600000 ms)
    packetSize: 8192 // Tamanho do pacote de rede
  },
  connectionTimeout: 600000,
  requestTimeout: 600000,
  pool: {
    idleTimeoutMillis: 600000,
    max: 1000
  },
};

async function connectDB() {
  try {
    const pool = await sql.connect(config);
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    return pool;
  } catch (error) {z
    console.error('Erro ao conectar ao banco de dados:', error.message);
    throw error;
  }
}

module.exports = connectDB;
