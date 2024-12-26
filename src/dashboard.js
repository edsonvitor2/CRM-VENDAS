class Dashboard{
    constructor(){
        this.listarVendas();
    }

    async listarVendas(data) {
        try {
            const usuario = JSON.parse(sessionStorage.getItem('usuario'));
            let user = usuario.user;
            var total_vendas = 0;
            var total_valores = 0;
            var propostas = 0;
    
            if (data == undefined) {
                data = {};
            }
            console.log(data);
    
            // Envia os dados para o servidor usando fetch
            const response = await fetch('http://localhost:3000/vendas/listar-vendas', {
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
                    if (venda.vendedor == user.usuario) {
                        let valor = parseInt(venda.valor_venda) || 0; // Garante que o valor seja um número
    
                        if (venda.status == 'concluido') {
                            total_vendas = total_vendas + 1;
                            total_valores = total_valores + valor;
                        } else {
                            propostas = propostas + 1;
                        }
                    } else {
                        console.log('Usuario Não Possui Vendas Cadastradas!!!');
                        console.log(venda.vendedor, user.usuario);
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