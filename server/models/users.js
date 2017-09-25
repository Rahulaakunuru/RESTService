var mongoose = require('mongoose');

var Users = mongoose.model('users', {
    email : {
        type: String,
        required: true,
        minLength: 1,
        trip: true
    }
});

module.exports = {
    Users
}