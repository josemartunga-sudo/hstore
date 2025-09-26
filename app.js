/**
 * ======================================================
 *             Servidor Principal da App
 *  -----------------------------------------------------
 */

const express = require("express");
const server = express();

// Carrega variáveis de ambiente (.env)
const dotenv = require("dotenv");
dotenv.config();

// Configuração da porta
const port = process.env.PORT;

// Template Engine - Handlebars
const handlebars = require("express-handlebars");

const path = require("path");
server.use(express.static(path.join(__dirname, "public")));

// Conexão com o banco de dados (configuração separada)
const db = require("./config/database.js");

// Rotas principais
const routes = require("./src/routes/index.js");

// Middlewares adicionais
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");

/**
 * ==================================
 *  Configuração da sessão de usuário
 * ==================================
 */
server.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
  })
);

// Flash
const flash = require("connect-flash");
server.use(flash());

// Middleware para passar mensagens para as views
server.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

/**
 * ==============================================
 *  Middlewares de parsing e override de métodos
 * ==============================================
 */

// Body Parser para dados de formulários e JSON
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// Cookie Parser para leitura de cookies
server.use(cookieParser());

/**
 * ================================
 *  Configuração do motor de views
 * ================================
 */

server.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "home", // Layout padrão em views/layouts/main.handlebars
    partialsDir: "views/partials/",
    helpers: {
      eq: (string1, string2) => {
        if (!string1) {
          string1 = "";
        }
        if (!string2) {
          string2 = "";
        }
        return string1 === string2;
      },
      getMoeda: (valor) => {
        if (!valor) {
          valor = 0;
        }
        return valor.toLocaleString("pt-AO", {
          style: "currency",
          currency: "AOA",
        });
      },
    },
  })
);
server.set("view engine", "handlebars");
server.set("views", "views");

/**
 * ================================
 *      Registro das Rotas
 * ================================
 */

server.use(routes);

/**
 * ================================
 *      Inicializa servidor
 * ================================
 */
server.listen(port, () => {
  console.log(
    `\nServidor rodando em http:localhost:${port}\n`
  );
});

server
  .get("/api/vendas-mensais", (req, res) => {
    res.json([
      { mes: "Jan", total: 12000 },
      { mes: "Fev", total: 8000 },
      { mes: "Mar", total: 15000 },
      { mes: "Abr", total: 10000 },
    ]);
  })
  .get("/api/faturacoes", (req, res) => {
    res.json([
      { tipo: "Pagas", qtd: 10 },
      { tipo: "Pendentes", qtd: 11 },
    ]);
  });

/**
 * ================================
 *      Banco de Dados (Conexão)
 * ================================
 */
// Verifica conexão com banco ao subir o servidor
db.sequelize
  .authenticate()
  .then(() => console.log("Banco de dados conectado"))
  .catch((err) => console.error(" Erro na conexão com o banco:", err));
