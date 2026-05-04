import React, { useContext, useState } from 'react';
import { 
    X, Trash2 
} from 'lucide-react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import DeleteModal from './DeleteModal';
import { clearChatMessages } from '../services/api';

const ContactInfoPanel = () => {
    const { selectedChat, setShowContactInfo, setSelectedChat, setMessages } = useContext(ChatContext);
    const { currentUser } = useContext(AuthContext);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    if (!selectedChat) return null;

    const handleDeleteChat = async () => {
        try {
            // Delete only for the current user
            await clearChatMessages(selectedChat._id, currentUser._id, false);
            
            // UI updates
            setMessages([]);
            setSelectedChat(null);
            setShowContactInfo(false);
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Failed to delete chat:', error);
        }
    };

    return (
        <div className="contact-info-panel animate-slide-in-right">
            <div className="panel-header">
                <X className="icon" onClick={() => setShowContactInfo(false)} />
                <span>Contact info</span>
            </div>

            <div className="panel-scroll-content">
                {/* Profile Section */}
                <div className="profile-hero">
                    <div className="large-avatar">
                        {selectedChat.profilePic ? (
                            <img src={selectedChat.profilePic} alt={selectedChat.username} />
                        ) : (
                            <div className="avatar-placeholder">{selectedChat.username.charAt(0).toUpperCase()}</div>
                        )}
                    </div>
                    <h2 className="profile-name">{selectedChat.username}</h2>
                    <p className="profile-email">{selectedChat.email}</p>
                </div>

                <div className="panel-divider"></div>

                {/* About Section */}
                <div className="panel-section">
                    <span className="section-label">About</span>
                    <p className="section-value">{selectedChat.bio || 'Available'}</p>
                </div>

                <div className="panel-divider"></div>

                {/* Danger Zone */}
                <div className="options-list danger-zone">
                    <div className="option-item red" onClick={() => setShowDeleteModal(true)}>
                        <Trash2 size={20} className="icon" />
                        <span>Delete chat</span>
                    </div>
                </div>
            </div>

            <DeleteModal 
                isOpen={showDeleteModal}
                title="Delete this chat?"
                deleteText="Delete"
                onCancel={() => setShowDeleteModal(false)}
                onDeleteForMe={handleDeleteChat}
            />
        </div>
    );
};

export default ContactInfoPanel;
