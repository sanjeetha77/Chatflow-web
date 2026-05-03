import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { socket } from '../socket/socket';
import { getMessages } from '../services/api';

const Chat = () => {
  const { selectedChat, setMessages, setOnlineUsers, setUnreadCounts, setLoadingMessages, setTypingUsers, setLastMessages } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const [socketConnected, setSocketConnected] = useState(false);
  const selectedChatRef = useRef(selectedChat);
  const typingTimeouts = useRef({}); // { userId: timeoutId }

  // Update ref whenever selectedChat changes
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Memoized fetch function
  const fetchMessages = useCallback(async (showLoading = true) => {
    if (selectedChatRef.current && currentUser) {
      try {
        if (showLoading) setLoadingMessages(true);
        const data = await getMessages(selectedChatRef.current._id, currentUser._id);
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        if (showLoading) setLoadingMessages(false);
      }
    }
  }, [currentUser, setMessages, setLoadingMessages]);

  useEffect(() => {
    if (currentUser) {
      const onConnect = () => {
        setSocketConnected(true);
        socket.emit('join', currentUser._id);
      };

      const onReceiveMessage = async (data) => {
        const senderId = String(typeof data.senderId === 'object' ? data.senderId._id : data.senderId);
        const selectedId = selectedChatRef.current ? String(selectedChatRef.current._id) : null;
        const messageId = String(data._id || data.id);

        // EXPLICIT FIX: Only emit if we are NOT the sender
        if (messageId && senderId !== String(currentUser._id)) {
          console.log('[Chat.jsx] Emitting delivery confirmation to original sender:', senderId);
          socket.emit('messageDelivered', {
            messageId: messageId,
            senderId: senderId,
            receiverId: String(currentUser._id)
          });

          // If we are currently looking at this chat, also mark it as SEEN instantly
          if (selectedId && senderId === selectedId) {
            socket.emit('markSeen', {
              senderId: senderId,
              receiverId: String(currentUser._id)
            });
          }
        }

        // 1. Update the sidebar preview for everyone involved
        const previewId = senderId === String(currentUser._id) ? String(data.receiverId) : senderId;
        setLastMessages(prev => ({
          ...prev,
          [previewId]: {
            message: data.message,
            timestamp: data.timestamp || new Date().toISOString()
          }
        }));

        // 2. Only handle unread counts and message addition if we are the RECEIVER
        if (senderId !== String(currentUser._id)) {
          if (selectedId && senderId === selectedId) {
            const newMessage = {
              ...data,
              _id: messageId,
              status: 'seen'
            };
            setMessages(prev => {
              if (prev.some(m => String(m._id) === messageId)) return prev;
              return [...prev, newMessage];
            });
          } else {
            setUnreadCounts(prev => ({
              ...prev,
              [senderId]: (prev[senderId] || 0) + 1
            }));
          }
        }
      };

      const onMessageDelivered = ({ messageId }) => {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, status: 'delivered' } : msg
        ));
      };

      const onMessagesSeen = ({ receiverId }) => {
        // If the person we are currently chatting with has seen our messages
        if (selectedChatRef.current?._id === receiverId) {
          setMessages(prev => prev.map(msg => ({ ...msg, status: 'seen' })));
        }
      };

      // We handle typing indicators in context so all components (ChatList, etc) see it
      const onTyping = (data) => {
        const senderId = typeof data.senderId === 'object' ? data.senderId._id : data.senderId;
        setTypingUsers(prev => ({ ...prev, [senderId]: true }));
        
        // Auto-clear helper
        if (typingTimeouts.current[senderId]) clearTimeout(typingTimeouts.current[senderId]);
        typingTimeouts.current[senderId] = setTimeout(() => {
          setTypingUsers(prev => ({ ...prev, [senderId]: false }));
        }, 3000);
      };

      const onStopTyping = (data) => {
        const senderId = typeof data.senderId === 'object' ? data.senderId._id : data.senderId;
        setTypingUsers(prev => ({ ...prev, [senderId]: false }));
      };

      const onGetOnlineUsers = (users) => {
        setOnlineUsers(users);
      };

      socket.on('connect', onConnect);
      socket.on('receiveMessage', onReceiveMessage);
      socket.on('messageDelivered', onMessageDelivered);
      socket.on('messagesSeen', onMessagesSeen);
      socket.on('typing', onTyping);
      socket.on('stopTyping', onStopTyping);
      socket.on('getOnlineUsers', onGetOnlineUsers);

      // Connect logic
      if (!socket.connected) {
        socket.connect();
      } else {
        setSocketConnected(true);
        socket.emit('join', currentUser._id);
      }

      return () => {
        socket.off('connect', onConnect);
        socket.off('receiveMessage', onReceiveMessage);
        socket.off('messageDelivered', onMessageDelivered);
        socket.off('messagesSeen', onMessagesSeen);
        socket.off('typing', onTyping);
        socket.off('stopTyping', onStopTyping);
        socket.off('getOnlineUsers', onGetOnlineUsers);
      };
    }
  }, [currentUser, fetchMessages]);

  useEffect(() => {
    fetchMessages(true);
  }, [selectedChat, fetchMessages]);

  return (
    <div className="chat-layout">
      <Sidebar />
      <div className="chat-main">
        <div className={`chat-list-wrapper ${selectedChat ? 'mobile-hidden' : ''}`}>
          <ChatList />
        </div>
        <div className={`chat-window-wrapper ${!selectedChat ? 'mobile-hidden' : ''}`}>
          <ChatWindow />
        </div>
      </div>
    </div>
  );
};

export default Chat;
