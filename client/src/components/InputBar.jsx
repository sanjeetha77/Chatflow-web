import React, { useState } from 'react';
import { Plus, Smile, Mic, Send } from 'lucide-react';

const InputBar = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="input-bar-container">
      <Smile size={24} className="icon" />
      <Plus size={24} className="icon" />
      
      <form className="input-bar-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
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
          style={{color: 'var(--accent-green)'}} 
          onClick={handleSubmit} 
        />
      ) : (
        <Mic size={24} className="icon" />
      )}
    </div>
  );
};

export default InputBar;
