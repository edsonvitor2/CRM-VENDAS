class Dashboard {
    constructor() {
        this.graficoRendimentoRef = null;
        this.vendas = null;
        
        this.verificarLogado();
        this.interface();

        setTimeout(() => {
            this.graficoRendimento();
            this.graficosStatus();
            this.graficosVendedores();
            this.graficosProdutos();
        }, 3000);

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

            this.listarVendas(dadosFormulario);

            setTimeout(() => {
                this.graficoRendimento();
                this.graficosStatus();
                this.graficosVendedores();
                this.graficosProdutos();
            }, 3000);
        });
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
    
            // Obter a data atual para filtro
            const hoje = new Date().toISOString().split('T')[0]; // Data no formato 'YYYY-MM-DD'
            
            const dataFimInput = document.getElementById("data_venda_fim");
            const valorInput = dataFimInput.value; // Exemplo: "2024-12-30"
            const dataSelecionada = new Date(valorInput);
            const mesAtual = dataSelecionada.getMonth();
    
            const vendasPorVendedorDia = {};
            const vendasPorVendedorMes = {};
    
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
                this.vendas = result.vendas;
                console.log(this.vendas)
                result.vendas.forEach(venda => {
                    const vendaData = venda.data_Status?.split('T')[0]; // Data da venda no formato 'YYYY-MM-DD'
                    const vendaMes = new Date(venda.data_Status).getMonth(); // Mês da venda (0-11)
                    const vendedor = venda.vendedor;
    
                    // Contagem de vendas por vendedor no dia
                    if (vendaData === hoje && venda.status == "Concluído") {
                        if (!vendasPorVendedorDia[vendedor]) {
                            vendasPorVendedorDia[vendedor] = 0;
                        }
                        vendasPorVendedorDia[vendedor]++;
                    }
    
                    // Contagem de vendas por vendedor no mês
                    if (vendaMes === mesAtual && venda.status == "Concluído") {
                        if (!vendasPorVendedorMes[vendedor]) {
                            vendasPorVendedorMes[vendedor] = 0;
                        }
                        vendasPorVendedorMes[vendedor]++;
                    }
    
                    // Lógica para exibir vendas com base no cargo
                    if (user.cargo == 'Vendedor') {
                        // Ocultar Graficos
                        document.querySelector("#prodVendidos").style.display = 'none';
                        document.querySelector("#vendasStatus").style.display = 'none';
                        // Exibir apenas as vendas do vendedor logado
                        if (venda.vendedor == user.usuario) {
                            let valor = parseInt(venda.valor_venda) || 0;
                            if (venda.status == 'Concluído') {
                                total_vendas++;
                                total_valores += valor;
                            } else {
                                propostas++;
                            }
                        }
                    } else {
                        // Exibir todas as vendas para outros cargos
                        let valor = parseInt(venda.valor_venda) || 0;
    
                        if (venda.status == 'Concluído') {
                            total_vendas++;
                            total_valores += valor;
                        } else {
                            propostas++;
                        }
                    }
                });
    
                // Identificar o maior vendedor do dia
                const maiorVendedorDia = Object.keys(vendasPorVendedorDia).reduce((a, b) => 
                    vendasPorVendedorDia[a] > vendasPorVendedorDia[b] ? a : b, null);
                const quantidadeDia = maiorVendedorDia ? vendasPorVendedorDia[maiorVendedorDia] : 0;
    
                // Identificar o maior vendedor do mês
                const maiorVendedorMes = Object.keys(vendasPorVendedorMes).reduce((a, b) => 
                    vendasPorVendedorMes[a] > vendasPorVendedorMes[b] ? a : b, null);
                const quantidadeMes = maiorVendedorMes ? vendasPorVendedorMes[maiorVendedorMes] : 0;
    
                // Atualiza os valores no HTML
                document.querySelector("#m_vendedor_dia").innerHTML = maiorVendedorDia || 'Nenhum';
                document.querySelector("#q_vendedor_dia").innerHTML = quantidadeDia || 0;
                document.querySelector("#m_vendedor_mes").innerHTML = maiorVendedorMes || 'Nenhum';
                document.querySelector("#q_vendedor_mes").innerHTML = quantidadeMes || 0;
    
                // Calcula a efetividade
                let total_geral = total_vendas + propostas;
                let efetividade = total_geral > 0 
                    ? ((total_vendas / total_geral) * 100).toFixed(2) 
                    : 0; // Evita divisão por zero
    
                document.querySelector("#total_vendas").innerHTML = total_geral;
                document.querySelector("#concluidas").innerHTML = total_vendas;
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
    
    graficoRendimento() {
        const vendasPorDia = {};
    
        // Filtra todas as vendas e agrupa os valores por data
        this.vendas.forEach(venda => {
            if (venda.status === 'Concluído') { // Verifica se o status da venda é "Concluído"
                const dataVenda = venda.data_venda; // Data da venda
                const valorVenda = parseFloat(venda.valor_venda); // Valor da venda como float
        
                // Agrupa os valores por data
                if (vendasPorDia[dataVenda]) {
                    vendasPorDia[dataVenda] += valorVenda;
                } else {
                    vendasPorDia[dataVenda] = valorVenda;
                }
            }
        });
    
        // Preparando os dados para o gráfico
        const labels = Object.keys(vendasPorDia); // Datas
        const dadosVendas = Object.values(vendasPorDia); // Somatório das vendas por data
        const dadosComissao = dadosVendas.map(venda => venda * 0.1); // Comissão de 10%
    
        // Configurando o gráfico
        const ctxVendas = document.getElementById('rendimentoChart').getContext('2d');
    
        // Destruir gráfico existente, se houver
        if (this.graficoRendimentoRef) {
            this.graficoRendimentoRef.destroy();
        }
    
        // Criar um novo gráfico e armazenar a referência
        this.graficoRendimentoRef = new Chart(ctxVendas, {
            type: 'line',
            data: {
                labels: labels, // Datas dos dias
                datasets: [
                    {
                        label: 'Vendas',
                        data: dadosVendas, // Valores de vendas
                        borderColor: 'blue',
                        fill: false
                    },
                    {
                        label: 'Comissão',
                        data: dadosComissao, // Valores de comissão
                        borderColor: 'black',
                        fill: false
                    }
                ]
            }
        });
    }
    
    graficosVendedores() {
        const vendasPorVendedor = {};
    
        // Agrupar vendas por vendedor e contar a quantidade
        this.vendas.forEach(venda => {
            if (venda.status === 'Concluído') {
                const vendedor = venda.vendedor;  // Supondo que 'vendedor' seja o nome ou ID do vendedor
    
                if (!vendasPorVendedor[vendedor]) {
                    vendasPorVendedor[vendedor] = 0;
                }
    
                vendasPorVendedor[vendedor] += 1; 
            }
        });
    
        // Preparar os dados para o gráfico
        const vendedores = Object.keys(vendasPorVendedor);  // Nomes ou IDs dos vendedores
        const vendas = Object.values(vendasPorVendedor);  // Quantidade de vendas por vendedor
    
        // Verifica se o gráfico já existe e o destrói
        if (this.vendedorChartInstance) {
            this.vendedorChartInstance.destroy();
        }
    
        // Criando o gráfico de barras horizontais
        const vendedorChart = document.getElementById('topVendedores').getContext('2d');
        this.vendedorChartInstance = new Chart(vendedorChart, {
            type: 'bar',  // Tipo de gráfico: barras
            data: {
                labels: vendedores,  // Vendedores (nomes ou IDs)
                datasets: [{
                    label: 'Quantidade de Vendas',
                    data: vendas,  // Quantidade de vendas por vendedor
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',  // Cor das barras
                    borderColor: 'rgba(153, 102, 255, 1)',  // Cor da borda das barras
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',  // Define o eixo Y como o eixo horizontal
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Quantidade de Vendas'
                        },
                        beginAtZero: true // Começa o eixo X no zero
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Vendedores'
                        },
                        ticks: {
                            autoSkip: true, // Evita que os rótulos dos vendedores se sobreponham
                            maxTicksLimit: 10 // Limite de ticks no eixo Y (número de vendedores visíveis)
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false  // Desativa a legenda
                    },
                    tooltip: {
                        enabled: true  // Exibe as dicas ao passar o mouse
                    }
                }
            }
        });
    }
    
    graficosProdutos() {
        const produtosVendidos = {};
    
        // Processar todas as vendas e contar os produtos
        this.vendas.forEach(venda => {
            if (venda.status == 'Concluído') { // Verifica se o status da venda é "Concluído"
                const produtos = venda.produtos; // Supondo que 'produtos' é uma string com produtos separados por vírgulas
                if (!produtos) return;
                
                // Separar os produtos e iterar sobre eles
                produtos.split(',').forEach(produto => {
                    const produtoTrimmed = produto.trim(); // Remover espaços extras
                    if (!produtosVendidos[produtoTrimmed]) {
                        produtosVendidos[produtoTrimmed] = 0;
                    }
                    produtosVendidos[produtoTrimmed] += 1; // Incrementa a contagem
                });
            }
        });
    
        // Preparar os dados para o gráfico
        const produtos = Object.keys(produtosVendidos);  // Nomes dos produtos
        const quantidades = Object.values(produtosVendidos);  // Quantidade de cada produto vendido
    
        // Verifica se o gráfico já existe e o destrói
        if (this.produtoChartInstance) {
            this.produtoChartInstance.destroy();
        }
    
        // Criando o gráfico de colunas
        const produtoChart = document.getElementById('produtosVendidos').getContext('2d');
        this.produtoChartInstance = new Chart(produtoChart, {
            type: 'bar',  // Tipo de gráfico: colunas
            data: {
                labels: produtos,  // Nomes dos produtos
                datasets: [{
                    label: 'Quantidade Vendida',
                    data: quantidades,  // Quantidade de vendas por produto
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',  // Cor das colunas
                    borderColor: 'rgba(255, 159, 64, 1)',  // Cor da borda das colunas
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Produtos'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Quantidade Vendida'
                        },
                        beginAtZero: true // Começa o eixo Y no zero
                    }
                },
                plugins: {
                    legend: {
                        display: false  // Desativa a legenda
                    },
                    tooltip: {
                        enabled: true  // Exibe as dicas ao passar o mouse
                    }
                }
            }
        });
    }
    
    graficosStatus() {
        const vendasPorStatus = {};
    
        // Definir cores para os status
        const coresStatus = {
            'Concluído': 'green',
            'Pendente Instalação': 'blue',
            'Venda Retornada': 'yellow',
            'Sem Cobertura': 'gray',
            'TAXA CLIENTE': 'purple',
            'Pré-Venda': 'orange',
            'FALTA PROVA DE VIDA': 'red',
            'Proposta': 'lightblue',
            'Cancelado': 'darkred',
            'Venda Anulada': 'darkgray',
            'PAGAR TAXA': 'brown',
            'Sem Contato': 'lightgray',
            'PENDENCIA CLIENTE': 'pink',
            'PROPOSTA NEGADA/CANCELADA': 'darkorange',
            'PENDENCIA TECNICA': 'teal',
            'Crédito Negado': 'darkblue',
            'Auditado': 'goldenrod'
        };
    
        // Contar a quantidade de vendas por status
        this.vendas.forEach(venda => {
            const dataVenda = venda.data_Status;  // Ex: '2024-12-01'
            const statusVenda = venda.status;    // Ex: 'Concluído'
            
            if (!vendasPorStatus[dataVenda]) {
                vendasPorStatus[dataVenda] = {};
            }
            if (!vendasPorStatus[dataVenda][statusVenda]) {
                vendasPorStatus[dataVenda][statusVenda] = 0;
            }
            vendasPorStatus[dataVenda][statusVenda] += 1;  // Incrementa a quantidade de vendas para esse status
        });
    
        // Preparando os dados para o gráfico de quantidade de vendas por status
        const statusLabels = Object.keys(vendasPorStatus); // Datas
        // Ordenar as datas em ordem crescente, convertendo para Date antes de comparar
        statusLabels.sort((a, b) => new Date(a) - new Date(b));
    
        const statusData = {}; // Dados para o gráfico de status
    
        // Criando um dataset para cada status
        Object.keys(vendasPorStatus).forEach(data => {
            Object.keys(vendasPorStatus[data]).forEach(status => {
                if (!statusData[status]) {
                    statusData[status] = [];
                }
                statusData[status].push(vendasPorStatus[data][status]);  // Adiciona o número de vendas para cada status
            });
        });
    
        // Prepara o dataset com barras empilhadas (cada status será uma camada dentro da barra)
        const datasets = Object.keys(statusData).map(status => ({
            label: status,
            data: statusLabels.map(label => vendasPorStatus[label][status] || 0), // Adiciona a quantidade de vendas para cada status ou 0 se não houver vendas nesse status no dia
            backgroundColor: coresStatus[status] || 'gray', // Preenchimento das barras com cores definidas para cada status
            borderColor: 'black', // Cor da borda das barras
            borderWidth: 1, // Largura da borda
            stack: 'stack1' // Necessário para criar barras empilhadas
        }));
    
        // Verifica se o gráfico já existe e o destrói
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }
    
        // Criando o gráfico de barras empilhadas
        const vendaStatus = document.getElementById('vendaStatus').getContext('2d');
        this.chartInstance = new Chart(vendaStatus, {
            type: 'bar',  // Tipo de gráfico: barras
            data: {
                labels: statusLabels, // Datas dos dias, agora ordenadas
                datasets: datasets  // Dados das vendas por status
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Data'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Quantidade de Vendas'
                        },
                        beginAtZero: true // Começa o eixo Y do gráfico no zero
                    }
                },
                plugins: {
                    legend: {
                        position: 'top', // Posição da legenda
                    },
                    tooltip: {
                        enabled: true, // Ativa as dicas ao passar o mouse
                    }
                }
            }
        });
    }
    
    
}

var dash = new Dashboard();

window.addEventListener("load", () => {
    // Obtém os dados do formulário automaticamente quando a página é carregada
    let formulario = document.querySelector("form");

    if (formulario) {
        // Cria um objeto FormData com os dados do formulário
        let formData = new FormData(formulario);

        // Converte os dados em um objeto ou faz algo com eles
        let dadosFormulario = {};
        formData.forEach((value, key) => {
            dadosFormulario[key] = value;
        });

        console.log(dadosFormulario); // Mostra os dados coletados no console

        // Chamadas das funções
        dash.listarVendas(dadosFormulario);

        setTimeout(() => {
            dash.graficoRendimento();
            dash.graficosStatus();
            dash.graficosVendedores();
            dash.graficosProdutos();
        }, 3000);
    }
});