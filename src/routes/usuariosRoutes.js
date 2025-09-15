/*
 * ===================================================|
 *  Rotas de Usuário                                  |
 *  Define endpoints relacionados ao CRUD de usuários.|
 *  Protegido por middleware de autenticação.         |
 * ===================================================|
 */
const express = require("express");
const UsuarioController = require("../controllers/usuarioController");
const AutenticacaoMiddleware = require("../middlewares/autenticacaoMiddleware");
const autenticacaoMiddleware = new AutenticacaoMiddleware;

// Instâncias
const usuarioController = new UsuarioController();

// Cria roteador do Express
const usuarioRoutes = express.Router();

/**
 * @route GET /usuarios/cadastrar
 * @desc Exibe formulário de cadastro de usuário
 */
usuarioRoutes.get(
  "/cadastrar",
  autenticacaoMiddleware.verificarAdmin,
  usuarioController.cadastro
);

/**
 * @route POST /usuarios/cadastrar
 * @desc Cria novo usuário
 */
usuarioRoutes.post(
  "/cadastrar",
  autenticacaoMiddleware.verificarAdmin,
  usuarioController.criarUsuario
);

/**
 * @route GET /usuarios
 * @desc Exibe uma nova pagina contendo todos os usuarios cadastrados que se encontram  no
 *   estado ativo
 */
usuarioRoutes.get("/",
  autenticacaoMiddleware.verificarAdmin,
  usuarioController.listarUsuarios
);

/**
 * @route GET /usuarios/ativos
 * @desc Lista todos os usuários
 */
usuarioRoutes.get("/ativos",
  usuarioController.listarUsuariosAtivos
);

/**
 * @route GET /usuarios/editar
 * @desc Exibe página de edição do usuário
 */
usuarioRoutes.get("/perfil/:id",
  usuarioController.perfilPage
);


/**
 * @route GET /usuarios/editar/id
 * @desc Atualiza dados do usuário

usuarioRoutes.post("/perfil/:id", usuarioController.atualizarUsuario);
 */
usuarioRoutes.get(
  "/editar/:id",
  usuarioController.actualizarPage
);

/**
 * @route PUT /usuarios/editar
 * @desc Atualiza dados do usuário
usuarioRoutes.post("/perfil/:id", usuarioController.atualizarUsuario);
 */
usuarioRoutes.put(
  "/editar",
  usuarioController.atualizarUsuario
);

/**
 * @route GET /usuarios/editarsenha/id
 * @desc Atualiza a senha do usuário
 */
usuarioRoutes.get(
  "/editarsenha/:id",
  usuarioController.actualizarSenhaPage
);

/**
 * @route PUT /usuarios/editarsenha
 * @desc Atualiza a senha do usuário
 */
usuarioRoutes.put(
  "/editarsenha",
  usuarioController.actualizarSenha
);

/**
 * @route delete /usuarios/delete
 * @desc Deleta o registro de um usuário
 */
usuarioRoutes.delete(
  "/delete",
  autenticacaoMiddleware.verificarAdmin,
  usuarioController.deleteUsuario
);


/**
 * @route GET /usuarios/estado/:id
 * @desc Suspende ou reativa usuário (muda estado)
usuarioRoutes.get("/estado/:id", usuarioController.mudarEstado);
*/

// Exporta o roteador e as instâncias
module.exports = { usuarioRoutes, usuarioController };
