const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('faturacoes', {
    id_facturacao: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    valor: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    data_faturacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    ultima_actualizacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    estado: {
      type: DataTypes.ENUM('Pendente','Pago'),
      allowNull: false,
      defaultValue: "Pendente"
    },
    tipo_faturacao: {
      type: DataTypes.ENUM('Físico','Electrônico'),
      allowNull: false
    },
    forma_pagamento: {
      type: DataTypes.ENUM('Quinzenal','Mensal'),
      allowNull: false,
      defaultValue: "Mensal"
    },
    agente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'agentes',
        key: 'id_agente'
      }
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
    tableName: 'faturacoes',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_facturacao" },
        ]
      },
      {
        name: "agente_id",
        using: "BTREE",
        fields: [
          { name: "agente_id" },
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
