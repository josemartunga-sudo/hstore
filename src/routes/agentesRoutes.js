/*
 * ===================================================
 *  Rotas de Agentes
 *  Define os endpoints relacionados ao CRUD de agentes.
 *  Protegido por middleware de autenticação.
 * ===================================================
 */

const express = require("express");
const AgentesController = require("../controllers/agentesController");
const AutenticacaoMiddleware = require("../middlewares/autenticacaoMiddleware");

// Instância dos controladores e middlewares
const agentesController = new AgentesController();
const autenticacaoMiddleware = new AutenticacaoMiddleware();

// Cria roteador
const agenteRoutes = express.Router();

/**
 * @route   GET /agentes/cadastrar
 * @desc    Exibe o formulário de cadastro de agentes
 * @acesso  Autenticado
 */
agenteRoutes.get(
  "/cadastrar",
  agentesController.cadastro
);

/**
 * @route   POST /agentes/cadastrar
 * @desc    Cria um novo agente
 * @acesso  Autenticado
 */
agenteRoutes.post(
  "/cadastrar",
  agentesController.criarAgentes
);

/**
 * @route   GET /agentes/listar
 * @desc    Lista todos os agentes
 * @acesso  Autenticado
 */
agenteRoutes.get(
  "/",
  agentesController.listarAgentes
);

/**
 * @route   GET /agentes/listar
 * @desc    Lista todos os agentes
 * @acesso  Autenticado
 */
agenteRoutes.get(
  "/ativos",
  agentesController.listarAgentesAtivos
);

/**
 * @route   GET /agentes/buscar/:id
 * @desc    Busca detalhes de um agente pelo ID
 * @acesso  Autenticado
*/
agenteRoutes.get(
  "/perfil/:id",
  agentesController.buscarAgentesPorId
);

/**
 * @route   GET /agentes/editar/:id
 * @desc    Exibe o formulário para editar um agente
 * @acesso  Autenticado
 */
agenteRoutes.get(
  "/editar/:id",
  autenticacaoMiddleware.verificarAdmin,
  agentesController.actualizarPage
);

/**
 * @route   PUT /agentes/editar/:id
 * @desc    Atualiza os dados de um agente
 * @acesso  Autenticado
 */
agenteRoutes.put(
  "/editar",
  autenticacaoMiddleware.verificarAdmin,
  agentesController.atualizarAgente
);

/**
 * @route   DELETE /agentes/delete
 * @desc    Deleta o registro de um agente
 * @acesso  Autenticado
 */
agenteRoutes.delete(
  "/delete",
  autenticacaoMiddleware.verificarAdmin,
  agentesController.deletarAgente
);

/**
 * @route   GET /agentes/faturacoes/:id"
 * @desc    Listar todas as vendas de um agente
 * @acesso  Autenticado
 */
agenteRoutes.get(
  "/faturacoes/:id",
  agentesController.buscarFacturacoesAgentes
);


/**
 * @route   PUT /alterarfaturacoes"
 * @acesso  Autenticado
 */
agenteRoutes.put(
  "/mudarformapagamento",
  agentesController.mudarFormaPagamento
);





/**
 * @route   GET /agentes/relatorio/:id
 * @desc    Gera um relatório do agente de acordo as parcelas de pagaento do mesmo no mês
 * @acesso  Autenticado
*/ 
agenteRoutes.get(
  "/relatorio/:id",
  autenticacaoMiddleware.verificarAdmin,
  agentesController.buscarRelatorioDeAgente
);

/**
 * @route   GET /agentes/relatorio/:id
 * @desc    Relatórios de um agente
 * @acesso  Autenticado
*/ 
agenteRoutes.post(
  "/relatorio/pagar",
  autenticacaoMiddleware.verificarAdmin,
  agentesController.criarRelatorioDoAgente
);

/**
 * @route   GET /agentes/estado/:id
 * @desc    Alterna o estado (ativo/inativo) de um agente
 * @acesso  Autenticado
agenteRoutes.get(
  "/estado/:id",
  agentesController.mudarEstado
);
*/

// Exporta o roteador
module.exports = { agenteRoutes };