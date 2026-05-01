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

export const sendMessage = async (senderId, receiverId, message) => {
    const response = await api.post('/messages', { senderId, receiverId, message });
    return response.data;
};

export const clearChatMessages = async (userId, currentUserId) => {
    const response = await api.delete(`/messages/${userId}?currentUserId=${currentUserId}`);
    return response.data;
};

export default api;
