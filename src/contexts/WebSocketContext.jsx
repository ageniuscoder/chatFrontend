import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';
import { WEBSOCKET_URL } from '../utils/constants';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { addMessage, updateMessageStatus, setTypingStatus } = useChat();
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user]);

  const connect = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const wsUrl = `${WEBSOCKET_URL}?token=${token}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setReconnectAttempts(0);
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setIsConnected(false);
        
        // Only attempt reconnection if it wasn't a normal close
        if (event.code !== 1000 && isAuthenticated && reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, 'User disconnected');
    }
    
    wsRef.current = null;
    setIsConnected(false);
    setReconnectAttempts(0);
  };

  const handleMessage = (data) => {
    switch (data.type) {
      case 'message':
        addMessage(data);
        break;
        
      case 'read_receipt':
        updateMessageStatus(data.message_id, data.conversation_id, 'read');
        break;
        
      case 'typing_start':
        setTypingStatus(data.conversation_id, data.user_id, true);
        break;
        
      case 'typing_stop':
        setTypingStatus(data.conversation_id, data.user_id, false);
        break;
        
      case 'presence':
        // Handle user presence updates
        console.log('User presence update:', data);
        break;
        
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  const startTyping = (conversationId) => {
    sendMessage({
      type: 'typing_start',
      conversation_id: conversationId
    });
  };

  const stopTyping = (conversationId) => {
    sendMessage({
      type: 'typing_stop',
      conversation_id: conversationId
    });
  };

  const value = {
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    reconnectAttempts,
    maxReconnectAttempts,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};