const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pagamentos', {
    id_pagamento: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    data_pagamento: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    data_correspondente: {
      type: DataTypes.DATE,
      allowNull: false
    },
    parcela: {
      type: DataTypes.ENUM('Primeira','Segunda','Única'),
      allowNull: false,
      defaultValue: "Única"
    },
    bonus: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    resto: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
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
    tableName: 'pagamentos',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_pagamento" },
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
