const { Op, fn, col, where, Sequelize } = require("sequelize");
const db = require("../../config/database");
const initModels = require("../models/init-models");
const { getFullStringDate } = require("../utils");
const sequelize = db.sequelize;
const models = initModels(sequelize);
const faturacoes = models.faturacoes;
const agente = models.agentes;
const usuario = models.usuarios;
/**
 * Serviço responsável por realisar todas as operações que envolvem a geração de relatórios.
 */
class FaturacaoService {
    /**
     * Buscar as faturações de uma data específica e que estao num determinado estado
     * @param { Number } usuarioId - Id do usuario que registro a faturação
     * @param { Object } dados - Dados da faturação, como: valor, id_agente...
     * @returns { Object }}
     */
    criarFaturacao = async (usuarioId, dadosFaturacao) => {
        try {
            const {
                agente_id,
                valor_electronico,
                valor_fisico,
                forma_pagamento,
            } = dadosFaturacao;

            let agenteEncontrado = false;

            if (agente_id) {
                agenteEncontrado = await agente.findOne({
                    where: { id_agente: agente_id },
                });
            } else {
                return {
                    successo: false,
                    mensagem: "O id do sub-agente  não  foi enviado.",
                };
            }

            if (!agenteEncontrado) {
                return {
                    successo: false,
                    mensagem: "Sub-agente não encontrado.",
                };
            }

            if (valor_electronico || valor_fisico) {
                if (valor_electronico) {
                    await faturacoes.create({
                        agente_id: agente_id,
                        usuario_id: usuarioId,
                        tipo_faturacao: "Electrônico",
                        valor: valor_electronico,
                        forma_pagamento: forma_pagamento,
                    });
                }

                if (valor_fisico) {
                    await faturacoes.create({
                        agente_id: agente_id,
                        usuario_id: usuarioId,
                        tipo_faturacao: "Físico",
                        valor: valor_fisico,
                        forma_pagamento: forma_pagamento,
                    });
                }
            } else {
                return {
                    successo: false,
                    mensagem: `Informe o/s valor da compra`,
                };
            }

            return {
                successo: true,
                mensagem: `Saldo Electrônico: ${valor_electronico},00 KZ e Saldo Físico: ${valor_fisico},00 KZ`,
            };
        } catch (erro) {
            console.error("Erro ao cadastrar faturação:", erro);
            return { successo: false, mensagem: "Confirme os dados!" };
        }
    };

    /**
     * Buscar as faturações de uma data específica
     * @param { Number } limit - Limite de registros desejados
     * @param { Date } data - Data do relatório
     * @returns { Object| { faturacoes: Array,
     * successo: Boolean,
     * mensagem: String }}
     */
    pegarFaturacoes = async (data, limit, filtro) => {
        try {
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

            const faturacoesEncontradas = await faturacoes.findAll({
                raw: true,
                nest: true,
                limit: limit,
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
                order: [["data_faturacao", "DESC"]],
                include: {
                    model: models.agentes,
                    as: "agente",
                    attributes: ["nome", "telefone"],
                },
            });
            if (faturacoesEncontradas.length == 0) {
                return {
                    successo: false,
                    mensagem: "Nenhuma faturação encontrada!",
                };
            }

            faturacoesEncontradas.map((faturacao) => {
                faturacao.data_faturacao = getFullStringDate(
                    faturacao.data_faturacao
                );
            });

            return {
                faturacoes: faturacoesEncontradas,
                filtro: filtro,
                successo: true,
                mensagem: "Faturações encontradas!",
            };
        } catch (error) {
            console.log("\nErro ao buscar faturações..." + error);
            return { successo: false, mensagem: "Erro ao renderizar home!" };
        }
    };

    /**
     * Buscar uma faturação específica
     * @param { Number } id_facturacao - ID da faturação que desejamos buscar
     * @returns { Object}
     */
    pegarFaturacaoPorId = async (id_facturacao) => {
        try {
            const faturacaoEncontrada = await faturacoes.findOne({
                raw: true,
                nest: true,
                where: {
                    id_facturacao: id_facturacao,
                },
                include: {
                    model: models.agentes,
                    as: "agente",
                    attributes: ["nome", "telefone"],
                },
            });

            const usuarioEncontrado = await usuario.findOne({
                raw: true,
                nest: true,
                where: {
                    id_usuario: faturacaoEncontrada.usuario_id,
                },
            });

            if (faturacaoEncontrada.length == 0) {
                return {
                    successo: false,
                    mensagem: "Nenhuma faturação encontrada!",
                };
            }

            faturacaoEncontrada.data_faturacao = getFullStringDate(
                faturacaoEncontrada.data_faturacao
            );

            return {
                faturacao: faturacaoEncontrada,
                usuario: usuarioEncontrado,
                successo: true,
                mensagem: "Faturação encontrada!",
            };
        } catch (error) {
            console.log("\nErro no perfil da faturação..." + error);
            return {
                successo: false,
                mensagem: "Erro no perfil da faturação!",
            };
        }
    };

    /**
     * Função que atualiza os dados de uma faturação
     * @param { Object } dados - Dados da faturação que queremos atualizar
     * @returns { Object}
     */
    actualizarFacturacao = async (dados) => {
        try {
            const {
                tipo,
                valor,
                forma_pagamento,
                data_faturacao,
                tipo_faturacao,
                id_facturacao,
            } = dados;
            const faturacaoAtualizada = await faturacoes.update(
                {
                    tipo: tipo,
                    valor: valor,
                    tipo_faturacao: tipo_faturacao,
                    data_faturacao: data_faturacao,
                    forma_pagamento: forma_pagamento,
                },
                { where: { id_facturacao: id_facturacao } }
            );

            if (!faturacaoAtualizada) {
                return {
                    successo: false,
                    mensagem: "Faturação não encontrada",
                };
            }

            return {
                successo: true,
                mensagem: "Faturação atualizada com sucesso.",
            };
        } catch (erro) {
            console.error("Erro ao atualizar faturação:", erro);
            return { successo: false, mensagem: "Confirme os dados!" };
        }
    };

    /**
     * Deleta um faturacao
     * @param {Object} dados
     * @returns {Object} { successo, mensagem }
     */
    async deleteFacturacao(dados) {
        const { id_facturacao } = dados;
        try {
            const deletada = await faturacoes.destroy({
                where: { id_facturacao: id_facturacao },
            });

            if (deletada) {
                return {
                    successo: true,
                    mensagem: "Faturação deletada com sucesso.",
                };
            } else {
                return {
                    successo: false,
                    mensagem: "Faturação não encontrado!",
                };
            }
        } catch (erro) {
            console.error("Erro ao deletar Faturação:", erro);
            return { successo: false, mensagem: "Tente novamente mais tarde!" };
        }
    }

    /**
     * Função que transita de estado de uma faturação,de pendente para paga
     * @param { Number } id_facturacao - ID da faturação que desejamos transitar
     * @returns { Object}
     */
    resolverFacturacao = async (id_facturacao) => {
        try {
            const faturacaoAtualizada = await faturacoes.update(
                {
                    estado: "Pago",
                },
                { where: { id_facturacao: id_facturacao } }
            );

            if (!faturacaoAtualizada) {
                return {
                    successo: false,
                    mensagem: "Faturação não encontrada",
                };
            }

            return {
                successo: true,
                mensagem: "Faturação resolvida com sucesso.",
            };
        } catch (erro) {
            console.error("Erro ao resolver faturação:", erro);
            return { successo: false, mensagem: "Internal server error!" };
        }
    };

    /**
     * Função que buscar todas as faturações de um agente
     * @param { Number } id_agente - ID do agente que desejamos ver as faturações
     * @param { Date } data - Data que desejamos filtrar as faturações, ano e mês
     * @returns { Object}
     */
    pegarTodasFacturacoesDoAgente = async (agente_id, data) => {
        try {
            if (!data) {
                data = new Date();
            }

            const ano = new Date(data).getFullYear();
            const mes = new Date(data).getMonth() + 1;

            const agenteEncontrado = await agente.findOne({
                raw: true,
                where: { id_agente: agente_id },
            });

            if (!agenteEncontrado) {
                return {
                    successo: false,
                    mensagem: "Nenhum Sub-agente encontrado!",
                };
            }

            const faturacoesEncontradas = await faturacoes.findAll({
                raw: true,
                nest: true,
                where: {
                    [Op.and]: [
                        where(fn("YEAR", col("data_faturacao")), ano),
                        where(fn("MONTH", col("data_faturacao")), mes),
                        where(col("agente_id"), agente_id),
                    ],
                },
                order: [["data_faturacao", "DESC"]],
                include: {
                    model: models.agentes,
                    as: "agente",
                    attributes: ["nome", "telefone"],
                },
            });

            if (faturacoesEncontradas.length == 0) {
                return {
                    successo: false,
                    agente: agenteEncontrado,
                    mensagem: "Nenhuma faturação encontrada!",
                };
            }

            faturacoesEncontradas.map((faturacao) => {
                faturacao.data_faturacao = getFullStringDate(
                    faturacao.data_faturacao
                );
            });

            return {
                faturacoes: faturacoesEncontradas,
                agente: agenteEncontrado,
                successo: true,
                mensagem: "Faturações encontradas!",
            };
        } catch (error) {
            console.log("\nErro buscar faturações do agente..." + error);
            return {
                successo: false,
                mensagem: "Erro buscar faturações do agente!",
            };
        }
    };
}

module.exports = FaturacaoService;
