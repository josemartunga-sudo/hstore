// Importações principais
const express = require("express");

// Importa rotas e middlewares das outras áreas do sistema
const { usuarioRoutes } = require("./usuariosRoutes");
const { facturacaoRoutes } = require("./faturacaoRoutes");
const { agenteRoutes } = require("./agentesRoutes");
const { autenticacaoRoutes } = require("./autenticacaoRoutes");
const { relatorioRoutes } = require("./relatorioRoutes");
const homeController = require("../controllers/homeController");

//Middlewares de autenticação
const AutenticacaoMiddleware = require("../middlewares/autenticacaoMiddleware");
const autenticacaoMiddleware = new AutenticacaoMiddleware();


// Cria um roteador principal
const routes = express.Router();
/**
 * Rota principal da aplicação (home)
 * Requer autenticação antes de carregar a homepage
 */

routes.get(
  "/",
  autenticacaoMiddleware.verificarAutenticacao,
  homeController.homePage
);

/**
 * Rota de login/autenticação
 * Aqui ficam as rotas de login, logout, etc.
 */
routes.use(autenticacaoRoutes);

/**
 * Rotas dos usuários (ex: cadastro, listagem, edição)
 * Protegidas por autenticação
 */
routes.use(
  "/usuarios",
  autenticacaoMiddleware.verificarAutenticacao,
  usuarioRoutes
);

/**
 * Rotas de faturação (criar, editar, listar faturações)
 * Protegidas por autenticação
 */
routes.use(
  "/faturacao",
  autenticacaoMiddleware.verificarAutenticacao,
  facturacaoRoutes
);

/**
 * Rotas dos agentes (criação, listagem, atualização de agentes)
 * Protegidas por autenticação
 */
routes.use(
  "/agentes",
  autenticacaoMiddleware.verificarAutenticacao,
  agenteRoutes
);

/**
 * Rotas dos relatorios (criação, listagem)
 * Protegidas por autenticação
 */
routes.use(
  "/relatorios",
  autenticacaoMiddleware.verificarAutenticacao,
  autenticacaoMiddleware.verificarAdmin,
  relatorioRoutes
);

// Exporta o roteador para ser usado na aplicação principal
module.exports = routes;