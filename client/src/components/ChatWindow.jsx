import React, { useContext, useEffect, useRef, useState } from 'react';
import { Search, MoreVertical, Phone, Video, Trash2, XCircle } from 'lucide-react';
import { ChatContext } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import { sendMessage, clearChatMessages } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { socket } from '../socket/socket';

const ChatWindow = () => {
  const { selectedChat, messages, setMessages, onlineUsers } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);

  const isOnline = selectedChat && onlineUsers.some(id => id.toString() === selectedChat._id.toString());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text) => {
    try {
      if (!selectedChat) return;

      console.log('Sending message via API...');
      const newMessage = await sendMessage(currentUser._id, selectedChat._id, text);
      console.log('Message saved in DB:', newMessage);
      
      console.log('Emitting sendMessage socket event...');
      socket.emit('sendMessage', {
        senderId: currentUser._id,
        receiverId: selectedChat._id,
        message: text,
        timestamp: newMessage.timestamp
      });

      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleClearChat = async () => {
    if (!selectedChat) return;
    if (window.confirm('Are you sure you want to clear this chat?')) {
      try {
        await clearChatMessages(selectedChat._id, currentUser._id);
        setMessages([]);
        setShowMenu(false);
      } catch (err) {
        console.error('Failed to clear chat:', err);
      }
    }
  };

  if (!selectedChat) {
    return (
      <div className="chatwindow-empty">
        <div className="empty-state-content">
          <div style={{fontSize: '100px', marginBottom: '20px', opacity: 0.1}}>💬</div>
          <h2>Select a chat</h2>
          <p>Choose a contact from the list to start messaging.<br/>Your messages will be stored securely.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chatwindow-container">
      <div className="chatwindow-header">
        <div className="chatwindow-header-left">
          <div className="avatar">
            {selectedChat.username.charAt(0).toUpperCase()}
          </div>
          <div className="chat-info">
            <h3>{selectedChat.username}</h3>
            <span className="status">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div className="chatwindow-header-right" style={{position: 'relative'}}>
          <Search size={20} className="icon" />
          <MoreVertical size={20} className="icon" onClick={() => setShowMenu(!showMenu)} />
          
          {showMenu && (
            <div className="chat-menu-dropdown" style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              backgroundColor: 'var(--bg-sidebar)',
              boxShadow: 'var(--shadow)',
              borderRadius: '8px',
              padding: '8px 0',
              zIndex: 100,
              width: '180px',
              marginTop: '8px'
            }}>
              <div 
                className="menu-item" 
                onClick={handleClearChat}
                style={{
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <XCircle size={18} />
                <span>Clear chat</span>
              </div>
              <div 
                className="menu-item" 
                onClick={handleClearChat}
                style={{
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <Trash2 size={18} />
                <span>Delete chat</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="chatwindow-messages">
        {messages.length === 0 ? (
          <div className="no-messages" style={{textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)'}}>
            No messages yet. Start the conversation!
          </div>
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
