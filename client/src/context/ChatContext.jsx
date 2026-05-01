import React, { createContext, useState } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});

    return (
        <ChatContext.Provider value={{ 
            selectedChat, 
            setSelectedChat, 
            messages, 
            setMessages,
            onlineUsers,
            setOnlineUsers,
            unreadCounts,
            setUnreadCounts
        }}>
            {children}
        </ChatContext.Provider>
    );
};
