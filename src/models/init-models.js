var DataTypes = require("sequelize").DataTypes;
var _agentes = require("./agentes");
var _faturacoes = require("./faturacoes");
var _pagamentos = require("./pagamentos");
var _usuarios = require("./usuarios");

function initModels(sequelize) {
  var agentes = _agentes(sequelize, DataTypes);
  var faturacoes = _faturacoes(sequelize, DataTypes);
  var pagamentos = _pagamentos(sequelize, DataTypes);
  var usuarios = _usuarios(sequelize, DataTypes);

  faturacoes.belongsTo(agentes, { as: "agente", foreignKey: "agente_id"});
  agentes.hasMany(faturacoes, { as: "faturacos", foreignKey: "agente_id"});
  pagamentos.belongsTo(agentes, { as: "agente", foreignKey: "agente_id"});
  agentes.hasMany(pagamentos, { as: "pagamentos", foreignKey: "agente_id"});
  agentes.belongsTo(usuarios, { as: "usuario", foreignKey: "usuario_id"});
  usuarios.hasMany(agentes, { as: "agentes", foreignKey: "usuario_id"});
  faturacoes.belongsTo(usuarios, { as: "usuario", foreignKey: "usuario_id"});
  usuarios.hasMany(faturacoes, { as: "faturacos", foreignKey: "usuario_id"});
  pagamentos.belongsTo(usuarios, { as: "usuario", foreignKey: "usuario_id"});
  usuarios.hasMany(pagamentos, { as: "pagamentos", foreignKey: "usuario_id"});

  return {
    agentes,
    faturacoes,
    pagamentos,
    usuarios,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
