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


  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<Navigate to={currentUser ? "/chat" : "/login"} replace />} 
        />
        <Route 
          path="/login" 
          element={currentUser ? <Navigate to="/chat" replace /> : <Login />} 
        />
        <Route 
          path="/chat" 
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
