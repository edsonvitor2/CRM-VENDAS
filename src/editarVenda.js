class EditarVendas {
    constructor() {
        this.interface();
        this.listarVenda();
    }

    interface() {
        let atualizarVenda = document.querySelector("#formulario");

        atualizarVenda.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o envio normal do formulário
            
            this.editarVendas();
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

        document.querySelector("#data_venda").value = vendaSelecionada.data_venda;
        document.querySelector("#data_agendamento").value = vendaSelecionada.data_agendamento;
        document.querySelector("#data_efetivacao").value = vendaSelecionada.data_efetivacao;

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

        const produtosSelecionados = result.cliente.produtos; // Array de produtos
        const selectElement = document.querySelector("#produtos");
        // Itera por todas as opções do select
        Array.from(selectElement.options).forEach(option => {
            // Marca como selecionado se o valor da opção estiver na lista
            option.selected = produtosSelecionados.includes(option.value);
        });

        document.querySelector("#metodo_pagamento").value = vendaSelecionada.metodo_pagamento;
        document.querySelector("#relato").value = result.cliente.relato;
        document.querySelector("#status_venda").value = vendaSelecionada.status;
        document.querySelector("#data_status").value = vendaSelecionada.data_Status;

        //sessionStorage.removeItem('vendaSelecionada');

    }
    
    async editarVendas() {
        var vendaId = 0;
        const vendaSelecionada = JSON.parse(sessionStorage.getItem('vendaSelecionada'));
        const usuario = JSON.parse(sessionStorage.getItem('usuario'));
        const vendedor = usuario.user.usuario;
    
        // Seleciona o formulário
        const form = document.getElementById('formulario');
        if (!form) {
            console.error("Formulário não encontrado!");
            return;
        }
    
        const formData = new FormData(form);
        const data = {};
    
        // Processar o FormData
        formData.forEach((value, key) => {
            if (key === "produtos[]") {
                if (!data["produtos"]) {
                    data["produtos"] = [];
                }
                data["produtos"].push(value);
            } else {
                data[key] = value;
            }
        });
    
        // Adiciona o vendedor nos dados
        data["vendedor"] = vendaSelecionada.vendedor;
    
        console.log(vendaId)
        // Adiciona o ID da venda
        data["id"] = vendaSelecionada.cliente_id;
        vendaId = vendaSelecionada.cliente_id;
        // Converte o array de produtos para uma string separada por vírgulas
        if (data["produtos"] && data["produtos"].length > 0) {
            data["produtos"] = data["produtos"].join(',');
        }
    
        console.log("Dados enviados:", data);
    
        // Enviar os dados ao servidor
        try {
            const response = await fetch(`http://192.168.20.171:3000/vendas/editar-venda/${vendaId}`, {
                method: "PUT", // Altere para PUT
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
    
            if (!response.ok) {
                throw new Error(`Erro ao editar a venda: ${response.statusText}`);
            }
    
            const responseData = await response.json();
            alert("Venda editada com sucesso!");
            window.close();

        } catch (error) {
            console.error("Erro ao editar a venda:", error);
        }
    }
    
    
}

// Inicializa a classe
var editarVenda = new EditarVendas();

const statusVendaSelect = document.getElementById('status_venda');

    // Adiciona o evento de mudança (change)
    statusVendaSelect.addEventListener('change', function () {
        
        const hoje = new Date();
        const dataISO = hoje.toISOString().split('T')[0];
        document.querySelector("#data_status").value = dataISO;

    });