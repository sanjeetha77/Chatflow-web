import React, { useContext, useEffect, useRef, useState } from 'react';
import { Search, MoreVertical, Phone, Video, Trash2, XCircle, Star, Loader2, ChevronDown, Reply, Pin, X, Forward, Info, BellOff, Clock, List, LogOut, ShieldAlert, Ban, LayoutGrid, FileText, UserPlus, Sparkles } from 'lucide-react';
import { ChatContext } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import ForwardModal from './ForwardModal';
import DeleteModal from './DeleteModal';
import { sendMessage, clearChatMessages, getUsers, deleteMessage } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { socket } from '../socket/socket';

const ChatWindow = () => {
  const { 
    selectedChat, setSelectedChat, messages, setMessages, onlineUsers, favourites, 
    toggleFavourite, loadingMessages, typingUsers, setTypingUsers, 
    setLastMessages, replyMessage, setReplyMessage, pinnedMessage, 
    setPinnedMessage, isSelectMode, setIsSelectMode, selectedMessages, 
    setSelectedMessages, showContactInfo, setShowContactInfo
  } = useContext(ChatContext);
  
  const { currentUser } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [toast, setToast] = useState(null); // { message, type }
  const [showSearch, setShowSearch] = useState(false);
  const [messageSearchTerm, setMessageSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const isOnline = selectedChat && onlineUsers.some(id => id.toString() === selectedChat._id.toString());
  const isTyping = selectedChat && typingUsers[selectedChat._id];

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch all users for forward modal
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setAllUsers(data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, []);

  // Socket listeners are now handled in the parent Chat.jsx component to avoid duplication and conflicts.
  
  // Handle scroll events to show/hide scroll button
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop <= clientHeight + 300;
      setShowScrollButton(!isNearBottom);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat) {
      scrollToBottom('auto');
    }
  }, [selectedChat]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setDroppedFile(files[0]);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 150;
      const lastMessage = messages[messages.length - 1];
      const sentByMe = lastMessage && String(lastMessage.senderId) === String(currentUser?._id);

      if (isAtBottom || sentByMe) {
        scrollToBottom('smooth');
      }
    }
  }, [messages, loadingMessages, currentUser]);

  const handleSendMessage = async (text) => {
    try {
      if (!selectedChat) return;

      const tempId = Date.now().toString();
      const tempMessage = {
        _id: tempId,
        senderId: currentUser._id,
        receiverId: selectedChat._id,
        message: text,
        timestamp: new Date().toISOString(),
        sending: true,
        replyTo: replyMessage
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setReplyMessage(null); // Clear reply immediately
      
      const newMessage = await sendMessage(currentUser._id, selectedChat._id, text, tempMessage.replyTo?._id);
      
      setMessages(prev => prev.map(m => 
        m._id === tempId ? { ...newMessage, status: 'sent' } : m
      ));

      socket.emit('sendMessage', {
        ...newMessage,
        status: 'sent'
      });

      // Update last messages instantly for sender's chat list
      setLastMessages(prev => ({
        ...prev,
        [selectedChat._id]: {
          message: newMessage.message,
          timestamp: newMessage.timestamp
        }
      }));
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleForwardClick = (message) => {
    setMessageToForward(message);
    setShowForwardModal(true);
  };

  const showToast = (count) => {
    setToast(`Forwarded ${count} item${count > 1 ? 's' : ''}`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleBatchDelete = async () => {
      try {
          await Promise.all(selectedMessages.map(id => deleteMessage(id)));
          setMessages(prev => prev.filter(m => !selectedMessages.includes(m._id)));
          setIsSelectMode(false);
          setSelectedMessages([]);
          setShowDeleteModal(false);
      } catch (err) {
          console.error('Batch delete failed:', err);
      }
  };

  const formatSeparatorDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'TODAY';
    if (date.toDateString() === yesterday.toDateString()) return 'YESTERDAY';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatSearchResultDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
    }
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (!selectedChat) {
    return (
      <div className="chatwindow-empty">
        <div className="empty-state-content">
          <div className="empty-state-message-main">
            <h2>Select a contact to start chatting 💬</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chatwindow-container" style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
      <div 
        className="chat-window-main" 
        style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="drag-drop-overlay" onDragLeave={handleDragLeave}>
            <div className="overlay-content">
              <div className="overlay-icon">
                <FileText size={48} />
              </div>
              <p>Drop files here to upload</p>
            </div>
          </div>
        )}

        <div className="chatwindow-header">
          <div className="chatwindow-header-left">
            <div className="avatar-wrapper" style={{ position: 'relative' }}>
              <div className="avatar">{selectedChat.username.charAt(0).toUpperCase()}</div>
              {isOnline && <div className="online-dot" style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', backgroundColor: '#4ade80', borderRadius: '50%', border: '2px solid white' }}></div>}
            </div>
            <div className="chat-info">
              <h3>{selectedChat.username}</h3>
              <span className={`status ${isTyping ? 'typing' : ''}`} style={{ color: isTyping ? 'var(--accent-green)' : 'inherit' }}>
                {isTyping ? 'typing...' : (isOnline ? 'Online' : 'Offline')}
              </span>
            </div>
          </div>
          <div className="chatwindow-header-right" style={{position: 'relative'}}>
            <Search size={20} className={`icon ${showSearch ? 'active' : ''}`} onClick={() => setShowSearch(!showSearch)} />
            <MoreVertical size={20} className="icon" onClick={() => setShowMenu(!showMenu)} />
            
            {showMenu && (
              <div className="chat-menu-dropdown">
                <div className="menu-item" onClick={() => { setShowContactInfo(true); setShowMenu(false); }}>
                  <Info size={18} /><span>Contact info</span>
                </div>
                <div className="menu-item" onClick={() => { setShowSearch(true); setShowMenu(false); }}>
                  <Search size={18} /><span>Search</span>
                </div>
                <div className="menu-item" onClick={() => { setIsSelectMode(true); setShowMenu(false); }}>
                   <LayoutGrid size={18} /><span>Select messages</span>
                </div>
                <div className="menu-item" onClick={() => { toggleFavourite(selectedChat._id); setShowMenu(false); }}>
                  {favourites.includes(selectedChat._id) ? (
                    <><XCircle size={18} color="#ff4b4b" /><span style={{color: '#ff4b4b'}}>Remove from favourites</span></>
                  ) : (
                    <><Star size={18} /><span>Add to favourites</span></>
                  )}
                </div>
                <div className="menu-item" onClick={() => { setSelectedChat(null); setShowMenu(false); }}>
                  <LogOut size={18} /><span>Close chat</span>
                </div>
                
                <div className="menu-separator"></div>
                
                <div className="menu-item" onClick={() => { setShowClearChatModal(true); setShowMenu(false); }}>
                  <Trash2 size={18} /><span>Clear chat</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pinned Message Bar */}
        {pinnedMessage && (
          <div className="pinned-message-bar" onClick={() => {
              const element = document.getElementById(`msg-${pinnedMessage._id}`);
              if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}>
            <div className="pinned-info">
              <Pin size={16} color="var(--accent-green)" />
              <div className="text">
                  <span style={{ fontWeight: '600' }}>Pinned Message:</span> {pinnedMessage.message}
              </div>
            </div>
            <X size={16} className="icon" onClick={(e) => {
                e.stopPropagation();
                setPinnedMessage(null);
            }} />
          </div>
        )}

        <div className="chatwindow-messages" ref={scrollRef}>
          {loadingMessages ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Loader2 size={32} className="spin" color="var(--accent-green)" />
            </div>
          ) : messages.length === 0 ? (
            <div className="no-messages-container" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              opacity: 0.6,
              textAlign: 'center',
              padding: '20px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
              <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
                Start conversation with {selectedChat.username}
              </h3>
              <p style={{ fontSize: '14px' }}>Say hello to start the chat!</p>
            </div>
          ) : (
            messages.reduce((acc, msg, index) => {
              const dateStr = formatSeparatorDate(msg.timestamp);
              const prevMsg = messages[index - 1];
              const prevDateStr = prevMsg ? formatSeparatorDate(prevMsg.timestamp) : null;
              if (dateStr !== prevDateStr) acc.push(<div key={`sep-${index}`} className="date-separator animate-fade-in"><span>{dateStr}</span></div>);
              acc.push(
                <MessageBubble 
                  key={msg._id || index} 
                  message={msg} 
                  onForwardClick={handleForwardClick} 
                  isHighlighted={msg._id === highlightedMessageId}
                />
              );
              return acc;
            }, [])
          )}
          <div ref={messagesEndRef} />
        </div>

        {showScrollButton && (
          <div className="scroll-bottom-btn" onClick={() => scrollToBottom('smooth')}><ChevronDown size={20} /></div>
        )}

        {/* Reply Preview */}
        {replyMessage && (
          <div className="reply-preview">
              <div className="reply-content">
                  <div className="reply-user">{typeof replyMessage.senderId === 'object' ? replyMessage.senderId.username : 'User'}</div>
                  <div className="reply-msg">{replyMessage.message}</div>
              </div>
              <X size={18} className="close-btn" onClick={() => setReplyMessage(null)} />
          </div>
        )}

        {/* Bottom Bar: Selection Actions or Input Bar */}
        {isSelectMode ? (
          <div className="select-mode-bottom-bar">
            <div className="select-info">
              <X className="icon" onClick={() => {
                  setIsSelectMode(false);
                  setSelectedMessages([]);
              }} />
              <span>{selectedMessages.length} selected</span>
            </div>
            <div className="select-actions">
              <Trash2 className="icon" onClick={() => setShowDeleteModal(true)} />
            </div>
          </div>
        ) : (
          <InputBar 
            onSendMessage={handleSendMessage} 
            disabled={!selectedChat} 
            droppedFile={droppedFile}
            onClearDroppedFile={() => setDroppedFile(null)}
          />
        )}

        {/* Modals */}
        {showForwardModal && (
          <ForwardModal 
            messageContent={messageToForward?.message} 
            users={allUsers} 
            onClose={() => setShowForwardModal(false)}
            onForwarded={(count) => showToast(count)}
          />
        )}

        <DeleteModal 
          isOpen={showDeleteModal}
          title={`Delete ${selectedMessages.length} message${selectedMessages.length > 1 ? 's' : ''}?`}
          deleteText="Delete"
          onCancel={() => setShowDeleteModal(false)}
          onDeleteForMe={handleBatchDelete}
        />

        <DeleteModal 
          isOpen={showClearChatModal}
          title="Clear this chat?"
          deleteText="Delete"
          onCancel={() => setShowClearChatModal(false)}
          onDeleteForMe={async () => {
              await clearChatMessages(selectedChat._id, currentUser._id);
              setMessages([]);
              setToast('Chat cleared');
              setShowClearChatModal(false);
          }}
          onDeleteForEveryone={async () => {
              await clearChatMessages(selectedChat._id, currentUser._id);
              setMessages([]);
              setToast('Chat cleared for everyone');
              setShowClearChatModal(false);
          }}
        />

        <DeleteModal 
          isOpen={showDeleteChatModal}
          title="Delete this chat?"
          deleteText="Delete"
          onCancel={() => setShowDeleteChatModal(false)}
          onDeleteForMe={() => {
              setSelectedChat(null);
              setToast('Chat deleted');
              setShowDeleteChatModal(false);
          }}
          onDeleteForEveryone={() => {
              setSelectedChat(null);
              setToast('Chat deleted for everyone');
              setShowDeleteChatModal(false);
          }}
        />
      </div>

      {/* Message Search Side Panel */}
      {showSearch && (
        <div className="message-search-panel">
          <div className="search-panel-header">
            <X size={20} className="icon" onClick={() => {
              setShowSearch(false);
              setMessageSearchTerm('');
            }} />
            <span>Search messages</span>
          </div>
          
          <div className="search-panel-input">
            <div className="input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={messageSearchTerm}
                onChange={(e) => setMessageSearchTerm(e.target.value)}
                autoFocus
              />
              {messageSearchTerm && <X size={16} className="clear-icon" onClick={() => setMessageSearchTerm('')} />}
            </div>
          </div>

          <div className="search-results-list">
            {messageSearchTerm === '' ? (
              <div className="search-placeholder">
                Search for messages with {selectedChat.username}
              </div>
            ) : messages.filter(m => m.message.toLowerCase().includes(messageSearchTerm.toLowerCase())).length === 0 ? (
              <div className="no-results">No messages found</div>
            ) : (
              messages
                .filter(m => m.message.toLowerCase().includes(messageSearchTerm.toLowerCase()))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map(msg => (
                  <div 
                    key={msg._id} 
                    className="search-result-item"
                    onClick={() => {
                      const element = document.getElementById(`msg-${msg._id}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setHighlightedMessageId(msg._id);
                        setTimeout(() => setHighlightedMessageId(null), 3000);
                      }
                    }}
                  >
                    <div className="result-date">{formatSearchResultDate(msg.timestamp)}</div>
                    <div className="result-text">{msg.message}</div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {toast && (
        <div className="toast-notification">
          {toast}
        </div>
      )}

      {/* High-Fidelity Deletion Modals */}
      <DeleteModal 
        isOpen={showDeleteModal}
        title={`Delete ${selectedMessages.length} messages?`}
        onCancel={() => { setShowDeleteModal(false); setIsSelectMode(false); setSelectedMessages([]); }}
        onDeleteForMe={() => handleBatchDelete(false)}
        onDeleteForEveryone={() => handleBatchDelete(true)}
      />

      <DeleteModal 
        isOpen={showClearChatModal}
        title="Clear this chat?"
        onCancel={() => setShowClearChatModal(false)}
        onDeleteForMe={async () => {
            await clearChatMessages(selectedChat._id, currentUser._id);
            setMessages([]);
            setToast('Chat cleared');
            setShowClearChatModal(false);
        }}
        onDeleteForEveryone={async () => {
            await clearChatMessages(selectedChat._id, currentUser._id); // In real app, this would be global
            setMessages([]);
            setToast('Chat cleared for everyone');
            setShowClearChatModal(false);
        }}
      />

      <DeleteModal 
        isOpen={showDeleteChatModal}
        title="Delete this chat?"
        onCancel={() => setShowDeleteChatModal(false)}
        onDeleteForMe={() => {
            setSelectedChat(null);
            setToast('Chat deleted');
            setShowDeleteChatModal(false);
        }}
        onDeleteForEveryone={() => {
            setSelectedChat(null);
            setToast('Chat deleted for everyone');
            setShowDeleteChatModal(false);
        }}
      />
    </div>
  );
};

export default ChatWindow;
