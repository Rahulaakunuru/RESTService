require('./config/config.js');

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');

var {mongoose} = require('./db/mongoose.js');
var {ObjectID} = require('mongodb');
var {Todo} = require('./models/todo.js');
var {Users} = require('./models/users.js');
var {authenticate} = require('./middleware/authenticate');

var app = express();

app.use(bodyParser.json());

//#############################     TODO APIs      ###################################

//Get All todos of logged in user API
app.get('/todos', authenticate, (req, res) => {
    var user = req.user;
    Todo.find({_creator: req.user._id}).then((todos) => {
        res.send({todos});
    }, (err) => {
        res.status(400).send(err);
    });
});

//get specific TODO of logged in user API
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

//Create a TODO API
app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text:req.body.text,
        _creator:req.user._id
    });
    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

//Update a TODO(Complete the todo) API
app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body,['text','completed']);
    
    if(!ObjectID.isValid(id)){
        return res.status(400).send();
    }
    
    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date.getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findByIdAndUpdate(id,{'$set':body}, {new: true}).then((todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send(todo);
    }).catch((error) => {
        res.status(404).send(e);
    });
});

//Delete TODO API
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

//#############################     USERS APIs      ###################################

//Create User API
app.post('/users', (req, res) => {
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

//Get logged in User API
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});


//Login API
app.post('/users/login', (req, res) => {
    var credentials = _.pick(req.body,['email','password']);
    Users.findByCredentials(credentials).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }, (err) => {
        res.status(404).send(err);
    });
});

//Logout API
app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.listen(process.env.PORT, () => {
    console.log('Starting server at port ', process.env.PORT);
});