import React, { useContext } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const MessageBubble = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  
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
        <div className="message-time">
          {formatTime(message.timestamp)}
          {isSent && <CheckCheck size={14} color="#53bdeb" style={{marginLeft: '4px'}} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
