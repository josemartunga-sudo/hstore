const RelatorioService = require("../services/relatorioService");
const FaturacoesService = require("../services/facturacaoService");
const relatorioService = new RelatorioService();
const faturacoesService = new FaturacoesService();

/*
    Controlador para a página inicial
*/  


homePage = async (req, res) => {

    const resumoDiario = await relatorioService.pegarResumoDiarioDaEmpresa();
    const response = await faturacoesService.pegarFaturacoes(null, 10);
    
    // Renderiza a home enviado os dados estatíticos do dia
    res.render("pages/index", {
        titulo: "Home",
        faturacoes: response.faturacoes,
        successo: response.successo,
        resumoDiario: resumoDiario
    });
};
module.exports = { homePage };