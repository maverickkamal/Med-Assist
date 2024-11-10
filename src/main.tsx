import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { History } from './pages/History';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Settings } from './pages/Settings';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Contact } from './pages/Contact';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import './index.css';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/signin" />;
};

// Chat route with WebSocketProvider only (removed ChatProvider)
const ChatRoute = () => (
  <WebSocketProvider>
    <App />
  </WebSocketProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected Routes */}
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatRoute />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);
