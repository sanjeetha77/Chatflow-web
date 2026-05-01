const Message = require('../models/Message');

// @desc    Send a message
// @route   POST /api/messages
const sendMessage = async (req, res) => {
    const { senderId, receiverId, message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Empty message' });
    }

    try {
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages for a specific chat
// @route   GET /api/messages/:userId
const getMessages = async (req, res) => {
    const { userId } = req.params;
    const { currentUserId } = req.query; // Assuming currentUserId is passed as query param for simplicity

    try {
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId }
            ]
        }).sort({ timestamp: 1 });
        
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear messages for a specific chat
// @route   DELETE /api/messages/:userId
const clearMessages = async (req, res) => {
    const { userId } = req.params;
    const { currentUserId } = req.query;

    try {
        await Message.deleteMany({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId }
            ]
        });
        res.status(200).json({ message: 'Chat cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { sendMessage, getMessages, clearMessages };
