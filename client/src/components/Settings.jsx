import React, { useState } from 'react';
import { X, Moon, Sun, Bell, User, Lock, Info } from 'lucide-react';

const Settings = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState('dark');

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'privacy', icon: Lock, label: 'Privacy' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'theme', icon: theme === 'dark' ? Moon : Sun, label: 'Theme' },
    { id: 'about', icon: Info, label: 'About' },
  ];

  return (
    <div className="settings-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="settings-modal" style={{
        backgroundColor: 'var(--bg-main)',
        width: '800px',
        height: '600px',
        borderRadius: '16px',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border-color)'
      }}>
        {/* Sidebar */}
        <div className="settings-sidebar" style={{
          width: '240px',
          backgroundColor: 'var(--bg-sidebar)',
          padding: '24px 0',
          borderRight: '1px solid var(--border-color)'
        }}>
          <h2 style={{ padding: '0 24px', marginBottom: '24px', fontSize: '20px', fontWeight: 700 }}>Settings</h2>
          {tabs.map((tab) => (
            <div 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                backgroundColor: activeTab === tab.id ? 'rgba(0, 168, 132, 0.1)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent-green)' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              <tab.icon size={20} />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{tab.label}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="settings-header" style={{ 
            padding: '24px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{tabs.find(t => t.id === activeTab).label}</h3>
            <X size={24} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={onClose} />
          </div>

          <div className="settings-body" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--bg-sidebar)', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    border: '1px solid var(--border-color)'
                  }}>
                    <User size={40} color="var(--text-secondary)" />
                  </div>
                  <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>Change Photo</button>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>Your Name</label>
                  <input type="text" defaultValue="User" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>About</label>
                  <input type="text" defaultValue="Hey there! I am using ChatFlow." style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Choose your preferred theme.</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div 
                    onClick={() => setTheme('dark')}
                    style={{ 
                      flex: 1, 
                      padding: '20px', 
                      borderRadius: '12px', 
                      backgroundColor: 'var(--bg-sidebar)', 
                      border: theme === 'dark' ? '2px solid var(--accent-green)' : '2px solid transparent',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <Moon size={32} style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px' }}>Dark</div>
                  </div>
                  <div 
                    onClick={() => setTheme('light')}
                    style={{ 
                      flex: 1, 
                      padding: '20px', 
                      borderRadius: '12px', 
                      backgroundColor: '#f0f2f5', 
                      color: '#000',
                      border: theme === 'light' ? '2px solid var(--accent-green)' : '2px solid transparent',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <Sun size={32} style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px' }}>Light</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Message Notifications</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Show notifications for new messages</div>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Sound</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Play sounds for incoming messages</div>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
            )}
            
            {/* Other tabs follow same pattern */}
            {(activeTab === 'privacy' || activeTab === 'about') && (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
                <Info size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                <p>More settings coming soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
