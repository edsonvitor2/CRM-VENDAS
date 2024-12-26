const express = require('express');
const cors = require('cors');
const app = express();

const apiUsuarios = require('./api-usuarios'); // Importa as rotas da API
const apiProdutos = require('./api-produtos'); // Importa as rotas da API
const apiVendas = require('./api-vendas'); // Importa as rotas da API

const connectDB = require('./db'); // Importa a função de conexão com o banco de dados
const bodyParser = require('body-parser');
const PORT = 3000;

// Conectando ao banco de dados
connectDB();

// Middleware para parsear JSON
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// Middleware CORS
app.use(cors());

// Rota principal
app.get('/', (req, res) => {
  res.send('Bem-vindo à API de Clientes!');
});

// Usar as rotas da API
app.use('/usuarios', apiUsuarios);
app.use('/produtos', apiProdutos);
app.use('/vendas', apiVendas);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
