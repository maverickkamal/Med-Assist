import { useState, useEffect } from 'react';
import { ChatSession, Message } from '@/types';

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('chat-sessions');
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'createdAt' || key === 'updatedAt' || key === 'timestamp') {
        return new Date(value);
      }
      return value;
    }) : [];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('chat-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const createNewSession = (firstMessage: Message) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: firstMessage.content.slice(0, 30) + (firstMessage.content.length > 30 ? '...' : ''),
      createdAt: new Date(),
      updatedAt: new Date(),
      isStarred: false,
      messages: [firstMessage]
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  };

  const updateSession = (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            messages,
            updatedAt: new Date()
          }
        : session
    ));
  };

  const toggleStar = (sessionId: string) => {
    setSessions(prev => prev.map(session =>
      session.id === sessionId
        ? { ...session, isStarred: !session.isStarred }
        : session
    ));
  };

  const getFormattedDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  };

  const recentChats = sessions
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .map(session => ({
      id: session.id,
      title: session.title,
      daysAgo: getFormattedDate(session.updatedAt)
    }));

  const starredChats = sessions
    .filter(session => session.isStarred)
    .map(session => ({
      id: session.id,
      title: session.title
    }));

  const updateSessionTitle = (sessionId: string, newTitle: string) => {
    setSessions(prev => prev.map(session =>
      session.id === sessionId
        ? { ...session, title: newTitle }
        : session
    ));
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
  };

  // Load last session ID from localStorage
  useEffect(() => {
    const lastSessionId = localStorage.getItem('last-session-id');
    if (lastSessionId) {
      setCurrentSessionId(lastSessionId);
    }
  }, []);

  // Save current session ID to localStorage
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('last-session-id', currentSessionId);
    }
  }, [currentSessionId]);

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
  };
} 