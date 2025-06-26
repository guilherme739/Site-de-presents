const express = require('express');

const mysql = require('mysql2');

const { engine } = require ('express-handlebars');

const app = express();

app.engine('handlebars', engine());
app.set('view engine','handlebars');
app.set('views','./views');

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist')); 


const conexao = mysql.createConnection( {
    host: 'localhost',
    user: 'root',
    password: 'senac',
    port: 3306,
    database:   'preset_db'
});


conexao.connect((erro) => {
    if (erro)  {
        console.error('Erro ao conectar ao banco de dados:', erro);
        return;
    }
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
});

app.get("/", function(req, res){
    res.render('index');
});

app.listen(8081);


