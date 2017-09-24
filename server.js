const bodyParser = require('body-parser');
const express = require('express');
const port = process.env.PORT || 3000

var app = express();

app.use(bodyParser.json());

app.post('/todo', (req, res) => {
    console.log(req.body);
    res.send(req.body);
});

app.listen(port,() => {
    console.log('Starting app at port ',port);
});