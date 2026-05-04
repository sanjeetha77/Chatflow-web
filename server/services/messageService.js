const Message = require('../models/Message');

const sendMessage = async (messageData) => {
    const newMessage = await Message.create({
        ...messageData,
        replyTo: messageData.replyTo || null
    });
    
    if (messageData.replyTo) {
        await newMessage.populate('replyTo');
    }

    return newMessage;
};

const getMessagesBetweenUsers = async (userId, currentUserId) => {
    const messages = await Message.find({
        $or: [
            { senderId: currentUserId, receiverId: userId },
            { senderId: userId, receiverId: currentUserId }
        ],
        deletedFor: { $ne: currentUserId }
    })
    .populate('replyTo')
    .sort({ timestamp: 1 });
    
    return messages;
};

const deleteMessageById = async (messageId) => {
    return await Message.findByIdAndDelete(messageId);
};

const forwardMessageToMultipleUsers = async (senderId, receiverIds, messageContent) => {
    const forwardPromises = receiverIds.map(receiverId => 
        Message.create({
            senderId,
            receiverId,
            message: messageContent,
            isForwarded: true
        })
    );
    
    return await Promise.all(forwardPromises);
};

const toggleStarOnMessage = async (messageId) => {
    const message = await Message.findById(messageId);
    if (!message) return null;

    message.isStarred = !message.isStarred;
    await message.save();
    return message;
};

const togglePinOnMessage = async (messageId) => {
    const message = await Message.findById(messageId);
    if (!message) return null;

    message.isPinned = !message.isPinned;
    await message.save();
    return message;
};

const clearChat = async (userId, currentUserId, deleteForEveryone) => {
    const query = {
        $or: [
            { senderId: currentUserId, receiverId: userId },
            { senderId: userId, receiverId: currentUserId }
        ]
    };

    if (deleteForEveryone === 'true') {
        await Message.deleteMany(query);
    } else {
        await Message.updateMany(query, {
            $addToSet: { deletedFor: currentUserId }
        });
    }
};

const reactToMessage = async (messageId, userId, emoji) => {
    const message = await Message.findById(messageId);
    if (!message) return null;

    if (!message.reactions) message.reactions = new Map();
    
    if (message.reactions.get(userId) === emoji) {
        message.reactions.delete(userId);
    } else {
        message.reactions.set(userId, emoji);
    }

    await message.save();
    return message;
};

const createMessageWithFile = async (messageData) => {
    return await Message.create(messageData);
};

const editMessageById = async (messageId, newMessage) => {
    return await Message.findByIdAndUpdate(
        messageId, 
        { message: newMessage, isEdited: true }, 
        { new: true }
    ).populate('replyTo');
};

const markMessagesAsSeen = async (senderId, receiverId) => {
    return await Message.updateMany(
        { senderId, receiverId, status: { $ne: 'seen' } },
        { status: 'seen' }
    );
};

module.exports = {
    sendMessage,
    getMessagesBetweenUsers,
    deleteMessageById,
    forwardMessageToMultipleUsers,
    toggleStarOnMessage,
    togglePinOnMessage,
    clearChat,
    reactToMessage,
    createMessageWithFile,
    editMessageById,
    markMessagesAsSeen
};
