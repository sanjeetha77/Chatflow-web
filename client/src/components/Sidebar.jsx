import React, { useContext, useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Users, 
  Bell, 
  Settings as SettingsIcon, 
  LogOut,
  User as UserIcon,
  Moon,
  Sun
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Settings from './Settings';

const Sidebar = () => {
  const { logout, currentUser } = useContext(AuthContext);
  const { unreadCounts } = useContext(ChatContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const hasUnread = Object.values(unreadCounts).some(count => count > 0);

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
            <MessageSquare size={22} />
          </div>
          <div className="sidebar-icon" title="Contacts">
            <Users size={22} />
          </div>
          <div 
            className={`sidebar-icon ${hasUnread ? 'has-notification' : ''}`} 
            title="Notifications"
          >
            <Bell size={22} />
          </div>
        </div>
        
        <div className="sidebar-bottom">
          <div 
            className="sidebar-icon" 
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </div>

          <div 
            className="sidebar-icon" 
            title="Settings" 
            onClick={() => setShowSettings(true)}
          >
            <SettingsIcon size={22} />
          </div>
          
          <div style={{ position: 'relative' }}>
            <div 
              className={`sidebar-avatar ${showProfileMenu ? 'active' : ''}`} 
              title={currentUser?.username || 'Profile'} 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <UserIcon size={20} />
            </div>

            {showProfileMenu && (
              <div 
                ref={menuRef}
                className="profile-menu-dropdown animate-fade-in" 
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '50px',
                  backgroundColor: 'var(--bg-sidebar)',
                  boxShadow: 'var(--shadow)',
                  borderRadius: '12px',
                  padding: '8px 0',
                  zIndex: 1000,
                  width: '220px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>{currentUser?.username || 'Guest'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="online-pulse"></div>
                        Online
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className="menu-item" 
                  onClick={() => {
                    setShowSettings(true);
                    setShowProfileMenu(false);
                  }}
                  style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px' }}
                >
                  <SettingsIcon size={18} />
                  <span>Settings</span>
                </div>

                <div 
                  className="menu-item" 
                  onClick={() => {
                      logout();
                      navigate('/login');
                  }}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#ff4b4b',
                    marginTop: '8px',
                    borderTop: '1px solid var(--border-color)'
                  }}
                >
                  <LogOut size={18} />
                  <span>Log out</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </>
  );
};

export default Sidebar;
