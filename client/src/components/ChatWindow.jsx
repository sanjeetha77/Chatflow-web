import React, { useContext, useEffect, useRef } from 'react';
import { ChatContext } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import { sendMessage } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { socket } from '../socket/socket';

const ChatWindow = () => {
  const { activeChat, messages, setMessages } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text) => {
    try {
      const newMessage = await sendMessage(currentUser._id, activeChat._id, text);
      
      // Emit via socket
      socket.emit('sendMessage', {
        senderId: currentUser._id,
        receiverId: activeChat._id,
        message: text
      });

      // Update local state
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Optional: Handle error UI
    }
  };

  if (!activeChat) {
    return (
      <div className="chatwindow-empty">
        <div className="empty-state-content">
          <h2>ChatFlow Web</h2>
          <p>Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chatwindow-container">
      <div className="chatwindow-header">
        <div className="avatar">
          {activeChat.username.charAt(0).toUpperCase()}
        </div>
        <div className="chat-info">
          <h3>{activeChat.username}</h3>
          <span className="status">Online</span>
        </div>
      </div>

      <div className="chatwindow-messages">
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet</div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble key={msg._id || index} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <InputBar onSendMessage={handleSendMessage} disabled={false} />
    </div>
  );
};

export default ChatWindow;
