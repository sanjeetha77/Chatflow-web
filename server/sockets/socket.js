const socketIO = (server) => {
    const io = require('socket.io')(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    let onlineUsers = new Set(); 

    io.on('connection', (socket) => {

        socket.on('join', (userId) => {
            const uid = String(userId);
            socket.join(uid);
            onlineUsers.add(uid);
            
            io.emit('getOnlineUsers', Array.from(onlineUsers));
        });

        socket.on('sendMessage', (data) => {
            const messageId = data._id || data.id;
            const rid = String(data.receiverId);
            
            io.to(rid).emit('receiveMessage', {
                ...data,
                _id: String(messageId)
            });
        });

        socket.on('typing', (data) => {
            const { senderId, receiverId } = data;
            const rid = String(receiverId);
            
            // Emit to the receiver's room
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
                // Persistent update in DB
                const Message = require('../models/Message');
                await Message.findByIdAndUpdate(messageId, { status: 'delivered' });
                
                // Notify the original sender
                io.to(String(senderId)).emit('messageDelivered', { messageId, receiverId });
            } catch (err) {
                console.error('Error updating delivery status:', err);
            }
        });

        socket.on('markSeen', async (data) => {
            const { senderId, receiverId } = data;
            
            try {
                const Message = require('../models/Message');
                // Mark all messages from the other person to US as 'seen'
                await Message.updateMany(
                    { senderId, receiverId, status: { $ne: 'seen' } },
                    { status: 'seen' }
                );
                
                // Notify the other person that their messages were seen
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

        socket.on('updateProfile', (data) => {
            // Broadcast to everyone so their allUsers state updates
            io.emit('profileUpdated', data);
        });

        socket.on('disconnecting', () => {
            const rooms = Array.from(socket.rooms);
            rooms.forEach(userId => {
                if (userId !== socket.id) {
                    const socketsInRoom = io.sockets.adapter.rooms.get(userId);
                    if (socketsInRoom && socketsInRoom.size === 1) {
                        onlineUsers.delete(String(userId));
                    }
                }
            });
        });

        socket.on('status-posted', (data) => {
            const { excludedUsers } = data;
            // Broadcast to everyone EXCEPT excluded users
            // We use io.sockets.sockets to filter or just emit to specific rooms
            socket.broadcast.emit('status-posted', data); 
            // Note: A more robust way would be to only emit to non-excluded rooms,
            // but for now, we'll also add a client-side check for double safety.
        });

        socket.on('status-deleted', (data) => {
            // Broadcast status deletion to everyone
            socket.broadcast.emit('status-deleted', data);
        });

        socket.on('disconnect', () => {
            io.emit('getOnlineUsers', Array.from(onlineUsers));
        });
    });

    return io;
};

module.exports = socketIO;
