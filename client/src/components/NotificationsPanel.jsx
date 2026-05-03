import React, { useContext, useMemo } from 'react';
import { X, Bell, MessageSquare, AtSign, Info, ChevronRight } from 'lucide-react';
import { socket } from '../socket/socket';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const NotificationsPanel = ({ onClose }) => {
    const { currentUser } = useContext(AuthContext);
    const { unreadCounts, setUnreadCounts, lastMessages, setSelectedChat, allUsers } = useContext(ChatContext);

    // Filter unread messages
    const unreadNotifications = useMemo(() => {
        return Object.entries(unreadCounts)
            .filter(([_, count]) => count > 0)
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
    }, [unreadCounts, lastMessages, allUsers]);

    // Mock data for mentions and alerts
    const otherNotifications = [
        {
            id: 'mention-1',
            type: 'mention',
            title: 'You were mentioned',
            content: '@julie check the latest project updates in the group.',
            time: new Date(Date.now() - 3600000),
            icon: <AtSign size={16} />
        },
        {
            id: 'alert-1',
            type: 'system',
            title: 'Security Alert',
            content: 'Your account was logged in from a new device.',
            time: new Date(Date.now() - 86400000),
            icon: <Info size={16} />
        }
    ];

    const allNotifications = [...unreadNotifications, ...otherNotifications].sort((a, b) => 
        new Date(b.time) - new Date(a.time)
    );

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
    };

    const handleNotificationClick = (notification) => {
        if (notification.type === 'message' && notification.userData) {
            // Mark this specific one as read
            socket.emit('markSeen', {
                senderId: String(notification.id),
                receiverId: String(currentUser._id)
            });
            setUnreadCounts(prev => ({ ...prev, [notification.id]: 0 }));
            
            // Navigate to chat
            setSelectedChat(notification.userData);
            onClose();
        } else if (notification.type === 'mention' || notification.type === 'system') {
            // Just clear mock notifications if needed, or just close
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
