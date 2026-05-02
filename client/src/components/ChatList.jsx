import React, { useState, useEffect, useContext } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { socket } from '../socket/socket';
import { getUsers } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const ChatList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser } = useContext(AuthContext);
  const { selectedChat, setSelectedChat, unreadCounts, setUnreadCounts, favourites, onlineUsers } = useContext(ChatContext);

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }).toLowerCase();
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Pass currentUserId to get last messages
      const data = await getUsers(currentUser._id);
      const otherUsers = data.filter(u => u._id.toString() !== currentUser._id.toString());
      setUsers(otherUsers);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    socket.on('userJoined', (userId) => {
      fetchUsers();
    });

    socket.on('receiveMessage', () => {
      fetchUsers();
    });

    return () => {
      socket.off('userJoined');
      socket.off('receiveMessage');
    };
  }, [currentUser]);

  // Apply search and status filters
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // Status filter
    if (filter === 'Unread') {
      return unreadCounts[user._id] > 0;
    }
    if (filter === 'Favourites') {
      return favourites.includes(user._id);
    }
    return true;
  });

  const handleUserClick = (user) => {
    setSelectedChat(user);
    // Reset unread count
    setUnreadCounts(prev => ({
        ...prev,
        [user._id]: 0
    }));
  };

  return (
    <div className="chatlist-container">
      <div className="chatlist-header">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h2 style={{fontSize: '22px', fontWeight: 600}}>Chats</h2>
          <div style={{display: 'flex', gap: '16px', color: 'var(--text-secondary)'}}>
            <RefreshCw 
              size={20} 
              style={{cursor: 'pointer'}} 
              className={loading ? 'spin' : ''} 
              onClick={fetchUsers}
            />
            <Search size={20} style={{cursor: 'pointer'}} />
            <Filter size={20} style={{cursor: 'pointer'}} />
          </div>
        </div>
        <div className="chatlist-search-container">
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search or start a new chat" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="chatlist-filters">
        {['All', 'Unread', 'Favourites'].map((f) => (
          <div 
            key={f} 
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </div>
        ))}
      </div>
      
      <div className="chatlist-items">
        {loading && users.length === 0 ? (
          <div style={{padding: '20px', textAlign: 'center', color: 'var(--text-secondary)'}}>Loading...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="chatlist-empty" style={{padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)'}}>
            {filter === 'Unread' ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <div style={{fontSize: '40px', opacity: 0.2}}>📭</div>
                    <p>No unread messages</p>
                </div>
            ) : filter === 'Favourites' ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <div style={{fontSize: '40px', opacity: 0.2}}>⭐</div>
                    <p>No favourites yet</p>
                </div>
            ) : (
                <p>{searchTerm ? 'No matches found' : 'No other users found'}</p>
            )}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div 
              key={user._id} 
              className={`chatlist-item ${selectedChat?._id === user._id ? 'active' : ''}`}
              onClick={() => handleUserClick(user)}
            >
              <div className="avatar-wrapper" style={{ position: 'relative' }}>
                <div className="avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                {onlineUsers.some(id => id.toString() === user._id.toString()) && (
                  <div className="online-dot" style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#4ade80',
                    borderRadius: '50%',
                    border: '2px solid white'
                  }}></div>
                )}
              </div>
              <div className="chat-info">
                <div className="chat-header-info">
                  <div className="chat-name">{user.username}</div>
                  <div className="chat-time">
                    {user.lastMessageTime ? formatTime(user.lastMessageTime) : ''}
                  </div>
                </div>
                <div className="chat-preview-container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div className="chat-preview" style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '180px',
                    minHeight: '18px',
                    color: 'var(--text-secondary)',
                    fontSize: '13px'
                  }}>
                    {user.lastMessage || 'No messages yet'}
                  </div>
                  {unreadCounts[user._id] > 0 && (
                    <div className="unread-badge" style={{
                        backgroundColor: 'var(--accent-green)',
                        color: '#000',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 'bold'
                    }}>
                        {unreadCounts[user._id]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
