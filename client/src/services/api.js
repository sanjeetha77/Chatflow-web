import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

export const login = async (username, email) => {
    const response = await api.post('/auth/login', { username, email });
    return response.data;
};

export const getUsers = async () => {
    const response = await api.get(`/users?t=${Date.now()}`);
    return response.data;
};

export const getMessages = async (userId, currentUserId) => {
    const response = await api.get(`/messages/${userId}?currentUserId=${currentUserId}`);
    return response.data;
};

export const sendMessage = async (senderId, receiverId, message, replyTo = null) => {
    const response = await api.post('/messages', { senderId, receiverId, message, replyTo });
    return response.data;
};

export const clearChatMessages = async (userId, currentUserId) => {
    const response = await api.delete(`/messages/${userId}?currentUserId=${currentUserId}`);
    return response.data;
};

export const deleteMessage = async (messageId) => {
    const response = await api.delete(`/messages/single/${messageId}`);
    return response.data;
};

export const forwardMessage = async (senderId, receiverIds, messageContent) => {
    const response = await api.post('/messages/forward', { senderId, receiverIds, messageContent });
    return response.data;
};

export const toggleStar = async (messageId) => {
    const response = await api.patch(`/messages/star/${messageId}`);
    return response.data;
};

export const togglePin = async (messageId) => {
    const response = await api.patch(`/messages/pin/${messageId}`);
    return response.data;
};

export const reactToMessage = async (messageId, userId, emoji) => {
    const response = await api.patch(`/messages/react/${messageId}`, { userId, emoji });
    return response.data;
};

export default api;
