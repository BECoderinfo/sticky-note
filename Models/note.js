const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    label: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Label',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    color: {
        type: String,
    },
    archived: {
        type: Boolean,
        default: false,
    },
    pinned: {
        type: Boolean,
        default: false,
    },
    files: [{
        _id: false, 
        index: {
            type: Number,
            default: 0,
        },
        url: {
            type: String,
            default: '',
        },
    }],

}, {timestamps: true}); 

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;