import React, { useState, useRef, useEffect, useContext } from 'react';
import { Plus, Smile, Mic, Send } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { socket } from '../socket/socket';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const InputBar = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  
  const { currentUser } = useContext(AuthContext);
  const { selectedChat } = useContext(ChatContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

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
          <button className="input-btn">
            <Plus size={24} />
          </button>
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
    </div>
  );
};

export default InputBar;
