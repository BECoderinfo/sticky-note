const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name:{
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    profileImage: {
        type: String,
    },
    otp: { type: String },

    otpExpires: { type: Date }
},{timestamps: true});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;