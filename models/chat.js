const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = Schema({
    txid: {
        type: String
    },    
    username: {
        type: String
    },
    msg: {
        type: String
    },
    filename: {
        type: String
    }
},
{ collection : 'chats' }
);

ChatSchema.index({ txid : -1 });

const ChatModel = mongoose.model("chats", ChatSchema);

module.exports = ChatModel;