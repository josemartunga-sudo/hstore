const agentesService = require("../services/agentesService");
const agenteService = new agentesService();
const FaturacaoService = require("../services/facturacaoService");
const faturacaoService = new FaturacaoService();
const RelatorioService = require("../services/relatorioService");
const relatorioService = new RelatorioService();
const { getFullStringDate, getStringDate, getSimpleDate } = require("../utils");
/**
 * Controlador responsável por gerenciar operações relacionadas aos agentes.
 */
class AgentesController {
    /**
     * @route GET /agentes/cadastrar
     * @description Renderiza a página de cadastro de agentes.
     * @access Privado (Autenticado)
     */
    cadastro = (req, res) => {
        res.render("pages/agente/cadastrar", {
            titulo: "Novo Agente",
        });
    };

    /**
     * @route POST /agentes/cadastrar
     * @description Cria um novo agente com base nos dados recebidos do formulário.
     * @access Privado (Autenticado)
     */
    criarAgentes = async (req, res) => {
        try {
            const dados = req.body;
            const usuarioId = req.usuario.id_usuario;
            // Chama o serviço para criar o agente
            const response = await agenteService.criarAgentes(dados, usuarioId);

            if (!response.successo) {
                return res.status(302).json({ msg: response.mensagem });
            }

            return res.status(200).json({ msg: response.mensagem });
        } catch (error) {
            console.error("Erro ao criar agente:", error);
            return res.status(500).json({ msg: "Internal server error" });
        }
    };

    /**
     * @route GET /agentes/
     * @description Lista todos os agentes cadastrados.
     * @access Privado (Autenticado)
     */
    listarAgentes = async (req, res) => {
        try {
            const { info } = req.query;
            const agentes = await agenteService.pegarTodosAgentes();

            if (agentes.length == 0) {
                return res.render("pages/agente/agentes", {
                    titulo: "Agentes Cadastrados",
                    msg: "Nenhum agente cadastrado!",
                });
            }

            return res.render("pages/agente/agentes", {
                titulo: "Agentes Cadastrados",
                agentes: agentes,
                info: info,
            });
        } catch (error) {
            console.error("Erro ao listar agentes:", error);
            res.render("pages/error", {
                titulo: "Internal error",
            });
        }
    };

    /**
     * @route GET /agentes/ativos
     * @description Lista todos os agentes cadastrados com estado ativo.
     * @access Privado (Autenticado)
     */
    listarAgentesAtivos = async (req, res) => {
        try {
            const agentes = await agenteService.pegarTodosAgentesAtivos();

            if (!agentes) {
                return res
                    .status(200)
                    .json({ msg: "Nenhum agente cadastrado!" });
            }

            res.status(200).json({ agentes: agentes });
        } catch (error) {
            console.error("Erro ao listar agentes:", error);
            res.status(500).send("Erro interno no servidor");
        }
    };

    /**
     * @route GET /agentes/perfil/id
     * @description Busca e exibe os detalhes de um agente com base no ID.
     * @access Privado (Autenticado)
     */
    buscarAgentesPorId = async (req, res) => {
        try {
            const { id } = req.params;
            const agente = await agenteService.pegarAgentesPorId(id);
            if (!agente) {
                return res.redirect("/agentes");
            }
            agente.data_criacao = getFullStringDate(agente.data_criacao);
            res.render("pages/agente/perfil", {
                titulo: "Perfil do Agente",
                agente: agente,
                logo: agente.nome[0].toUpperCase(),
            });
        } catch (error) {
            console.error("Erro ao buscar agente:", error);
            res.render("pages/error", {
                titulo: "Internal error",
            });
        }
    };

    /**
     * @route GET /agentes/editar/id
     * @description Renderiza a página de edição de um agente específico.
     * @access Privado (Autenticado)
     */
    actualizarPage = async (req, res) => {
        try {
            const { id } = req.params;
            const agente = await agenteService.pegarAgentesPorId(id);

            if (!agente) {
                return res.redirect("/agentes");
            }

            res.render("pages/agente/editar", {
                titulo: "Editar Agente",
                agente: agente,
            });
        } catch (error) {
            console.error("Erro ao carregar página de edição:", error);
            res.render("pages/error", {
                titulo: "Internal error",
            });
        }
    };

    /**
     * @route PUT /agentes/editar
     * @description Atualiza os dados de um agente existente.
     * @access Privado (Autenticado)
     */
    atualizarAgente = async (req, res) => {
        try {
            const dados = req.body;
            // Chama o serviço
            const response = await agenteService.actualizarAgente(dados);

            if (!response.successo) {
                return res.status(302).json({ msg: response.mensagem });
            }

            return res.status(200).json({ msg: response.mensagem });
        } catch (error) {
            console.error("Erro ao atualizar agente:", error);
            res.status(500).send("Erro interno no servidor");
        }
    };

    /**
     * @route DELETE /agentes/delete
     * @description Deleta o registro de um agente
     * @access Privado (Autenticado)
     */
    deletarAgente = async (req, res) => {
        try {
            const dados = req.body;
            // Chama o serviço
            const response = await agenteService.deletarAgente(dados);

            if (!response.successo) {
                return res.status(302).json({ msg: response.mensagem });
            }

            return res.status(200).json({ msg: response.mensagem });
        } catch (error) {
            console.error("Erro ao atualizar agente:", error);
            res.status(500).send("Erro interno no servidor");
        }
    };

    /**
     * @route GET /agentes/faturacoes/idAgente
     * @description Busca e exibe as faturações de um agente com base no ID.
     * @access Privado (Autenticado)
     */
    buscarFacturacoesAgentes = async (req, res) => {
        const { id } = req.params;
        let { data } = req.query;
        if (!data) {
            data = getStringDate();
        }
        data = new Date(data);
        try {
            const response =
                await faturacaoService.pegarTodasFacturacoesDoAgente(id, data);
            const resumoMensalDoAgente =
                await relatorioService.pegarResumoMensalDoAgente(id, data);

            if (!resumoMensalDoAgente.successo) {
                res.redirect("/agentes");
            }

            if (!response.successo) {
                return res.render("pages/faturacao/agente", {
                    titulo: "Histórico do Agente",
                    agente: response.agente,
                    msg: response.mensagem,
                    resumoMensalDoAgente: resumoMensalDoAgente,
                });
            }

            res.render("pages/faturacao/agente", {
                titulo: "Histórico do Agente",
                faturacoes: response.faturacoes,
                agente: response.agente,
                successo: response.successo,
                resumoMensalDoAgente: resumoMensalDoAgente,
            });
        } catch (error) {
            console.error("Erro ao buscar relatório do agente:", error);
            res.render("pages/error", {
                titulo: "Internal error",
            });
        }
    };

    /**
     * @route GET /agentes/relatorio/idAgente
     * @description Gera um relatório do agente de acordo as parcelas de pagaento do mesmo no mês
     * @access Privado (Autenticado)
     */
    buscarRelatorioDeAgente = async (req, res) => {
        const { id } = req.params;
        let { data, parcela } = req.query;
        if (!data) {
            data = getStringDate();
        }
        if (!parcela) {
            parcela = null;
        }
        data = new Date(data);
        try {
            const response =
                await relatorioService.pegarRelatorioDePagamentoDoAgente(
                    id,
                    data,
                    parcela
                );

            if (!response.successo) {
                return res.redirect("/agentes");
            }

            res.render("pages/relatorio/agente", {
                titulo: "Relatório de Pagamento do Agente",
                relatorioFinal: response,
                successo: response.successo,
            });
        } catch (error) {
            console.error("Erro ao buscar agente:", error);
            res.render("pages/error", {
                titulo: "Internal error",
            });
        }
    };

    /**
     * @route POST /agentes/cadastrar
     * @description Cria um novo agente com base nos dados recebidos do formulário.
     * @access Privado (Autenticado)
     */
    criarRelatorioDoAgente = async (req, res) => {
        try {
            const { id_usuario } = req.usuario;
            const dados = req.body;
            const response = await relatorioService.criarRelatorioFinalDoAgente(
                id_usuario,
                dados
            );

            if (response.newPage) {
                return res
                    .status(302)
                    .json({ msg: response.mensagem, page: response.page });
            }

            if (!response.successo) {
                return res.status(302).json({ msg: response.mensagem });
            }

            return res.status(200).json({ msg: response.mensagem });
        } catch (error) {
            console.error("Erro ao atualizar faturação:", error);
            return res.status(500).json({ msg: response.mensagem });
        }
    };

    mudarFormaPagamento = async (req, res) => {
        try {
            const { id_agente } = req.body;

            const response = await agenteService.mudarFormaPagamento(id_agente);

            if (!response.successo) {
                req.flash("error_msg", response.mensagem);
                return res.status(302).json({ msg: response.mensagem });
            }

            req.flash("success_msg", response.mensagem);
            return res.status(200).json({ msg: response.mensagem });
        } catch (error) {
            console.error("Erro ao mudar forma de pagamento:", error);
            res.render("pages/error", {
                titulo: "Internal error",
            });
        }
    };
}

module.exports = AgentesController;
