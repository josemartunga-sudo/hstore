/**
 * ===============================================
 * SISTEMA DE BUSCA E RELATÓRIOS - DASHBOARD
 * ===============================================
 *
 * Sistema completo para gerenciamento de busca de agentes/usuários,
 * relatórios financeiros e visualização de dados em gráficos.
 *
 * Funcionalidades principais:
 * • Busca em tempo real de agentes e usuários
 * • Sistema de filtros por data para relatórios
 * • Gráficos interativos de vendas com Chart.js
 * • Modal de busca responsivo
 * • Navegação automática com parâmetros URL
 *
 *
 * @version 1.0.0
 * @requires Chart.js, ChartDataLabels
 */

// ===============================================
// VARIÁVEIS GLOBAIS DE ESTADO
// ===============================================

/**
 * Cache global de agentes ativos
 * Carregado na inicialização para otimizar buscas
 * @type {Array|null}
 */
let agentes;

/**
 * Cache global de usuários ativos
 * Carregado na inicialização para otimizar buscas
 * @type {Array|null}
 */
let usuarios;

// ===============================================
// INICIALIZAÇÃO - CARREGAMENTO DE DADOS
// ===============================================

/**
 * Carrega agentes ativos na inicialização da página
 * Armazena dados em cache global para melhor performance
 *
 * @async
 * @function loadAgentesAtivos
 * @fires window#load
 * @returns {Promise<void>}
 */
window.addEventListener("load", async () => {
    const agentesEncontrados = await fetchGet("/agentes/ativos");
    agentes = agentesEncontrados.agentes;
});

/**
 * Carrega usuários ativos na inicialização da página
 * Armazena dados em cache global para melhor performance
 *
 * @async
 * @function loadUsuariosAtivos
 * @fires window#load
 * @returns {Promise<void>}
 */
window.addEventListener("load", async () => {
    const usuariosEncontrados = await fetchGet("/usuarios/ativos");
    usuarios = usuariosEncontrados.usuarios;
});

// ===============================================
// SISTEMA DE BUSCA - ELEMENTOS DOM
// ===============================================

/**
 * Container para exibição dos resultados de busca
 * @type {Element}
 */
const resultadoBusca = document.querySelector(".main-page-hero-resultado");

/**
 * Campo de input para busca de agentes
 * @type {Element}
 */
const campoBuscaAgente = document.getElementById("busca-agente");

// ===============================================
// BUSCA DE AGENTES - FUNCIONALIDADE PRINCIPAL
// ===============================================

/**
 * Sistema de busca inteligente para agentes
 *
 * Características:
 * • Busca case-insensitive por nome ou ID
 * • Filtro em tempo real
 * • Controle de visibilidade do modal
 * • Tratamento de estados vazios
 * • Links diretos para perfil do agente
 *
 * @listens input#busca-agente
 */
if (campoBuscaAgente) {
    campoBuscaAgente.addEventListener("input", () => {
        // Limpa resultados anteriores
        resultadoBusca.innerHTML = "";

        /**
         * Estado vazio - esconde modal e resultados
         */
        if (campoBuscaAgente.value == "") {
            resultadoBusca.classList.remove("main-page-hero-resultado-visivel");
            document
                .querySelector(".modal-busca")
                .classList.remove("modal-busca-visivel");
        } else {
            /**
             * Estado ativo - mostra modal e processa busca
             */
            document
                .querySelector(".modal-busca")
                .classList.add("modal-busca-visivel");
            resultadoBusca.classList.add("main-page-hero-resultado-visivel");
            /**
             * Verifica se existem agentes válidos (sem mensagem de erro)
             */
            if (!agentes.msg) {
                /**
                 * Itera sobre agentes e aplica filtro de busca
                 * Compara nome do agente (case-insensitive) ou ID (como string) com valor digitado
                 */
                for (const agente of agentes) {
                    const valorBuscado =
                        campoBuscaAgente.value.toLocaleLowerCase();
                    const nomeLower = agente.nome.toLocaleLowerCase();
                    const idString = String(agente.id_agente);

                    if (
                        nomeLower.includes(valorBuscado) ||
                        idString.includes(valorBuscado)
                    ) {
                        /**
                         * Renderiza resultado encontrado
                         * Template: Link -> Div -> Nome + ID
                         */
                        resultadoBusca.innerHTML += `<a href="/agentes/perfil/${agente.id_agente}"><div class="resultado">
                                <p class="nome">${agente.nome}</p>
                                <h3>${agente.id_agente}</h3>
                            </div></a>`;
                    }
                }
            }

            /**
             * Tratamento de casos sem resultado
             * Exibe quando: erro na API OU nenhum resultado encontrado
             */
            if (agentes.msg || resultadoBusca.innerHTML.length == 0) {
                resultadoBusca.innerHTML = `<div class="agente"><p class="nome">Nenhum resultado encontrado...</p></div>`;
            }
        }
    });
}

// ===============================================
// BUSCA DE USUÁRIOS - FUNCIONALIDADE SECUNDÁRIA
// ===============================================

/**
 * Campo de input para busca de usuários
 * @type {Element}
 */
const campoBuscaUsuario = document.getElementById("busca-usuario");

/**
 * Sistema de busca inteligente para usuários
 *
 * Funciona de forma idêntica à busca de agentes:
 * • Mesma lógica de filtro
 * • Mesmo controle de modal
 * • Roteamento diferente (/usuarios/ vs /agentes/perfil/)
 *
 * @listens input#busca-usuario
 */
if (campoBuscaUsuario) {
    campoBuscaUsuario.addEventListener("input", () => {
        // Limpa resultados anteriores
        resultadoBusca.innerHTML = "";

        /**
         * Estado vazio - comportamento padrão
         */
        if (campoBuscaUsuario.value == "") {
            resultadoBusca.classList.remove("main-page-hero-resultado-visivel");
            document
                .querySelector(".modal-busca")
                .classList.remove("modal-busca-visivel");
        } else {
            /**
             * Estado ativo - processamento da busca
             */
            document
                .querySelector(".modal-busca")
                .classList.add("modal-busca-visivel");
            resultadoBusca.classList.add("main-page-hero-resultado-visivel");

            /**
             * Filtragem de usuários válidos
             */
            if (!usuarios.msg) {
                for (const usuario of usuarios) {
                    const valorBuscado =
                        campoBuscaUsuario.value.toLocaleLowerCase();
                    if (
                        usuario.nome.toLocaleLowerCase().includes(valorBuscado)
                    ) {
                        /**
                         * Template de resultado para usuários
                         * Diferença: rota /usuarios/ ao invés de /agentes/perfil/
                         */
                        resultadoBusca.innerHTML += `<a href="/usuarios/${usuario.id_usuario}"><div class="resultado">
                                <p class="nome">${usuario.nome}</p>
                                <h3>${usuario.id_usuario}</h3>
                            </div></a>`;
                    }
                }
            }

            /**
             * Fallback para casos sem resultado
             */
            if (usuarios.msg || resultadoBusca.innerHTML.length == 0) {
                resultadoBusca.innerHTML = `<div class="usuario"><p class="nome">Nenhum resultado encontrado...</p></div>`;
            }
        }
    });
}

// ===============================================
// CONTROLE DO MODAL DE BUSCA
// ===============================================

/**
 * Gerencia o fechamento do modal de busca
 *
 * Comportamento:
 * • Click no overlay fecha o modal
 * • Limpa todos os resultados
 * • Reseta campo de busca de agente
 * • Remove classes de visibilidade
 *
 * @listens click .modal-busca
 */
if (document.querySelector(".modal-busca")) {
    document
        .querySelector(".modal-busca")
        .addEventListener("click", (event) => {
            if (
                resultadoBusca.classList.contains(
                    "main-page-hero-resultado-visivel"
                )
            ) {
                // Remove visibilidade dos resultados
                resultadoBusca.classList.remove(
                    "main-page-hero-resultado-visivel"
                );

                // Esconde modal
                document
                    .querySelector(".modal-busca")
                    .classList.remove("modal-busca-visivel");

                // Limpa conteúdo e campo
                resultadoBusca.innerHTML = "";
                campoBuscaAgente.value = "";
            }
        });
}

// ===============================================
// SISTEMA DE FILTROS DE DATA - RELATÓRIOS
// ===============================================

/**
 * Campo de data para filtros de relatório
 * @type {Element}
 */
const campoBuscaDataRelatorio = document.querySelector(
    ".main-page-hero-form-busca-campo[name='data-relatorio']"
);

/**
 * Campo select para filtros
 * @type {Element}
 */
const campoBuscaRelatorioFiltro = document.querySelector(
    ".main-page-hero-form select[name='filtro'"
);

/**
 * Ativa date picker no ícone do calendário
 *
 * @listens click .fa-calendar-alt
 */
if (document.querySelector(".fa-calendar-alt")) {
    document.querySelector(".fa-calendar-alt").addEventListener("click", () => {
        if (campoBuscaDataRelatorio) {
            campoBuscaDataRelatorio.showPicker?.();
        }
    });
}

/**
 * Sistema principal de filtros por data
 *
 * Funcionalidades:
 * • Date picker nativo no click
 * • Navegação automática com parâmetro URL
 * • Recarregamento da página com nova data
 *
 * @listens click|input .main-page-hero-form-busca-campo[name='data-relatorio']
 */
if (campoBuscaDataRelatorio) {
    /**
     * Abre date picker no click do campo
     */
    campoBuscaDataRelatorio.addEventListener("click", () => {
        if (campoBuscaDataRelatorio) {
            campoBuscaDataRelatorio.showPicker?.();
        }
    });

    /**
     * Processa mudança de data
     * Navega para nova URL com parâmetro 'data'
     */
    campoBuscaDataRelatorio?.addEventListener("input", async () => {
        window.location =
            "?data=" +
            campoBuscaDataRelatorio.value +
            "&filtro=" +
            campoBuscaRelatorioFiltro?.value;
    });

    campoBuscaRelatorioFiltro?.addEventListener("input", async () => {
        window.location =
            "?data=" +
            campoBuscaDataRelatorio.value +
            "&filtro=" +
            campoBuscaRelatorioFiltro?.value;
    });
}

// ===============================================
// FILTROS DE PAGAMENTO - SISTEMA AVANÇADO
// ===============================================

/**
 * Campo de data para filtro de pagamentos
 * @type {Element}
 */
const campoBuscaPagamentoData = document.querySelector(
    ".main-page-hero-form-relatorio input[name='data-pagamento']"
);

/**
 * Campo select para parcelas
 * @type {Element}
 */
const campoBuscaPagamentoParcela = document.querySelector(
    ".main-page-hero-form-relatorio select[name='parcela'"
);

/**
 * Date picker para campo de pagamento
 *
 * @listens click .fa-calendar-alt
 */
if (document.querySelector(".fa-calendar-alt")) {
    document.querySelector(".fa-calendar-alt").addEventListener("click", () => {
        if (campoBuscaPagamentoData) {
            campoBuscaPagamentoData.showPicker?.();
        }
    });
}

/**
 * Sistema de filtros combinados (data + parcela)
 *
 * Características:
 * • Dois parâmetros URL simultâneos
 * • Sincronização entre campos
 * • Navegação automática
 */
if (campoBuscaPagamentoData) {
    /**
     * Date picker no click
     */
    campoBuscaPagamentoData.addEventListener("click", () => {
        if (campoBuscaPagamentoData) {
            campoBuscaPagamentoData.showPicker?.();
        }
    });

    /**
     * Filtro por mudança de data
     * Mantém valor da parcela selecionada
     */
    campoBuscaPagamentoData.addEventListener("input", () => {
        window.location =
            "?data=" +
            campoBuscaPagamentoData.value +
            "&parcela=" +
            campoBuscaPagamentoParcela.value;
    });

    /**
     * Filtro por mudança de parcela
     * Mantém valor da data selecionada
     */
    campoBuscaPagamentoParcela.addEventListener("input", () => {
        window.location =
            "?data=" +
            campoBuscaPagamentoData.value +
            "&parcela=" +
            campoBuscaPagamentoParcela.value;
    });
}

// ===============================================
// SISTEMA DE GRÁFICOS - CHART.JS
// ===============================================

/**
 * Inicializa sistema de gráficos na carga da página
 *
 * Processo:
 * 1. Localiza canvas do gráfico
 * 2. Obtém dados via API
 * 3. Cria gradientes premium
 * 4. Configura Chart.js com animações
 * 5. Renderiza gráfico de barras
 *
 * @async
 * @function initGraficoVendas
 * @fires window#load
 * @requires Chart.js, ChartDataLabels
 */
window.addEventListener("load", async () => {
    /**
     * Elemento canvas para renderização do gráfico
     * @type {HTMLCanvasElement}
     */
    const canvas = document.getElementById("graficoVendas");
    if (!canvas) return;

    /**
     * Contexto 2D do canvas para desenho
     * @type {CanvasRenderingContext2D}
     */
    const ctx = canvas.getContext("2d");

    /**
     * Data atual ou filtrada para busca de dados
     * @type {string}
     */
    const dataBusca = campoBuscaDataRelatorio.value;

    /**
     * Dados financeiros obtidos da API
     * @type {Object}
     */
    const dados = await fetchGet("/relatorios/insight?data=" + dataBusca);
    const resumoMensal = dados.resumoMensal;

    // ===============================================
    // GRADIENTES PREMIUM - DESIGN VISUAL
    // ===============================================

    /**
     * Gradiente para "Total Vendido"
     * Verde: do claro (#6ee7b7) ao escuro (#059669)
     * @type {CanvasGradient}
     */
    const gradVendido = ctx.createLinearGradient(0, 0, 0, 400);
    gradVendido.addColorStop(0, "#6ee7b7");
    gradVendido.addColorStop(1, "#059669");

    /**
     * Gradiente para "Total Pago"
     * Azul: do claro (#93c5fd) ao escuro (#2563eb)
     * @type {CanvasGradient}
     */
    const gradPago = ctx.createLinearGradient(0, 0, 0, 400);
    gradPago.addColorStop(0, "#93c5fd");
    gradPago.addColorStop(1, "#2563eb");

    /**
     * Gradiente para "Total Extraído"
     * Vermelho: do claro (#fca5a5) ao escuro (#b91c1c)
     * @type {CanvasGradient}
     */
    const gradExtraido = ctx.createLinearGradient(0, 0, 0, 400);
    gradExtraido.addColorStop(0, "#fca5a5");
    gradExtraido.addColorStop(1, "#b91c1c");

    /**
     * Gradiente para "Facturações"
     * Amarelo/Laranja: do claro (#fcd34d) ao escuro (#d97706)
     * @type {CanvasGradient}
     */
    const gradFaturacoes = ctx.createLinearGradient(0, 0, 0, 400);
    gradFaturacoes.addColorStop(0, "#fcd34d");
    gradFaturacoes.addColorStop(1, "#d97706");

    // ===============================================
    // ESTRUTURA DE DADOS DO GRÁFICO
    // ===============================================

    /**
     * Configuração de dados para Chart.js
     * Estrutura: labels + datasets com valores e estilos
     *
     * @type {Object}
     */
    const data = {
        /**
         * Rótulos das barras (eixo X)
         * @type {string[]}
         */
        labels: [
            "Total Vendido",
            "Total Pago",
            "Total Extraído",
            "Facturações",
        ],

        /**
         * Datasets com dados e configurações visuais
         * @type {Object[]}
         */
        datasets: [
            {
                label: "Resumo Mensal",

                /**
                 * Valores numéricos para cada barra
                 * Ordem corresponde aos labels
                 * @type {number[]}
                 */
                data: [
                    resumoMensal.totalVendido,
                    resumoMensal.totalPago,
                    resumoMensal.totalExtraido,
                    resumoMensal.totalFaturacoes,
                ],

                /**
                 * Gradientes de fundo para cada barra
                 * @type {CanvasGradient[]}
                 */
                backgroundColor: [
                    gradVendido,
                    gradPago,
                    gradExtraido,
                    gradFaturacoes,
                ],

                // Configurações de estilo
                borderWidth: 0,
                borderRadius: 16,

                /**
                 * Cores para estado hover
                 * @type {string[]}
                 */
                hoverBackgroundColor: [
                    "#10b981",
                    "#3b82f6",
                    "#ef4444",
                    "#f59e0b",
                ],
            },
        ],
    };

    // ===============================================
    // CONFIGURAÇÃO AVANÇADA DO GRÁFICO
    // ===============================================

    /**
     * Configuração completa do Chart.js
     * Inclui: responsividade, plugins, escalas, animações
     *
     * @type {Object}
     */
    const config = {
        type: "bar",
        data: data,

        /**
         * Opções avançadas de configuração
         */
        options: {
            responsive: true,
            maintainAspectRatio: false,

            // ===============================================
            // PLUGINS E EXTENSÕES
            // ===============================================

            plugins: {
                /**
                 * Configuração da legenda
                 */
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#1f2937",
                        font: {
                            size: 15,
                            weight: "600",
                            family: "Inter, system-ui, sans-serif",
                        },
                        usePointStyle: true,
                        pointStyle: "roundedRect",
                        padding: 20,
                    },
                },

                /**
                 * Configuração dos tooltips (hover)
                 */
                tooltip: {
                    backgroundColor: "#111827",
                    titleColor: "#f9fafb",
                    bodyColor: "#e5e7eb",
                    padding: 14,
                    borderColor: "#374151",
                    borderWidth: 1,
                    cornerRadius: 10,
                    displayColors: false,

                    /**
                     * Customização do conteúdo dos tooltips
                     */
                    callbacks: {
                        /**
                         * Formata valor exibido no tooltip
                         * Aplica formatação pt-AO + moeda Kz
                         *
                         * @param {Object} context - Contexto do tooltip
                         * @returns {string} Texto formatado
                         */
                        label: function (context) {
                            let valor = context.raw.toLocaleString("pt-AO");
                            return `${context.label}: ${valor} Kz`;
                        },
                    },
                },

                /**
                 * Labels sobre as barras (plugin externo)
                 * Mostra valores diretamente nas barras
                 */
                datalabels: {
                    color: "#111827",
                    anchor: "end",
                    align: "top",
                    font: {
                        weight: "700",
                        size: 13,
                    },

                    /**
                     * Formatador dos valores nos labels
                     *
                     * @param {number} value - Valor numérico
                     * @returns {string} Valor formatado com moeda
                     */
                    formatter: (value) => value.toLocaleString("pt-AO") + " Kz",
                },
            },

            // ===============================================
            // CONFIGURAÇÃO DAS ESCALAS (EIXOS)
            // ===============================================

            scales: {
                /**
                 * Eixo X (horizontal) - Labels das categorias
                 */
                x: {
                    grid: { display: false },
                    ticks: {
                        color: "#374151",
                        font: { size: 13, weight: "600" },
                    },
                },

                /**
                 * Eixo Y (vertical) - Valores numéricos
                 */
                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(0,0,0,0.05)" },
                    ticks: {
                        color: "#6b7280",
                        font: { size: 12 },

                        /**
                         * Formatador dos valores do eixo Y
                         * Aplica formatação monetária
                         *
                         * @param {number} value - Valor do tick
                         * @returns {string} Valor formatado
                         */
                        callback: function (value) {
                            return value.toLocaleString("pt-AO") + " Kz";
                        },
                    },
                },
            },

            // ===============================================
            // SISTEMA DE ANIMAÇÕES PREMIUM
            // ===============================================

            /**
             * Configuração de animações avançadas
             */
            animation: {
                /**
                 * Callback executado quando animação termina
                 * Aplica efeito de "pulse" no gráfico
                 */
                onComplete: () => {
                    const chart = ctx.canvas;
                    chart.style.transition = "transform 0.5s ease";
                    chart.style.transform = "scale(1.03)";
                    setTimeout(() => {
                        chart.style.transform = "scale(1)";
                    }, 500);
                },
                duration: 1400,
                easing: "easeOutElastic",
            },

            /**
             * Configuração de interações
             */
            interaction: {
                mode: "nearest",
                axis: "x",
                intersect: false,
            },
        },

        /**
         * Plugins externos necessários
         * ChartDataLabels: exibe valores sobre as barras
         *
         * @type {Object[]}
         */
        plugins: [ChartDataLabels],
    };

    /**
     * Instância final do gráfico
     * Renderiza no canvas com configuração completa
     *
     * @type {Chart}
     */
    new Chart(ctx, config);
});

// ===============================================
// UTILITÁRIO DE REQUISIÇÕES HTTP
// ===============================================

/**
 * Função utilitária para requisições GET
 * Centraliza lógica de fetch com tratamento de erros
 *
 * Características:
 * • Async/await para melhor legibilidade
 * • Parse automático de JSON
 * • Tratamento básico de erros
 * • Reutilizable em todo o sistema
 *
 * @async
 * @function fetchGet
 * @param {string} url - URL da requisição
 * @returns {Promise<Object>} Dados da resposta JSON
 * @throws {Error} Em caso de erro na requisição ou parsing
 *
 * @example
 * // Buscar dados de agentes
 * const agentes = await fetchGet('/agentes/ativos');
 *
 * @example
 * // Buscar relatório com parâmetros
 * const dados = await fetchGet('/relatorios/insight?data=2024-01-15');
 */
async function fetchGet(url) {
    try {
        /**
         * Executa requisição HTTP GET
         * @type {Response}
         */
        const response = await fetch(url);

        /**
         * Converte resposta para JSON
         * @type {Object}
         */
        return response.json();
    } catch (error) {
        /**
         * Fallback em caso de erro
         * Tenta parsing da resposta mesmo com erro
         *
         * @note Pode ser problemático - considerar melhorar tratamento
         */
        return response.json();
    }
}
