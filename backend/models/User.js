const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    nama: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Petugas'],
        default: 'Petugas'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
