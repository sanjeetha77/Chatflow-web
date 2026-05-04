import React, { useContext, useState, useRef, useEffect } from 'react';
import { 
  Check, CheckCheck, Clock, ChevronDown, Copy, Forward, Trash2, Smile, 
  CornerUpLeft, Pin, Star, LayoutGrid, Info, HelpCircle, Star as StarFilled,
  FileText, Download, Play, Pause, Edit3, CircleDashed
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import EmojiPicker from 'emoji-picker-react';
import { deleteMessage, toggleStar, togglePin, reactToMessage } from '../services/api';
import DeleteModal from './DeleteModal';

const API_BASE_URL = 'http://localhost:5000';

const AudioPlayer = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const onLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-player">
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={onTimeUpdate} 
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      <button className="play-btn" onClick={togglePlay}>
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
      </button>
      <div className="audio-controls">
        <input 
          type="range" 
          min="0" 
          max={duration || 0} 
          value={currentTime} 
          onChange={(e) => {
            audioRef.current.currentTime = e.target.value;
            setCurrentTime(e.target.value);
          }}
          className="audio-slider"
        />
        <span className="audio-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>
    </div>
  );
};

const MessageBubble = ({ message, onForwardClick, isHighlighted }) => {
  const { currentUser } = useContext(AuthContext);
  const { 
    setMessages, setReplyMessage, setIsSelectMode, isSelectMode,
    selectedMessages, setSelectedMessages, setPinnedMessage, setEditingMessage
  } = useContext(ChatContext);
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [menuPosition, setMenuPosition] = useState('top'); // 'top' or 'bottom'
  const dropdownRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const longPressTimer = useRef(null);
  
  const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
  const isSent = senderId === currentUser._id;
  const isSending = message.sending;
  const isSelected = selectedMessages.includes(message._id);

  // Close dropdown or reaction picker on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target)) {
        setShowReactionPicker(false);
      }
    };
    if (showDropdown || showReactionPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown, showReactionPicker]);

  // Dynamic positioning logic
  useEffect(() => {
    if (showDropdown && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      
      if (spaceAbove < 200) { // If less than 200px space at top
        setMenuPosition('bottom');
      } else {
        setMenuPosition('top');
      }
    }
  }, [showDropdown]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    }).toLowerCase();
  };

  const handleDelete = async () => {
    try {
      await deleteMessage(message._id);
      setMessages(prev => prev.filter(m => m._id !== message._id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleStar = async () => {
    try {
      const updated = await toggleStar(message._id);
      setMessages(prev => prev.map(m => m._id === message._id ? { ...m, isStarred: updated.isStarred } : m));
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
    setShowDropdown(false);
  };

  const handlePin = async () => {
    try {
      const updated = await togglePin(message._id);
      setPinnedMessage(updated.isPinned ? message : null);
      setMessages(prev => prev.map(m => m._id === message._id ? { ...m, isPinned: updated.isPinned } : m));
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
    setShowDropdown(false);
  };

  const handleReact = async (emoji) => {
    try {
      const updated = await reactToMessage(message._id, currentUser._id, emoji);
      // Update local state via ChatContext
      setMessages(prev => prev.map(m => m._id === message._id ? { ...m, reactions: updated.reactions } : m));
      
      // Emit to socket
      const targetId = isSent 
        ? (typeof message.receiverId === 'object' ? message.receiverId._id : message.receiverId)
        : (typeof message.senderId === 'object' ? message.senderId._id : message.senderId);

      // Ensure reactions is a plain object for socket emission
      const plainReactions = updated.reactions && typeof updated.reactions.toJSON === 'function' 
        ? updated.reactions.toJSON() 
        : updated.reactions;

      console.log(`[Reaction] Emitting reaction for ${message._id} to ${targetId}`, plainReactions);

      socket.emit('messageReacted', { 
        messageId: message._id, 
        reactions: plainReactions,
        receiverId: String(targetId)
      });
    } catch (error) {
      console.error('Failed to react:', error);
    }
    setShowReactionPicker(false);
    setShowReactions(false);
  };

  const toggleSelect = () => {
    if (!isSelectMode) setIsSelectMode(true);
    setSelectedMessages(prev => 
      prev.includes(message._id) 
        ? prev.filter(id => id !== message._id) 
        : [...prev, message._id]
    );
  };

  // Mobile Long Press
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      if (isSelectMode) return;
      setShowDropdown(true); // Open menu on long press
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <div 
      id={`msg-${message._id}`}
      className={`message-wrapper ${isSent ? 'sent' : 'received'} ${isSelectMode ? 'selectable' : ''} ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
      onClick={isSelectMode ? toggleSelect : undefined}
    >
      {isSelectMode && (
        <div className={`message-selection-indicator ${isSelected ? 'checked' : ''}`}>
           {isSelected && <Check size={12} color="#fff" strokeWidth={4} />}
        </div>
      )}
      <div className="message-bubble-container">
        
        {/* External Forward Action Button */}
        {!isSending && !isSelectMode && (
          <div className="external-action-btn" onClick={() => onForwardClick(message)} title="Forward">
            <Forward size={18} />
          </div>
        )}

        <div 
          className="message-bubble"
          onContextMenu={(e) => {
             e.preventDefault();
             if (isSelectMode) return;
             setShowDropdown(true);
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseLeave={() => setShowReactions(false)}
        >
          {/* Reactions Bar Shortcut */}
          {showReactions && (
            <div className="reactions-bar" onMouseLeave={() => !showReactionPicker && setShowReactions(false)}>
              {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                <span key={emoji} className="reaction-emoji" onClick={() => handleReact(emoji)}>
                  {emoji}
                </span>
              ))}
              <div className="reaction-add" onClick={(e) => {
                e.stopPropagation();
                setShowReactionPicker(!showReactionPicker);
              }}>+</div>

              {showReactionPicker && (
                <div className="reaction-emoji-picker" ref={reactionPickerRef} onClick={e => e.stopPropagation()}>
                  <EmojiPicker 
                    onEmojiClick={(emojiData) => handleReact(emojiData.emoji)}
                    theme="dark"
                    width={300}
                    height={350}
                    skinTonesDisabled
                    searchPlaceHolder="Search emoji"
                  />
                </div>
              )}
            </div>
          )}

          {/* Dropdown Menu - High-Fidelity Floating Overlay */}
          {showDropdown && (
            <div className="bubble-dropdown-container">
              <div className={`bubble-dropdown ${menuPosition}`} ref={dropdownRef}>
                <div className="dropdown-item" onClick={() => { setReplyMessage(message); setShowDropdown(false); }}>
                  <CornerUpLeft size={16} />
                  <span>Reply</span>
                </div>
                <div className="dropdown-item" onClick={() => {
                  navigator.clipboard.writeText(message.message);
                  setShowDropdown(false);
                }}>
                  <Copy size={16} />
                  <span>Copy</span>
                </div>
                {isSent && message.message && !message.fileUrl && (
                  <div className="dropdown-item" onClick={() => { setEditingMessage(message); setShowDropdown(false); }}>
                    <Edit3 size={16} />
                    <span>Edit</span>
                  </div>
                )}
                <div className="dropdown-item" onClick={() => { onForwardClick(message); setShowDropdown(false); }}>
                  <Forward size={16} />
                  <span>Forward</span>
                </div>
                <div className="dropdown-item" onClick={handleStar}>
                  <Star size={16} />
                  <span>{message.isStarred ? 'Unstar' : 'Star'}</span>
                </div>
                <div className="dropdown-item" onClick={handlePin}>
                  <Pin size={16} />
                  <span>{message.isPinned ? 'Unpin' : 'Pin'}</span>
                </div>
                <div className="dropdown-item" onClick={toggleSelect}>
                  <LayoutGrid size={16} />
                  <span>Select</span>
                </div>
                <div className="dropdown-item danger" onClick={() => { setShowDeleteModal(true); setShowDropdown(false); }}>
                  <Trash2 size={16} />
                  <span>Delete</span>
                </div>
              </div>
            </div>
          )}

          {/* Hover Action Trigger (Chevron) */}
          {!isSending && !isSelectMode && (
            <div className="bubble-action-triggers">
               <div className="action-trigger" onMouseEnter={() => setShowReactions(true)}>
                 <Smile size={14} />
               </div>
               <div className="action-trigger" onClick={(e) => {
                 e.stopPropagation();
                 setShowDropdown(!showDropdown);
               }}>
                 <ChevronDown size={16} />
               </div>
            </div>
          )}

          {/* Forwarded Label */}
          {message.isForwarded && (
            <div className="forwarded-label">
              <Forward size={12} />
              <span>Forwarded</span>
            </div>
          )}

          {/* Reply Content */}
          {message.replyTo && (
            <div className="message-reply-box" onClick={() => {
                const element = document.getElementById(`msg-${message.replyTo._id}`);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}>
              <div className="reply-user">
                {typeof message.replyTo.senderId === 'object' ? message.replyTo.senderId.username : 'User'}
              </div>
              <div className="reply-msg">{message.replyTo.message}</div>
            </div>
          )}

          {message.fileUrl && (
            <div className={`message-media-container ${message.fileType}`}>
              {message.fileType === 'image' ? (
                <div className="image-attachment">
                  <img 
                    src={`${API_BASE_URL}${message.fileUrl}`} 
                    alt={message.fileName} 
                    onClick={() => window.open(`${API_BASE_URL}${message.fileUrl}`, '_blank')}
                  />
                </div>
              ) : message.fileType === 'video' ? (
                <div className="video-attachment">
                  <video 
                    src={`${API_BASE_URL}${message.fileUrl}`} 
                    controls
                    className="message-video"
                    poster={`${API_BASE_URL}${message.fileUrl}#t=0.1`} // Try to show first frame
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : message.fileType === 'audio' ? (
                <AudioPlayer src={`${API_BASE_URL}${message.fileUrl}`} />
              ) : (
                <div className="file-attachment" onClick={() => window.open(`${API_BASE_URL}${message.fileUrl}`, '_blank')}>
                  <div className={`file-icon-box ${message.fileName?.split('.').pop()?.toLowerCase()}`}>
                    <FileText size={24} color="#fff" />
                  </div>
                  <div className="file-details">
                    <div className="file-name">{message.fileName}</div>
                    <div className="file-meta">{(message.fileSize || 'FILE').toUpperCase()}</div>
                  </div>
                  <div className="file-download-icon">
                    <Download size={20} />
                  </div>
                </div>
              )}
            </div>
          )}

          {message.message && (
            message.message.startsWith('*Status Reply:*') ? (
              <div className="status-reply-content">
                <div className="status-reply-box">
                  <div className="status-reply-header">
                    <CircleDashed size={12} className="status-reply-icon" />
                    <span>Status</span>
                  </div>
                  <div className="status-reply-preview">
                    {message.message.split('\n\n')[0].replace('*Status Reply:* ', '')}
                  </div>
                </div>
                <div className="message-text main-text">
                  {message.message.split('\n\n')[1] || ''}
                </div>
              </div>
            ) : (
              <div className="message-text" id={`msg-${message._id}`}>{message.message}</div>
            )
          )}
          
          {/* Reaction Badge (Bottom Right overlapping bubble) */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="message-reaction-badge">
              {Array.from(new Set(Object.values(message.reactions))).slice(0, 3).map((emoji, i) => (
                <span key={i}>{emoji}</span>
              ))}
              {Object.keys(message.reactions).length > 1 && (
                <span className="reaction-count">{Object.keys(message.reactions).length}</span>
              )}
            </div>
          )}

          <div className="message-time">
            {message.isEdited && <span className="edited-label" style={{ marginRight: '4px', fontStyle: 'italic', fontSize: '11px', opacity: 0.7 }}>edited</span>}
            {message.isStarred && <StarFilled size={10} style={{ marginRight: '4px', color: 'var(--text-secondary)' }} />}
            {formatTime(message.timestamp)}
            {isSent && (
              message.sending ? (
                <Clock size={12} style={{marginLeft: '4px'}} />
              ) : message.status === 'seen' ? (
                <CheckCheck size={14} color="#34B7F1" style={{marginLeft: '4px'}} />
              ) : message.status === 'delivered' ? (
                <CheckCheck size={14} color="#8696a0" style={{marginLeft: '4px'}} />
              ) : (
                <Check size={14} color="#8696a0" style={{marginLeft: '4px'}} />
              )
            )}
          </div>
        </div>
      </div>
      
      <DeleteModal 
        isOpen={showDeleteModal}
        title="Delete message?"
        deleteText="Delete"
        onCancel={() => setShowDeleteModal(false)}
        onDeleteForMe={handleDelete}
        onDeleteForEveryone={isSent ? handleDelete : null}
      />
    </div>
  );
};

export default MessageBubble;
