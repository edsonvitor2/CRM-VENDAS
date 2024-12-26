const express = require('express');
const router = express.Router();
const db = require('./db'); // Função de conexão com pool único
const sql = require('mssql');

router.get('/usuarios', async (req, res) => {
  try {
    const pool = await db(); // Reutiliza o pool existente
    const result = await pool.request().query('SELECT * FROM usuarios');
    res.json(result.recordset);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error.message);
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    console.log(username,password);
    try {
      // Verifica se o usuário enviou os dados
      if (!username || !password) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
      }
  
      // Conectando ao banco de dados
      const pool = await db();
  
      // Consulta SQL para verificar as credenciais
      const query = `
        SELECT * FROM usuarios 
        WHERE cpf = @cpf AND senha = @senha
      `;
      const result = await pool.request()
        .input('cpf', sql.VarChar, username) // Evita injeção SQL
        .input('senha', sql.VarChar, password) // Evita injeção SQL
        .query(query);
  
      // Verifica se o usuário foi encontrado
      if (result.recordset.length > 0) {
        res.status(200).json({ message: 'Login bem-sucedido!', user: result.recordset[0] });
      } else {
        res.status(401).json({ message: 'Credenciais inválidas.' });
      }
    } catch (error) {
      console.error('Erro no login:', error.message);
      res.status(500).json({ message: 'Erro ao processar a requisição.' });
    }
  });

module.exports = router;
