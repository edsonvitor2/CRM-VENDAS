class Dashboard {
    constructor() {
        this.vendas = null;
        // Instancia a classe User
        this.user = new User();
        // Pega os dados do usuário
        this.userData = this.user.usuarioLogado; // Acessa a propriedade salva no construtor
        // Inicializa as vendas
        this.listarVendas();
        this.interface();

        setTimeout(() => {
            this.graficoRendimento();
            this.graficosStatus();
            this.graficosVendedores();
            this.graficosProdutos();
        }, 3000);

    }

    interface(){
        let formulario = document.querySelector("form");
        formulario.addEventListener("submit", (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário
            // Captura os dados do formulário
            const formData = new FormData(formulario);
            // Converte os dados do formulário em um objeto
            const dadosFormulario = {};
            formData.forEach((value, key) => {
                if (dadosFormulario[key]) {
                    // Se já existir, transforma em array para múltiplos valores
                    if (!Array.isArray(dadosFormulario[key])) {
                        dadosFormulario[key] = [dadosFormulario[key]];
                    }
                    dadosFormulario[key].push(value);
                } else {
                    dadosFormulario[key] = value;
                }
            });
            // Exibe os dados capturados no console
            console.log(dadosFormulario);
            // Você pode agora usar esses dados para outras ações, como enviar para uma API
        });
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
                this.vendas = result.vendas;
                result.vendas.forEach(venda => {
                    console.log(venda);
    
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
    
                // Calcula a efetividade
                let total_geral = total_vendas + propostas;
                let efetividade = total_geral > 0 
                    ? ((total_vendas / total_geral) * 100).toFixed(2) 
                    : 0; // Evita divisão por zero
    
                // Atualiza os valores no HTML
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
        const vendasPorStatus = {};
    
        // Filtra todas as vendas
        this.vendas.forEach(venda => {
            const dataVenda = venda.data_Status;  // Ex: '2024-12-01'
            const statusVenda = venda.status; // Ex: 'Concluído'
            
            // Garantir que valor_venda seja um número float
            const valorVenda = parseFloat(venda.valor_venda);
            
            if (isNaN(valorVenda)) {
                console.warn(`Valor de venda inválido para a venda em ${dataVenda}: ${venda.valor_venda}`);
                return;  // Ignora essa venda, caso o valor seja inválido
            }
    
            // Somar vendas por dia
            if (!vendasPorDia[dataVenda]) {
                vendasPorDia[dataVenda] = 0;
            }
            vendasPorDia[dataVenda] += valorVenda;
    
            // Contar a quantidade de vendas por status
            if (!vendasPorStatus[dataVenda]) {
                vendasPorStatus[dataVenda] = {};
            }
            if (!vendasPorStatus[dataVenda][statusVenda]) {
                vendasPorStatus[dataVenda][statusVenda] = 0;
            }
            vendasPorStatus[dataVenda][statusVenda] += 1;  // Incrementa a quantidade de vendas para esse status
    
            // Log para verificar as vendas por status
            console.log(`Data: ${dataVenda}, Status: ${statusVenda}, Total Vendas: ${vendasPorStatus[dataVenda][statusVenda]}`);
        });
    
        // Preparando os dados para o gráfico de vendas por dia
        const labels = Object.keys(vendasPorDia); // Datas
        const dadosVendas = Object.values(vendasPorDia); // Somatório das vendas por dia
        const dadosComissao = dadosVendas.map(venda => venda * 0.1); // Comissão de 10%
    
        const ctxVendas = document.getElementById('rendimentoChart').getContext('2d');
        new Chart(ctxVendas, {
            type: 'line',
            data: {
                labels: labels, // Datas dos dias
                datasets: [{
                    label: 'Vendas',
                    data: dadosVendas, // Valores de vendas
                    borderColor: 'blue',
                    fill: false
                }, {
                    label: 'Comissão',
                    data: dadosComissao, // Valores de comissão
                    borderColor: 'black',
                    fill: false
                }]
            }
        });
    }

    graficosVendedores() {
        const vendasPorVendedor = {};
    
        // Agrupar vendas por vendedor e contar a quantidade
        this.vendas.forEach(venda => {
            if(venda.status == 'Concluído'){
                const vendedor = venda.vendedor;  // Supondo que 'vendedor' seja o nome ou ID do vendedor
            
                if (!vendasPorVendedor[vendedor]) {
                    vendasPorVendedor[vendedor] = 0;
                }
        
                vendasPorVendedor[vendedor] += 1; 
            }
            // Incrementa a contagem de vendas
        });
    
        // Preparar os dados para o gráfico
        const vendedores = Object.keys(vendasPorVendedor);  // Nomes ou IDs dos vendedores
        const vendas = Object.values(vendasPorVendedor);  // Quantidade de vendas por vendedor
    
        // Criando o gráfico de barras horizontais
        const vendedorChart = document.getElementById('topVendedores').getContext('2d');
        new Chart(vendedorChart, {
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
        });
    
        // Preparar os dados para o gráfico
        const produtos = Object.keys(produtosVendidos);  // Nomes dos produtos
        const quantidades = Object.values(produtosVendidos);  // Quantidade de cada produto vendido
    
        // Criando o gráfico de colunas
        const produtoChart = document.getElementById('produtosVendidos').getContext('2d');
        new Chart(produtoChart, {
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
    
        // Criando o gráfico de barras empilhadas
        const vendaStatus = document.getElementById('vendaStatus').getContext('2d');
        new Chart(vendaStatus, {
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