const db = require("../../config/database");
const initModels = require("../models/init-models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const sequelize = db.sequelize;
const models = initModels(sequelize);
const usuario = models.usuarios;

// Carrega variáveis de ambiente
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRATION;

/**
 * Serviço responsável por autenticar um usuário no sistema.
 * Aplica hashing seguro e gera token JWT.
 */
class AutenticacaoService {
  /**
   * Autentica um usuário usando telefone e senha.
   * @param {{ telefone: string, senha: string }} credenciais - Credenciais do usuário.
   * @returns {Promise<string|{msg: string}>} Token JWT ou mensagem de erro.
   */
  autenticar = async (credenciais) => {
    try {
      const { telefone, senha } = credenciais;
      // Busca o usuário no banco de dados
      const usuarioEncontrado = await usuario.findOne({
        where: { telefone: telefone },
      });

      if (!usuarioEncontrado) {
        return { successo: false, mensagem: "Telefone incorreto!" };
      }

      // Verifica se encontrou e se a senha bate
      const senhaValida = usuarioEncontrado
        ? await bcrypt.compare(senha, usuarioEncontrado.senha)
        : false;

      if (!senhaValida) {
        return { successo: false, mensagem: "Senha incorreta!" };
      }
      // Gera token JWT com dados essenciais do usuário
      const token = jwt.sign(
        {
          id_usuario: usuarioEncontrado.id_usuario,
          nome: usuarioEncontrado.nome,
          tipo: usuarioEncontrado.tipo,
          estado: usuarioEncontrado.estado,
          data_criacao: usuarioEncontrado.data_criacao,
          telefone: usuarioEncontrado.telefone,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      return {
        successo: true,
        mensagem: "Logado",
        token: token,
        usuarioLogado: {
          id_usuario: usuarioEncontrado.id_usuario,
          nome: usuarioEncontrado.nome,
          tipo: usuarioEncontrado.tipo,
          estado: usuarioEncontrado.estado,
          data_criacao: usuarioEncontrado.data_criacao,
          telefone: usuarioEncontrado.telefone,
        },
      };
    } catch (erro) {
      console.error("Erro ao efeituar Login:", erro);
      return { successo: false, mensagem: "Erro interno ao efeituar login" };
    }
  };
}

module.exports = AutenticacaoService;