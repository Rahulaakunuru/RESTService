var {Users} = require('./../models/users.js');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth');
    return Users.findByToken(token).then((user) => {
        if(!user){
            return Promise.reject();
        }
        
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send(e);
    });
};

module.exports = {
    authenticate
};