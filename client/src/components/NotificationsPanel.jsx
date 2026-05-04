import React, { useContext, useMemo } from 'react';
import { X, Bell, MessageSquare, AtSign, Info, ChevronRight, CornerUpLeft } from 'lucide-react';
import { socket } from '../socket/socket';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const NotificationsPanel = ({ onClose }) => {
    const { currentUser } = useContext(AuthContext);
    const { 
        unreadCounts, setUnreadCounts, lastMessages, setSelectedChat, allUsers,
        notifications, setNotifications, setNotificationCount 
    } = useContext(ChatContext);

    // Merge computed unread messages with explicit notifications
    const allNotifications = useMemo(() => {
        // Explicit notifications from socket (includes replies)
        const explicit = notifications.map(n => {
            const user = allUsers.find(u => String(u._id) === String(n.senderId));
            const isReply = n.type === 'reply';
            
            return {
                id: n.messageId,
                type: n.type,
                title: isReply ? `${user?.username || 'Someone'} replied` : (user?.username || 'New Message'),
                userData: user,
                content: n.text,
                time: n.timestamp,
                icon: isReply ? <CornerUpLeft size={16} /> : <MessageSquare size={16} />,
                originalData: n
            };
        });

        // Computed unread messages from regular chat (avoid duplicates if already in explicit)
        const computed = Object.entries(unreadCounts)
            .filter(([userId, count]) => count > 0 && !notifications.some(n => String(n.senderId) === String(userId)))
            .map(([userId, count]) => {
                const user = allUsers.find(u => String(u._id) === String(userId));
                return {
                    id: userId,
                    type: 'message',
                    title: user ? user.username : 'New Message',
                    userData: user,
                    content: lastMessages[userId]?.message || 'Sent an attachment',
                    time: lastMessages[userId]?.timestamp || new Date(),
                    count: count,
                    icon: <MessageSquare size={16} />
                };
            });

        return [...explicit, ...computed].sort((a, b) => 
            new Date(b.time) - new Date(a.time)
        );
    }, [unreadCounts, lastMessages, allUsers, notifications]);

    const handleMarkAllRead = () => {
        // Emit markSeen for all unread chats
        Object.keys(unreadCounts).forEach(senderId => {
            if (unreadCounts[senderId] > 0) {
                socket.emit('markSeen', {
                    senderId: String(senderId),
                    receiverId: String(currentUser._id)
                });
            }
        });
        setUnreadCounts({});
        setNotifications([]);
        setNotificationCount(0);
    };

    const handleNotificationClick = (notification) => {
        if ((notification.type === 'message' || notification.type === 'reply') && notification.userData) {
            // Mark this specific one as read
            socket.emit('markSeen', {
                senderId: String(notification.userData._id),
                receiverId: String(currentUser._id)
            });
            
            setUnreadCounts(prev => ({ ...prev, [notification.userData._id]: 0 }));
            
            // Remove from explicit notifications
            setNotifications(prev => prev.filter(n => n.messageId !== notification.id));
            setNotificationCount(prev => Math.max(0, prev - 1));
            
            // Navigate to chat
            setSelectedChat(notification.userData);
            onClose();
        } else {
            onClose();
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="notifications-overlay" onClick={onClose}>
            <div className="notifications-panel animate-slide-in-left" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <div className="header-title">
                        <Bell size={20} color="var(--accent-green)" />
                        <h3>Notifications</h3>
                    </div>
                    <X className="close-btn" onClick={onClose} />
                </div>

                <div className="notifications-content">
                    {allNotifications.length === 0 ? (
                        <div className="empty-notifications">
                            <Bell size={48} opacity={0.2} />
                            <p>No new notifications</p>
                        </div>
                    ) : (
                        allNotifications.map(notification => (
                            <div 
                                key={notification.id} 
                                className={`notification-item ${notification.type}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className={`notification-icon-box ${notification.type}`}>
                                    {notification.icon}
                                </div>
                                <div className="notification-main">
                                    <div className="notification-top">
                                        <span className="notification-title">{notification.title}</span>
                                        <span className="notification-time">{formatTime(notification.time)}</span>
                                    </div>
                                    <p className="notification-text">{notification.content}</p>
                                    {notification.count > 0 && (
                                        <span className="unread-badge-small">{notification.count}</span>
                                    )}
                                </div>
                                <ChevronRight size={16} className="arrow-icon" />
                            </div>
                        ))
                    )}
                </div>

                {allNotifications.length > 0 && (
                    <div className="panel-footer">
                        <button className="clear-all-btn" onClick={handleMarkAllRead}>
                            Mark all as read
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;
