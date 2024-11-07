import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { startNewSession } from '../services/api';

interface ChatContextType {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  resetChat: () => void;
  currentSessionId: string | null;
  createNewSession: (firstMessage?: Message) => string;
  updateSession: (sessionId: string, messages: Message[]) => void;
  isLoading: boolean;
  backendSessionId: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [backendSessionId, setBackendSessionId] = useState<string | null>(null);
  
  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    updateSession,
    startNewChat,
    loadSessions,
    isInitialized
  } = useChatSessions();

  // Handle initialization and URL params
  useEffect(() => {
    const init = async () => {
      if (user) {
        setIsLoading(true);
        await loadSessions();
        
        // Check for chat ID in URL
        const params = new URLSearchParams(location.search);
        const chatId = params.get('chat');
        if (chatId && sessions.some(s => s.id === chatId)) {
          setCurrentSessionId(chatId);
        }
        
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    
    init();
  }, [user, location.search]);

  // Update URL when current session changes
  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (currentSessionId) {
        navigate(`?chat=${currentSessionId}`, { replace: true });
      } else {
        navigate('', { replace: true });
      }
    }
  }, [currentSessionId, isInitialized, isLoading]);

  // Initialize backend session when starting new chat
  const initializeBackendSession = async () => {
    try {
      const sessionResponse = await startNewSession();
      setBackendSessionId(sessionResponse.session_id);
      return sessionResponse.session_id;
    } catch (error) {
      console.error('Failed to start new session:', error);
      return null;
    }
  };

  // Handle navigation state
  useEffect(() => {
    const from = location.state?.from;
    if (!from) {
      startNewChat();
      initializeBackendSession(); // Initialize new backend session
    }
  }, [location]);

  const currentSession = currentSessionId 
    ? sessions.find(s => s.id === currentSessionId)
    : null;

  const messages = currentSession?.messages || [];

  // Update setMessages to handle backend session
  const setMessages = async (newMessages: Message[]) => {
    if (currentSessionId) {
      updateSession(currentSessionId, newMessages);
    } else if (newMessages.length > 0) {
      // Ensure we have a backend session before creating frontend session
      if (!backendSessionId) {
        await initializeBackendSession();
      }
      const newSessionId = createNewSession(newMessages[0]);
      updateSession(newSessionId, newMessages);
      navigate(`?chat=${newSessionId}`, { replace: true });
    }
  };

  // Update resetChat to handle backend session
  const resetChat = async () => {
    startNewChat();
    await initializeBackendSession(); // Initialize new backend session
    navigate('', { replace: true });
  };

  return (
    <ChatContext.Provider value={{
      messages,
      setMessages,
      resetChat,
      currentSessionId,
      createNewSession,
      updateSession,
      isLoading,
      backendSessionId
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 