var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');

var {mongoose} = require('./db/mongoose.js');
var {ObjectID} = require('mongodb');
var {Todo} = require('./models/todo.js');
var {Users} = require('./models/users.js');

var app = express();

var port = process.env.PORT || 3000

app.use(bodyParser.json());

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
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

app.post('/todos', (req, res) => {
    console.log(req.body);
    var todo = new Todo({text:req.body.text});
    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
      res.status(404).send();
  }
    else {
  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send(todo);
  }).catch((e) => {
    res.status(400).send();
  });   
    }
});

app.post('/user', (req, res) => {
    var body = _.pick(req.body,['email', 'password']);
    var user = new Users(body);
    
    user.save().then(()=>{
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth',token).send(user.toJson());
    }).catch((err) => {
        console.log(`err: ${err}`);
        res.status(400).send(err);
    })
});

app.listen(port, () => {
    console.log('Starting server at port ', port);
});