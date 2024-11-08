import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useChat } from './ChatContext';

interface WebSocketContextType {
  sendMessage: (message: string) => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const { backendSessionId } = useChat();
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connectWebSocket = (sessionId: string) => {
    // Reset connection state
    if (wsRef.current) {
      wsRef.current.close();
      setIsConnected(false);
    }

    try {
      // Fix the URL format - remove potential double slashes
      const baseUrl = 'wss://infamous-toad-5gqrrvvp6jjg2vwqj-8000.app.github.dev';
      const wsUrl = `${baseUrl}/ws/${sessionId}`.replace(/([^:]\/)\/+/g, "$1");
      
      console.log('Attempting to connect to:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket Connected Successfully');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('WebSocket Disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Only attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS && backendSessionId) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connectWebSocket(backendSessionId);
          }, delay);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          console.error('Max reconnection attempts reached');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  };

  // Connect/Reconnect when backendSessionId changes
  useEffect(() => {
    if (backendSessionId) {
      reconnectAttemptsRef.current = 0; // Reset attempts when session ID changes
      connectWebSocket(backendSessionId);
    } else {
      // Close existing connection if no session
      if (wsRef.current) {
        wsRef.current.close();
        setIsConnected(false);
      }
    }

    // Cleanup on unmount or session change
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [backendSessionId]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'tool_start':
        console.log('Tool execution started:', data);
        break;
      case 'tool_result':
        console.log('Tool execution result:', data);
        break;
      case 'agent_response':
        console.log('Agent response:', data);
        break;
      case 'error':
        console.error('WebSocket error:', data);
        break;
      default:
        console.log('Received:', data);
    }
  };

  const sendMessage = (message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', content: message }));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}; 