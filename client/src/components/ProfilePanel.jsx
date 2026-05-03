import React, { useContext, useState, useEffect, useRef } from 'react';
import { X, Camera, User, LogOut, Check, Pencil, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket/socket';

const ProfilePanel = ({ onClose }) => {
    const { currentUser, logout, updateUserProfile } = useContext(AuthContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [loading, setLoading] = useState(true);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [name, setName] = useState(currentUser?.username || '');
    const [bio, setBio] = useState(currentUser?.bio || 'Available');
    const [showLightbox, setShowLightbox] = useState(false);
    const [toast, setToast] = useState(null);

    // Photo flow states
    const [selectedImage, setSelectedImage] = useState(null);
    const [showAdjustment, setShowAdjustment] = useState(false);
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
    const [profilePic, setProfilePic] = useState(currentUser?.profilePic || null);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const showToastMsg = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const broadcastUpdate = (updatedData) => {
        socket.emit('updateProfile', {
            userId: currentUser._id,
            ...updatedData
        });
    };

    const handleSaveName = async () => {
        try {
            await updateUserProfile({ username: name });
            setIsEditingName(false);
            showToastMsg('Name updated');
            broadcastUpdate({ username: name });
        } catch (err) {
            showToastMsg('Failed to update name');
        }
    };

    const handleSaveBio = async () => {
        try {
            await updateUserProfile({ bio });
            setIsEditingBio(false);
            showToastMsg('About updated');
            broadcastUpdate({ bio });
        } catch (err) {
            showToastMsg('Failed to update bio');
        }
    };

    const handleFileClick = (e) => {
        e.stopPropagation();
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target.result);
                setShowAdjustment(true);
            };
            reader.readAsDataURL(file);
        } else if (file) {
            showToastMsg('Only image formats are accepted');
        }
    };

    const handleSavePhoto = async () => {
        try {
            await updateUserProfile({ profilePic: selectedImage });
            setProfilePic(selectedImage);
            setShowAdjustment(false);
            showToastMsg('profile pic updated');
            broadcastUpdate({ profilePic: selectedImage });
        } catch (err) {
            showToastMsg('Failed to update photo');
        }
    };

    const handleDeletePhoto = async (e) => {
        e.stopPropagation();
        try {
            await updateUserProfile({ profilePic: '' });
            setProfilePic(null);
            setSelectedImage(null);
            setShowLightbox(false);
            showToastMsg('Profile photo removed');
            broadcastUpdate({ profilePic: '' });
        } catch (err) {
            showToastMsg('Failed to remove photo');
        }
    };

    const handleCloseAdjustment = () => {
        setShowDiscardConfirm(true);
    };

    const confirmDiscard = () => {
        setShowDiscardConfirm(false);
        setShowAdjustment(false);
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleLogout = () => {
        showToastMsg('Logging out...');
        setTimeout(() => {
            logout();
            navigate('/login');
            onClose();
        }, 1000);
    };

    if (loading) {
        return (
            <div className="profile-overlay" onClick={onClose}>
                <div className="profile-panel animate-slide-in-left" onClick={e => e.stopPropagation()}>
                    <div className="panel-header">
                        <div className="header-title"><User size={20} color="var(--accent-green)" /><h3>Profile</h3></div>
                        <X className="close-btn" onClick={onClose} />
                    </div>
                    <div className="profile-content skeleton-loading">
                        <div className="skeleton-avatar"></div>
                        <div className="skeleton-group"></div>
                        <div className="skeleton-group"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="profile-overlay" onClick={onClose}>
                <div className="profile-panel animate-slide-in-left" onClick={e => e.stopPropagation()}>
                    <div className="panel-header">
                        <div className="header-title">
                            <User size={20} color="var(--accent-green)" />
                            <h3>Profile</h3>
                        </div>
                        <X className="close-btn" onClick={onClose} />
                    </div>

                    <div className="profile-content">
                        <div className="profile-avatar-section">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                hidden 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />
                            <div className="large-avatar" onClick={() => profilePic ? setShowLightbox(true) : handleFileClick()}>
                                {profilePic ? (
                                    <img src={profilePic} alt="Profile" className="avatar-img" />
                                ) : (
                                    currentUser?.username?.charAt(0).toUpperCase()
                                )}
                                <div className="avatar-overlay">
                                    <div className="overlay-content" onClick={handleFileClick}>
                                        <Camera size={24} />
                                        <span>CHANGE PROFILE PHOTO</span>
                                    </div>
                                    {profilePic && (
                                        <div className="delete-photo-btn" onClick={handleDeletePhoto} title="Delete Photo">
                                            <Trash2 size={18} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="profile-info-section">
                            <div className="info-group">
                                <div className="info-header">
                                    <label>Your name</label>
                                    {isEditingName && <span className="char-counter">{name.length}/25</span>}
                                </div>
                                <div className="info-value-container">
                                    {isEditingName ? (
                                        <div className="edit-input-wrapper active">
                                            <input 
                                                type="text" 
                                                value={name} 
                                                maxLength={25}
                                                onChange={(e) => setName(e.target.value)}
                                                onBlur={handleSaveName}
                                                autoFocus
                                            />
                                            <Check size={20} className="save-icon" onMouseDown={handleSaveName} />
                                        </div>
                                    ) : (
                                        <div className="display-value" onClick={() => setIsEditingName(true)}>
                                            <span>{name}</span>
                                            <Pencil size={18} className="edit-icon" />
                                        </div>
                                    )}
                                </div>
                                <p className="info-hint">This name will be visible to your ChatFlow contacts.</p>
                            </div>

                            <div className="info-group">
                                <div className="info-header">
                                    <label>About</label>
                                    {isEditingBio && <span className="char-counter">{bio.length}/140</span>}
                                </div>
                                <div className="info-value-container">
                                    {isEditingBio ? (
                                        <div className="edit-input-wrapper active">
                                            <input 
                                                type="text" 
                                                value={bio} 
                                                maxLength={140}
                                                onChange={(e) => setBio(e.target.value)}
                                                onBlur={handleSaveBio}
                                                autoFocus
                                            />
                                            <Check size={20} className="save-icon" onMouseDown={handleSaveBio} />
                                        </div>
                                    ) : (
                                        <div className="display-value" onClick={() => setIsEditingBio(true)}>
                                            <span>{bio}</span>
                                            <Pencil size={18} className="edit-icon" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="profile-actions">
                            <button className="logout-btn" onClick={handleLogout}>
                                <LogOut size={20} />
                                <span>Logout from ChatFlow</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Adjustment / Preview Modal */}
            {showAdjustment && (
                <div className="lightbox-overlay adjustment-mode">
                    <div className="lightbox-content animate-zoom-in">
                        <div className="lightbox-header">
                            <span>Drag to adjust</span>
                            <X size={24} className="icon" onClick={handleCloseAdjustment} />
                        </div>
                        <div className="lightbox-image-container preview-bg">
                            <div className="crop-circle-mask">
                                <img src={selectedImage} alt="Preview" className="preview-img-adjust" />
                            </div>
                        </div>
                        <div className="adjustment-footer">
                            <button className="cancel-btn-outline" onClick={handleCloseAdjustment}>Cancel</button>
                            <button className="save-photo-btn" onClick={handleSavePhoto}>SAVE</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Discard Confirmation Modal */}
            {showDiscardConfirm && (
                <div className="mini-modal-overlay">
                    <div className="mini-modal animate-pop-in">
                        <div className="mini-modal-body">
                            <AlertCircle size={40} color="#ff4b4b" />
                            <h4>Discard changes?</h4>
                            <p>You haven't saved your profile photo yet.</p>
                        </div>
                        <div className="mini-modal-actions">
                            <button className="discard-btn" onClick={confirmDiscard}>DISCARD</button>
                            <button className="cancel-btn" onClick={() => setShowDiscardConfirm(false)}>CANCEL</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox Modal (View existing) */}
            {showLightbox && (
                <div className="lightbox-overlay" onClick={() => setShowLightbox(false)}>
                    <div className="lightbox-content animate-zoom-in" onClick={e => e.stopPropagation()}>
                        <div className="lightbox-header">
                            <span>Profile photo</span>
                            <div className="lightbox-actions">
                                <Trash2 size={20} className="icon" onClick={handleDeletePhoto} title="Remove" />
                                <X size={24} className="icon" onClick={() => setShowLightbox(false)} />
                            </div>
                        </div>
                        <div className="lightbox-image-container">
                            <img src={profilePic} alt="Profile Large" className="lightbox-img-full" />
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && <div className="toast-notification animate-slide-up">{toast}</div>}
        </>
    );
};


export default ProfilePanel;
