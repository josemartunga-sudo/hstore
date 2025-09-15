const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware responsável por verificar se o usuário está autenticado
 * e se possui permissões de administrador, utilizando JSON Web Token.
 */
class AutenticacaoMiddleware {
  /**
   * Verifica se o usuário está autenticado.
   * Se o token estiver ausente ou inválido, redireciona para a página de login.
   *
   * @param - Objeto de requisição HTTP.
   * @param - Objeto de resposta HTTP.
   * @param - Função para continuar a cadeia de middlewares.
   */
  verificarAutenticacao = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect("/usuarios/login");
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.redirect("/usuarios/login");
      }

      req.usuario = decoded;
      next();
    });
  };

  /**
   * Verifica se o usuário autenticado é um administrador.
   * Se não for, responde com uma mensagem de erro e impede o acesso.
   *
   * @param req - Objeto de requisição HTTP.
   * @param res - Objeto de resposta HTTP.
   * @param next - Função para continuar a cadeia de middlewares.
   */
  verificarAdmin = (req, res, next) => {
    const tipo = req.usuario?.tipo;
    if (tipo === "Admin") {
      return next();
    }
    
    console.warn("Acesso negado: usuário não é administrador.");
    if (req.method == "GET") {
      return res.render("pages/index", {
        alerta: {
          msg: "Não tens permissão para executar esta operação"
        }
      });
    } else {
      return res.status(350).json({ msg: "Não tens permissão para executar esta operação" });
    }
  };
}

module.exports = AutenticacaoMiddleware;
