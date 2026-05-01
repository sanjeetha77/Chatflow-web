import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const MessageBubble = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  
  // Check if senderId is an object (populated) or just an ID string
  const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
  const isSent = senderId === currentUser._id;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
      <div className="message-bubble">
        <div className="message-text">{message.message}</div>
        <div className="message-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
