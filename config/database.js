const Sequelize = require("sequelize");

// Use diretamente a URL de conexão completa, se estiver no Railway
const sequelize = new Sequelize(
  process.env.RAILWAY_DATABASE_URL || {
    // fallback local
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
  }
);

module.exports = { sequelize, Sequelize };
