const db = require("../../config/database");
const initModels = require("../models/init-models");
const sequelize = db.sequelize;
const models = initModels(sequelize);
const agente = models.agentes;
const faturacoes = models.faturacoes;
const pagamentos = models.pagamentos;

class AgentesService {
    /**
     * Cria um novo agente, caso o telefone não esteja cadastrado.
     * @param {Object} dadosAgentes
     * @returns {Object} { successo, mensagem }
     */
    async criarAgentes(dadosAgentes, id_usuario) {
        const { id_agente, nome, telefone } = dadosAgentes;

        try {
            let agenteExistente = await agente.findOne({
                where: { telefone: telefone },
            });
            if (agenteExistente) {
                return {
                    successo: false,
                    mensagem: "Número de telefone indisponivel.",
                };
            }

            agenteExistente = await agente.findOne({
                where: { id_agente: id_agente },
            });
            if (agenteExistente) {
                return {
                    successo: false,
                    mensagem: "ID de agente indisponivel.",
                };
            }

            await agente.create({
                id_agente: id_agente,
                usuario_id: id_usuario,
                nome: nome,
                telefone: telefone,
                estado: "ativo",
            });

            return { successo: true, mensagem: "Sub-agente " + nome + " cadastrado com sucesso." };
        } catch (erro) {
            console.error("Erro ao cadastrar agente:", erro);
            return { successo: false, mensagem: "Confirme os dados!" };
        }
    }

    /**
     * Retorna todos os agentes.
     * @returns {Object[]} Lista de agentes
     */
    async pegarTodosAgentes() {
        try {
            const agentes = await agente.findAll({
                raw: true,
                order: [
                    ["nome", "ASC"]
                ]
            });
            if (agentes) {
                return agentes;
            } else {
                return false;
            }
        } catch (erro) {
            console.error("Erro ao buscar agentes:", erro);
            return false;
        }
    }

    /**
     * Retorna todos os agentes.
     * @returns {Object[]} Lista de agentes
     */
    async pegarTodosAgentesAtivos() {
        try {
            const agentes = await agente.findAll({
                raw: true,
                where: { estado: "Ativo" },
                order: [
                    ["nome", "ASC"]
                ]
            });

            if (agentes) {
                return agentes;
            } else {
                return false;
            }
        } catch (erro) {
            console.error("Erro ao buscar agentes:", erro);
            return false;
        }
    }

    /**
     * Retorna um agente pelo ID.
     * @param {number} id
     * @returns {Object|null}
     */
    async pegarAgentesPorId(id) {
        const agenteEncontardo = await agente.findOne({
            raw: true,
            nest: true,
            where: { id_agente: id },
            include: {
                model: models.usuarios,
                as: "usuario", attributes: ["nome", "telefone"]
            }

        });
        if (agenteEncontardo) {
            return agenteEncontardo;
        } else {
            return false;
        }
    }

    /**
     * Verifica se o telefone já está cadastrado.
     * @param {string} telefone
     * @returns {boolean}
     */
    async verificarTelefoneExistente(telefone) {
        try {
            const agenteExistente = await agente.findOne({
                where: { telefone_agente: telefone },
            });

            return !!agenteExistente; // Retorna true se existir, false caso contrário
        } catch (erro) {
            console.error("Erro ao verificar telefone:", erro);
            return false; // Em caso de erro, assume-se que o telefone não existe
        }
    }

    /**
     * Verifica se o agente está activo.
     * @param {number} id
     * @returns {boolean}
     */

    async verificarAgenteActivo(id) {
        try {
            const agenteEncontrado = await agente.findOne({
                where: { id_agente: id, estado: "ativo" },
            });

            return !!agenteEncontrado; // Retorna true se o agente estiver activo, false caso contrário
        } catch (erro) {
            console.error("Erro ao verificar estado do agente:", erro);
            return false; // Em caso de erro, assume-se que o agente não está activo
        }
    }

    /**
     * Atualiza dados de um agente.
     * @param {Object} dados
     * @returns {Object} { successo, mensagem }
     */
    async actualizarAgente(dados) {
        const { nome, telefone, id_agente } = dados;
        try {
            const atualizado = await agente.update({
                nome: nome,
                telefone: telefone,
            }, { where: { id_agente: id_agente } });

            if (atualizado) {
                return { successo: true, mensagem: "Sub-agente atualizado com sucesso." };
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
     * Deleta um agente
     * @param {Object} dados
     * @returns {Object} { successo, mensagem }
     */
    async deletarAgente(dados) {
        const { id_agente } = dados;
        try {
            const deletado = await agente.destroy({
                where: { id_agente: id_agente }
            });

            if (deletado) {
                return { successo: true, mensagem: "Sub-agente deletado com sucesso." };
            } else {
                return { successo: false, mensagem: "Sub-agente não encontrado!" };
            }

        } catch (erro) {
            console.error("Erro ao deletar Sub-agente:", erro);
            return { successo: false, mensagem: "Tente novamente mais tarde!" };
        }
    }

    /**
     * Alterna o estado do agente entre activo e suspenso.
     * @param {number} id
     * @param {string} estadoAtual
     * @returns {Object} { successo, mensagem }
     */
    async mudarEstado(id, estadoAtual) {
        const novoEstado = estadoAtual === "activo" ? "suspenso" : "activo";

        try {
            const [alterado] = await agente.update(
                { estado: novoEstado },
                { where: { id_agente: id } }
            );

            if (alterado) {
                return {
                    successo: true,
                    mensagem: `Estado alterado para ${novoEstado}.`,
                };
            } else {
                return { successoo: false, mensagem: "Sub-agente não encontrado." };
            }
        } catch (erro) {
            console.error("Erro ao mudar estado do agente:", erro);
            return { successo: false, mensagem: "Erro ao mudar estado do Sub-agente" };
        }
    }
}

module.exports = AgentesService;
