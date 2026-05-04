module.exports = (io, socket, onlineUsers) => {
    socket.on('join', (userId) => {
        const uid = String(userId);
        socket.join(uid);
        onlineUsers.add(uid);
        io.emit('getOnlineUsers', Array.from(onlineUsers));
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

    socket.on('disconnect', () => {
        io.emit('getOnlineUsers', Array.from(onlineUsers));
    });
};
