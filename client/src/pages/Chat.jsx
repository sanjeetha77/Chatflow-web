import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { socket } from '../socket/socket';
import { getMessages } from '../services/api';

const Chat = () => {
  const { selectedChat, setMessages, setOnlineUsers, setUnreadCounts, setLoadingMessages } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const [socketConnected, setSocketConnected] = useState(false);
  const selectedChatRef = useRef(selectedChat);

  // Update ref whenever selectedChat changes
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Memoized fetch function to avoid recreate on every render
  const fetchMessages = useCallback(async (showLoading = true) => {
    if (selectedChatRef.current && currentUser) {
      try {
        if (showLoading) setLoadingMessages(true);
        console.log('Fetching fresh messages from API for sync...');
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
      console.log('Initializing socket connection for:', currentUser.username);
      socket.connect();
      
      socket.on('connect', () => {
        console.log('Socket connected successfully! ID:', socket.id);
        setSocketConnected(true);
        socket.emit('join', currentUser._id);
      });
      
      socket.on('receiveMessage', async (data) => {
        console.log('--- Socket Message Received ---');
        const senderId = typeof data.senderId === 'object' ? data.senderId._id : data.senderId;
        const selectedId = selectedChatRef.current?._id;

        // If message is for active chat, trigger API reload (background refresh)
        if (selectedId && senderId === selectedId) {
          console.log('Message for active chat received. Reloading via API...');
          await fetchMessages(false); // Don't show loading for background sync
        } else {
          console.log('Background message. Incrementing unread count.');
          setUnreadCounts(prev => ({
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1
          }));
        }
      });

      socket.on('getOnlineUsers', (users) => {
        console.log('Online users list updated:', users);
        setOnlineUsers(users);
      });

      return () => {
        socket.off('receiveMessage');
        socket.off('getOnlineUsers');
        socket.off('connect');
        socket.disconnect();
      };
    }
  }, [currentUser, setMessages, setOnlineUsers, setUnreadCounts, fetchMessages]);

  // Fetch when chat selection changes
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
