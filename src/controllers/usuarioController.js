const { json } = require("body-parser");
const UsuarioService = require("../services/usuarioService");
const { getFullStringDate } = require("../utils");
const usuarioService = UsuarioService;

/**
 * Controller responsável por gerenciar ações relacionadas ao usuário.
 * Segue padrão MVC: Este é o "Controller".
 */
class UsuarioController {
    /**
     * Exibe o formulário de cadastro de um novo usuário.
     */
    cadastro = (req, res) => {
        res.render('pages/usuario/cadastrar', {
            titulo: 'Novo Usuario'
        });
    };

    /**
     * Cria um novo usuário a partir dos dados enviados pelo formulário.
     */
    criarUsuario = async (req, res) => {
        try {
            const dados = req.body;
            // Chama o serviço para criar o usuário
            const response = await usuarioService.criarUsuario(dados);

            if (!response.successo) {
                return res.status(302).json({ msg: response.mensagem });
            }

            return res.status(200).json({ msg: response.mensagem });
        } catch (error) {
            console.error("Erro ao criar usuario:", error);
            res.status(500).json({ msg: "Erro interno no servidor!" });
        }
    };

    /**
     * Vai renderizar uma nova pagina  contendo todas os usuarios cadastrados que se encontram  no estado ativo.
     */

    listarUsuarios = async (req, res) => {
        try {
            const usuariosActivos = await usuarioService.pegarTodosUsuarios();

            if (!usuariosActivos.successo) {
                return res.render("pages/agente/agentes", {
                    titulo: "Agentes Cadastrados",
                    msg: "Nenhum usuário cadastrado!"
                });
            }

            res.render("pages/usuario/usuarios", {
                titulo: "Usuários Cadastrados",
                usuarios: usuariosActivos.usuarios
            });
        } catch (error) {
            console.error("Erro ao listar agentes:", error);
            res.render("pages/error", {
                titulo: "Internal error"
            });
        }
    };

    /**
     * Lista todos os usuários cadastrados.
     */
    listarUsuariosAtivos = async (req, res) => {
        try {
            const response = await usuarioService.pegarTodosUsuarios();

            if (!response.successo) {
                return res.status(302).json({ msg: "Nenhum agente cadastrado!" });
            }

            res.status(200).json({ usuarios: response.usuarios });
        } catch (error) {
            console.error("Erro ao listar Usuarios:", error);
            res.status(500).send("Erro interno no servidor");
        }
    };

    /**
     * Renderiza a página de perfil do usuário.
     */
    perfilPage = async (req, res) => {
        try {
            const { id } = req.params; // Exemplo de como obter o ID do usuário autenticado
            const usuario = await usuarioService.pegarUsuarioPorId(id);

            if (!usuario) {
                return res.redirect("/usuarios");
            }

            usuario.data_criacao = getFullStringDate(usuario.data_criacao);
            res.render("pages/usuario/perfil", {
                titulo: "Perfil do Usuário",
                usuario: usuario,
                logo: usuario.nome[0].toUpperCase()
            });
        } catch (error) {
            console.error("Erro ao buscar usuario:", error);
            res.render("pages/error", {
                titulo: "Internal error"
            });
        }
    };

    /**
     * Renderiza a página de edição do usuário atual.
     */
    actualizarPage = async (req, res) => {
        try {
            const { id } = req.params;
            const usuario = await usuarioService.pegarUsuarioPorId(id);

            if (!usuario) {
                return res.redirect("/usuarios");
            }

            res.render('pages/usuario/editar', {
                titulo: 'Editar Usuário',
                usuario: usuario
            });
        } catch (error) {
            console.error("Erro ao carregar página de edição:", error);
            res.render("pages/error", {
                titulo: "Internal error"
            });
        }
    };

    /**
     * Atualiza os dados do usuário autenticado.
     */
    atualizarUsuario = async (req, res) => {
        try {
            const dados = req.body;
            // Chama o serviço
            const response = await usuarioService.actualizarUsuario(dados);

            if (!response.successo) {
                return res.status(302).json({ msg: response.mensagem });
            }

            return res.status(200).json({ msg: response.mensagem });
        } catch (error) {
            console.error("Erro ao atualizar agente:", error);
            res.status(500).send("Erro interno no servidor");
        }
    };
    
    /**
     * Renderiza a página de edição do usuário atual.
     */
    actualizarSenhaPage = async (req, res) => {
        try {
            const { id } = req.params;
            const usuario = await usuarioService.pegarUsuarioPorId(id);

            if (!usuario) {
                return res.redirect("/usuarios");
            }

            res.render('pages/usuario/editarsenha', {
                titulo: 'Editar Senha',
                usuario: usuario
            });
        } catch (error) {
            console.error("Erro ao carregar página de edição:", error);
            res.render("pages/error", {
                titulo: "Internal error"
            });
        }
    };

    /**
     * Atualiza os dados do usuário autenticado.
     */
    actualizarSenha = async (req, res) => {
        try {
            const dados = req.body;
            
            // Chama o serviço
            const response = await usuarioService.actualizarSenha(dados);
            
            if (!response.successo) {
                return res.status(302).json({ msg: response.mensagem });
            }

            return res.status(200).json({ msg: response.mensagem });
        } catch (error) {
            console.error("Erro ao atualizar agente:", error);
            res.status(500).send("Erro interno no servidor");
        }
    };

    /**
     * Atualiza os dados do usuário autenticado.
     */
    deleteUsuario = async (req, res) => {
        try {
            const dados = req.body;
            // Chama o serviço
            const response = await usuarioService.deleteUsuario(dados);

            if (!response.successo) {
                return res.status(302).json({ msg: response.mensagem });
            }

            return res.status(200).json({ msg: response.mensagem });
        } catch (error) {
            console.error("Erro ao atualizar agente:", error);
            res.status(500).send("Erro interno no servidor");
        }
    };

    /**
     * Muda o estado de um usuário (ativo/inativo).
    mudarEstado = async (req, res) => {
        const { id } = req.params;
        const usuario = await usuarioService.pegarUsuarioPorId(id);

        if (!usuario) {
            return res.json({ msg: "Usuário não existe" });
        }

        const novoEstado = usuario.estado;
        console.log(novoEstado);
        const resultado = await usuarioService.mudarEstado(id, novoEstado);

        if (resultado) {
            return res.json({ estado_alterado: usuario });
        }
    };
    */
};

/**
 * Redefinir a senha de um usuário (em desenvolvimento).
 */
/*
redefinirSenha = async (req, res) => {
  const { id } = req.params;
  const dados = req.body;
  const resultado = await usuarioService.actualizarUsuario(id, dados);
 
  if (resultado) {
    return res.redirect("/");
  }
 
  res.redirect("/usuarios/redefinirSenha");
};
*/

module.exports = UsuarioController;
