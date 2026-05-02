import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

// Use a more robust configuration
export const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'] // Allow fallback to polling if websocket fails
});
