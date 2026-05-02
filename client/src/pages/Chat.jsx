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
        console.log('[Socket] Connected and joined as:', currentUser.username);
      };

      const onReceiveMessage = async (data) => {
        const senderId = typeof data.senderId === 'object' ? data.senderId._id : data.senderId;
        const selectedId = selectedChatRef.current?._id;

        setLastMessages(prev => ({
          ...prev,
          [senderId]: {
            message: data.message,
            timestamp: data.timestamp || new Date().toISOString()
          }
        }));

        if (selectedId && senderId === selectedId) {
          fetchMessages(false);
        } else {
          setUnreadCounts(prev => ({
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1
          }));
        }
      };

      // We handle typing indicators in ChatList.jsx and ChatWindow.jsx directly for reliability
      const onTyping = (data) => {
        const senderId = typeof data.senderId === 'object' ? data.senderId._id : data.senderId;
        setTypingUsers(prev => ({ ...prev, [senderId]: true }));
        
        // Auto-clear helper
        setTimeout(() => {
          setTypingUsers(prev => ({ ...prev, [senderId]: false }));
        }, 3000);
      };

      const onStopTyping = (data) => {
        const senderId = typeof data.senderId === 'object' ? data.senderId._id : data.senderId;
        setTypingUsers(prev => ({ ...prev, [senderId]: false }));
      };

      const onGetOnlineUsers = (users) => {
        console.log('[Socket] Online users updated:', users);
        setOnlineUsers(users);
      };

      socket.on('connect', onConnect);
      socket.on('receiveMessage', onReceiveMessage);
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
        <ChatList />
        <ChatWindow />
      </div>
    </div>
  );
};

export default Chat;
