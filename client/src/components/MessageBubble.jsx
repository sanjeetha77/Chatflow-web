import React, { useContext } from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const MessageBubble = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  
  const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
  const isSent = senderId === currentUser._id;
  const isSending = message.sending;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    }).toLowerCase();
  };

  return (
    <div className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
      <div className="message-bubble" style={{ opacity: isSending ? 0.7 : 1 }}>
        <div className="message-text">{message.message}</div>
        <div className="message-time">
          {formatTime(message.timestamp)}
          {isSent && (
            isSending ? (
              <Check size={14} color="var(--text-secondary)" style={{marginLeft: '4px'}} />
            ) : (
              <CheckCheck size={14} color="#53bdeb" style={{marginLeft: '4px'}} />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
