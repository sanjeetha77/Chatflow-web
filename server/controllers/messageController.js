const messageService = require('../services/messageService');

// @desc    Send a message
// @route   POST /api/messages
const sendMessage = async (req, res, next) => {
    const { senderId, receiverId, message, replyTo } = req.body;

    if (!message) {
        res.status(400);
        return next(new Error('Empty message'));
    }

    try {
        const newMessage = await messageService.sendMessage({
            senderId,
            receiverId,
            message,
            replyTo
        });
        res.status(201).json(newMessage);
    } catch (error) {
        next(error);
    }
};

// @desc    Get messages for a specific chat
// @route   GET /api/messages/:userId
const getMessages = async (req, res, next) => {
    const { userId } = req.params;
    const { currentUserId } = req.query;

    try {
        const messages = await messageService.getMessagesBetweenUsers(userId, currentUserId);
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a single message
// @route   DELETE /api/messages/single/:messageId
const deleteMessage = async (req, res, next) => {
    const { messageId } = req.params;

    try {
        const deletedMessage = await messageService.deleteMessageById(messageId);
        if (!deletedMessage) {
            res.status(404);
            return next(new Error('Message not found'));
        }
        res.status(200).json({ message: 'Message deleted successfully', messageId });
    } catch (error) {
        next(error);
    }
};

// @desc    Forward a message to multiple users
// @route   POST /api/messages/forward
const forwardMessage = async (req, res, next) => {
    const { senderId, receiverIds, messageContent } = req.body;

    try {
        const forwardedMessages = await messageService.forwardMessageToMultipleUsers(senderId, receiverIds, messageContent);
        res.status(201).json(forwardedMessages);
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle star on message
// @route   PATCH /api/messages/star/:messageId
const toggleStar = async (req, res, next) => {
    const { messageId } = req.params;

    try {
        const message = await messageService.toggleStarOnMessage(messageId);
        if (!message) {
            res.status(404);
            return next(new Error('Message not found'));
        }
        res.status(200).json(message);
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle pin on message
// @route   PATCH /api/messages/pin/:messageId
const togglePin = async (req, res, next) => {
    const { messageId } = req.params;

    try {
        const message = await messageService.togglePinOnMessage(messageId);
        if (!message) {
            res.status(404);
            return next(new Error('Message not found'));
        }
        res.status(200).json(message);
    } catch (error) {
        next(error);
    }
};

// @desc    Clear messages for a specific chat
// @route   DELETE /api/messages/:userId
const clearMessages = async (req, res, next) => {
    const { userId } = req.params;
    const { currentUserId, deleteForEveryone } = req.query;

    try {
        await messageService.clearChat(userId, currentUserId, deleteForEveryone);
        res.status(200).json({ message: 'Chat cleared successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    React to a message
// @route   PATCH /api/messages/react/:messageId
const reactToMessage = async (req, res, next) => {
    const { messageId } = req.params;
    const { userId, emoji } = req.body;

    try {
        const message = await messageService.reactToMessage(messageId, userId, emoji);
        if (!message) {
            res.status(404);
            return next(new Error('Message not found'));
        }
        res.status(200).json(message);
    } catch (error) {
        next(error);
    }
};

// @desc    Upload a file and create a message
// @route   POST /api/messages/upload
const uploadFile = async (req, res, next) => {
    try {
        const { senderId, receiverId, message, fileType } = req.body;
        const file = req.file;

        if (!file) {
            res.status(400);
            return next(new Error('No file uploaded'));
        }

        const newMessage = await messageService.createMessageWithFile({
            senderId,
            receiverId,
            message: message || '',
            fileUrl: `/uploads/${file.filename}`,
            fileName: file.originalname,
            fileType: fileType
        });
        res.status(201).json(newMessage);
    } catch (error) {
        next(error);
    }
};

// @desc    Edit a message
// @route   PATCH /api/messages/:messageId
const editMessage = async (req, res, next) => {
    const { messageId } = req.params;
    const { message } = req.body;
    try {
        const updatedMessage = await messageService.editMessageById(messageId, message);
        res.status(200).json(updatedMessage);
    } catch (error) {
        next(error);
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
    uploadFile, 
    editMessage 
};
