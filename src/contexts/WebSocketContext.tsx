import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chat-store';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const { backendSessionId } = useChatStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!backendSessionId) return;

    const connectWebSocket = () => {
      const ws = new WebSocket(`wss://scaling-telegram-564q9jg5jrgf776g-8000.app.github.dev/ws/${backendSessionId}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        (window as any).activeWebSocket = ws;
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const store = useChatStore.getState();
        const currentSession = store.currentSession();
        
        if (data.type === 'agent_response' && currentSession) {
          const aiMessage = {
            id: Date.now().toString(),
            content: data.content,
            timestamp: new Date(),
            isAI: true
          };
          
          store.updateSession(
            store.currentSessionId!,
            [...currentSession.messages, aiMessage]
          );
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        (window as any).activeWebSocket = null;
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [backendSessionId]);

  return <>{children}</>;
} 