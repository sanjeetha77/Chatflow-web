const Message = require('../models/Message');

module.exports = (io, socket) => {
    socket.on('sendMessage', (data) => {
        const messageId = data._id || data.id;
        const rid = String(data.receiverId);
        const sid = String(data.senderId);
        
        io.to(rid).emit('receiveMessage', {
            ...data,
            _id: String(messageId)
        });

        // Trigger real-time notification
        if (rid !== sid) {
            // Detect if it's a standard reply or a status/story reply
            const isStatusReply = data.message && data.message.startsWith('*Status Reply:*');
            const isReply = !!data.replyTo || isStatusReply;
            
            console.log("Notification trigger - isReply:", isReply, "isStatusReply:", isStatusReply);
            
            io.to(rid).emit("new_notification", {
                type: isReply ? "reply" : "message",
                senderId: sid,
                messageId: String(messageId),
                replyTo: data.replyTo || null,
                text: data.message || (data.fileUrl ? "Sent an attachment" : ""),
                timestamp: data.timestamp || new Date()
            });
            console.log("Notification emitted to:", rid);
        }
    });

    socket.on('typing', (data) => {
        const { senderId, receiverId } = data;
        const rid = String(receiverId);
        io.to(rid).emit('typing', { senderId });
    });

    socket.on('stopTyping', (data) => {
        const { senderId, receiverId } = data;
        const rid = String(receiverId);
        io.to(rid).emit('stopTyping', { senderId });
    });

    socket.on('messageDelivered', async (data) => {
        const { messageId, senderId, receiverId } = data;
        try {
            await Message.findByIdAndUpdate(messageId, { status: 'delivered' });
            io.to(String(senderId)).emit('messageDelivered', { messageId, receiverId });
        } catch (err) {
            console.error('Error updating delivery status:', err);
        }
    });

    socket.on('markSeen', async (data) => {
        const { senderId, receiverId } = data;
        try {
            await Message.updateMany(
                { senderId, receiverId, status: { $ne: 'seen' } },
                { status: 'seen' }
            );
            io.to(String(senderId)).emit('messagesSeen', { receiverId });
        } catch (err) {
            console.error('Error marking messages as seen:', err);
        }
    });

    socket.on('deleteMessage', (data) => {
        const { messageId, receiverId } = data;
        io.to(String(receiverId)).emit('messageDeleted', { messageId });
    });

    socket.on('forwardMessage', (data) => {
        const { forwardedMessages } = data;
        forwardedMessages.forEach(msg => {
            io.to(String(msg.receiverId)).emit('receiveMessage', msg);
        });
    });

    socket.on('messageReacted', (data) => {
        const { messageId, receiverId, reactions } = data;
        console.log(`[Reaction] Message ${messageId} updated with reactions. Emitting to ${receiverId}`);
        io.to(String(receiverId)).emit('messageReaction', { messageId, reactions });
    });
};
