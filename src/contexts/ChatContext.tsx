import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { startNewSession, sendMessage } from '../services/api';

interface ChatContextType {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  resetChat: () => void;
  currentSessionId: string | null;
  createNewSession: (firstMessage?: Message) => string;
  updateSession: (sessionId: string, messages: Message[], backendSessionId?: string) => void;
  isLoading: boolean;
  backendSessionId: string | null;
  handleChatSelect: (chatId: string) => void;
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

  // Modified resetChat to properly clear everything and initialize new backend session
  const resetChat = async () => {
    const newBackendSessionId = await initializeBackendSession();
    if (newBackendSessionId) {
      setCurrentSessionId(null);
      setBackendSessionId(newBackendSessionId);
      startNewChat();
      // Navigate to base chat URL for new chat
      navigate('/chat', { replace: true });
    }
  };

  // Handle initialization and URL params
  useEffect(() => {
    const init = async () => {
      if (user) {
        setIsLoading(true);
        await loadSessions();
        
        const params = new URLSearchParams(location.search);
        const chatId = params.get('chat');
        
        if (location.pathname === '/chat') {
          if (chatId && sessions.some(s => s.id === chatId)) {
            // Load existing chat
            setCurrentSessionId(chatId);
            const session = sessions.find(s => s.id === chatId);
            if (session?.backendSessionId) {
              setBackendSessionId(session.backendSessionId);
            }
          } else {
            // Clear everything for a fresh chat and initialize new backend session
            const newBackendSessionId = await initializeBackendSession();
            if (newBackendSessionId) {
              setCurrentSessionId(null);
              setBackendSessionId(newBackendSessionId);
              startNewChat();
            }
          }
        }
        
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    
    init();
  }, [user, location.search, location.pathname]);

  // Update setMessages to handle real message sending
  const setMessages = async (newMessages: Message[]) => {
    try {
      if (currentSessionId) {
        // Get the last message (the new user message)
        const lastMessage = newMessages[newMessages.length - 1];
        
        // Only send if it's a user message
        if (!lastMessage.isAI) {
          // First update UI with user's message
          updateSession(currentSessionId, newMessages, backendSessionId || undefined);
          
          // Send message to backend
          const response = await sendMessage(
            backendSessionId!, 
            lastMessage.content,
            lastMessage.images?.map(img => URL.createObjectURL(img)),
            lastMessage.files?.map(file => URL.createObjectURL(file))
          );

          // Create AI response message
          const aiMessage: Message = {
            id: Date.now().toString(),
            content: response,
            timestamp: new Date(),
            isAI: true
          };

          // Update messages with AI response
          const updatedMessages = [...newMessages, aiMessage];
          updateSession(currentSessionId, updatedMessages, backendSessionId || undefined);
        }
      } else if (newMessages.length > 0) {
        // Handle new session creation
        let sessionBackendId = backendSessionId;
        if (!sessionBackendId) {
          sessionBackendId = await initializeBackendSession();
        }
        if (sessionBackendId) {
          const newSessionId = createNewSession(newMessages[0], sessionBackendId);
          
          // First update UI with user's message
          updateSession(newSessionId, newMessages, sessionBackendId);
          
          // Send message to backend
          const response = await sendMessage(
            sessionBackendId,
            newMessages[0].content,
            newMessages[0].images?.map(img => URL.createObjectURL(img)),
            newMessages[0].files?.map(file => URL.createObjectURL(file))
          );

          // Create AI response message
          const aiMessage: Message = {
            id: Date.now().toString(),
            content: response,
            timestamp: new Date(),
            isAI: true
          };

          // Update messages with AI response
          const updatedMessages = [...newMessages, aiMessage];
          updateSession(newSessionId, updatedMessages, sessionBackendId);
          
          // Update URL with new chat ID
          navigate(`/chat?chat=${newSessionId}`, { replace: true });
          setCurrentSessionId(newSessionId);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Sorry, I encountered an error processing your message. Please try again.",
        timestamp: new Date(),
        isAI: true
      };
      const updatedMessages = [...newMessages, errorMessage];
      if (currentSessionId) {
        updateSession(currentSessionId, updatedMessages, backendSessionId || undefined);
      }
    }
  };

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

  const currentSession = currentSessionId 
    ? sessions.find(s => s.id === currentSessionId)
    : null;

  const messages = currentSession?.messages || [];

  // Handle chat selection from sidebar
  const handleChatSelect = (chatId: string) => {
    if (!chatId) return;
    
    setCurrentSessionId(chatId);
    const session = sessions.find(s => s.id === chatId);
    if (session?.backendSessionId) {
      setBackendSessionId(session.backendSessionId);
    }
    // Navigate to chat with ID
    navigate(`/chat?chat=${chatId}`, { replace: true });
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
      backendSessionId,
      handleChatSelect
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