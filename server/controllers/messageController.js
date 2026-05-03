const Message = require('../models/Message');

// @desc    Send a message
// @route   POST /api/messages
const sendMessage = async (req, res) => {
    const { senderId, receiverId, message, replyTo } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Empty message' });
    }

    try {
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message,
            replyTo: replyTo || null
        });
        
        // Populate replyTo if exists
        if (replyTo) {
            await newMessage.populate('replyTo');
        }

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages for a specific chat
// @route   GET /api/messages/:userId
const getMessages = async (req, res) => {
    const { userId } = req.params;
    const { currentUserId } = req.query;

    try {
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId }
            ]
        })
        .populate('replyTo')
        .sort({ timestamp: 1 });
        
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a single message
// @route   DELETE /api/messages/single/:messageId
const deleteMessage = async (req, res) => {
    const { messageId } = req.params;

    try {
        const deletedMessage = await Message.findByIdAndDelete(messageId);
        if (!deletedMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.status(200).json({ message: 'Message deleted successfully', messageId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forward a message to multiple users
// @route   POST /api/messages/forward
const forwardMessage = async (req, res) => {
    const { senderId, receiverIds, messageContent } = req.body;

    try {
        const forwardPromises = receiverIds.map(receiverId => 
            Message.create({
                senderId,
                receiverId,
                message: messageContent,
                isForwarded: true
            })
        );
        
        const forwardedMessages = await Promise.all(forwardPromises);
        res.status(201).json(forwardedMessages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle star on message
// @route   PATCH /api/messages/star/:messageId
const toggleStar = async (req, res) => {
    const { messageId } = req.params;

    try {
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });

        message.isStarred = !message.isStarred;
        await message.save();
        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle pin on message
// @route   PATCH /api/messages/pin/:messageId
const togglePin = async (req, res) => {
    const { messageId } = req.params;

    try {
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });

        message.isPinned = !message.isPinned;
        await message.save();
        res.status(200).json(message);
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

// @desc    React to a message
// @route   PATCH /api/messages/react/:messageId
const reactToMessage = async (req, res) => {
    const { messageId } = req.params;
    const { userId, emoji } = req.body;

    try {
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });

        if (!message.reactions) message.reactions = new Map();
        
        // Toggle reaction: if same user+emoji, remove it. If different emoji, update it.
        if (message.reactions.get(userId) === emoji) {
            message.reactions.delete(userId);
        } else {
            message.reactions.set(userId, emoji);
        }

        await message.save();
        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload a file and create a message
// @route   POST /api/messages/upload
const uploadFile = async (req, res) => {
    const { senderId, receiverId, message, fileType } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message: message || '', // Caption
            fileUrl: `/uploads/${file.filename}`,
            fileName: file.originalname,
            fileType: fileType // 'image', 'video', 'doc', etc.
        });

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    sendMessage, 
    getMessages, 
    clearMessages, 
    deleteMessage, 
    forwardMessage, 
    toggleStar, 
    togglePin,
    reactToMessage,
    uploadFile
};
