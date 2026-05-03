import React, { useState, useRef, useEffect, useContext } from 'react';
import { Plus, Smile, Mic, Send, FileText, Image as ImageIcon, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { socket } from '../socket/socket';
import { sendMessage, uploadFile } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import FilePreviewModal from './FilePreviewModal';

const InputBar = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null); // 'image' or 'doc'
  
  const emojiPickerRef = useRef(null);
  const plusMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  
  const { currentUser } = useContext(AuthContext);
  const { selectedChat, setMessages } = useContext(ChatContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) {
        setShowPlusMenu(false);
      }
    };
    if (showPlusMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPlusMenu]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileType('doc');
      setShowPlusMenu(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileType('image');
      setShowPlusMenu(false);
    }
  };

  const handleSendFile = async (file, caption) => {
    if (!selectedChat || !currentUser) return;
    
    try {
      const result = await uploadFile(currentUser._id, selectedChat._id, file, fileType, caption);
      
      // Emit via socket
      socket.emit('sendMessage', result);
      
      // Update local state
      setMessages(prev => [...prev, result]);
      
      // Reset state
      setSelectedFile(null);
      setFileType(null);
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  const handleTyping = () => {
    if (!selectedChat || !currentUser) return;
    socket.emit('typing', { senderId: currentUser._id, receiverId: selectedChat._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { senderId: currentUser._id, receiverId: selectedChat._id });
    }, 2000);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (message.trim() && !disabled) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit('stopTyping', { senderId: currentUser._id, receiverId: selectedChat._id });
      onSendMessage(message); // Pass full message (CSS handles pre-wrap)
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    handleTyping();
  };

  return (
    <div className="input-bar-wrapper">
      {showEmojiPicker && (
        <div className="emoji-picker-container" ref={emojiPickerRef}>
          <EmojiPicker 
            onEmojiClick={onEmojiClick} 
            theme="dark" 
            width="100%"
            height={350}
            skinTonesDisabled
            searchPlaceHolder="Search emoji"
          />
        </div>
      )}

      <div className="input-bar-main">
        <div className="input-actions-left">
          <button className="input-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <Smile size={24} className={showEmojiPicker ? 'active' : ''} />
          </button>
          
          <div className="plus-menu-container" ref={plusMenuRef}>
            {showPlusMenu && (
              <div className="plus-dropdown">
                <div className="plus-item" onClick={() => fileInputRef.current.click()}>
                  <div className="plus-icon document"><FileText size={20} /></div>
                  <span>Document</span>
                </div>
                <div className="plus-item" onClick={() => imageInputRef.current.click()}>
                  <div className="plus-icon image"><ImageIcon size={20} /></div>
                  <span>Photos & Videos</span>
                </div>
              </div>
            )}
            <button className="input-btn" onClick={() => setShowPlusMenu(!showPlusMenu)}>
              <Plus size={24} className={showPlusMenu ? 'active rotate-45' : ''} />
            </button>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileSelect}
          />
          <input 
            type="file" 
            accept="image/*,video/*" 
            ref={imageInputRef} 
            style={{ display: 'none' }} 
            onChange={handleImageSelect}
          />
        </div>
        
        <div className="input-field-container">
          <textarea
            ref={textareaRef}
            rows="1"
            placeholder="Type a message"
            value={message}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            disabled={disabled}
            onFocus={() => setShowEmojiPicker(false)}
          />
        </div>

        <div className="input-actions-right">
          {message.trim() ? (
            <button className="send-btn" onClick={handleSubmit} disabled={disabled}>
              <Send size={24} />
            </button>
          ) : (
            <button className="input-btn">
              <Mic size={24} />
            </button>
          )}
        </div>
      </div>

      {selectedFile && (
        <FilePreviewModal 
          file={selectedFile} 
          fileType={fileType} 
          onClose={() => { setSelectedFile(null); setFileType(null); }}
          onSend={handleSendFile}
        />
      )}
    </div>
  );
};

export default InputBar;
