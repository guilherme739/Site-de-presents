const express = require('express');

const app = express();

app.get("/", function(req, res){
    res.write('Hello Word');
    res.end();
});

app.listen(8080);

