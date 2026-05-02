const socketIO = (server) => {
    const io = require('socket.io')(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    let onlineUsers = new Set(); 

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('join', (userId) => {
            const uid = String(userId);
            socket.join(uid);
            onlineUsers.add(uid);
            
            console.log(`[Server] User ${uid} joined. Online users:`, Array.from(onlineUsers));
            io.emit('getOnlineUsers', Array.from(onlineUsers));
        });

        socket.on('sendMessage', (data) => {
            const { senderId, receiverId, message, timestamp } = data;
            const rid = String(receiverId);
            io.to(rid).emit('receiveMessage', {
                senderId,
                message,
                timestamp: timestamp || new Date()
            });
        });

        // Typing indicators with the specific logs you requested
        socket.on('typing', (data) => {
            const { senderId, receiverId } = data;
            const rid = String(receiverId);
            
            console.log("Typing event received:", data);
            
            // Check if anyone is in that room
            const room = io.sockets.adapter.rooms.get(rid);
            console.log(`Receiver room ${rid} members:`, room ? room.size : 0);

            // Emit to the receiver's room
            io.to(rid).emit('typing', { senderId });
        });

        socket.on('stopTyping', (data) => {
            const { senderId, receiverId } = data;
            const rid = String(receiverId);
            io.to(rid).emit('stopTyping', { senderId });
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

        socket.on('disconnect', () => {
            io.emit('getOnlineUsers', Array.from(onlineUsers));
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

module.exports = socketIO;
