const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('agentes', {
    id_agente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    telefone: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "telefone"
    },
    nome: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    estado: {
      type: DataTypes.ENUM('Ativo','Inativo'),
      allowNull: false,
      defaultValue: "Ativo"
    },
    ultima_actualizacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id_usuario'
      }
    }
  }, {
    sequelize,
    tableName: 'agentes',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_agente" },
        ]
      },
      {
        name: "telefone",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "telefone" },
        ]
      },
      {
        name: "usuario_id",
        using: "BTREE",
        fields: [
          { name: "usuario_id" },
        ]
      },
    ]
  });
};
