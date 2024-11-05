import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';

interface ChatContextType {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  resetChat: () => void;
  currentSessionId: string | null;
  createNewSession: (firstMessage?: Message) => string;
  updateSession: (sessionId: string, messages: Message[]) => void;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Handle navigation state
  useEffect(() => {
    const from = location.state?.from;
    if (from && from !== '/chat' && !location.search.includes('chat=')) {
      startNewChat();
    }
  }, [location]);

  const currentSession = currentSessionId 
    ? sessions.find(s => s.id === currentSessionId)
    : null;

  const messages = currentSession?.messages || [];

  const setMessages = (newMessages: Message[]) => {
    if (currentSessionId) {
      updateSession(currentSessionId, newMessages);
    } else if (newMessages.length > 0) {
      const newSessionId = createNewSession(newMessages[0]);
      updateSession(newSessionId, newMessages);
      // Update URL with new session ID
      navigate(`?chat=${newSessionId}`, { replace: true });
    }
  };

  const resetChat = () => {
    startNewChat();
    // Remove chat ID from URL
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
      isLoading
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