const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    color: {
        type: String,
    },
}, {timestamps: true});

const Label = mongoose.model('Label', labelSchema);

module.exports = Label;
