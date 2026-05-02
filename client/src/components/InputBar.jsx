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
  
  const { currentUser } = useContext(AuthContext);
  const { selectedChat } = useContext(ChatContext);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTyping = () => {
    if (!selectedChat || !currentUser) return;

    console.log(`[Client] Emitting typing: ${currentUser._id} -> ${selectedChat._id}`);
    // Emit typing event
    socket.emit('typing', {
      senderId: currentUser._id,
      receiverId: selectedChat._id
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', {
        senderId: currentUser._id,
        receiverId: selectedChat._id
      });
    }, 2000);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (message.trim() && !disabled) {
      // Clear typing indicator immediately on send
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit('stopTyping', {
        senderId: currentUser._id,
        receiverId: selectedChat._id
      });

      onSendMessage(message.trim());
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    handleTyping();
  };

  return (
    <div className="input-bar-container" style={{ position: 'relative' }}>
      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef} 
          style={{ 
            position: 'absolute', 
            bottom: '100%', 
            left: '10px', 
            zIndex: 1000,
            marginBottom: '10px',
            boxShadow: 'var(--shadow)'
          }}
        >
          <EmojiPicker 
            onEmojiClick={onEmojiClick} 
            theme="dark" 
            autoFocusSearch={false}
            width={350}
            height={400}
            skinTonesDisabled
            searchPlaceHolder="Search emoji"
          />
        </div>
      )}

      <Smile 
        size={24} 
        className={`icon ${showEmojiPicker ? 'active' : ''}`} 
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        style={{ cursor: 'pointer', color: showEmojiPicker ? 'var(--accent-green)' : 'inherit' }}
      />
      <Plus size={24} className="icon" style={{ cursor: 'pointer' }} />
      
      <form className="input-bar-form" onSubmit={handleSubmit} style={{ flex: 1 }}>
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          disabled={disabled}
          onFocus={() => setShowEmojiPicker(false)}
        />
        <button 
          type="submit" 
          style={{display: 'none'}}
          disabled={disabled || !message.trim()}
        />
      </form>

      {message.trim() ? (
        <Send 
          size={24} 
          className="icon" 
          style={{color: 'var(--accent-green)', cursor: 'pointer'}} 
          onClick={handleSubmit} 
        />
      ) : (
        <Mic size={24} className="icon" style={{ cursor: 'pointer' }} />
      )}
    </div>
  );
};

export default InputBar;
