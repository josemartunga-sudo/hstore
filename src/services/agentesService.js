const db = require("../../config/database");
const initModels = require("../models/init-models");
const { Op, fn, col, where } = require("sequelize");
const sequelize = db.sequelize;
const models = initModels(sequelize);
const agente = models.agentes;
const faturacoes = models.faturacoes;
const pagamentos = models.pagamentos;

class AgentesService {
    /**
     * Cria um novo agente, caso o telefone e o ID não estejam já cadastrados.
     * @param {Object} dadosAgentes - Dados do agente (id_agente, nome, telefone)
     * @param {number} id_usuario - ID do usuário associado
     * @returns {Object} { successo, mensagem }
     */
    async criarAgentes(dadosAgentes, id_usuario) {
        const { id_agente, nome, telefone } = dadosAgentes;

        try {
            // Verifica se já existe um agente com o mesmo telefone
            let agenteExistente = await agente.findOne({
                where: { telefone: telefone },
            });
            if (agenteExistente) {
                return {
                    successo: false,
                    mensagem: "Número de telefone indisponivel.",
                };
            }

            // Verifica se já existe um agente com o mesmo ID
            agenteExistente = await agente.findOne({
                where: { id_agente: id_agente },
            });
            if (agenteExistente) {
                return {
                    successo: false,
                    mensagem: "ID de agente indisponivel.",
                };
            }

            // Cria o novo agente
            await agente.create({
                id_agente: id_agente,
                usuario_id: id_usuario,
                nome: nome,
                telefone: telefone,
                estado: "ativo",
            });

            return {
                successo: true,
                mensagem: "Sub-agente " + nome + " cadastrado com sucesso.",
            };
        } catch (erro) {
            console.error("Erro ao cadastrar agente:", erro);
            return { successo: false, mensagem: "Confirme os dados!" };
        }
    }

    /**
     * Retorna todos os agentes cadastrados.
     * @returns {Object[]|boolean} Lista de agentes ou false em caso de erro
     */
    async pegarTodosAgentes() {
        try {
            const agentes = await agente.findAll({
                raw: true,
                order: [["nome", "ASC"]],
            });
            return agentes || false;
        } catch (erro) {
            console.error("Erro ao buscar agentes:", erro);
            return false;
        }
    }

    /**
     * Retorna apenas agentes com estado "Ativo".
     * @returns {Object[]|boolean} Lista de agentes ativos ou false em caso de erro
     */
    async pegarTodosAgentesAtivos() {
        try {
            const agentes = await agente.findAll({
                raw: true,
                where: { estado: "Ativo" },
                order: [["nome", "ASC"]],
            });
            return agentes || false;
        } catch (erro) {
            console.error("Erro ao buscar agentes:", erro);
            return false;
        }
    }

    /**
     * Busca um agente pelo ID, incluindo dados do usuário associado.
     * @param {number} id - ID do agente
     * @returns {Object|boolean} Dados do agente ou false se não encontrado
     */
    async pegarAgentesPorId(id) {
        const agenteEncontardo = await agente.findOne({
            raw: true,
            nest: true,
            where: { id_agente: id },
            include: {
                model: models.usuarios,
                as: "usuario",
                attributes: ["nome", "telefone"],
            },
        });
        return agenteEncontardo || false;
    }

    /**
     * Verifica se já existe um agente com o telefone informado.
     * @param {string} telefone - Número do telefone
     * @returns {boolean} True se existir, False se não
     */
    async verificarTelefoneExistente(telefone) {
        try {
            const agenteExistente = await agente.findOne({
                where: { telefone_agente: telefone },
            });
            return !!agenteExistente;
        } catch (erro) {
            console.error("Erro ao verificar telefone:", erro);
            return false;
        }
    }

    /**
     * Verifica se o agente está ativo.
     * @param {number} id - ID do agente
     * @returns {boolean} True se estiver ativo, False se não
     */
    async verificarAgenteActivo(id) {
        try {
            const agenteEncontrado = await agente.findOne({
                where: { id_agente: id, estado: "ativo" },
            });
            return !!agenteEncontrado;
        } catch (erro) {
            console.error("Erro ao verificar estado do agente:", erro);
            return false;
        }
    }

    /**
     * Atualiza dados de um agente (nome e telefone).
     * @param {Object} dados - { nome, telefone, id_agente }
     * @returns {Object} { successo, mensagem }
     */
    async actualizarAgente(dados) {
        const { nome, telefone, id_agente } = dados;
        try {
            const atualizado = await agente.update(
                { nome: nome, telefone: telefone },
                { where: { id_agente: id_agente } }
            );

            if (atualizado) {
                return {
                    successo: true,
                    mensagem: "Sub-agente atualizado com sucesso.",
                };
            } else {
                return {
                    successo: false,
                    mensagem: "Sub-agente não encontrado ou dados iguais.",
                };
            }
        } catch (erro) {
            console.error("Erro ao atualizar Sub-agente:", erro);
            return { successo: false, mensagem: "Confirme os dados!" };
        }
    }

    /**
     * Remove um agente do sistema.
     * @param {Object} dados - { id_agente }
     * @returns {Object} { successo, mensagem }
     */
    async deletarAgente(dados) {
        const { id_agente } = dados;
        try {
            const deletado = await agente.destroy({
                where: { id_agente: id_agente },
            });

            if (deletado) {
                return {
                    successo: true,
                    mensagem: "Sub-agente deletado com sucesso.",
                };
            } else {
                return {
                    successo: false,
                    mensagem: "Sub-agente não encontrado!",
                };
            }
        } catch (erro) {
            console.error("Erro ao deletar Sub-agente:", erro);
            return { successo: false, mensagem: "Tente novamente mais tarde!" };
        }
    }

    /**
     * Busca todas as facturações associadas a um agente.
     * Inclui também informações de agente, cliente e pagamento.
     * @param {number} id_agente - ID do agente
     * @returns {Object[]|boolean} Lista de facturação ou false em caso de erro
     */
    async buscarFacturacoesAgentes(id_agente) {
        try {
            const facturacoesAgente = await faturacoes.findAll({
                raw: true,
                where: { agente_id: id_agente },
                include: [
                    {
                        model: models.agentes,
                        as: "agente",
                        attributes: ["nome", "telefone"],
                    },
                    {
                        model: models.clientes,
                        as: "cliente",
                        attributes: ["nome", "telefone"],
                    },
                    {
                        model: models.pagamentos,
                        as: "pagamento",
                        attributes: ["tipo"],
                    },
                ],
                order: [["data", "DESC"]],
            });

            return facturacoesAgente || false;
        } catch (erro) {
            console.error("Erro ao buscar facturação do agente:", erro);
            return false;
        }
    }

    /**
     * Muda a forma de pagamento das facturas de um agente no mês/ano atuais.
     * Regras:
     *  - Só pode alterar se TODAS as facturas forem "Mensais"
     *  - Caso contrário, retorna erro
     *  - Atualiza todas para "Quinzenal"
     * @param {number} idAgente - ID do agente
     * @returns {Object} { sucesso, mensagem }
     */
    async mudarFormaPagamento(id_agente) {
        try {
            // Obtém mês e ano atuais
            const mesAtual = new Date().getMonth() + 1;
            const anoAtual = new Date().getFullYear();

            // Busca facturas do agente neste mês/ano
            const Facturacoes = await faturacoes.findAll({
                where: {
                    agente_id: id_agente,
                    [Op.and]: [
                        where(fn("MONTH", col("data_faturacao")), mesAtual),
                        where(fn("YEAR", col("data_faturacao")), anoAtual),
                    ],
                },
                raw: true,
            });

            // Se não houver facturas no mês atual
            if (!Facturacoes.length) {
                return {
                    sucesso: false,
                    mensagem: "O agente ainda não tem facturações este mês.",
                };
            }

            // Verifica se o agente já é Quinzenal
            const todasQuinzenais = Facturacoes.every(
                (f) => f.forma_pagamento === "Quinzenal"
            );

            if (todasQuinzenais) {
                return {
                    sucesso: false,
                    mensagem: "O agente já é quinzenal.",
                };
            }

            // Atualiza todas as facturas para "Quinzenal"
            await faturacoes.update(
                { forma_pagamento: "Quinzenal" },
                {
                    where: {
                        agente_id: id_agente,
                        [Op.and]: [
                            where(fn("MONTH", col("data_faturacao")), mesAtual),
                            where(fn("YEAR", col("data_faturacao")), anoAtual),
                        ],
                    },
                }
            );

            return {
                sucesso: true,
                mensagem:
                    "Forma de pagamento alterada para Quinzenal com sucesso.",
            };
        } catch (erro) {
            console.error("Erro ao mudar forma de pagamento:", erro);
            return { sucesso: false, mensagem: "Erro interno do servidor." };
        }
    }
}

module.exports = AgentesService;
