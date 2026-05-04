module.exports = (io, socket) => {
    socket.on('status-posted', (data) => {
        // Broadcast status updates to everyone
        // In a production app, this would be filtered based on user privacy settings
        socket.broadcast.emit('status-posted', data); 
    });

    socket.on('status-deleted', (data) => {
        // Broadcast status deletion to everyone
        socket.broadcast.emit('status-deleted', data);
    });
};
