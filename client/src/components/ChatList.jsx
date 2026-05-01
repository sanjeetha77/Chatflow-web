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
  const { selectedChat, setSelectedChat, unreadCounts, setUnreadCounts } = useContext(ChatContext);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
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
      console.log('User joined event received:', userId);
      fetchUsers();
    });

    // Automatically refresh users list when a message arrives
    // This ensures any newly created users or status changes are reflected
    socket.on('receiveMessage', () => {
      console.log('Message received. Auto-refreshing user list...');
      fetchUsers();
    });

    return () => {
      socket.off('userJoined');
      socket.off('receiveMessage');
    };
  }, [currentUser]);

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserClick = (user) => {
    console.log('User selected:', user._id);
    setSelectedChat(user);
    
    // Reset unread count for this user
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
          <div className="chatlist-empty" style={{padding: '20px', textAlign: 'center', color: 'var(--text-secondary)'}}>
            {searchTerm ? 'No matches found' : 'No other users found'}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div 
              key={user._id} 
              className={`chatlist-item ${selectedChat?._id === user._id ? 'active' : ''}`}
              onClick={() => handleUserClick(user)}
            >
              <div className="avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="chat-info">
                <div className="chat-header-info">
                  <div className="chat-name">{user.username}</div>
                  <div className="chat-time">10:47 am</div>
                </div>
                <div className="chat-preview-container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div className="chat-preview" style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '180px'
                  }}>
                    Check out the latest design!
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
