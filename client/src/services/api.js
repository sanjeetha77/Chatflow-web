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

export const updateUser = async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data);
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

export const editMessage = async (messageId, message) => {
    const response = await api.patch(`/messages/${messageId}`, { message });
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

export const uploadFile = async (senderId, receiverId, file, fileType, message = '') => {
    const formData = new FormData();
    formData.append('senderId', senderId);
    formData.append('receiverId', receiverId);
    formData.append('file', file);
    formData.append('fileType', fileType);
    formData.append('message', message);

    const response = await api.post('/messages/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const uploadStatusMedia = async (userId, file) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('file', file);

    const response = await api.post('/status/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getStatuses = async (currentUserId) => {
    const response = await api.get('/status', { params: { currentUserId } });
    return response.data;
};

export const postStatus = async (statusData) => {
    const response = await api.post('/status', statusData);
    return response.data;
};

export const markSeen = async (statusId, viewerId) => {
    const response = await api.post('/status/view', { statusId, viewerId });
    return response.data;
};

export const getViewers = async (statusId) => {
    const response = await api.get(`/status/${statusId}/viewers`);
    return response.data;
};

export const deleteStatus = async (statusId) => {
    const response = await api.delete(`/status/${statusId}`);
    return response.data;
};

export default api;
