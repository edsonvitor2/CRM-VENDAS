class Dashboard {
    constructor() {
        
        // Instancia a classe User
        this.user = new User();
        // Pega os dados do usuário
        this.userData = this.user.usuarioLogado; // Acessa a propriedade salva no construtor
        // Inicializa as vendas
        this.listarVendas();

    }

    async listarVendas(data) {
        try {
            const usuario = JSON.parse(sessionStorage.getItem('usuario'));
            console.log(this.userData);
            let user = usuario.user;
            var total_vendas = 0;
            var total_valores = 0;
            var propostas = 0;
    
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
                // Exibe os resultados no HTML
                result.vendas.forEach(venda => {
                    console.log(venda);
    
                    // Lógica para exibir vendas com base no cargo
                    if (user.cargo === 'Vendedor') {
                        // Ocultar Graficos
                        document.querySelector("#prodVendidos").style.display = 'none';
                        document.querySelector("#vendasStatus").style.display = 'none';
                        // Exibir apenas as vendas do vendedor logado
                        if (venda.vendedor == user.usuario) {
                            let valor = parseInt(venda.valor_venda) || 0;

                            if (venda.status == 'concluido') {
                                total_vendas++;
                                total_valores += valor;
                            } else {
                                propostas++;
                            }
                        }
                    } else {
                        // Exibir todas as vendas para outros cargos
                        let valor = parseInt(venda.valor_venda) || 0;
    
                        if (venda.status == 'concluido') {
                            total_vendas++;
                            total_valores += valor;
                        } else {
                            propostas++;
                        }
                    }
                });
    
                // Calcula a efetividade
                let total_geral = total_vendas + propostas;
                let efetividade = total_geral > 0 
                    ? ((total_vendas / total_geral) * 100).toFixed(2) 
                    : 0; // Evita divisão por zero
    
                // Atualiza os valores no HTML
                document.querySelector("#total_vendas").innerHTML = total_vendas;
                document.querySelector("#rendimento").innerHTML = `R$ ${total_valores},00`;
                document.querySelector("#propostas").innerHTML = propostas;
                document.querySelector("#efetividade").innerHTML = `${efetividade}%`;
            } else {
                alert('Erro ao buscar vendas: ' + result.message);
            }
        } catch (error) {
            console.error('Erro ao enviar a requisição:', error);
            alert('Ocorreu um erro ao tentar buscar as vendas.');
        }
    }
    
    
}

var dash = new Dashboard();