const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const messageSchema = new Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    message:{
        type:String,
        required: true
    }
})

module.exports = mongoose.model('message', messageSchema);