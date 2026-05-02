import React, { useState, useRef, useEffect } from 'react';
import { Plus, Smile, Mic, Send } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const InputBar = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

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

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
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
          onChange={(e) => setMessage(e.target.value)}
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
