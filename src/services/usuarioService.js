// Importações necessárias
const db = require("../../config/database");
const initModels = require("../models/init-models");
const bcrypt = require("bcrypt");
const usuario = initModels(db.sequelize).usuarios;

/**
 * Service responsável por operações de CRUD relacionadas ao modelo "usuario"
 */
class UsuarioService {
    /**
     * Cria um novo usuário se telefone e email ainda não estiverem cadastrados
     * @param {Object} dadosUsuario - Objeto contendo nome, telefone e email
     * @returns {Object|Boolean} Retorna false em caso de sucesso ou mensagem de erro
     */
    criarUsuario = async (dadosUsuario) => {
        const { nome, telefone, email } = dadosUsuario;
        // Validações básicas

        try {
            if (!nome || !telefone || !email) {
                // Retorna mensagem de erro se algum campo estiver vazio ou email inválido
                return { successo: false, mensagem: "Preencha todos os campos." };
            } else {
                // Verifica se já existe um usuário com o mesmo telefone
                let usuarioExistente = await usuario.findOne({
                    where: { telefone: telefone },
                });
                if (usuarioExistente) {
                    return { successo: false, mensagem: "Telefone indisponível." };
                }

                // Verifica se já existe um usuário com o mesmo email
                usuarioExistente = await usuario.findOne({
                    where: { email: email },
                });
                if (usuarioExistente) {
                    return { successo: false, mensagem: "Email indisponível." };
                }

                const senhaHashed = bcrypt.hashSync(telefone, 10); // Senha gerada a partir do telefone

                await usuario.create({
                    nome: nome,
                    email: email,
                    telefone: telefone,
                    senha: senhaHashed
                });
                return { successo: true, mensagem: "Usuario " + nome + " cadastrado com sucesso." };
            }
        } catch (erro) {
            console.error("Erro ao cadastrar usuario:", erro);
            return { successo: false, mensagem: "Erro interno ao cadastrar usuario." };
        }
    };

    /**
     * Retorna todos os usuários cadastrados
     * @returns {Array} Lista de usuários
     */
    pegarTodosUsuarios = async () => {
        const usuarioEncontrado = await usuario.findAll({
            raw: true,
            order: [
                ["nome", "ASC"]
            ]
        });

        if (!usuarioEncontrado) {
            return { successo: false, mensagem: "Ainda não existe usuarios cadastrados!" };
        }

        return { usuarios: usuarioEncontrado, successo: true, mensagem: "Usuarios encontrados!" };
    };

    /**
     * Busca um usuário pelo ID
     * @param {Number} idUsuario - ID do usuário
     * @returns {Object|null} Dados do usuário ou null
     */
    pegarUsuarioPorId = async (id) => {
        const usuarioEncontrado = await usuario.findOne({
            raw: true,
            where: { id_usuario: id },
        });

        if (usuarioEncontrado) {
            return usuarioEncontrado;
        } else {
            return false;
        }
    };

    /**
     * Atualiza a senha de um usuário
     * @param {Object} dados - Novos dados do usuário
     * @returns {Boolean|null} true, false ou null dependendo do resultado
     */
    actualizarSenha = async (dados) => {
        try {
            const { id_usuario, senha, senhaNova } = dados;
            const usuarioEncontrado = await usuario.findOne({
                where: { id_usuario: id_usuario },
            });

            if (!usuarioEncontrado) {
                return { successo: false, mensagem: "Usuário não encontrado!" };
            }

            // Verifica se encontrou e se a senha bate
            const senhaValida =  await bcrypt.compare(senha, usuarioEncontrado.senha);
            
            if (!senhaValida) {
                return { successo: false, mensagem: "A senha está incorreta!" };
            }

            const senhaHashed = bcrypt.hashSync(senhaNova, 10);

            const atualizado = await usuario.update({
                senha: senhaHashed
            },
                { where: { id_usuario: id_usuario } }
            );

            if (!atualizado) {
                return { successo: false, mensagem: "Tente novamente mais tarde!" };
            }

            return { successo: true, mensagem: "Senha do usuário atualizada com sucesso." };
        } catch (erro) {
            console.error("Erro ao atualizar Senha do usuário:", erro);
            return { successo: false, mensagem: "Tente novamente mais tarde!" };
        }
    }

    /**
     * Atualiza os dados de um usuário
     * @param {Object} dados - Novos dados do usuário
     * @returns {Boolean|null} true, false ou null dependendo do resultado
     */
    actualizarUsuario = async (dados) => {
        try {
            const { nome, telefone, id_usuario, email } = dados;
            // Validações básicas
            if (!nome || !telefone || !email) {
                // Retorna mensagem de erro se algum campo estiver vazio ou email inválido
                return { successo: false, mensagem: "Preencha todos os campos." };
            }

            const atualizado = await usuario.update({
                nome: nome,
                telefone: telefone,
                email: email
            },
                { where: { id_usuario: id_usuario } }
            );

            if (!atualizado) {
                return { successo: false, mensagem: "Usuário não encontrado" };
            }
            return { successo: true, mensagem: "Usuário atualizado com sucesso." };
        } catch (erro) {
            console.error("Erro ao atualizar usuário:", erro);
            return { successo: false, mensagem: "Confirme os dados!" };
        }
    }

    /**
     * Deleta um usuario
     * @param {Object} dados
     * @returns {Object} { successo, mensagem }
     */
    async deleteUsuario(dados) {
        const { id_usuario } = dados;
        try {
            const usuarioEncontrado = await usuario.findOne({
                where: { id_usuario: id_usuario },
            });
            if (usuarioEncontrado.tipo == "Admin") {
                return { successo: false, mensagem: "Não pode deletar um admin." };
            }

            const deletado = await usuario.destroy({
                where: { id_usuario: id_usuario }
            });

            if (deletado) {
                return { successo: true, mensagem: "Usuario deletado com sucesso." };
            } else {
                return { successo: false, mensagem: "Usuario não encontrado!" };
            }
        } catch (erro) {
            console.error("Erro ao deletar Usuario:", erro);
            return { successo: false, mensagem: "Tente novamente mais tarde!" };
        }
    }
};

/**
 * Alterna o estado de um usuário entre "activo" e "suspenso"
 * @param {Number} id - ID do usuário
 * @param {String} estadoAtual - Estado atual do usuário ("activo" ou "suspenso")
 * @returns {Boolean|null} true, false ou null dependendo do resultado
mudarEstado = async (id, estadoAtual) => {
    console.log("estado actual " + estadoAtual)
    const novoEstado = estadoAtual === "Ativo" ? "Inativo" : "Ativo";
    console.log("Novo estado  " + novoEstado)
    try {
        await usuario.update(
            { estado: novoEstado },
            { where: { id_usuario: id } }
        );
        console.log(`Estado atualizado para "${novoEstado}"`);
        return true;
    } catch (erro) {
        console.error(" Erro ao mudar estado: ", erro);
        return false;
    }
};
*/

// Exporta a instância da classe
module.exports = new UsuarioService();
// Exporta a classe para ser usada em outros módulos
