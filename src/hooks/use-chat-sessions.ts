import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  isStarred: boolean;
  createdAt: Date;
  updatedAt: Date;
  backendSessionId?: string;
}

interface ChatSessionDisplay {
  id: string;
  title: string;
  daysAgo: string;
}

export function useChatSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load sessions from localStorage
  const loadSessions = async () => {
    if (!user) return;
    
    try {
      const storedSessions = localStorage.getItem(`chat_sessions_${user.id}`);
      const storedCurrentId = localStorage.getItem(`current_session_${user.id}`);
      
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions, (key, value) => {
          if (key === 'createdAt' || key === 'updatedAt' || key === 'timestamp') {
            return new Date(value);
          }
          return value;
        });

        setSessions(parsedSessions);

        // Only restore current session if it exists in the loaded sessions
        if (storedCurrentId && parsedSessions.some((s: ChatSession) => s.id === storedCurrentId)) {
          setCurrentSessionId(storedCurrentId);
        }
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setIsInitialized(true);
    }
  };

  // Initialize sessions when component mounts or user changes
  useEffect(() => {
    loadSessions();
  }, [user]);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (!user || !isInitialized) return;

    try {
      localStorage.setItem(`chat_sessions_${user.id}`, JSON.stringify(sessions));
      
      if (currentSessionId) {
        localStorage.setItem(`current_session_${user.id}`, currentSessionId);
      } else {
        localStorage.removeItem(`current_session_${user.id}`);
      }
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }, [sessions, currentSessionId, user, isInitialized]);

  const createNewSession = (firstMessage?: Message, backendSessionId?: string) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: firstMessage?.content.slice(0, 30) + '...' || 'New Chat',
      messages: firstMessage ? [firstMessage] : [],
      isStarred: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      backendSessionId
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  };

  const updateSession = (sessionId: string, messages: Message[], backendSessionId?: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          messages,
          title: messages[0]?.content.slice(0, 30) + '...' || 'New Chat',
          updatedAt: new Date(),
          backendSessionId: backendSessionId || session.backendSessionId
        };
      }
      return session;
    }));
  };

  const toggleStar = (sessionId: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return { ...session, isStarred: !session.isStarred };
      }
      return session;
    }));
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  };

  const updateSessionTitle = (sessionId: string, newTitle: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return { ...session, title: newTitle };
      }
      return session;
    }));
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
  };

  // Add resetChat function
  const resetChat = async () => {
    setCurrentSessionId(null);
    // Clear current session and prepare for a new one
    return Promise.resolve(); // Return a promise to maintain async compatibility
  };

  // Filter sessions for display
  const recentChats = sessions
    .filter(session => !session.isStarred)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .map(session => ({
      id: session.id,
      title: session.title,
      daysAgo: Math.floor((Date.now() - session.updatedAt.getTime()) / (1000 * 60 * 60 * 24)).toString()
    }));

  const starredChats = sessions
    .filter(session => session.isStarred)
    .map(session => ({
      id: session.id,
      title: session.title
    }));

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    updateSession,
    toggleStar,
    recentChats,
    starredChats,
    updateSessionTitle,
    deleteSession,
    startNewChat,
    resetChat, // Add resetChat to the returned object
    loadSessions,
    isInitialized
  };
} 