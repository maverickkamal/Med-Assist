import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Message, ChatSession } from '@/types/chat';
import { startNewSession, sendMessage as apiSendMessage } from '@/services/api';
import { exportChat as exportChatUtil } from '@/utils/chatExport';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  backendSessionId: string | null;
  isLoading: boolean;
  
  // Session Management
  setCurrentSession: (id: string | null) => void;
  createNewSession: (firstMessage: Message, backendId: string) => string;
  updateSession: (sessionId: string, messages: Message[], backendId?: string) => void;
  deleteSession: (sessionId: string) => void;
  toggleStar: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, newTitle: string) => void;
  
  // Message Management
  sendMessage: (content: string, files?: File[], images?: File[]) => Promise<void>;
  
  // Chat Actions
  startNewChat: () => Promise<void>;
  resetChat: () => Promise<void>;
  
  // Computed Properties
  currentSession: () => ChatSession | null;
  recentChats: () => { id: string; title: string; daysAgo: string }[];
  starredChats: () => { id: string; title: string }[];
  
  // Utils
  exportChat: (messages: Message[]) => void;
}

// Define the storage configuration
const storage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    
    try {
      const data = JSON.parse(str);
      // Convert date strings back to Date objects
      if (data.state?.sessions) {
        data.state.sessions = data.state.sessions.map((session: ChatSession) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      }
      return data;
    } catch (error) {
      console.error('Error parsing stored state:', error);
      return null;
    }
  },
  setItem: (name: string, value: any) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  }
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      backendSessionId: null,
      isLoading: false,

      setCurrentSession: (id) => set({ currentSessionId: id }),

      createNewSession: (firstMessage, backendId) => {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title: firstMessage.content.slice(0, 30) + '...',
          messages: [firstMessage],
          isStarred: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          backendSessionId: backendId
        };
        
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
          backendSessionId: backendId
        }));
        
        return newSession.id;
      },

      updateSession: (sessionId, messages, backendId) => {
        set((state) => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId
              ? {
                  ...session,
                  messages,
                  title: messages[0]?.content.slice(0, 30) + '...' || 'New Chat',
                  updatedAt: new Date(),
                  backendSessionId: backendId || session.backendSessionId
                }
              : session
          )
        }));
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter(s => s.id !== sessionId),
          currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId
        }));
      },

      toggleStar: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, isStarred: !session.isStarred }
              : session
          )
        }));
      },

      updateSessionTitle: (sessionId, newTitle) => {
        set((state) => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, title: newTitle }
              : session
          )
        }));
      },

      sendMessage: async (content, files = [], images = []) => {
        const state = get();
        let sessionId = state.currentSessionId;
        
        const userMessage: Message = {
          id: Date.now().toString(),
          content,
          timestamp: new Date(),
          isAI: false,
          files,
          images
        };

        try {
          if (!sessionId) {
            const { session_id } = await startNewSession();
            sessionId = get().createNewSession(userMessage, session_id);
            set({ currentSessionId: sessionId, backendSessionId: session_id });
          } else {
            const currentSession = get().currentSession();
            if (currentSession) {
              const updatedMessages = [...currentSession.messages, userMessage];
              get().updateSession(sessionId, updatedMessages);
            }
          }

          // Send message to backend
          const response = await apiSendMessage(
            get().currentSession()?.backendSessionId!,
            content,
            images?.map(img => URL.createObjectURL(img)),
            files?.map(file => URL.createObjectURL(file))
          );

          // Add AI response
          const aiMessage: Message = {
            id: Date.now().toString(),
            content: response,
            timestamp: new Date(),
            isAI: true
          };

          const currentSession = get().currentSession();
          if (currentSession) {
            get().updateSession(
              sessionId!,
              [...currentSession.messages, aiMessage]
            );
          }
        } catch (error) {
          console.error('Failed to send message:', error);
          const errorMessage: Message = {
            id: Date.now().toString(),
            content: "Sorry, I encountered an error processing your message. Please try again.",
            timestamp: new Date(),
            isAI: true
          };

          const currentSession = get().currentSession();
          if (currentSession && sessionId) {
            get().updateSession(sessionId, [...currentSession.messages, errorMessage]);
          }
        }
      },

      startNewChat: async () => {
        try {
          const { session_id } = await startNewSession();
          set({ 
            currentSessionId: null,
            backendSessionId: session_id
          });
        } catch (error) {
          console.error('Failed to start new chat:', error);
        }
      },

      resetChat: async () => {
        try {
          const { session_id } = await startNewSession();
          set({ 
            currentSessionId: null,
            backendSessionId: session_id
          });
        } catch (error) {
          console.error('Failed to reset chat:', error);
        }
      },

      currentSession: () => {
        const state = get();
        return state.sessions.find(s => s.id === state.currentSessionId) || null;
      },

      recentChats: () => {
        const state = get();
        return state.sessions
          .filter(session => !session.isStarred)
          .sort((a, b) => {
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);
            return dateB.getTime() - dateA.getTime();
          })
          .map(session => ({
            id: session.id,
            title: session.title,
            daysAgo: Math.floor((Date.now() - new Date(session.updatedAt).getTime()) / (1000 * 60 * 60 * 24)).toString()
          }));
      },

      starredChats: () => {
        const state = get();
        return state.sessions
          .filter(session => session.isStarred)
          .map(session => ({
            id: session.id,
            title: session.title
          }));
      },

      exportChat: (messages) => {
        exportChatUtil(messages);
      }
    }),
    {
      name: 'chat-storage',
      version: 1,
      storage: createJSONStorage(() => storage),
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Handle migration from version 0 to 1
          return {
            ...persistedState,
            sessions: persistedState.sessions?.map((session: any) => ({
              ...session,
              createdAt: new Date(session.createdAt || Date.now()),
              updatedAt: new Date(session.updatedAt || Date.now()),
              messages: session.messages?.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp || Date.now())
              })) || []
            })) || [],
            currentSessionId: persistedState.currentSessionId || null,
            backendSessionId: persistedState.backendSessionId || null,
            isLoading: false
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        backendSessionId: state.backendSessionId
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure all dates are properly converted after rehydration
          state.sessions = state.sessions.map(session => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
        }
      }
    }
  )
);