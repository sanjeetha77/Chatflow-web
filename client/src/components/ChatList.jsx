import React, { useState, useEffect, useContext } from 'react';
import { getUsers } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const ChatList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser } = useContext(AuthContext);
  const { activeChat, setActiveChat } = useContext(ChatContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        // Filter out the current user
        setUsers(data.filter(u => u._id !== currentUser._id));
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  if (loading) return <div className="chatlist-loading">Loading chats...</div>;
  if (error) return <div className="chatlist-error">{error}</div>;

  return (
    <div className="chatlist-container">
      <div className="chatlist-header">
        <h2>Chats</h2>
      </div>
      
      <div className="chatlist-items">
        {users.length === 0 ? (
          <div className="chatlist-empty">No other users found</div>
        ) : (
          users.map((user) => (
            <div 
              key={user._id} 
              className={`chatlist-item ${activeChat?._id === user._id ? 'active' : ''}`}
              onClick={() => setActiveChat(user)}
            >
              <div className="avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="chat-info">
                <div className="chat-name">{user.username}</div>
                {/* Last message logic can be added later if needed, keeping it simple for now */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
