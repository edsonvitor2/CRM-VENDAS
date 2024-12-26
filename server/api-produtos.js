const express = require('express');
const sql = require('mssql');
const router = express.Router();
const db = require('./db'); // Importa a função de conexão com o banco de dados


router.get('/usuarios', async (req, res) => {
    try {
        // Conecta ao banco especificado
        const pool = await connectOutroBanco();
        
        // Início da consulta SQL
        let query = `
            SELECT * FROM usuarios
        `;
        
        // Executa a consulta SQL
        const result = await pool.request().query(query);
        res.status(200).json({ message: 'Usuarios Obtidos Com Sucesso!.' });
        res.json(result.recordset);
    } catch (error) {
        console.error('Erro ao buscar uduarios:', error.message);
        res.status(500).json({ message: 'Erro ao buscar uduarios.' });
    }
  });

module.exports = router;
