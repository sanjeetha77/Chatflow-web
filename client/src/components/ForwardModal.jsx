import React, { useContext, useState } from 'react';
import { X, Search, Send } from 'lucide-react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { forwardMessage } from '../services/api';
import { socket } from '../socket/socket';

const ForwardModal = ({ messageContent, onClose, users, onForwarded }) => {
    const { currentUser } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [sending, setSending] = useState(false);

    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) && 
        user._id !== currentUser._id
    );

    const toggleUser = (userId) => {
        setSelectedUserIds(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId) 
                : [...prev, userId]
        );
    };

    const handleForward = async () => {
        if (selectedUserIds.length === 0) return;
        setSending(true);
        try {
            const forwardedMessages = await forwardMessage(currentUser._id, selectedUserIds, messageContent);
            
            // Emit to socket
            socket.emit('forwardMessage', { forwardedMessages });

            onForwarded(selectedUserIds.length);
            onClose();
        } catch (error) {
            console.error('Failed to forward message:', error);
            alert('Failed to forward message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content forward-modal">
                <div className="modal-header">
                    <h3>Forward message</h3>
                    <X className="close-btn" onClick={onClose} />
                </div>
                
                <div className="modal-search">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search contacts" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="modal-user-list">
                    {filteredUsers.map(user => (
                        <div 
                            key={user._id} 
                            className={`modal-user-item ${selectedUserIds.includes(user._id) ? 'selected' : ''}`}
                            onClick={() => toggleUser(user._id)}
                        >
                            <div className="user-avatar">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                                <span className="username">{user.username}</span>
                            </div>
                            <div className="checkbox">
                                {selectedUserIds.includes(user._id) && <div className="checked" />}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="modal-footer">
                    <span className="selected-count">
                        {selectedUserIds.length} selected
                    </span>
                    <button 
                        className="forward-btn" 
                        disabled={selectedUserIds.length === 0 || sending}
                        onClick={handleForward}
                    >
                        {sending ? 'Forwarding...' : <Send size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForwardModal;
