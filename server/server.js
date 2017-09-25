var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose.js');
var {ObjectID} = require('mongodb');
var {Todo} = require('./models/todo.js');
var {Users} = require('./models/users.js');

var app = express();

var port = process.env.PORT || 3000

app.use(bodyParser.json());

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send(todos);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.post('/todos', (req, res) => {
    console.log(req.body);
    var todo = new Todo({text:req.body.text});
    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        res.status(400).send("Given ID is invalid");
    } else {
    Todo.findById(id).then((todo) => {
        if(!todo)
            res.status(400).send("No Task found");
        res.send({todo});
    }, (err) => {
        res.status(400).send(err);
    });
    }
});

app.listen(port, () => {
    console.log('Starting server at port ', port);
});