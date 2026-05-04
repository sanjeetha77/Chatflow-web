import React, { createContext, useState, useEffect, useContext } from 'react';
import { getStatuses, postStatus, markSeen, getViewers } from '../services/api';
import { AuthContext } from './AuthContext';
import { ThemeContext } from './ThemeContext';
import { socket } from '../socket/socket';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState(() => {
        const saved = sessionStorage.getItem('chatflow_unread_counts');
        return saved ? JSON.parse(saved) : {};
    });
    const [lastMessages, setLastMessages] = useState(() => {
        const saved = sessionStorage.getItem('chatflow_last_messages');
        return saved ? JSON.parse(saved) : {};
    }); // { userId: { message, timestamp } }
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [typingUsers, setTypingUsers] = useState({}); // { userId: boolean }
    const [favourites, setFavourites] = useState(() => {
        const saved = sessionStorage.getItem('chatflow_favourites');
        return saved ? JSON.parse(saved) : [];
    });
    const [notifications, setNotifications] = useState(() => {
        const saved = sessionStorage.getItem('chatflow_notifications');
        return saved ? JSON.parse(saved) : [];
    });
    const [notificationCount, setNotificationCount] = useState(() => {
        const saved = sessionStorage.getItem('chatflow_notification_count');
        return saved ? Number(saved) : 0;
    });

    useEffect(() => {
        sessionStorage.setItem('chatflow_notifications', JSON.stringify(notifications));
        sessionStorage.setItem('chatflow_notification_count', notificationCount.toString());
    }, [notifications, notificationCount]);

    useEffect(() => {
        socket.on('new_notification', (data) => {
            console.log("New notification received:", data);
            
            // If the user is currently looking at this chat, don't show an explicit notification
            // (The message will appear in the chat window anyway)
            if (selectedChat && String(selectedChat._id) === String(data.senderId)) {
                return;
            }

            setNotifications(prev => {
                // Avoid duplicates by messageId
                if (prev.some(n => n.messageId === data.messageId)) return prev;
                return [data, ...prev];
            });
            setNotificationCount(prev => prev + 1);
        });

        return () => {
            socket.off('new_notification');
        };
    }, [selectedChat]);

    useEffect(() => {
        sessionStorage.setItem('chatflow_favourites', JSON.stringify(favourites));
    }, [favourites]);

    useEffect(() => {
        sessionStorage.setItem('chatflow_unread_counts', JSON.stringify(unreadCounts));
    }, [unreadCounts]);

    useEffect(() => {
        sessionStorage.setItem('chatflow_last_messages', JSON.stringify(lastMessages));
    }, [lastMessages]);

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
    const [editingMessage, setEditingMessage] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('chats'); // 'chats', 'status'
    const [activeStatusUser, setActiveStatusUser] = useState(null);
    const [statuses, setStatuses] = useState([]);
    const [showContactInfo, setShowContactInfo] = useState(false);

    const fetchStatuses = async (currentUserId) => {
        if (!currentUserId) return;
        try {
            const data = await getStatuses(currentUserId);
            setStatuses(data);
        } catch (error) {
            console.error("Failed to fetch statuses in context:", error);
        }
    };

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
            setIsSelectMode,
            editingMessage,
            setEditingMessage,
            allUsers,
            setAllUsers,
            activeTab,
            setActiveTab,
            activeStatusUser,
            setActiveStatusUser,
            statuses,
            setStatuses,
            fetchStatuses,
            showContactInfo,
            setShowContactInfo,
            notifications,
            setNotifications,
            notificationCount,
            setNotificationCount
        }}>
            {children}
        </ChatContext.Provider>
    );
};
