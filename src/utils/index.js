function getLocalDate(date) {
    if (!date) {
        date = new Date();
    }
    return new Date(date).toLocaleDateString("pt-br", { year: "numeric", month: "long", day: "numeric" });
}

function getFullStringDate(date) {
    if (!date) {
        date = new Date();
    }
    const data = new Date(date).toJSON();
    return data.slice(0, 10) + "  " + data.slice(11, 16);
}

function getStringDate(date) {
    if (!date) {
        date = new Date();
    }
    return new Date(date).toJSON().slice(0, 10);
}

function getSimpleDate(date) {
    if (!date) {
        date = new Date();
    }
    return new Date(date).toJSON().slice(0, 7);
}

function getMoeda(valor) {
    return valor.toLocaleString("pt-AO", {
        style: "currency",
        currency: "AOA"
    });
}

const bcrypt = require("bcrypt")
const senhaHashed = bcrypt.hashSync("937413018", 10);


/*
res.render("pages/error", {
    titulo: "Internal error"
});
*/
module.exports = { getFullStringDate, getStringDate, getLocalDate, getSimpleDate, getMoeda }