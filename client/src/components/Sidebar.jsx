import React, { useContext, useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Phone, 
  CircleDot, 
  Users, 
  Settings as SettingsIcon, 
  LogOut,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Settings from './Settings';

const Sidebar = () => {
  const { logout, currentUser } = useContext(AuthContext);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-icon active" title="Chats">
            <MessageSquare size={24} />
          </div>
          <div className="sidebar-icon" title="Calls">
            <Phone size={24} />
          </div>
          <div className="sidebar-icon" title="Status">
            <CircleDot size={24} />
          </div>
          <div className="sidebar-icon" title="Communities">
            <Users size={24} />
          </div>
        </div>
        
        <div className="sidebar-bottom" style={{ position: 'relative' }}>
          <div className="sidebar-icon" title="Settings" onClick={() => setShowSettings(true)}>
            <SettingsIcon size={24} />
          </div>
          
          <div 
            className="sidebar-avatar" 
            title={currentUser?.username || 'Profile'} 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}
          >
            <UserIcon size={20} color="var(--text-secondary)" />
          </div>

          {showProfileMenu && (
            <div 
              ref={menuRef}
              className="profile-menu-dropdown" 
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '60px',
                backgroundColor: 'var(--bg-sidebar)',
                boxShadow: 'var(--shadow)',
                borderRadius: '8px',
                padding: '8px 0',
                zIndex: 1000,
                width: '180px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{currentUser?.username || 'Guest'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Online</div>
              </div>
              <div 
                className="menu-item" 
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                style={{
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#ff4b4b'
                }}
              >
                <LogOut size={18} />
                <span>Log out</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </>
  );
};

export default Sidebar;
