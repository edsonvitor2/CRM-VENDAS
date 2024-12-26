const express = require('express');
const sql = require('mssql');
const router = express.Router();
const db = require('./db'); // Importa a função de conexão com o banco de dados

router.get('/usuarios', async (req, res) => {
    try {
        // Conecta ao banco especificado
        const pool = await db();
        
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


router.post('/listar-vendas', async (req, res) => {
    try {
        // Recebe os parâmetros de filtro do corpo da requisição
        const {
            nome_cliente,
            data_status_inicio,
            data_status_fim,
            data_efetivacao_inicio,
            data_efetivacao_fim,
            data_venda_inicio,
            data_venda_fim,
            data_agendamento_inicio,
            data_agendamento_fim,
            vendedor,
            cpf_cliente,
            operadora,
            quantidade // Limite de vendas a retornar
        } = req.body;

        // Conecta ao banco especificado
        const pool = await db();

        // Início da construção da consulta SQL com filtros
        let query = `SELECT * FROM Venda WHERE 1=1`;

        // Filtro por nome do cliente
        if (nome_cliente) {
            query += ` AND cliente LIKE @cliente`;
        }

        // Filtro por data_status
        if (data_status_inicio && data_status_fim) {
            query += ` AND data_status BETWEEN @data_status_inicio AND @data_status_fim`;
        }

        // Filtro por data_efetivacao
        if (data_efetivacao_inicio && data_efetivacao_fim) {
            query += ` AND data_efetivacao BETWEEN @data_efetivacao_inicio AND @data_efetivacao_fim`;
        }

        // Filtro por data_venda
        if (data_venda_inicio && data_venda_fim) {
            query += ` AND data_venda BETWEEN @data_venda_inicio AND @data_venda_fim`;
        }

        // Filtro por data_agendamento
        if (data_agendamento_inicio && data_agendamento_fim) {
            query += ` AND data_agendamento BETWEEN @data_agendamento_inicio AND @data_agendamento_fim`;
        }

        // Filtro por vendedor
        if (vendedor) {
            query += ` AND vendedor LIKE @vendedor`;
        }

        // Filtro por cpf_cliente
        if (cpf_cliente) {
            query += ` AND cpf_cliente = @cpf_cliente`;
        }

        // Filtro por operadora
        if (operadora) {
            query += ` AND operadora LIKE @operadora`;
        }

        // Limite de resultados (quantidade)
        if (quantidade) {
            query += ` TOP (@quantidade) `;
        }

        // Executa a consulta SQL com os filtros aplicados
        const request = pool.request();

        // Adiciona os parâmetros à consulta, se fornecidos
        if (nome_cliente) {
            request.input('cliente', sql.NVarChar, `%${nome_cliente}%`); // Usando LIKE para filtro parcial
        }
        if (data_status_inicio && data_status_fim) {
            request.input('data_status_inicio', sql.Date, data_status_inicio);
            request.input('data_status_fim', sql.Date, data_status_fim);
        }
        if (data_efetivacao_inicio && data_efetivacao_fim) {
            request.input('data_efetivacao_inicio', sql.Date, data_efetivacao_inicio);
            request.input('data_efetivacao_fim', sql.Date, data_efetivacao_fim);
        }
        if (data_venda_inicio && data_venda_fim) {
            request.input('data_venda_inicio', sql.Date, data_venda_inicio);
            request.input('data_venda_fim', sql.Date, data_venda_fim);
        }
        if (data_agendamento_inicio && data_agendamento_fim) {
            request.input('data_agendamento_inicio', sql.Date, data_agendamento_inicio);
            request.input('data_agendamento_fim', sql.Date, data_agendamento_fim);
        }
        if (vendedor) {
            request.input('vendedor', sql.NVarChar, `%${vendedor}%`);
        }
        if (cpf_cliente) {
            request.input('cpf_cliente', sql.NVarChar, cpf_cliente);
        }
        if (operadora) {
            request.input('operadora', sql.NVarChar, `%${operadora}%`);
        }
        if (quantidade) {
            request.input('quantidade', sql.Int, quantidade);
        }

        // Executa a consulta com os parâmetros
        const result = await request.query(query);

        // Retorna os resultados
        res.status(200).json({ message: 'Vendas encontradas com sucesso!', vendas: result.recordset });
    } catch (error) {
        console.error('Erro ao buscar vendas:', error.message);
        res.status(500).json({ message: 'Erro ao buscar vendas.' });
    }
});

router.post('/cadastrar-venda', async (req, res) => {
    const agora = new Date();
    let data = agora.toLocaleDateString();
    let hora = agora.toLocaleTimeString();

    const {
        bairro,
        cep,
        cidade,
        complemento,
        cpf,
        data_emissao,
        data_nascimento,
        email,
        estado_civil,
        genero,
        logradouro,
        metodo_pagamento,
        nome,
        numero,
        orgao_emissor,
        produtos,
        relato,
        rg,
        telefone_celular,
        telefone_whatsapp,
        uf,
        criado_em = `${data + '-' + hora}`,
        operadora,
        vendedor // Recebe o vendedor
    } = req.body;

    // Logando os dados recebidos
    console.log('Dados recebidos:', {
        bairro, cep, cidade, complemento, cpf, data_emissao, data_nascimento, email, estado_civil, genero,
        logradouro, metodo_pagamento, nome, numero, orgao_emissor, produtos, relato, rg, telefone_celular,
        telefone_whatsapp, uf, criado_em, operadora, vendedor
    });

    const pool = await db(); // Conecte-se ao banco de dados

    try {
        // Query de inserção do cliente
        const queryCliente = `
            INSERT INTO clientes (
                bairro, cep, cidade, complemento, cpf, data_emissao, 
                data_nascimento, email, estado_civil, genero, logradouro, 
                metodo_pagamento, nome, numero, orgao_emissor, produtos, 
                relato, rg, telefone_celular, telefone_whatsapp, uf, criado_em, operadora
            ) 
            OUTPUT INSERTED.id AS clienteId
            VALUES (
                @bairro, @cep, @cidade, @complemento, @cpf, @data_emissao, 
                @data_nascimento, @email, @estado_civil, @genero, @logradouro, 
                @metodo_pagamento, @nome, @numero, @orgao_emissor, @produtos, 
                @relato, @rg, @telefone_celular, @telefone_whatsapp, @uf, @criado_em, @operadora
            );
        `;

        const resultCliente = await pool.request()
            .input('bairro', sql.NVarChar, bairro)
            .input('cep', sql.NVarChar, cep)
            .input('cidade', sql.NVarChar, cidade)
            .input('complemento', sql.NVarChar, complemento)
            .input('cpf', sql.NVarChar, cpf)
            .input('data_emissao', sql.NVarChar, data_emissao)
            .input('data_nascimento', sql.NVarChar, data_nascimento)
            .input('email', sql.NVarChar, email)
            .input('estado_civil', sql.NVarChar, estado_civil)
            .input('genero', sql.NVarChar, genero)
            .input('logradouro', sql.NVarChar, logradouro)
            .input('metodo_pagamento', sql.NVarChar, metodo_pagamento)
            .input('nome', sql.NVarChar, nome)
            .input('numero', sql.NVarChar, numero)
            .input('orgao_emissor', sql.NVarChar, orgao_emissor)
            .input('produtos', sql.NVarChar, produtos)
            .input('relato', sql.NVarChar, relato)
            .input('rg', sql.NVarChar, rg)
            .input('telefone_celular', sql.NVarChar, telefone_celular)
            .input('telefone_whatsapp', sql.NVarChar, telefone_whatsapp)
            .input('uf', sql.NVarChar, uf)
            .input('criado_em', sql.NVarChar, criado_em)
            .input('operadora', sql.NVarChar, operadora)
            .query(queryCliente);

        console.log('Resultado da inserção do cliente:', resultCliente);

        // Agora acessando corretamente o ID retornado pela cláusula OUTPUT
        const clienteId = resultCliente.recordset.length > 0 ? resultCliente.recordset[0].clienteId : null;
        console.log('Cliente ID:', clienteId);

        if (!clienteId) {
            console.error('Erro: ID do cliente não encontrado.');
            return res.status(400).json({ message: 'Erro ao obter o ID do cliente.' });
        }

        console.log('produtos:', produtos);

        if (produtos) {
            listaProdutos = produtos.split(','); // Converte a string em um array
            console.log('Lista de produtos:', listaProdutos); // Verifique o conteúdo do array de produtos
        }

        // Verificar se a lista de produtos foi corretamente criada
        if (!listaProdutos || listaProdutos.length === 0) {
            console.error('Erro: produtos não foram fornecidos ou estão vazios.');
            return res.status(400).json({ message: 'Produtos não fornecidos ou inválidos.' });
        }

        // Buscar os preços dos produtos na tabela
        const queryProdutos = `
            SELECT nome, preco 
            FROM produtos 
            WHERE nome IN (${listaProdutos.map(p => `'${p}'`).join(',')})
        `;

        const resultProdutos = await pool.request().query(queryProdutos);
        console.log('Produtos encontrados:', resultProdutos.recordset);

        // Calcular o valor total da venda
        let valorVenda = 0;
        resultProdutos.recordset.forEach(produto => {
            valorVenda += produto.preco;
        });

        console.log('Valor total da venda:', valorVenda);

        // Definir valor de comissão (exemplo: 10% do valor total)
        const valorComissao = valorVenda * 0.1;

        // Query de inserção da venda
        const queryVenda = `
            INSERT INTO Venda (
                status, cpf_cliente, cliente, cliente_id, data_status, vendedor, 
                operadora, produtos, valor_venda, valor_comissao, metodo_pagamento
            ) VALUES (
                'pre-venda', @cpf_cliente, @cliente, @cliente_id, @data_status, @vendedor, 
                @operadora, @produtos, @valor_venda, @valor_comissao, @metodo_pagamento
            );
        `;

        // Insere a venda
        await pool.request()
            .input('cpf_cliente', sql.NVarChar, cpf)
            .input('cliente', sql.NVarChar, nome)
            .input('cliente_id', sql.Int, clienteId)
            .input('data_status', sql.NVarChar, `${data} ${hora}`)
            .input('vendedor', sql.NVarChar, vendedor)
            .input('operadora', sql.NVarChar, operadora)
            .input('produtos', sql.NVarChar, produtos)
            .input('valor_venda', sql.Float, valorVenda)
            .input('valor_comissao', sql.Float, valorComissao)
            .input('metodo_pagamento', sql.NVarChar, metodo_pagamento)
            .query(queryVenda);

        // Resposta de sucesso
        res.status(201).json({ message: 'Venda e cliente cadastrados com sucesso!' });
    } catch (error) {
        console.error('Erro ao inserir os dados:', error.message);
        res.status(500).json({ message: 'Erro ao processar os dados.' });
    } finally {
        // Fecha a conexão com o banco de dados
        await sql.close();
    }
});
router.post('/vendaCliente', async (req, res) => {
    let pool;
    try {
        const { id } = req.body; // Recebe o ID enviado no corpo da requisição

        if (!id) {
            return res.status(400).json({ message: 'ID do cliente não fornecido.' });
        }

        // Estabelece conexão com o banco de dados
        pool = await db();

        // Consulta SQL para obter o cliente com base no ID
        const query = 'SELECT * FROM clientes WHERE id = @id';

        // Configura e executa a consulta
        const result = await pool.request()
            .input('id', sql.Int, id) // Define o parâmetro id
            .query(query);

        // Verifica se o cliente foi encontrado
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }

        // Responde com os dados do cliente encontrado
        res.status(200).json({ cliente: result.recordset[0] });

    } catch (error) {
        console.error('Erro ao consultar cliente:', error.message);
        res.status(500).json({ message: 'Erro ao processar os dados.' });
    } finally {
        // Fecha a conexão com o banco de dados, se criada
        if (pool) {
            await pool.close();
        }
    }
});



module.exports = router;


