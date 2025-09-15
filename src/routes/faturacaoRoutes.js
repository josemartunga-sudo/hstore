/**
 * ===================================================
 *  Rotas de Facturação
 *  Define endpoints relacionados ao CRUD de facturação.
 *  Protegido por middleware de autenticação.
 * ===================================================
 */

const express = require("express");
const FacturacaoController = require("../controllers/faturaçaoController");
const AutenticacaoMiddleware = require("../middlewares/autenticacaoMiddleware");

// Instanciando controller e middleware
const facturacaoController = new FacturacaoController();
const autenticacaoMiddleware = new AutenticacaoMiddleware();


// Criando roteador do Express
const facturacaoRoutes = express.Router();

/**
 * @route GET /facturacao
 * @description Lista todas as faturas registadas
 * @access Privado (Autenticado)
 */
facturacaoRoutes.get(
  "/",
  facturacaoController.buscarFacturacoes
);

/**
 * @route GET /facturacao
 * @description Lista todas as faturas registadas
 * @access Privado (Autenticado)
 */
facturacaoRoutes.get(
  "/mensal",
  facturacaoController.buscarFacturacoesMensal
);


/**
 * @route GET /facturacao/cadastrar
 * @description Exibe o formulário para cadastrar uma nova fatura
 * @access Privado (Autenticado)
 */
facturacaoRoutes.get(
  "/cadastrar/:id",
  facturacaoController.cadastro
);

/**
 * @route POST /facturacao/cadastrar
 * @description Processa o envio do formulário e cria uma nova fatura
 * @access Privado (Autenticado)
 */
facturacaoRoutes.post(
  "/cadastrar",
  facturacaoController.criarFacturacao
);


/**
 * @route GET /facturacao/:id
 * @description Busca uma fatura específica pelo ID
 * @access Privado (Autenticado)
 */
facturacaoRoutes.get(
  "/:id",
  facturacaoController.buscarFacturacaoPorId
);

/**
 * @route GET /facturacao/editar/:id
 * @description Exibe o formulário para atualizar uma fatura existente
 * @access Privado (Autenticado)
 */
facturacaoRoutes.get(
  "/editar/:id",
  autenticacaoMiddleware.verificarAdmin,
  facturacaoController.actualizarPage
);

/**
 * @route delete /facturacao/delete
 * @description Processa a atualização de uma fatura
 * @access Privado (Autenticado)
 */
facturacaoRoutes.delete(
  "/delete",
  autenticacaoMiddleware.verificarAdmin,
  facturacaoController.deleteFacturacao
);

/**
 * @route PUT /facturacao/actualizar
 * @description Processa a atualização de uma fatura
 * @access Privado (Autenticado)
 */
facturacaoRoutes.put(
  "/editar",
  autenticacaoMiddleware.verificarAdmin,
  facturacaoController.atualizarFacturacao
);


/**
 * @route PUT /facturacao/resolver
 * @description Muda o estado de uma fatura
 * @access Privado (Autenticado)
facturacaoRoutes.put(
  "/resolver",
  autenticacaoMiddleware.verificarAdmin,
  facturacaoController.resolverFacturacao
);
facturacaoRoutes.get(
  "/pendentes",
  facturacaoController.facturacoesPendentes
);
*/
// Exporta o roteador

module.exports = { facturacaoRoutes };