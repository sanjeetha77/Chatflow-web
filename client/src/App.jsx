import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Chat from './pages/Chat';
import { AuthContext } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={currentUser ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
