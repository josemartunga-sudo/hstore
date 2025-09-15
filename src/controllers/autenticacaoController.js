const AutenticacaoService = require("../services/autenticacaoService");
const autenticacaoService = new AutenticacaoService();

/**
 * Controlador responsável pela autenticação de usuários.
 * Renderiza a página de login e realiza o processo de login.
 */
class AutenticacaoController {
  /**
   * Renderiza a página de login.
   *
   * @param req - Objeto de requisição HTTP.
   * @param  res - Objeto de resposta HTTP.
   */
  loginPage = (req, res) => {
    res.render("pages/usuario/login", {
      titulo: "Login"
    });
  };

  /**
   * Autentica um usuário com base nas credenciais fornecidas.
   * Se autenticado com sucesso, define um cookie com o token e redireciona para a página inicial.
   * Se falhar, retorna uma mensagem de erro.
   *
   * @param req - Objeto de requisição contendo as credenciais do usuário.
   * @param  res - Objeto de resposta HTTP.
   * @returns
   */
  login = async (req, res) => {
    const credenciais = req.body;

    const response = await autenticacaoService.autenticar(credenciais);

    if (!response.successo) {
      return res.status(302).json({ msg: response.mensagem });
    }

    // Autenticação bem-sucedida
    res.cookie("token", response.token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: process.env.COOKIE_EXPIRATION,
    });
    res.status(200).json({ msg: response.mensagem, usuario: response.usuarioLogado });
  };


  /**
   * Remoção dos dados de sessão de usuário, destruição dos cookies gravados no navegador
   * @param req - Objeto de requisição contendo as credenciais do usuário.
   * @param  res - Objeto de resposta HTTP.
   * @returns
   */
  logout = async (req, res) => { 
    // Remoção dos cookies
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      maxAge: process.env.COOKIE_EXPIRATION,
    }).status(302).redirect("/usuarios/login");
  };
}

module.exports = AutenticacaoController;
