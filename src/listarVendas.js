class ListarVendas {
    constructor() {
        this.interface();
        this.listarVendas();
    }

    interface() {
        let pesquisa = document.querySelector("form");

        pesquisa.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o envio normal do formulário

            // Coleta os dados do formulário
            const formData = new FormData(event.target);
            const data = {};

            formData.forEach((value, key) => {
                data[key] = value;
            });

            this.listarVendas(data);
        });

        
        document.getElementById('cpf_cliente').addEventListener('input', function (e) {
            let cpf = e.target.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
            if (cpf.length > 9) {
                cpf = cpf.slice(0, 9) + '-' + cpf.slice(9);
            }
            if (cpf.length > 6) {
                cpf = cpf.slice(0, 6) + '.' + cpf.slice(6);
            }
            if (cpf.length > 3) {
                cpf = cpf.slice(0, 3) + '.' + cpf.slice(3);
            }
            e.target.value = cpf; // Atualiza o valor no input
        });

    }

    async listarVendas(data) {
        try {
            // Verifica se `data` foi passado, senão inicializa como objeto vazio
            if (data == undefined) {
                data = {};
            }
            console.log(data);
    
            // Envia os dados para o servidor usando fetch
            const response = await fetch('http://192.168.20.171:3000/vendas/listar-vendas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            // Processa a resposta do servidor
            const result = await response.json();
            if (response.ok) {
                const usuario = JSON.parse(sessionStorage.getItem('usuario'));
                const user = usuario.user;
    
                // Ordena as vendas em ordem decrescente pelo cliente_id
                const vendasOrdenadas = result.vendas.sort((a, b) => b.cliente_id - a.cliente_id);
    
                // Prepara o HTML para exibir as vendas
                const resultadoDiv = document.getElementById('resultado');
                let htmlContent = ''; // Acumula as linhas HTML
    
                vendasOrdenadas.forEach((venda, index) => {
                    // Lógica para exibir vendas com base no cargo
                    if (user.cargo === 'Vendedor') {
                        // Exibe apenas vendas do vendedor logado
                        if (venda.vendedor === user.usuario) {
                            htmlContent += `
                            <tr>
                                <td>${venda.cliente_id}</td>
                                <td>${venda.status}</td>
                                <td>${venda.cpf_cliente}</td>
                                <td>${venda.cliente}</td>
                                <td>${venda.data_Status}</td>
                                <td>${venda.operadora}</td>
                                <td>${venda.vendedor}</td>
                                <td>${Number(venda.valor_venda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td>${venda.metodo_pagamento}</td>
                                <td class="btn_venda" data-index="${index}">Abrir</td>
                            </tr>`;
                        }
                    } else {
                        // Exibe todas as vendas para outros cargos
                        htmlContent += `
                        <tr>
                            <td>${venda.cliente_id}</td>
                            <td>${venda.status}</td>
                            <td>${venda.cpf_cliente}</td>
                            <td>${venda.cliente}</td>
                            <td>${venda.data_Status}</td>
                            <td>${venda.operadora}</td>
                            <td>${venda.vendedor}</td>
                            <td>${Number(venda.valor_venda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            <td>${venda.metodo_pagamento}</td>
                            <td class="btn_venda" data-index="${index}">Abrir</td>
                        </tr>`;
                    }
                });
    
                // Atualiza o HTML de uma só vez
                resultadoDiv.innerHTML = htmlContent;
    
                // Adiciona evento de clique para cada botão "Abrir"
                document.querySelectorAll('.btn_venda').forEach(button => {
                    button.addEventListener('click', () => {
                        const index = button.getAttribute('data-index');
                        const venda = vendasOrdenadas[index];
                        sessionStorage.setItem('vendaSelecionada', JSON.stringify(venda));
                        console.log('Venda salva no sessionStorage:', venda);

                        window.open('venda.html', '_blank');

                    });
                });
            } else {
                alert('Erro ao buscar vendas: ' + result.message);
            }
        } catch (error) {
            console.error('Erro ao enviar a requisição:', error);
            alert('Ocorreu um erro ao tentar buscar as vendas.');
        }
    }
    
    
    
    
}

// Inicializa a classe
var listaVendas = new ListarVendas();
