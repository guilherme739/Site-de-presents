const express = require('express');

const mysql = require('mysql2');

const { engine } = require ('express-handlebars');

const app = express();

app.engine('handlebars', engine());
app.set('view engine','handlebars');
app.set('views','./views');

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist')); 
app.use(express.static('static'));


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

app.get("/", function(req, res){;
    let sql = 'SELECT * FROM casamento';
    conexao.query(sql, function (erro, casamento_qs) {
    if (erro) {
        conexao.error(' Erro ao consultar casamento:' , erro)
        res.status(500).send('Erro ao consultar casamento');
        return;
        }
        res.render('index', { casamento: casamento_qs});
    });    
}
);


app.get("/casamento/:id/detalhes", function(req, res){
    const id = req.params.id;

    const sql = 'SELECT * FROM casamento WHERE id = ?';
    
    conexao.query(sql, [id], function (erro, casamento_qs) {
        if (erro) {
            console.error('Erro ao consultar casamentos:', erro);
            res.status(500).send('Erro ao Consultar casamentos');
            return;
        }
        if (casamento_qs.length === 0) {
            return res.status(404).send('Casamento não encontrado');
        }
        res.render('casamento', {casamento: casamento_qs[0] });
    });
});



app.listen(8081);


