import React, { useContext } from 'react';
import { MessageSquare, User, Settings, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, currentUser } = useContext(AuthContext);

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-icon active" title="Chats">
          <MessageSquare size={24} />
        </div>
        <div className="sidebar-icon" title="Profile">
          <User size={24} />
        </div>
        <div className="sidebar-icon" title="Settings">
          <Settings size={24} />
        </div>
      </div>
      
      <div className="sidebar-bottom">
        <div className="sidebar-avatar" title={currentUser?.username}>
          {currentUser?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="sidebar-icon logout" onClick={logout} title="Logout">
          <LogOut size={24} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
