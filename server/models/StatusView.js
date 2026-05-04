const mongoose = require('mongoose');

const statusViewSchema = new mongoose.Schema({
    statusId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Status',
        required: true
    },
    viewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure a user can only view a specific status once
statusViewSchema.index({ statusId: 1, viewerId: 1 }, { unique: true });

module.exports = mongoose.model('StatusView', statusViewSchema);
