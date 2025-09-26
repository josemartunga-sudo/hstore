const { CharsetToEncoding } = require("mysql2");
const relatorio_Service = require("../services/relatorioService");
const { getStringDate, getSimpleDate } = require("../utils");
const relatorioService = new relatorio_Service();

class relatorioController {
    /**
     * @route GET /relatorio/listar
     * @desc Lista todas as relatorios cadastradas.
     */
    buscarRelatorioMensal = async (req, res) => {
        let { data, filtro } = req.query;

        if (!data) {
            data = getSimpleDate();
        }
        data = new Date(data);
        try {
            const response = await relatorioService.pegarResumoMensalDaEmpresa(
                data,
                filtro
            );

            if (!response.successo) {
                return res.redirect("/");
            }

            res.render("pages/relatorio/mensal", {
                titulo: "Relatório Mensal",
                resumoMensal: response,
                successo: response.successo,
            });
        } catch (error) {
            console.error("Erro ao buscar relatório mensal   :", error);
            res.render("pages/error", {
                titulo: "Internal error",
            });
        }
    };

    buscarRelatorioQuinzenal = async (req, res) => {
        let { data, filtro } = req.query;

        if (!data) {
            data = getSimpleDate();
        }
        data = new Date(data);
        try {
            const response = await relatorioService.pegarResumoQuinzenalDaEmpresa(
                data,
                filtro
            );

            if (!response.successo) {
                return res.redirect("/");
            }

            res.render("pages/relatorio/quinzenal", {
                titulo: "Relatório Quinzenal",
                resumoQuinzenal: response,
                successo: response.successo,
            });
        } catch (error) {
            console.error("Erro ao buscar relatório quinzenal   :", error);
            res.render("pages/error", {
                titulo: "Internal error",
            });
        }
    };

    buscarRelatorioInsight = async (req, res) => {
        let { data } = req.query;
        if (!data) {
            data = getSimpleDate();
        }
        data = new Date(data);
        try {
            const response = await relatorioService.pegarResumoMensalDaEmpresa(
                data
            );

            res.json({
                titulo: "Insights",
                resumoMensal: response,
                successo: response.successo,
            });
        } catch (error) {
            console.error("Erro ao buscar relatório mensal   :", error);
            res.render("pages/error", {
                titulo: "Internal error",
            });
        }
    };

    buscarAgentesPagos = async (req, res) => {
        let { data, filtro } = req.query;
        if (!data) {
            data = getSimpleDate();
        }
        data = new Date(data);
        try {
            const response = await relatorioService.pegarResumoMensalDaEmpresa(
                data,
                filtro
            );

            if (!response.successo) {
                return res.redirect("/");
            }

            res.render("pages/relatorio/pagos", {
                titulo: "Agentes pagos",
                resumoMensal: response,
                successo: response.successo,
            });
        } catch (error) {
            console.error("Erro ao buscar relatório mensal   :", error);
            res.render("pages/error", {
                titulo: "Internal error",
            });
        }
    };
}

module.exports = relatorioController;
