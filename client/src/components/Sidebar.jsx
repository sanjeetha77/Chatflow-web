import React, { useContext, useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Users, 
  Bell, 
  Settings as SettingsIcon, 
  LogOut,
  User as UserIcon,
  Moon,
  Sun,
  SquarePen,
  Monitor
} from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import ProfilePanel from './ProfilePanel';
import StatusPanel from './StatusPanel';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Settings from './Settings';
import NewChatModal from './NewChatModal';

const Sidebar = () => {
  const { logout, currentUser } = useContext(AuthContext);
  const { unreadCounts, activeTab, setActiveTab } = useContext(ChatContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const { setSelectedChat } = useContext(ChatContext);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const totalUnread = Object.values(unreadCounts).reduce((acc, count) => acc + count, 0);
  const hasUnread = totalUnread > 0;

  const handleThemeCycle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-top">
          <div 
            className={`sidebar-icon ${activeTab === 'chats' ? 'active' : ''}`} 
            title="Chats"
            onClick={() => setActiveTab('chats')}
          >
            <MessageSquare size={22} />
            {totalUnread > 0 && <span className="sidebar-badge">{totalUnread}</span>}
          </div>
          <div 
            className="sidebar-icon" 
            title="New Chat"
            onClick={() => setShowNewChat(true)}
          >
            <SquarePen size={22} />
          </div>
          <div 
            className={`sidebar-icon ${activeTab === 'status' ? 'active' : ''}`} 
            title="Status"
            onClick={() => setActiveTab('status')}
          >
            <div className="status-icon-custom">
               <div className="ring-segment" />
               <div className="ring-segment" />
               <div className="ring-segment" />
            </div>
          </div>
          <div className="sidebar-icon" title="Contacts">
            <Users size={22} />
          </div>
          <div 
            className={`sidebar-icon ${hasUnread ? 'has-notification' : ''}`} 
            title="Notifications"
            onClick={() => setShowNotifications(true)}
          >
            <Bell size={22} />
            {totalUnread > 0 && <span className="sidebar-badge">{totalUnread}</span>}
          </div>
        </div>
        
        <div className="sidebar-bottom">
          <div 
            className="sidebar-icon theme-switcher" 
            title={`Current: ${theme.charAt(0).toUpperCase() + theme.slice(1)} (Click to switch)`}
            onClick={handleThemeCycle}
          >
            {theme === 'dark' && <Moon size={22} />}
            {theme === 'light' && <Sun size={22} />}
            {theme === 'system' && <Monitor size={22} />}
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
              className={`sidebar-avatar ${showProfilePanel ? 'active' : ''}`} 
              title={currentUser?.username || 'Profile'} 
              onClick={() => setShowProfilePanel(true)}
            >
              {currentUser?.profilePic ? (
                <img src={currentUser.profilePic} alt="Me" className="avatar-img-small" />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
          </div>
        </div>
      </div>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showNewChat && (
        <NewChatModal 
          onClose={() => setShowNewChat(false)} 
          onSelectUser={(user) => {
            setSelectedChat(user);
            setActiveTab('chats');
          }} 
        />
      )}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
      {showProfilePanel && (
        <ProfilePanel onClose={() => setShowProfilePanel(false)} />
      )}
    </>
  );
};

export default Sidebar;
