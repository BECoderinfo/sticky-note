const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
    note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',    
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',    
    },
    size: {
        type: Number,
    },    
}, {timestamps: true});

module.exports = mongoose.model('Attachment', attachmentSchema);
