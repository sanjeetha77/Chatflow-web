import React, { useState } from 'react';
import { Send } from 'lucide-react';

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
    <form className="input-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
      />
      <button 
        type="submit" 
        className="send-button" 
        disabled={disabled || !message.trim()}
      >
        <Send size={20} />
      </button>
    </form>
  );
};

export default InputBar;
