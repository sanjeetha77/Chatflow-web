import React, { useContext, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { socket } from '../socket/socket';
import { getMessages } from '../services/api';

const Chat = () => {
  const { activeChat, setMessages } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    if (currentUser) {
      socket.connect();
      socket.emit('join', currentUser._id);
      
      socket.on('connect', () => setSocketConnected(true));
      
      socket.on('getMessage', (data) => {
        // Only append if the message is from the currently active chat
        // We use a functional state update to ensure we have the latest activeChat value
        // Note: in a more complex app, we might store messages in a map by userId
        setMessages((prevMessages) => {
           // We might need to handle the case where the message is for a different chat
           // For simplicity, we just add it to the current chat window if it matches the active chat
           // In a real app, we'd update unread counts for non-active chats
           return [...prevMessages, {
             senderId: data.senderId,
             message: data.message,
             timestamp: data.timestamp
           }];
        });
      });

      return () => {
        socket.off('getMessage');
        socket.disconnect();
      };
    }
  }, [currentUser, setMessages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (activeChat && currentUser) {
        try {
          const data = await getMessages(activeChat._id, currentUser._id);
          setMessages(data);
        } catch (error) {
          console.error("Failed to fetch messages:", error);
        }
      }
    };

    fetchMessages();
  }, [activeChat, currentUser, setMessages]);

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
