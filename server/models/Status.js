const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String, // Can be text, image URL, etc.
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'video'],
        default: 'text'
    },
    backgroundColor: {
        type: String,
        default: '#00a884'
    },
    fontFamily: {
        type: String,
        default: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    caption: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
});

module.exports = mongoose.model('Status', statusSchema);
