const express = require("express");
const bodyParser = require('body-parser');
//const admin = require('');
const app = express();
const flash = require("connect-flash")


app.use(bodyParser.json());
app.use(flash());

app.get('/', (req, res) => {
    res.send('Bem-vindo ao Sistema de Gerenciamento de Cidades Inteligentes!');
});

//app.use("/admin", admin);


const PORT = 8081;
app.listen(PORT, () => {
    console.log("Servidor rodando ");
});

module.exports = app;