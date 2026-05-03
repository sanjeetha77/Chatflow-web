import React, { createContext, useState, useEffect } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [lastMessages, setLastMessages] = useState({}); // { userId: { message, timestamp } }
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [typingUsers, setTypingUsers] = useState({}); // { userId: boolean }
    const [favourites, setFavourites] = useState(() => {
        const saved = localStorage.getItem('chatflow_favourites');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('chatflow_favourites', JSON.stringify(favourites));
    }, [favourites]);

    const toggleFavourite = (userId) => {
        setFavourites(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId) 
                : [...prev, userId]
        );
    };

    const [replyMessage, setReplyMessage] = useState(null);
    const [pinnedMessage, setPinnedMessage] = useState(null);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [isSelectMode, setIsSelectMode] = useState(false);

    return (
        <ChatContext.Provider value={{ 
            selectedChat, 
            setSelectedChat, 
            messages, 
            setMessages,
            onlineUsers,
            setOnlineUsers,
            unreadCounts,
            setUnreadCounts,
            lastMessages,
            setLastMessages,
            favourites,
            toggleFavourite,
            loadingMessages,
            setLoadingMessages,
            typingUsers,
            setTypingUsers,
            replyMessage,
            setReplyMessage,
            pinnedMessage,
            setPinnedMessage,
            selectedMessages,
            setSelectedMessages,
            isSelectMode,
            setIsSelectMode
        }}>
            {children}
        </ChatContext.Provider>
    );
};
