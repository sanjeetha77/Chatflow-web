import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
    Plus, 
    MoreVertical, 
    Type, 
    Image as ImageIcon, 
    X, 
    Smile, 
    Send,
    User,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Eye,
    CircleDashed,
    Trash2
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { getStatuses, postStatus, markSeen, getViewers, uploadStatusMedia, sendMessage, deleteStatus } from '../services/api';
import { socket } from '../socket/socket';
import Picker from 'emoji-picker-react';

const formatTime = (date) => {
    const now = new Date();
    const statusDate = new Date(date);
    const diffInHours = (now - statusDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
        return `Today at ${statusDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return statusDate.toLocaleDateString();
    }
};

const StatusPanel = () => {
    const { currentUser } = useContext(AuthContext);
    const { 
        setSelectedChat, setActiveTab, activeStatusUser, setActiveStatusUser, 
        statuses, setStatuses, allUsers 
    } = useContext(ChatContext);
    
    const [showCreateMode, setShowCreateMode] = useState(false);
    const [pendingMedia, setPendingMedia] = useState(null);
    const [statusType, setStatusType] = useState('text'); // 'text', 'image', 'video'
    const [statusText, setStatusText] = useState('');
    const [bgColor, setBgColor] = useState('#00a884');
    const [fontFamily, setFontFamily] = useState("'Segoe UI', Tahoma, Geneva, Verdana, sans-serif");
    const [fontIndex, setFontIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const [showMyStatusMenu, setShowMyStatusMenu] = useState(false);
    const fileInputRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [selectedPrivacyUsers, setSelectedPrivacyUsers] = useState([]);

    const renderPrivacyModal = () => (
        <div className="privacy-modal-overlay animate-fade-in" onClick={() => setShowPrivacyModal(false)}>
            <div className="privacy-modal animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Status privacy</h3>
                    <X onClick={() => setShowPrivacyModal(false)} />
                </div>
                <div className="modal-info">Who can see your status updates</div>
                <div className="user-selection-list">
                    {allUsers.filter(u => u._id !== currentUser._id).map(user => (
                        <div 
                            key={user._id} 
                            className={`selection-item ${selectedPrivacyUsers.includes(user._id) ? 'selected' : ''}`}
                            title={user.username}
                            onClick={() => {
                                setSelectedPrivacyUsers(prev => 
                                    prev.includes(user._id) 
                                        ? prev.filter(id => id !== user._id) 
                                        : [...prev, user._id]
                                );
                            }}
                        >
                            <div className="avatar">
                                {user.profilePic ? <img src={user.profilePic} alt={user.username} /> : <div className="avatar-placeholder">{user.username?.charAt(0).toUpperCase()}</div>}
                            </div>
                            <div className="user-details-privacy">
                                <span className="username-full">{user.username}</span>
                                {selectedPrivacyUsers.includes(user._id) && <span className="status-hidden-label">Hidden from status</span>}
                            </div>
                            <div className="checkbox-sim">
                                {selectedPrivacyUsers.includes(user._id) && <div className="check-mark" />}
                            </div>
                        </div>
                    ))}
                </div>
                <button className="done-btn" onClick={() => setShowPrivacyModal(false)}>Done</button>
            </div>
        </div>
    );

    const bgPresets = ['#00a884', '#128c7e', '#075e54', '#34b7f1', '#25d366', '#ece5dd', '#53bdeb', '#9c27b0', '#e91e63', '#ff5722'];
    const fontPresets = [
        "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        "'Georgia', serif",
        "'Courier New', Courier, monospace",
        "'Brush Script MT', cursive",
        "Impact, charcoal, sans-serif",
        "'Arial Black', Gadget, sans-serif"
    ];

    useEffect(() => {
        fetchStatuses(true);
        
        const handleStatusPosted = (data) => {
            // Privacy check: If we are in the excluded list, don't show the update
            if (data && data.excludedUsers && data.excludedUsers.includes(currentUser._id)) {
                return;
            }
            fetchStatuses(false);
        };
        const handleStatusDeleted = () => fetchStatuses(false);

        socket.on('status-posted', handleStatusPosted);
        socket.on('status-deleted', handleStatusDeleted);

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            socket.off('status-posted', handleStatusPosted);
            socket.off('status-deleted', handleStatusDeleted);
        };
    }, []);

    const fetchStatuses = async (initial = false) => {
        try {
            if (initial) setIsInitialLoading(true);
            const data = await getStatuses(currentUser._id);
            setStatuses(data);
        } catch (error) {
            console.error("Failed to fetch statuses:", error);
        } finally {
            if (initial) setIsInitialLoading(false);
        }
    };

    const handlePostStatus = async (type = 'text', content = null, caption = '') => {
        try {
            setLoading(true);
            const data = await postStatus({
                userId: currentUser._id,
                content: type === 'text' ? statusText : content,
                type: type,
                backgroundColor: type === 'text' ? bgColor : null,
                fontFamily: type === 'text' ? fontFamily : null,
                caption: caption,
                excludedUsers: selectedPrivacyUsers
            });
            
            setStatuses(prev => {
                const myGroup = prev.find(g => g.user._id === currentUser._id);
                if (myGroup) {
                    return prev.map(g => g.user._id === currentUser._id ? {
                        ...g,
                        latestStatus: data,
                        allStatuses: [data, ...g.allStatuses]
                    } : g);
                } else {
                    return [{
                        user: currentUser,
                        latestStatus: data,
                        allStatuses: [data],
                        hasUnseen: false
                    }, ...prev];
                }
            });

            // Emit via socket
            socket.emit('status-posted', data);
            
            setShowCreateMode(false);
            setStatusText('');
        } catch (error) {
            console.error("Failed to post status:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const type = file.type.startsWith('video') ? 'video' : 'image';
        try {
            setLoading(true);
            const response = await uploadStatusMedia(currentUser._id, file);
            setPendingMedia({ url: response.url, type });
            setStatusText(''); // Clear any text from text mode
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setLoading(false);
        }
    };


    const myStatusGroup = statuses.find(g => g.user._id === currentUser._id);
    const otherStatusGroups = statuses.filter(g => g.user._id !== currentUser._id);

    const renderMediaPreview = () => {
        if (!pendingMedia) return null;

        const isVideo = pendingMedia.type === 'video';

        return (
            <div className="status-media-preview animate-fade-in">
                <div className="preview-header">
                    <X size={32} color="white" className="close-btn" onClick={() => { setPendingMedia(null); setShowCreateMode(false); }} />
                </div>

                <div className="preview-content">
                    {isVideo ? (
                        <video src={`http://localhost:5000${pendingMedia.url}`} controls autoPlay className="main-media" />
                    ) : (
                        <img src={`http://localhost:5000${pendingMedia.url}`} alt="Preview" className="main-media" />
                    )}
                </div>

                <div className="preview-footer">
                    <div className="preview-footer-main" style={{ display: 'flex', alignItems: 'center', gap: '15px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                        <div className="caption-input-wrapper" style={{ flex: 1, margin: 0 }}>
                            <Smile size={24} color="var(--text-secondary)" onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
                            <input 
                                type="text" 
                                placeholder="Add a caption..." 
                                value={statusText}
                                onChange={(e) => setStatusText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handlePostStatus(pendingMedia.type, pendingMedia.url, statusText)}
                            />
                            {showEmojiPicker && (
                                <div className="emoji-picker-container" style={{ bottom: '80px', position: 'absolute' }}>
                                    <Picker 
                                        onEmojiClick={(emoji) => setStatusText(prev => prev + emoji.emoji)}
                                        theme="dark"
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="send-status-btn" onClick={() => {
                            handlePostStatus(pendingMedia.type, pendingMedia.url, statusText);
                            setPendingMedia(null);
                        }}>
                            <Send size={24} color="white" />
                        </div>
                    </div>
                </div>

                {showPrivacyModal && renderPrivacyModal()}
            </div>
        );
    };

    if (showCreateMode) {
        if (statusType !== 'text') {
            return renderMediaPreview();
        }
        
        return (
            <div className="status-create-overlay animate-fade-in" style={{ backgroundColor: bgColor }}>
                <div className="create-header">
                    <X size={32} color="white" className="close-btn" onClick={() => setShowCreateMode(false)} />
                    <div className="header-actions-right">
                        <div className="icon-btn" title="Emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                            <Smile size={24} />
                            {showEmojiPicker && (
                                <div className="create-emoji-picker">
                                    <Picker onEmojiClick={(emoji) => setStatusText(prev => prev + emoji.emoji)} />
                                </div>
                            )}
                        </div>
                        <div className="icon-btn" title="Text" onClick={() => {
                            const nextFont = (fontIndex + 1) % fontPresets.length;
                            setFontIndex(nextFont);
                            setFontFamily(fontPresets[nextFont]);
                        }}>
                            <Type size={24} />
                        </div>
                        <div className="icon-btn" title="Color" onClick={() => {
                            const nextIndex = (bgPresets.indexOf(bgColor) + 1) % bgPresets.length;
                            setBgColor(bgPresets[nextIndex]);
                        }}>
                            <div className="color-palette-icon" style={{ borderColor: 'white', borderWidth: '2px', borderStyle: 'solid', borderRadius: '50%', width: '20px', height: '20px', backgroundColor: 'transparent' }} />
                        </div>
                    </div>
                </div>
                <div className="create-content">
                    <textarea 
                        placeholder="Type a status"
                        value={statusText}
                        onChange={(e) => setStatusText(e.target.value)}
                        style={{ fontFamily: fontFamily }}
                        autoFocus
                    />
                </div>
                <div className="create-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 40px' }}>
                    <button className="post-btn-circular" disabled={loading || !statusText.trim()} onClick={() => handlePostStatus()} style={{ width: '60px', height: '60px' }}>
                        <Send size={28} />
                    </button>
                </div>

                {showPrivacyModal && renderPrivacyModal()}
            </div>
        );
    }

    return (
        <div className="chatlist-container status-panel-container animate-fade-in">
            <div className="chatlist-header">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2 style={{fontSize: '22px', fontWeight: 600}}>Status</h2>
                    <div style={{display: 'flex', gap: '16px', color: 'var(--text-secondary)'}}>
                        <div className="action-icon-container" onClick={() => setShowPlusMenu(!showPlusMenu)}>
                            <Plus size={24} style={{cursor: 'pointer'}} />
                            {showPlusMenu && (
                                <div className="status-plus-menu animate-pop-in" onClick={e => e.stopPropagation()}>
                                    <div className="menu-item" onClick={() => { setShowCreateMode(true); setStatusType('text'); setShowPlusMenu(false); }}>
                                        <Type size={20} />
                                        <span>Text</span>
                                    </div>
                                    <div className="menu-item" onClick={() => { fileInputRef.current.click(); setShowPlusMenu(false); }}>
                                        <ImageIcon size={20} />
                                        <span>Photos & videos</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <MoreVertical size={24} style={{cursor: 'pointer'}} />
                    </div>
                </div>
            </div>

            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*,video/*" 
                onChange={handleFileUpload} 
            />

            <div className="chatlist-items status-list-items">
                {isInitialLoading ? (
                    <div style={{padding: '20px', textAlign: 'center', color: 'var(--text-secondary)'}}>Loading...</div>
                ) : (
                    <>
                        <div className="chatlist-item status-item-main" onClick={() => myStatusGroup ? setActiveStatusUser(myStatusGroup) : setShowMyStatusMenu(!showMyStatusMenu)}>
                            <div className="avatar-wrapper">
                                <div className={`status-avatar-ring ${myStatusGroup ? (myStatusGroup.hasUnseen ? 'has-unseen' : 'has-seen') : ''}`}>
                                    {currentUser.profilePic ? (
                                        <img src={currentUser.profilePic} alt="Me" className="avatar-img" />
                                    ) : (
                                        <div className="avatar-placeholder"><User size={24} /></div>
                                    )}
                                    {!myStatusGroup && (
                                        <div className="add-status-badge" onClick={(e) => { e.stopPropagation(); setShowMyStatusMenu(!showMyStatusMenu); }}>
                                            <Plus size={14} />
                                        </div>
                                    )}
                                    {showMyStatusMenu && (
                                        <div className="status-plus-menu my-status-menu animate-pop-in" onClick={e => e.stopPropagation()}>
                                            <div className="menu-item" onClick={() => { setShowCreateMode(true); setStatusType('text'); setShowMyStatusMenu(false); }}>
                                                <Type size={20} />
                                                <span>Text</span>
                                            </div>
                                            <div className="menu-item" onClick={() => { fileInputRef.current.click(); setShowMyStatusMenu(false); }}>
                                                <ImageIcon size={20} />
                                                <span>Photos & videos</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="chat-info">
                                <div className="chat-name">My status</div>
                                <div className="chat-preview">
                                    {myStatusGroup ? formatTime(myStatusGroup.latestStatus.createdAt) : 'Click to add status update'}
                                </div>
                            </div>
                            
                            {myStatusGroup && (
                                <div className="my-status-view-btn" onClick={(e) => { e.stopPropagation(); setActiveStatusUser(myStatusGroup); }}>
                                    <Eye size={18} />
                                    <span>Views</span>
                                </div>
                            )}
                        </div>

                        {otherStatusGroups.length > 0 && (
                            <>
                                <div className="section-label" style={{padding: '20px 16px 10px', fontSize: '14px', color: 'var(--accent-green)', fontWeight: 500}}>Recent updates</div>
                                {otherStatusGroups.map(group => (
                                    <div 
                                        key={group.user._id} 
                                        className="chatlist-item status-item-main"
                                        onClick={() => setActiveStatusUser(group)}
                                    >
                                        <div className="avatar-wrapper">
                                            <div className={`status-avatar-ring ${group.hasUnseen ? 'has-unseen' : 'has-seen'}`}>
                                                {group.user.profilePic ? (
                                                    <img src={group.user.profilePic} alt={group.user.username} className="avatar-img" />
                                                ) : (
                                                    <div className="avatar-placeholder"><User size={24} /></div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="chat-info">
                                            <div className="chat-name">{group.user.username}</div>
                                            <div className="chat-preview">{formatTime(group.latestStatus.createdAt)}</div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Global statuses passed to viewer will be handled in Chat.jsx */}
            {renderMediaPreview()}
        </div>
    );
};

export const StatusViewer = ({ statusGroups, initialUserIndex, onClose }) => {
    const { currentUser } = useContext(AuthContext);
    const { setSelectedChat, setActiveTab, setStatuses, setLastMessages } = useContext(ChatContext);
    
    const [userIndex, setUserIndex] = useState(initialUserIndex);
    const [statusIndex, setStatusIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [videoDuration, setVideoDuration] = useState(5000);
    const [showReplyEmoji, setShowReplyEmoji] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [viewers, setViewers] = useState([]);
    const [showViewersModal, setShowViewersModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const videoRef = useRef(null);
    const currentUserGroup = statusGroups[userIndex];
    
    // Reverse statuses for chronological order (oldest first)
    const chronologicalStatuses = currentUserGroup?.allStatuses ? [...currentUserGroup.allStatuses].reverse() : [];
    const currentStatus = chronologicalStatuses[statusIndex];

    useEffect(() => {
        if (!currentStatus) return;
        
        // Reset progress when status changes
        setProgress(0);
        
        // Fetch viewers for this specific status
        if (currentUserGroup.user._id === currentUser._id) {
            getViewers(currentStatus._id).then(data => setViewers(data)).catch(err => console.error(err));
        }

        // Mark as seen
        if (currentUserGroup.user._id !== currentUser._id) {
            markSeen(currentStatus._id, currentUser._id).catch(err => console.error(err));
        }

        if (currentStatus.type === 'video' && videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
                setVideoDuration(videoRef.current.duration * 1000);
            };
        } else {
            setVideoDuration(5000);
        }
    }, [userIndex, statusIndex, currentStatus, currentUser, currentUserGroup]);

    useEffect(() => {
        if (isPaused) return;

        const interval = 50;
        const step = (interval / videoDuration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    handleNext();
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [userIndex, statusIndex, isPaused, videoDuration]);

    const handleNext = () => {
        if (statusIndex < chronologicalStatuses.length - 1) {
            setStatusIndex(prev => prev + 1);
        } else if (userIndex < statusGroups.length - 1) {
            setUserIndex(prev => prev + 1);
            setStatusIndex(0);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (statusIndex > 0) {
            setStatusIndex(prev => prev - 1);
        } else if (userIndex > 0) {
            const prevUserIndex = userIndex - 1;
            const prevUserStatuses = [...statusGroups[prevUserIndex].allStatuses].reverse();
            setUserIndex(prevUserIndex);
            setStatusIndex(prevUserStatuses.length - 1);
        } else {
            setStatusIndex(0); // Stay at first status of first user
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        try {
            const statusPreview = currentStatus.type === 'text' 
                ? currentStatus.content 
                : (currentStatus.caption || `[${currentStatus.type} status]`);
            
            const richMessage = `*Status Reply:* ${statusPreview}\n\n${replyText}`;

            const msg = await sendMessage(
                currentUser._id,
                currentUserGroup.user._id,
                richMessage
            );
            
            // Emit via socket so receiver gets notification count
            socket.emit('sendMessage', msg);
            
            // Update last messages instantly for sender's chat list
            setLastMessages(prev => ({
                ...prev,
                [currentUserGroup.user._id]: {
                    message: msg.message,
                    timestamp: msg.timestamp
                }
            }));
            
            setShowSuccess(true);
            setReplyText('');
            setTimeout(() => {
                setShowSuccess(false);
                // We no longer close the viewer or switch tabs here
            }, 2000);
        } catch (error) {
            console.error("Reply failed:", error);
        }
    };

    const handleDeleteStatus = async (e) => {
        if (e) e.stopPropagation();
        
        try {
            await deleteStatus(currentStatus._id);
            setShowDeleteConfirm(false);
            setIsPaused(false);
            
            // Update local state in real-time
            setStatuses(prev => {
                return prev.map(group => {
                    if (group.user._id === currentUser._id) {
                        const updatedAll = group.allStatuses.filter(s => s._id !== currentStatus._id);
                        if (updatedAll.length === 0) return null;
                        return {
                            ...group,
                            allStatuses: updatedAll,
                            latestStatus: updatedAll[0]
                        };
                    }
                    return group;
                }).filter(Boolean);
            });
            
            // Emit via socket
            socket.emit('status-deleted', { statusId: currentStatus._id, userId: currentUser._id });
            
            // Navigate or close
            if (chronologicalStatuses.length === 1) {
                onClose();
            } else {
                // If we're deleting the last one, go back
                if (statusIndex === chronologicalStatuses.length - 1) {
                    handlePrev();
                } else {
                    // Otherwise stay at same index (which is now the next one)
                    // but since handleNext increments, we just stay
                }
            }
        } catch (error) {
            console.error("Failed to delete status:", error);
        }
    };

    if (!currentUserGroup) {
        return (
            <div className="status-viewer animate-fade-in" style={{ backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'white' }}>Loading group...</div>
                <X className="close-btn" style={{ position: 'absolute', top: '20px', right: '20px', color: 'white', cursor: 'pointer' }} onClick={onClose} />
            </div>
        );
    }

    if (!currentStatus) {
        return (
            <div className="status-viewer animate-fade-in" style={{ backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'white' }}>Loading status...</div>
                <X className="close-btn" style={{ position: 'absolute', top: '20px', right: '20px', color: 'white', cursor: 'pointer' }} onClick={onClose} />
            </div>
        );
    }

    return (
        <div 
            className="status-viewer animate-fade-in" 
            style={{ backgroundColor: currentStatus.type === 'text' ? currentStatus.backgroundColor : '#000' }}
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
        >
            <div className="viewer-header">
                <div className="progress-bars">
                    {chronologicalStatuses.map((_, i) => (
                        <div key={i} className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: i === statusIndex ? `${progress}%` : i < statusIndex ? '100%' : '0%' }} />
                        </div>
                    ))}
                </div>
                <div className="viewer-user-info">
                    <div className="avatar">
                        {currentUserGroup.user.profilePic ? <img src={currentUserGroup.user.profilePic} alt={currentUserGroup.user.username} /> : <div className="avatar-placeholder"><User size={24} /></div>}
                    </div>
                    <div className="text-info">
                        <span className="name">{currentUserGroup.user.username}</span>
                        <span className="time">{formatTime(currentStatus.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {currentUserGroup.user._id === currentUser._id && (
                            <Trash2 size={24} color="white" style={{ cursor: 'pointer', opacity: 0.8 }} onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); setIsPaused(true); }} />
                        )}
                        <X size={32} color="white" className="close-btn" onClick={(e) => { e.stopPropagation(); onClose(); }} />
                    </div>
                </div>
            </div>

            <div className="viewer-content">
                <div className="nav-btn prev" onClick={(e) => { e.stopPropagation(); handlePrev(); }}><ChevronLeft /></div>
                
                {currentStatus.type === 'text' ? (
                    <div className="status-text" style={{ fontFamily: currentStatus.fontFamily }}>{currentStatus.content}</div>
                ) : currentStatus.type === 'image' ? (
                    <img src={currentStatus.content.startsWith('http') ? currentStatus.content : `http://localhost:5000${currentStatus.content}`} alt="Status" className="status-media" />
                ) : (
                    <video 
                        ref={videoRef} 
                        src={currentStatus.content.startsWith('http') ? currentStatus.content : `http://localhost:5000${currentStatus.content}`} 
                        autoPlay 
                        className="status-media" 
                    />
                )}
                
                {currentStatus.caption && <div className="status-caption">{currentStatus.caption}</div>}
                
                {currentUserGroup.user._id === currentUser._id && (
                    <div className="viewer-my-status-footer" onClick={(e) => { e.stopPropagation(); setShowViewersModal(true); setIsPaused(true); }}>
                        <ChevronUp size={24} />
                        <span className="view-count">{viewers.length}</span>
                    </div>
                )}

                <div className="nav-btn next" onClick={(e) => { e.stopPropagation(); handleNext(); }}><ChevronRight /></div>
            </div>

            {showViewersModal && (
                <div className="viewers-modal-overlay viewer-context" onClick={() => { setShowViewersModal(false); setIsPaused(false); }}>
                    <div className="viewers-modal animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Viewed by {viewers.length}</h3>
                            <X onClick={() => { setShowViewersModal(false); setIsPaused(false); }} />
                        </div>
                        <div className="viewers-list">
                            {viewers.length > 0 ? viewers.map(view => (
                                <div key={view._id} className="viewer-item">
                                    <div className="avatar">
                                        {view.viewerId.profilePic ? <img src={view.viewerId.profilePic} alt={view.viewerId.username} /> : <div className="avatar-placeholder">{view.viewerId.username[0]}</div>}
                                    </div>
                                    <div className="info">
                                        <span className="name">{view.viewerId.username}</span>
                                        <span className="time">{new Date(view.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="no-viewers">No views yet</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {currentUserGroup.user._id !== currentUser._id && (
                <div className="viewer-footer" onClick={e => e.stopPropagation()}>
                    {showSuccess && <div className="reply-success-toast animate-pop-in">Reply sent successfully!</div>}
                    <div className="reply-input-container">
                        <div className="reply-emoji-btn" onClick={() => { setShowReplyEmoji(!showReplyEmoji); setIsPaused(true); }}>
                            <Smile size={24} />
                        </div>
                        {showReplyEmoji && (
                            <div className="reply-emoji-picker">
                                <Picker onEmojiClick={(emoji) => setReplyText(prev => prev + emoji.emoji)} />
                            </div>
                        )}
                        <input 
                            type="text" 
                            placeholder="Type a message" 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onFocus={() => setIsPaused(true)}
                            onBlur={() => !showReplyEmoji && setIsPaused(false)}
                        />
                        <button onClick={handleReply} disabled={!replyText.trim()}>
                            <Send size={20} />
                        </button>
                    </div>
                    <span className="reply-label">REPLY</span>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="custom-confirm-overlay animate-fade-in" onClick={() => { setShowDeleteConfirm(false); setIsPaused(false); }}>
                    <div className="custom-confirm-modal animate-pop-in" onClick={e => e.stopPropagation()}>
                        <h3>Delete status update?</h3>
                        <p>This status update will be deleted for everyone who can see it.</p>
                        <div className="confirm-actions">
                            <button className="confirm-btn cancel" onClick={() => { setShowDeleteConfirm(false); setIsPaused(false); }}>Cancel</button>
                            <button className="confirm-btn delete" onClick={handleDeleteStatus}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusPanel;
