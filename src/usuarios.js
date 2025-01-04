class Usuarios {
    constructor() {
        this.graficoRendimentoRef = null;
        this.vendas = null;
        
        this.verificarLogado();
        this.interface();

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
    

    interface(){
        let formulario = document.querySelector("form");
        formulario.addEventListener("submit", (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário

            // Cria um objeto FormData com os dados do formulário
            let formData = new FormData(formulario);

            // Converte os dados em um objeto ou faz algo com eles
            let dadosFormulario = {};
            formData.forEach((value, key) => {
                dadosFormulario[key] = value;
            });
            console.log(dadosFormulario); // Mostra os dados coletados no console
        });
    }

    async listarVendas(data) {
        try {
            // Envia os dados para o servidor usando fetch
            const response = await fetch('http://192.168.4.11:3200/vendas/listar-vendas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            // Processa a resposta do servidor
            const result = await response.json();
            alert('Erro ao buscar vendas: ' + result.message);

        } catch (error) {
            console.error('Erro ao enviar a requisição:', error);
            alert('Ocorreu um erro ao tentar buscar as vendas.');
        }
    }
    
}

var user = new Usuarios();
