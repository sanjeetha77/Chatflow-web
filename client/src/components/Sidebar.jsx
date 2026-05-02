import React, { useContext, useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Phone, 
  CircleDot, 
  Users, 
  Settings as SettingsIcon, 
  LogOut,
  User as UserIcon,
  ChevronRight,
  Bell,
  Lock
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
      <div className="sidebar" style={{
        width: '60px',
        backgroundColor: 'var(--bg-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 0',
        borderRight: '1px solid var(--border-color)',
        zIndex: 100
      }}>
        <div className="sidebar-top" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div className="sidebar-icon active" title="Chats" style={{ color: 'var(--accent-green)', cursor: 'pointer' }}>
            <MessageSquare size={24} />
          </div>
          <div className="sidebar-icon" title="Calls" style={{ color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.6 }}>
            <Phone size={24} />
          </div>
          <div className="sidebar-icon" title="Status" style={{ color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.6 }}>
            <CircleDot size={24} />
          </div>
          <div className="sidebar-icon" title="Communities" style={{ color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.6 }}>
            <Users size={24} />
          </div>
        </div>
        
        <div className="sidebar-bottom" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div 
            className="sidebar-icon" 
            title="Settings" 
            onClick={() => setShowSettings(true)}
            style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }}
          >
            <SettingsIcon size={24} />
          </div>
          
          <div 
            className="sidebar-avatar" 
            title={currentUser?.username || 'Profile'} 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ 
              cursor: 'pointer', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              backgroundColor: showProfileMenu ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: '1px solid var(--border-color)',
              transition: 'background-color 0.2s'
            }}
          >
            <UserIcon size={20} color={showProfileMenu ? 'var(--accent-green)' : 'var(--text-secondary)'} />
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
                animation: 'slideIn 0.2s ease-out'
              }}
            >
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{currentUser?.username || 'Guest'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-green)' }}></div>
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
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </>
  );
};

export default Sidebar;
