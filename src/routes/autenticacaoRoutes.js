/*
 * ============================================================
 *  Autenticação Routes
 *  Define endpoints relacionados ao login de usuários.
 *  Faz parte do módulo de autenticação do sistema.
 *  Protegido por middleware, quando necessário.
 * ============================================================
 */

const express = require("express");

// Importa os controladores e middlewares
const AutenticacaoController = require("../controllers/autenticacaoController");
const AutenticacaoMiddleware = require("../middlewares/autenticacaoMiddleware");

// Instancia os objetos das classes
const autenticacaoMiddleware = new AutenticacaoMiddleware();
const autenticacaoController = new AutenticacaoController();

// Cria o roteador para o módulo de autenticação
const autenticacaoRoutes = express.Router();

/**
 * GET /login
 * Página de login do sistema
 * Exibe o formulário de login.
 */
autenticacaoRoutes.get("/usuarios/login", autenticacaoController.loginPage);

/**
 * POST /login
 * Processa o login do usuário
 * Valida credenciais e gera token JWT (via Controller)
 */
autenticacaoRoutes.post("/usuarios/login", autenticacaoController.login);


/**
 *  necessário no futuro:
 * GET /logout
 * Encerra a sessão do usuário 
 */
autenticacaoRoutes.get("/usuarios/logout",
    autenticacaoMiddleware.verificarAutenticacao,
    autenticacaoController.logout
); //  quando implementar logout

// Exporta as rotas de autenticação
module.exports = { autenticacaoRoutes };