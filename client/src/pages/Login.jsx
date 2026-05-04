import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Lock, User, Mail, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { login as loginService } from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'existing', 'new'
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please provide a username.');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const user = await loginService(username, email);
      
      if (user.isNew) {
         setStatus('new');
      } else {
         setStatus('existing');
      }

      // Delay navigation to show feedback message
      setTimeout(() => {
        login(user);
        navigate('/');
      }, 1500);

    } catch (err) {
      setStatus('idle');
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    }
  };

  let buttonText = 'Get Started →';
  if (status === 'loading') buttonText = 'Processing...';
  else if (status === 'existing') buttonText = `Welcome back, ${username}`;
  else if (status === 'new') buttonText = 'Creating your account...';

  return (
    <div className="login-page-container">
      <div className="login-panel-left">
        <div className="illustration-wrapper">
          <div className="wa-web-logo-wrapper">
            <div className="wa-circle-outer">
              <div className="wa-circle-inner">
                <Smartphone size={100} strokeWidth={1} />
              </div>
              <div className="wa-mini-logo">
                <MessageSquare size={20} fill="#00a884" color="#00a884" />
              </div>
            </div>
          </div>
          <h1 className="wa-web-title">WhatsApp <span className="green-text">Web</span></h1>
          <p className="wa-web-subtitle">Send and receive messages without keeping your phone online</p>
          <div className="wa-web-footer">
            <Lock size={12} /> <span>End-to-end encrypted</span>
          </div>
        </div>
      </div>

      <div className="login-panel-right">
        <div className="login-form-wrapper">
          <div className="wa-login-logo">
             <div className="wa-icon-container">
                <MessageSquare size={40} fill="#fff" color="#00a884" />
             </div>
          </div>
          <h2 className="login-title">Sign in to WhatsApp Clone</h2>
          <p className="login-desc">Enter a username to get started. If you're new, we'll create your account automatically.</p>
          
          {error && <div className="error-message-toast">{error}</div>}
          
          <form onSubmit={handleSubmit} className="wa-login-form">
            <div className="wa-input-group">
              <User size={20} className="wa-input-icon" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (required)"
                disabled={status !== 'idle'}
              />
            </div>

            <div className="wa-input-group">
              <Mail size={20} className="wa-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address (optional)"
                disabled={status !== 'idle'}
              />
            </div>
            
            <button type="submit" className="wa-btn-get-started" disabled={status !== 'idle'}>
              {buttonText}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
