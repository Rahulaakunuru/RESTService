var mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
    text : {
        type: String,
        required: true,
        minLength: 1,
        trip: true
    },
    completed : {
        type: Boolean,
        default: false
    },
    completedAt : {
        type : Number,
        dafault: null
    },
    _creator : {
        type : mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = {
    Todo
}