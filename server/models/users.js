const mongoose = require('mongoose');
const validator_ = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var userSchema = new mongoose.Schema(
    {
    email : {
        type: String,
        required: true,
        minlength: 1,
        trip: true,
        unique: true,
        validate: {
            validator: validator_.isEmail,
            message: '{VALUE} is not a valid Email ID'
        }
    },
    password : {
        type: String,
        required: true,
        minlength: 6
    },
    tokens :[{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
}
);

userSchema.methods.generateAuthToken = function(){
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
    
    user.tokens.push({
        access,
        token
    });
    
    return user.save().then(()=>{
        return token;
    }).catch((err)=>{
        return err;
    })
}

userSchema.methods.toJson = function(){
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject,['_id','email']);
}

userSchema.statics.findByToken = function(token){
    var User = this;
    var decoded;
    try{
        decoded = jwt.verify(token, 'abc123');
    } catch(e){
        /*new promise((resolve, reject) => {
            reject();
        })*/
        return Promise.reject();
    }
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': decoded.access
    })
}

var Users = mongoose.model('users', userSchema);

module.exports = {
    Users
}