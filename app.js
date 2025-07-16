const express = require('express');

const mysql = require('mysql2');

const { engine } = require ('express-handlebars');

const app = express();

app.use(express.urlencoded({ extended: true }));

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

app.get("/", function(req, res){
    let sql = 'SELECT * FROM casamento';
    conexao.query(sql, function (erro, casamento_qs) {
        if (erro) {
            conexao.error(' Erro ao consultar casamento:' , erro);
            res.status(500).send('Erro ao consultar casamento');
            return;
        }
 
        // FORMATAÇÃO DAS DATAS AQUI
        const casamentosFormatados = casamento_qs.map(c => {
            const data = new Date(c.data_casamento);
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();
 
            return {
                ...c,
                data_casamento: `${dia}/${mes}/${ano}`
            };
        });
 
        // envia o array já formatado para o template
        res.render('index', { casamento: casamentosFormatados });
    });    
});


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
        res.render('casamento', {casamento: [casamento_qs[0]] });
    });
});

app.get('/casamento/:id/cadastro', function (req, res) {
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
        res.render('cadastro', {casamento: [casamento_qs[0]] });
    });
});


app.post('/casamento/:id/detalhes', (req, res) => {
    const id = req.params.id;
    const {nome} = req.body;
    const sql = 'INSERT INTO convidados (nome) VALUES (?)';
    conexao.query(sql, [nome], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao inserir convidado:' , erro);
            return res.status(500).send('Erro ao adicionar convidados');
        }
        res.redirect(`/casamento/${id}/presentes`);
    });
});



app.get("/casamento/:id/presentes", function(req, res){
    const id = req.params.id;

    const sql = 'SELECT * FROM presentes';

    const sqlCasamentos = 'SELECT * FROM casamento';
    
    conexao.query(sql, function (erro, presentes_qs) {
        if (erro) {
            console.error('Erro ao consultar presentes:', erro);
            res.status(500).send('Erro ao consultar presentes');
        }
        if (presentes_qs.length === 0) {
             conexao.query(sqlCasamentos, (erro2, casamento_qs) => {
                if (erro2) return res.status(500).send('Erro ao buscar casamentos');

                res.render('presentes', {
                    presentes: [],
                    casamento: casamento_qs,
                    formAction: `/casamento/${id}/presentes`
                });
             });

            
            conexao.query(sqlCasamentos, (erro2, casamento_qs) => {
                if (erro2) return res.status(500).send('Erro ao buscar casamentos.');

                res.render('presentes', {
                presentes,
                casamento: casamento_qs,
                formAction: `/casamento/${id}/presentes`
               });
            });


        } 
        res.render('presentes', {presentes: presentes_qs });
    });
});



app.get('/produtos/:id/editar', (req, res) => {
  const id = req.params.id;

  const sqlProduto = `
    SELECT produtos.*, categorias.nome AS categoria_nome
    FROM produtos
    JOIN categorias ON produtos.categoria_id = categorias.id
    WHERE produtos.id = ?
  `;

  const sqlCategorias = 'SELECT id, nome FROM categorias';

  conexao.query(sqlProduto, [id], (erro, produto_qs) => {
    if (erro) return res.status(500).send('Erro ao buscar produto.');

    if (produto_qs.length === 0) return res.status(404).send('Produto não encontrado.');

    const produto = produto_qs[0];

    conexao.query(sqlCategorias, (erro2, categorias_qs) => {
      if (erro2) return res.status(500).send('Erro ao buscar categorias.');

      res.render('produto_form', {
        produto,
        categorias: categorias_qs,
        formAction: `/produtos/${id}/editar`
      });
    });
  });
});




app.listen(8081);


