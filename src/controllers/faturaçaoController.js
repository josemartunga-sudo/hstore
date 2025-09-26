const facturacao_Service = require("../services/facturacaoService");
const facturacaoService = new facturacao_Service();
const db = require("../../config/database");
const initModels = require("../models/init-models");
const agentesService = require("../services/agentesService");
const agenteService = new agentesService();
const sequelize = db.sequelize;
const models = initModels(sequelize);
const agente = models.agentes;
const faturacao = models.faturacoes;
const RelatorioService = require("../services/relatorioService");
const relatorioService = new RelatorioService();
const { Op, fn, col, where } = require("sequelize")
const { getStringDate, getFullStringDate, getSimpleDate } = require("../utils")

class FacturacaoController {
    /**
     * @route GET /facturacao/cadastrar
     * @desc Renderiza o formulário de cadastro de facturação.
     */
    cadastro = async (req, res) => {
        // Renderiza a página de cadastro de facturação
        const { id } = req.params;
        if (!id) {
            return res.redirect("/agentes");
        }

        const agenteEncontrado = await agente.findOne({
            raw: true,
            where: { id_agente: id },
        });
        if (!agenteEncontrado) {
            return res.redirect("/agentes");
        }

        const mes = new Date().getMonth() + 1;
        const ano = new Date().getFullYear();
        const faturacaoEncontrado = await faturacao.findOne({
            raw: true,
            where: {
                [Op.and]: [
                    where(fn("YEAR", col("data_faturacao")), ano),
                    where(fn("MONTH", col("data_faturacao")), mes),
                    where(col("agente_id"), agenteEncontrado.id_agente)
                ]
            }
        });

        return res.render("pages/faturacao/cadastrar", {
            titulo: "Nova Faturação",
            forma_pagamento: faturacaoEncontrado?.forma_pagamento,
            agente: agenteEncontrado,
        });
    };

    /**
     * @route POST /facturacao/cadastrar
     * @desc Cria uma nova entrada de facturação.
     */
    criarFacturacao = async (req, res) => {
        try {
            const dados = req.body;
            const usuarioId = await req.usuario.id_usuario;

            const response = await facturacaoService.criarFaturacao(usuarioId, dados);

            if (!response.successo) {
                return res.status(400).send({ msg: response.mensagem });
            }

            return res.status(200).json({ msg: response.mensagem });
        } catch (error) {
            console.error("Erro ao criar facturação:", error);
            res.status(500).send("Erro interno do servidor");
        }
    };

    /**
     * @route GET /facturacao
     * @desc Lista todas as facturações cadastradas.
     */
    buscarFacturacoes = async (req, res) => {
        try {
            let { data, filtro } = req.query;
            if (!data) {
                data = getStringDate();
            }
            data = new Date(data);
            const resumoDiario = await relatorioService.pegarResumoDiarioDaEmpresa(data, filtro);
            const response = await facturacaoService.pegarFaturacoes(data, null, filtro);

            res.render("pages/faturacao/faturacoes", {
                titulo: "Faturações",
                resumoDiario: resumoDiario,
                successo: response.successo,
                faturacoes: response.faturacoes
            });
        } catch (error) {
            console.error("Erro ao listar facturações:", error);
            res.render("pages/error", {
                titulo: "Internal error"
            });
        }
    };

    /**
     * @route GET /facturacao/mensal
     * @desc Lista todas as facturações cadastradas de um mês
     */
    buscarFacturacoesMensal = async (req, res) => {
        let { data, filtro } = req.query;
        if (!data) {
            data = getSimpleDate();
        }
        data = new Date(data);

        try {
            const response = await relatorioService.pegarResumoMensalDaEmpresa(data, filtro);

            if (!response.successo) {
                return res.redirect("/");
            }
            
            res.render('pages/faturacao/faturacoesMensal', {
                titulo: 'Faturações do Mês',
                resumoMensal: response,
                successo: response.successo
            });
        } catch (error) {
            console.error("Erro ao buscar faturações do mês:", error);
            res.render("pages/error", {
                titulo: "Internal error"
            });
        }
    };

    /**
     * @route GET /facturacao/:id
     * @desc Busca uma facturação específica pelo ID.
     */
    buscarFacturacaoPorId = async (req, res) => {
        try {
            const { id: usuarioId } = req.params;
            const response = await facturacaoService.pegarFaturacaoPorId(usuarioId);

            if (!response.successo) {
                return res.redirect("/faturacao/resolvidas");
            }

            response.faturacao.data_criacao = getFullStringDate(response.faturacao.data_criacao);

            res.render("pages/faturacao/detalhes", {
                titulo: "Detalhes de Faturação",
                faturacao: response.faturacao,
                usuario: response.usuario
            });
        } catch (error) {
            console.error("Erro ao buscar agente:", error);
            res.render("pages/error", {
                titulo: "Internal error"
            });
        }
    };

    /**
     * @route GET /facturacao/actualizar
     * @desc Renderiza o formulário de atualização.
     */
    actualizarPage = async (req, res) => {
        try {
            const { id: idFacturacao } = req.params;
            const facturacao = await facturacaoService.pegarFaturacaoPorId(idFacturacao);

            if (!facturacao) {
                return res.redirect("/faturacao/resolvidas");
            }

            const agente = await agenteService.pegarAgentesPorId(facturacao.faturacao.agente_id);

            if (!agente) {
                return res.redirect("/agentes");
            }            

            res.render("pages/faturacao/editar", {
                titulo: 'Editar Faturação',
                agente: agente,
                faturacao: facturacao.faturacao
            });
        } catch (error) {
            console.error("Erro ao carregar página de edição:", error);
            res.render("pages/error", {
                titulo: "Internal error"
            });
        }
    };

    /**
     * @route POST /facturacao/actualizar
     * @desc Atualiza dados de uma facturação.
     */
    atualizarFacturacao = async (req, res) => {
        try {
            const dados = req.body;
            // Chama o serviço
            const response = await facturacaoService.actualizarFacturacao(dados);

            if (!response.successo) {
                return res.status(302).json({ msg: response.mensagem });
            }

            return res.status(200).json({ msg: response.mensagem });
        } catch (error) {
            console.error("Erro ao atualizar faturação:", error);
            return res.status(500).json({ msg: response.mensagem });
        }
    };

    /**
     * @route POST /facturacao/delete
     * @desc Deletarregistro de uma facturação.
     */
    deleteFacturacao = async (req, res) => {
        try {
            const dados = req.body;
            // Chama o serviço
            const response = await facturacaoService.deleteFacturacao(dados);

            if (!response.successo) {
                return res.status(302).json({ msg: response.mensagem });
            }

            return res.status(200).json({ msg: response.mensagem });
        } catch (error) {
            console.error("Erro ao deletar faturação:", error);
            return res.status(500).json({ msg: response.mensagem });
        }
    };

    /**
     * @route PUT /facturacao/resolver
     * @desc Atualiza o estado de uma facturação.

    resolverFacturacao = async (req, res) => {
        try {
            const { id_facturacao } = req.body;
            const response = await facturacaoService.resolverFacturacao(id_facturacao);

            if (!response.successo) {
                return res.status(302).json({ msg: response.mensagem });
            }

            return res.status(200).json({ msg: response.mensagem });
        } catch (error) {
            console.error("Erro ao atualizar faturação:", error);
            return res.status(500).json({ msg: response.mensagem });
        }
    };

     * @route GET /facturacao/listar
     * @desc Lista todas as facturações cadastradas pendentes.
    facturacoesPendentes = async (req, res) => {
        try {
            let { data } = req.query;
            if (!data) {
                data = getStringDate();
            }
            data = new Date(data);
            const resumoDiario = await relatorioService.pegarResumoDiarioDaEmpresa(data);
            const response = await facturacaoService.pegarFaturacoes("Pendente", data);

            res.render("pages/faturacao/pendentes", {
                titulo: "Faturações Pendentes",
                resumoDiario: resumoDiario,
                successo: response.successo,
                faturacoes: response.faturacoes
            });
        } catch (error) {
            console.error("Erro ao listar facturações:", error);
            res.render("pages/error", {
                titulo: "Internal error"
            });
        }
    };
    */
}

module.exports = FacturacaoController;
