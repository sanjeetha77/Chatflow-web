import React, { useContext, useState, useEffect } from 'react';
import { X, Search, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getUsers } from '../services/api';

const NewChatModal = ({ onClose, onSelectUser }) => {
    const { currentUser } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                setLoading(true);
                const data = await getUsers(currentUser._id);
                // Filter out current user
                const otherUsers = data.filter(u => u._id.toString() !== currentUser._id.toString());
                setUsers(otherUsers);
            } catch (err) {
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllUsers();
    }, [currentUser]);

    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content new-chat-modal animate-slide-up">
                <div className="modal-header">
                    <div className="header-title">
                        <MessageSquare size={20} color="var(--accent-green)" />
                        <h3>New Chat</h3>
                    </div>
                    <X className="close-btn" onClick={onClose} />
                </div>
                
                <div className="modal-search">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search name or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="modal-user-list">
                    {loading ? (
                        <div className="loading-state">Loading contacts...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="no-results">No contacts found</div>
                    ) : (
                        filteredUsers.map(user => (
                            <div 
                                key={user._id} 
                                className="modal-user-item"
                                onClick={() => {
                                    onSelectUser(user);
                                    onClose();
                                }}
                            >
                                <div className="user-avatar">
                                    {user.username.charAt(0).toUpperCase()}
                                    {user.isOnline && <div className="online-indicator" />}
                                </div>
                                <div className="user-info">
                                    <span className="username">{user.username}</span>
                                    <span className="status">{user.email}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewChatModal;
