const db = require("../../config/database");
const initModels = require("../models/init-models");
const sequelize = db.sequelize;
const { Op, fn, col, where, and } = require("sequelize");
const models = initModels(sequelize);
const agentes = models.agentes;
const pagamento = models.pagamentos;
const faturacoes = models.faturacoes;
const { getStringDate, getMoeda, getSimpleDate } = require("../utils");

/**
 * Serviço responsável por realisar todas as operações que envolvem a geração de relatórios.
 */
class relatorioService {
    /**
     * Gerar um relatório diário com os dados de um dia
     * @param { Date } data - Data do relatório
     * @returns {Object|{resumoDiarioDaEmpresa: {
     * totalAgentes: Number,
     * vendasResolvidas: Number,
     * totalResolvido: Number,
     * data: Date,
     * successo: boolean
     * }}}
     */
    pegarResumoDiarioDaEmpresa = async (data, filtro) => {
        // Se a data não for enviada pegue a data atual do sistema
        if (!data) {
            data = new Date();
        }
        const ano = new Date(data).getFullYear();
        const mes = new Date(data).getMonth() + 1;
        const dia = new Date(data).toJSON().slice(8, 10);

        let forma_pagamento;
        if (!filtro || filtro.includes("Geral")) {
            filtro = "Geral";
            forma_pagamento = "%%";
        } else if (filtro.includes("Mensal")) {
            forma_pagamento = "%Mensal%";
        } else if (filtro.includes("Quinzenal")) {
            forma_pagamento = "%Quinzenal%";
        }

        const totalAgentes = await agentes.count();

        const numeroDeVendas = await faturacoes.count({
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_faturacao")), ano),
                    where(fn("MONTH", col("data_faturacao")), mes),
                    where(fn("DAY", col("data_faturacao")), dia),
                    where(col("forma_pagamento"), {
                        [Op.like]: forma_pagamento,
                    }),
                ],
            },
        });

        let totalVendido = await faturacoes.sum("valor", {
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_faturacao")), ano),
                    where(fn("MONTH", col("data_faturacao")), mes),
                    where(fn("DAY", col("data_faturacao")), dia),
                ],
            },
        });

        const resumoDiario = {
            totalAgentes: totalAgentes,
            numeroDeVendas: numeroDeVendas,
            totalVendido: totalVendido,
            filtro: filtro,
            data: getStringDate(data),
            successo: true,
        };

        return resumoDiario;
    };

    /**
     * Gerar um relatório mensal com os dados de um agente específico
     * @param { Number } id_agente - ID do agente
     * @param { Date } data - Data do relatório
     * @returns {Object|{resumoMensalDoAgente: {
     * totalComprado: Number,
     * comprasEfetuadas: Number,
     * data: Date,
     * successo: boolean
     * }}}
     */
    pegarResumoMensalDoAgente = async (id_agente, data) => {
        const agenteEncontrado = await agentes.findOne({
            raw: true,
            where: { id_agente: id_agente },
        });
        if (!agenteEncontrado) {
            return {
                successo: false,
                mensagem: "Nenhum Sub-agente encontrado!",
            };
        }

        // Se a data não for enviada pegue a data atual
        if (!data) {
            data = new Date();
        }
        const ano = new Date(data).getFullYear();
        const mes = new Date(data).getMonth() + 1;

        const comprasEfetuadas = await faturacoes.count({
            where: {
                [Op.and]: [
                    where(col("agente_id"), id_agente),
                    where(fn("YEAR", col("data_faturacao")), ano),
                    where(fn("MONTH", col("data_faturacao")), mes),
                ],
            },
        });

        let totalComprado = await faturacoes.sum("valor", {
            where: {
                [Op.and]: [
                    where(col("agente_id"), id_agente),
                    where(fn("YEAR", col("data_faturacao")), ano),
                    where(fn("MONTH", col("data_faturacao")), mes),
                ],
            },
        });
        if (!totalComprado) {
            totalComprado = 0.0;
        }
        const resumoMensalDoAgente = {
            totalComprado: totalComprado,
            comprasEfetuadas: comprasEfetuadas,
            data: getSimpleDate(data),
            successo: true,
        };

        return resumoMensalDoAgente;
    };

    /**
     * Gera um relatório do agente de acordo as parcelas de pagaento do mesmo no mês
     * @param { Number } id_agente - ID do agente
     * @param { Date } data - Data do relatório
     * @param { String } parcela - Parcela correspondente de acordo a forma de pagamento do agente
     * @returns {Object|{resumoFinalDoAgente: {
     * ...resumoParcelarDoAgente: Object,
     * parcela: String,
     * bonus: Number,
     * resto: Number,
     * caixas: Number,
     * agente: Object,
     * }}}
     * @dependence pegarResumoParcelarDoAgente();
     * @dependence calcularBonusAgente();
     */
    pegarRelatorioDePagamentoDoAgente = async (id_agente, data, parcela) => {
        const agenteEncontrado = await agentes.findOne({
            raw: true,
            where: { id_agente: id_agente },
        });
        if (!agenteEncontrado) {
            return {
                successo: false,
                mensagem: "Nenhum Sub-agente encontrado!",
            };
        }

        // Se a data não for enviada pegue a data atual
        if (!data) {
            data = new Date();
        }
        const ano = new Date(data).getFullYear();
        const mes = new Date(data).getMonth() + 1;

        // Caso a parcela não for enviada
        if (!parcela) {
            const faturacaoEncontrado = await faturacoes.findOne({
                raw: true,
                where: {
                    [Op.and]: [
                        where(col("agente_id"), id_agente),
                        where(fn("YEAR", col("data_faturacao")), ano),
                        where(fn("MONTH", col("data_faturacao")), mes),
                    ],
                },
            });

            // Se o agente não tiver faturado neste mês ou ele for Mensal pegue o valor Única
            if (
                !faturacaoEncontrado ||
                faturacaoEncontrado.forma_pagamento == "Mensal"
            ) {
                parcela = "Única";
            } else {
                parcela = "Primeira";
            }
        }

        const resumoParcelarDoAgente = await this.pegarResumoParcelarDoAgente(
            id_agente,
            data,
            parcela
        );
        const pagamento = this.calcularBonusAgente(
            resumoParcelarDoAgente.totalComprado
        );

        const relatorioFinal = {
            ...resumoParcelarDoAgente,
            parcela: parcela,
            bonus: pagamento.bonus,
            resto: pagamento.resto,
            caixas: pagamento.caixas,
            agente: agenteEncontrado,
        };
        return relatorioFinal;
    };

    /**
     * Cria registros na tabela pagamentos
     * @param { Number } usuario_id - ID do usuario que fez o registro
     * @param { Object } dados - Dados do pagamento a ser registrado
     * @returns {Object|{resumoFinalDoAgente: {
     * ...resumoParcelarDoAgente: Object,
     * mensagem: String,
     * successo: Boolean
     * }}}
     * @dependence verificarPagamento();
     * @dependence pegarRelatorioDePagamentoDoAgente();
     */
    criarRelatorioFinalDoAgente = async (usuarioId, dados) => {
        try {
            const { id_agente, data_relatorio, parcela } = dados;

            const agenteEncontrado = await agentes.findOne({
                where: { id_agente: id_agente },
            });
            if (!agenteEncontrado) {
                return { successo: false, mensagem: "Agente não encontrado." };
            }

            const response = await this.verificarPagamento(
                id_agente,
                data_relatorio,
                parcela
            );
            if (response.newPage) {
                return {
                    successo: false,
                    newPage: true,
                    page: response.page,
                    mensagem: response.mensagem,
                };
            }

            if (!response.successo) {
                return { successo: true, mensagem: response.mensagem };
            }

            const dadosPagamento = await this.pegarRelatorioDePagamentoDoAgente(
                id_agente,
                data_relatorio,
                parcela
            );

            await pagamento.create({
                data_correspondente: dadosPagamento.data,
                parcela: parcela,
                resto: dadosPagamento.resto,
                bonus: dadosPagamento.bonus,
                agente_id: id_agente,
                usuario_id: usuarioId,
            });

            return {
                successo: true,
                mensagem:
                    "Pagamento do Sub-agente " +
                    agenteEncontrado.nome +
                    " registrado!",
            };
        } catch (erro) {
            console.error("Erro ao cadastrar faturação:", erro);
            return {
                successo: false,
                mensagem: "Erro interno ao cadastrar faturação.",
            };
        }
    };

    /**
     * Gerar um relatório mensal com os dados de um mes
     * @param {{ data: Date }} data - Data do relatório
     * @param {{ filtro: Strong }} filtro - Filtro que vai indicar quis dados buscar
     * @dependence buscarAgentesPagosNaoPagos()
     * @returns {Object|{resumoMensalDaEmpresa: {
     * totalPago: Number,
     * totalExtraido: Number,
     * totalVendido: Number,
     * agentesPagos: Number,
     * listaAgentesPagos: Object[Array],
     * listaFaturacoes: Object[Array],
     * data: Date,
     * successo: boolean
     * }}}
     */
    pegarResumoMensalDaEmpresa = async (data, filtro) => {
        if (!data) {
            data = new Date();
        }
        const ano = new Date(data).getFullYear();
        const mes = new Date(data).getMonth() + 1;

        let parcela;
        let forma_pagamento;
        if (!filtro || filtro.includes("Geral")) {
            filtro = "Geral";
            parcela = "%%";
            forma_pagamento = "%%";
        } else if (filtro.includes("Mensal")) {
            parcela = "%nica%";
            forma_pagamento = "%Mensal%";
        } else if (filtro.includes("Quinzenal")) {
            parcela = "%e%";
            forma_pagamento = "%Quinzenal%";
        }
        /**
         * @description Total pago de bonus aos agentes
         */
        let totalPago = await pagamento.sum("bonus", {
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_correspondente")), ano),
                    where(fn("MONTH", col("data_correspondente")), mes),
                    where(col("parcela"), { [Op.like]: parcela }),
                ],
            },
        });
        if (!totalPago) {
            totalPago = 0.0;
        }

        /**
         * @description Numero total de agentes pagos
         */
        let agentesPagos = await pagamento.count({
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_correspondente")), ano),
                    where(fn("MONTH", col("data_correspondente")), mes),
                    where(col("parcela"), { [Op.like]: parcela }),
                ],
            },
        });
        if (!agentesPagos) {
            agentesPagos = 0;
        }

        const totalFaturacoes = await faturacoes.count({
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_faturacao")), ano),
                    where(fn("MONTH", col("data_faturacao")), mes),
                    where(col("forma_pagamento"), {
                        [Op.like]: forma_pagamento,
                    }),
                ],
            },
        });

        /**
         * @description Valor total extraído do resto das faturações dos gentes
         */
        let totalExtraido = await pagamento.sum("resto", {
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_correspondente")), ano),
                    where(fn("MONTH", col("data_correspondente")), mes),
                    where(col("parcela"), { [Op.like]: parcela }),
                ],
            },
        });
        if (!totalExtraido) {
            totalExtraido = 0.0;
        }

        /**
         * @description Valor total vendido pela empresa naquele mês
         */
        let totalVendido = await faturacoes.sum("valor", {
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_faturacao")), ano),
                    where(fn("MONTH", col("data_faturacao")), mes),
                    where(col("forma_pagamento"), {
                        [Op.like]: forma_pagamento,
                    }),
                ],
            },
        });
        if (!totalVendido) {
            totalVendido = 0.0;
        }

        const responsePagamentos = await this.buscarAgentesPagosNaoPagos(
            data,
            forma_pagamento,
            parcela
        );

        const resumoMensal = {
            totalPago: totalPago,
            totalExtraido: totalExtraido,
            totalVendido: totalVendido,
            totalFaturacoes: totalFaturacoes,
            agentesPagos: agentesPagos,
            listaAgentesPagos: responsePagamentos.listaAgentesPagos,
            listaFaturacoes: responsePagamentos.listaFaturacoes,
            data: getSimpleDate(data),
            filtro: filtro,
            successo: true,
        };
        return resumoMensal;
    };

    /**
     * Gerar um relatório quinzenal com os dados de um periodo
     * @param {{ data: Date }} data - Data do relatório
     * @param {{ filtro: Strong }} filtro - Filtro que vai indicar quis dados buscar
     * @dependence buscarAgentesPagosNaoPagos()
     * @returns {Object|{resumoMensalDaEmpresa: {
     * totalPago: Number,
     * totalExtraido: Number,
     * totalVendido: Number,
     * agentesPagos: Number,
     * listaAgentesPagos: Object[Array],
     * listaFaturacoes: Object[Array],
     * data: Date,
     * successo: boolean
     * }}}
     */
    pegarResumoQuinzenalDaEmpresa = async (data, filtro) => {
        if (!data) {
            data = new Date();
        }
        const ano = new Date(data).getFullYear();
        const mes = new Date(data).getMonth() + 1;

        let parcela;
        let forma_pagamento;
        let periodo;

        if (!filtro || filtro.includes("Primeira")) {
            filtro = "Primeira";
            parcela = "%Primeira%";
            forma_pagamento = "%Quinzenal%";
            periodo = [1, 15];
        } else if (filtro.includes("Segunda")) {
            parcela = "%Segunda%";
            forma_pagamento = "%Quinzenal%";
            periodo = [16, 32];
        }
        /**
         * @description Total pago de bonus aos agentes
         */
        let totalPago = await pagamento.sum("bonus", {
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_correspondente")), ano),
                    where(fn("MONTH", col("data_correspondente")), mes),
                    where(col("parcela"), { [Op.like]: parcela }),
                ],
            },
        });
        if (!totalPago) {
            totalPago = 0.0;
        }

        /**
         * @description Numero total de agentes pagos
         */
        let agentesPagos = await pagamento.count({
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_correspondente")), ano),
                    where(fn("MONTH", col("data_correspondente")), mes),
                    where(col("parcela"), { [Op.like]: parcela }),
                ],
            },
        });
        if (!agentesPagos) {
            agentesPagos = 0;
        }

        const totalFaturacoes = await faturacoes.count({
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_faturacao")), ano),
                    where(fn("MONTH", col("data_faturacao")), mes),
                    where(col("forma_pagamento"), {
                        [Op.like]: forma_pagamento,
                    }),
                    where(fn("DAY", col("data_faturacao")), {
                        [Op.between]: periodo,
                    }),
                ],
            },
        });

        /**
         * @description Valor total extraído do resto das faturações dos gentes
         */
        let totalExtraido = await pagamento.sum("resto", {
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_correspondente")), ano),
                    where(fn("MONTH", col("data_correspondente")), mes),
                    where(col("parcela"), { [Op.like]: parcela }),
                ],
            },
        });
        if (!totalExtraido) {
            totalExtraido = 0.0;
        }

        /**
         * @description Valor total vendido pela empresa naquele mês
         */
        let totalVendido = await faturacoes.sum("valor", {
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_faturacao")), ano),
                    where(fn("MONTH", col("data_faturacao")), mes),
                    where(col("forma_pagamento"), {
                        [Op.like]: forma_pagamento,
                    }),
                    where(fn("DAY", col("data_faturacao")), {
                        [Op.between]: periodo,
                    }),
                ],
            },
        });
        if (!totalVendido) {
            totalVendido = 0.0;
        }

        const responsePagamentos = await this.buscarAgentesPagosNaoPagos(data);

        const resumoMensal = {
            totalPago: totalPago,
            totalExtraido: totalExtraido,
            totalVendido: totalVendido,
            totalFaturacoes: totalFaturacoes,
            agentesPagos: agentesPagos,
            listaAgentesPagos: responsePagamentos.listaAgentesPagos,
            listaFaturacoes: responsePagamentos.listaFaturacoes,
            data: getSimpleDate(data),
            filtro: filtro,
            successo: true,
        };
        return resumoMensal;
    };

    // FUNÇÕES USADAS INTERNAMENTE
    /**
     * Gera um relatório do agente de acordo as parcelas de pagaento do mesmo no mês
     * @param { Number } id_agente - ID do agente
     * @param { Date } data - Data do relatório
     * @param { String } parcela - Parcela correspondente de acordo a forma de pagamento do agente
     * @returns {Object|{resumoParcelarDoAgente: {
     * totalComprado: Number,
     * comprasEfetuadas: Number,
     * forma_pagamento: String,
     * data: Date,
     * successo: Boolean,
     * }}}
     */
    pegarResumoParcelarDoAgente = async (id_agente, data, parcela) => {
        const agenteEncontrado = await agentes.findOne({
            raw: true,
            where: { id_agente: id_agente },
        });
        if (!agenteEncontrado) {
            return {
                successo: false,
                mensagem: "Nenhum Sub-agente encontrado!",
            };
        }

        if (!data) {
            data = new Date();
        }
        const ano = new Date(data).getFullYear();
        const mes = new Date(data).getMonth() + 1;

        const faturacaoEncontrado = await faturacoes.findOne({
            raw: true,
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_faturacao")), ano),
                    where(fn("MONTH", col("data_faturacao")), mes),
                    where(col("agente_id"), agenteEncontrado.id_agente),
                ],
            },
        });

        let forma_pagamento = faturacaoEncontrado?.forma_pagamento;

        if (!forma_pagamento) {
            forma_pagamento = "Mensal";
        }

        let comprasEfetuadas;
        let totalComprado;
        if (parcela == "Única") {
            comprasEfetuadas = await faturacoes.count({
                where: {
                    [Op.and]: [
                        where(col("agente_id"), id_agente),
                        where(fn("YEAR", col("data_faturacao")), ano),
                        where(fn("MONTH", col("data_faturacao")), mes),
                    ],
                },
            });

            totalComprado = await faturacoes.sum("valor", {
                where: {
                    [Op.and]: [
                        where(col("agente_id"), id_agente),
                        where(fn("YEAR", col("data_faturacao")), ano),
                        where(fn("MONTH", col("data_faturacao")), mes),
                    ],
                },
            });
        } else if (parcela == "Primeira") {
            comprasEfetuadas = await faturacoes.count({
                raw: true,
                nest: true,
                where: {
                    [Op.and]: [
                        where(col("agente_id"), id_agente),
                        where(fn("YEAR", col("data_faturacao")), ano),
                        where(fn("MONTH", col("data_faturacao")), mes),
                        where(fn("DAY", col("data_faturacao")), {
                            [Op.between]: [1, 15],
                        }),
                    ],
                },
            });

            totalComprado = await faturacoes.sum("valor", {
                where: {
                    [Op.and]: [
                        where(col("agente_id"), id_agente),
                        where(fn("YEAR", col("data_faturacao")), ano),
                        where(fn("MONTH", col("data_faturacao")), mes),
                        where(fn("DAY", col("data_faturacao")), {
                            [Op.between]: [1, 15],
                        }),
                    ],
                },
            });
        } else if (parcela == "Segunda") {
            comprasEfetuadas = await faturacoes.count({
                raw: true,
                nest: true,
                where: {
                    [Op.and]: [
                        where(col("agente_id"), id_agente),
                        where(fn("YEAR", col("data_faturacao")), ano),
                        where(fn("MONTH", col("data_faturacao")), mes),
                        where(fn("DAY", col("data_faturacao")), {
                            [Op.between]: [16, 32],
                        }),
                    ],
                },
            });

            totalComprado = await faturacoes.sum("valor", {
                where: {
                    [Op.and]: [
                        where(col("agente_id"), id_agente),
                        where(fn("YEAR", col("data_faturacao")), ano),
                        where(fn("MONTH", col("data_faturacao")), mes),
                        where(fn("DAY", col("data_faturacao")), {
                            [Op.between]: [16, 32],
                        }),
                    ],
                },
            });
        }

        const resumoPorParcela = {
            totalComprado: totalComprado,
            comprasEfetuadas: comprasEfetuadas,
            forma_pagamento: forma_pagamento,
            data: getSimpleDate(data),
            successo: true,
        };
        return resumoPorParcela;
    };

    /**
     * Calcular o bonus do agente de acordo ao valor total faturaddo
     * @param { Number } comprasEfetuadas - Total comprado por um agente
     * bonus: Number,
     * resto: Number,
     * caixas: Number,
     * }}}
     */
    calcularBonusAgente(comprasEfetuadas) {
        let resumo = {
            bonus: 0.0,
            resto: 0.0,
            caixas: 0,
        };

        if (comprasEfetuadas == 0) {
            return resumo;
        } else if (comprasEfetuadas % 12500 === 0) {
            resumo.caixas = comprasEfetuadas / 25000;
            resumo.bonus = (comprasEfetuadas / 25000) * 1800;
            resumo.resto = 0;
        } else {
            // Pegamos o múltiplo de 12500 menor e mais próximo
            const multiplo = Math.floor(comprasEfetuadas / 12500) * 12500;
            resumo.caixas = multiplo / 25000;
            resumo.bonus = (multiplo / 25000) * 1800;
            resumo.resto = comprasEfetuadas - multiplo;
        }

        return resumo;
    }

    /**
     * Verificar se o pagamento do bodus do agente pode ser concluido
     * @param { Number } id_agente - ID do agente
     * @param { Date } data - Data do relatório
     * @param { String } parcela - Parcela correspondente de acordo a forma de pagamento do agente
     * @returns {Object|{resumoFinalDoAgente: {
     * ...resumoParcelarDoAgente: Object,
     * mensagem: String,
     * successo: Boolean
     * }}}
     * @dependence verificarPagamento();
     * @dependence pegarRelatorioDePagamentoDoAgente();
     */
    verificarPagamento = async (id_agente, data, parcela) => {
        const ano = new Date(data).getFullYear();
        const mes = new Date(data).getMonth() + 1;

        /**
         * @description Não se pagar um agente se o @período_de_faturação daquele mês estiver aberto
         */
        const mesAtual = new Date().getMonth() + 1;
        // Se a parcela for única ou a segunda
        if (parcela == "Única" || parcela == "Segunda") {
            /**
             * @description O pagamento não pode ser feito no mesmo mês, ou seja só podemos pagar um agente na condição anterior no mês a seguir ao mês atual
             */
            if (mesAtual <= mes) {
                return {
                    successo: false,
                    mensagem: "O período de faturação ainda está aberto!",
                };
            }
        } else if (parcela == "Primeira") {
            /**
             * @description Se for a primeira parcela ela pode ser paga depois da primeira quinzena do mes atual
             */
            const diaAtual = new Date().toJSON().slice(8, 10);
            if (mesAtual <= mes) {
                if (diaAtual <= 15) {
                    return {
                        successo: false,
                        mensagem: "O período de faturação ainda está aberto!",
                    };
                }
            }
        }

        /**
         * @description Não se pode pagar um agente que @não_tem_faturações no periodo de pagamento
         */
        if (parcela == "Única") {
            const faturacoesResolvidas = await faturacoes.findAll({
                row: true,
                nest: true,
                where: {
                    [Op.and]: [
                        where(col("agente_id"), id_agente),
                        where(fn("YEAR", col("data_faturacao")), ano),
                        where(fn("MONTH", col("data_faturacao")), mes),
                    ],
                },
            });
            if (faturacoesResolvidas.length == 0) {
                return {
                    successo: false,
                    mensagem: "O Sub-agente não tem faturações!",
                };
            }
        } else if (parcela == "Primeira") {
            const faturacoesResolvidas = await faturacoes.findAll({
                row: true,
                nest: true,
                where: {
                    [Op.and]: [
                        where(col("agente_id"), id_agente),
                        where(fn("YEAR", col("data_faturacao")), ano),
                        where(fn("MONTH", col("data_faturacao")), mes),
                        where(fn("DAY", col("data_faturacao")), {
                            [Op.between]: [1, 15],
                        }),
                    ],
                },
            });
            if (faturacoesResolvidas.length == 0) {
                return {
                    successo: false,
                    mensagem: "O Sub-agente não tem faturações!",
                };
            }
        } else if (parcela == "Segunda") {
            const faturacoesResolvidas = await faturacoes.findAll({
                row: true,
                nest: true,
                where: {
                    [Op.and]: [
                        where(col("agente_id"), id_agente),
                        where(fn("YEAR", col("data_faturacao")), ano),
                        where(fn("MONTH", col("data_faturacao")), mes),
                        where(fn("DAY", col("data_faturacao")), {
                            [Op.between]: [16, 32],
                        }),
                    ],
                },
            });
            if (faturacoesResolvidas.length == 0) {
                return {
                    successo: false,
                    mensagem: "O Sub-agente não tem faturações!",
                };
            }
        }

        /**
         * @description Não se pode registrar o pagamento de um período que @já_foi_pago
         */
        const pagamentoEncontrado = await pagamento.findOne({
            raw: true,
            nest: true,
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_correspondente")), ano),
                    where(fn("MONTH", col("data_correspondente")), mes),
                    where(col("agente_id"), id_agente),
                    where(col("parcela"), parcela),
                ],
            },
        });
        if (pagamentoEncontrado) {
            return {
                successo: false,
                mensagem: "O Sub-agente já foi pago neste mês!",
            };
        }

        return { successo: true, mensagem: "Pode ser pago!" };
    };

    /**
     * Buscar os agentes pagos e não pagos de um determinado periodo
     * @param { Date } data - Data do relatório
     * @returns {Object|{resumoFinalDoAgente: {
     * listaAgentesPagos: Object,
     * listaFaturacoes: Object
     * }}}
     */
    buscarAgentesPagosNaoPagos = async (data, forma_pagamento, parcela) => {
        if (!forma_pagamento) {
            forma_pagamento = "%%";
        }
        if (!data) {
            data = new Date();
        }
        const ano = new Date(data).getFullYear();
        const mes = new Date(data).getMonth() + 1;

        const listaAgentesPagos = await pagamento.findAll({
            raw: true,
            nest: true,
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_correspondente")), ano),
                    where(fn("MONTH", col("data_correspondente")), mes),
                    where(col("parcela"), {
                        [Op.like]: parcela,
                    }),
                ],
            },
            include: {
                model: models.agentes,
                as: "agente",
                attributes: ["nome", "telefone"],
            },
        });

        const listaFaturacoes = await faturacoes.findAll({
            attributes: [
                [fn("count", col("agente_id")), "Total"],
                "agente_id",
                "forma_pagamento",
                [col("agente.nome"), "agente.nome"],
                [col("agente.telefone"), "agente.telefone"],
            ],
            include: {
                model: models.agentes,
                as: "agente",
                attributes: [],
                order: [["nome", "ASC"]],
            },
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_faturacao")), ano),
                    where(fn("MONTH", col("data_faturacao")), mes),
                    where(col("forma_pagamento"), {
                        [Op.like]: forma_pagamento,
                    }),
                ],
            },
            group: ["agente_id", "forma_pagamento"],
            order: [[col("agente.nome"), "ASC"]],
            raw: true,
            nest: true,
        });

        const pagamentosAgentesEncontrados = {
            listaAgentesPagos: listaAgentesPagos,
            listaFaturacoes: listaFaturacoes,
        };
        return pagamentosAgentesEncontrados;
    };
}

module.exports = relatorioService;
