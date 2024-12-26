class EditarVendas {
    constructor() {
        this.interface();
        this.listarVenda();
    }

    interface() {
        let pesquisa = document.querySelector("form");

        pesquisa.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o envio normal do formulário

        });

        
        document.getElementById('cpf').addEventListener('input', function (e) {
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

    async listarVenda() {
        try {
            const vendaSelecionada = JSON.parse(sessionStorage.getItem('vendaSelecionada'));
    
            if (vendaSelecionada) {
                console.log('Venda recuperada do sessionStorage:', vendaSelecionada);
                
                // Envia o id da venda via POST para a rota 'vendaCliente'
                const response = await fetch('http://192.168.20.171:3000/vendas/vendaCliente', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: vendaSelecionada.cliente_id }) // Substitua pelo campo correto de id
                });
    
                // Processa a resposta do servidor
                const result = await response.json();
                if (response.ok) {
                    console.log('Dados da venda enviados com sucesso:', result);
                    this.listarDadosForm(result,vendaSelecionada);
                } else {
                    console.error('Erro ao enviar os dados:', result.message);
                }
    
            } else {
                console.log('Nenhuma venda encontrada no sessionStorage.');
            }
    
        } catch (error) {
            console.error('Erro ao enviar a requisição:', error);
            alert('Ocorreu um erro ao tentar buscar as vendas.');
        }
    }

    listarDadosForm(result){
        const vendaSelecionada = JSON.parse(sessionStorage.getItem('vendaSelecionada'));

        console.log(vendaSelecionada.data_Status);

        document.querySelector("#cpf").value = vendaSelecionada.cpf_cliente;
        document.querySelector("#nome").value = vendaSelecionada.cliente;
        document.querySelector("#data_nascimento").value = result.cliente.data_nascimento;
        document.querySelector("#genero").value = result.cliente.genero;
        document.querySelector("#rg").value = result.cliente.rg;
        document.querySelector("#orgao_emissor").value = result.cliente.orgao_emissor;
        document.querySelector("#data_emissao").value = result.cliente.data_emissao;
        document.querySelector("#estado_civil").value = result.cliente.estado_civil;
        document.querySelector("#telefone_celular").value = result.cliente.telefone_celular;
        document.querySelector("#telefone_whatsapp").value = result.cliente.telefone_whatsapp;
        document.querySelector("#email").value = result.cliente.email;
        document.querySelector("#cep").value = result.cliente.cep;
        document.querySelector("#logradouro").value = result.cliente.logradouro;
        document.querySelector("#numero").value = result.cliente.numero;
        document.querySelector("#complemento").value = result.cliente.complemento;
        document.querySelector("#bairro").value = result.cliente.bairro;
        document.querySelector("#cidade").value = result.cliente.cidade;
        document.querySelector("#uf").value = result.cliente.uf;
        document.querySelector("#operadora").value = result.cliente.operadora;
        document.querySelector("#prod").value = result.cliente.produtos;
        document.querySelector("#metodo_pagamento").value = vendaSelecionada.metodo_pagamento;
        document.querySelector("#relato").value = result.cliente.relato;
        document.querySelector("#status_venda").value = vendaSelecionada.status;
        document.querySelector("#data_status").value = data;
        
    }
    
    
    async editarVendas(data) {
        try {
            // Verifica se `data` foi passado, senão inicializa como objeto vazio
            if (data == undefined) {
                data = {};
            }
            console.log(data);
    
            // Envia os dados para o servidor usando fetch
            const response = await fetch('http://192.168.20.171:3000/vendas/editar-vendas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            // Processa a resposta do servidor
            const result = await response.json();
            console.log(result);
        } catch (error) {
            console.error('Erro ao enviar a requisição:', error);
            alert('Ocorreu um erro ao tentar buscar as vendas.');
        }
    }
    
}

// Inicializa a classe
var editarVenda = new EditarVendas();
