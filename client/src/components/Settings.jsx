import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Monitor } from 'lucide-react';

const Settings = ({ onClose }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="settings-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="settings-card" style={{
        backgroundColor: 'var(--bg-main)',
        width: '400px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)'
      }}>
        <div className="settings-header" style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-sidebar)'
        }}>
          <h2 style={{fontSize: '18px', fontWeight: 500}}>Settings</h2>
          <X size={20} style={{cursor: 'pointer'}} onClick={onClose} />
        </div>
        
        <div className="settings-content" style={{padding: '20px'}}>
          <div className="settings-section" style={{marginBottom: '24px'}}>
            <h3 style={{fontSize: '14px', color: 'var(--accent-green)', marginBottom: '12px', fontWeight: 500}}>Theme</h3>
            <div className="theme-options" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <div 
                className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: theme === 'light' ? 'var(--bg-active)' : 'transparent'
                }}
              >
                <Sun size={20} color="var(--text-secondary)" />
                <span>Light</span>
              </div>
              <div 
                className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: theme === 'dark' ? 'var(--bg-active)' : 'transparent'
                }}
              >
                <Moon size={20} color="var(--text-secondary)" />
                <span>Dark</span>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3 style={{fontSize: '14px', color: 'var(--accent-green)', marginBottom: '12px', fontWeight: 500}}>Profile</h3>
            <p style={{fontSize: '14px', color: 'var(--text-secondary)'}}>Manage your personal info and visibility.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
