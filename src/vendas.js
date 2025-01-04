class Vendas {
    constructor() {
        this.interface();
        this.verificarLogado();
    }

    verificarLogado() {
        const usuario = JSON.parse(sessionStorage.getItem('usuario'));
        // Verifica se há um usuário logado
        if (!usuario || !usuario.user) {
            // Redireciona para a página index.html
            window.location.href = 'index.html';
        }else{
            document.querySelector(".username").innerHTML = usuario.user.usuario;
        }
    }

    interface() {
            // Atualiza o nome do usuário no HTML, se necessário
            

        let formulario = document.querySelector("form");
        let cepInput = document.querySelector("#cep");

        const usuario = JSON.parse(sessionStorage.getItem('usuario'));
        const operadora = usuario.user.operadora;

        const usuarioNomeDiv = document.querySelector('.username');
        
        if (usuarioNomeDiv) {
            usuarioNomeDiv.textContent = `${usuario.user.usuario}`; // Supondo que o servidor retorne um campo "usuario"
        }

        document.querySelector("#operadora").value = operadora;

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

        // Evento de submit do formulário
        formulario.addEventListener("submit", (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário

            this.cadastrarVenda();
        });

        // Evento de keyup no campo CEP
        cepInput.addEventListener("keyup", async (event) => {
            let cep = event.target.value;

            if (cep.length === 8) { // Verifica se o CEP tem 8 caracteres
                const endereco = await this.obterEnderecoCep(cep);

                if (endereco) {
                    console.log("Endereço encontrado:", endereco);
                    // Preenche os campos de endereço automaticamente (exemplo)
                    document.querySelector("#logradouro").value = endereco.logradouro || "";
                    document.querySelector("#bairro").value = endereco.bairro || "";
                    document.querySelector("#cidade").value = endereco.localidade || "";
                    document.querySelector("#uf").value = endereco.uf || "";
                    document.querySelector("#complemento").value = endereco.complemento || "";
                } else {
                    console.log("CEP inválido ou não encontrado.");
                }
            }
        });
    }

    async obterEnderecoCep(cep) {
        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const dados = await resposta.json();

            if (dados.erro) {
                console.error("CEP inválido.");
                return null;
            }

            return dados;
        } catch (erro) {
            console.error("Erro ao buscar o CEP:", erro);
            return null;
        }
    }

    async cadastrarVenda() {
        const usuario = JSON.parse(sessionStorage.getItem('usuario'));
        const vendedor = usuario.user.usuario;

        let equipe = usuario.user.equqipe;
        console.log(usuario.user.equqipe);

        // Seleciona o formulário
        const form = document.getElementById('formulario'); // Remove '.target'
    
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
        data["vendedor"] = vendedor;
        data["equipe"] = equipe;
       
    
        // Converte o array de produtos para uma string separada por vírgulas
        if (data["produtos"]) {
            data["produtos"] = data["produtos"].join(',');
        }
    
        console.log("Dados enviados:", data);
    
        // Enviar os dados ao servidor
        try {
            const response = await fetch("http://192.168.4.11:3200/vendas/cadastrar-venda", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
    
            if (!response.ok) {
                throw new Error(`Erro ao cadastrar a venda: ${response.statusText}`);
            }
    
            const responseData = await response.json();
            alert("Venda cadastrada com sucesso!");
            window.location.reload();
            console.log("Venda cadastrada com sucesso:", responseData);
        } catch (error) {
            console.error("Erro ao cadastrar a venda:", error);
        }
    }
    
}

// Inicializa a classe
var venda = new Vendas();

