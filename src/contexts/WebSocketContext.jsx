import React, { createContext, useContext } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';
import { WEBSOCKET_URL } from '../utils/constants';

const WebSocketContext = createContext();

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addMessage, updateMessageStatus, setTypingStatus } = useChat();

  const token = isAuthenticated ? localStorage.getItem('token') : null;
  const socketUrl = token ? `${WEBSOCKET_URL}?token=${token}` : null;

  const { sendJsonMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: (closeEvent) => {
      // Auto reconnect unless closed normally
      return closeEvent.code !== 1000;
    },
    reconnectAttempts: 5,
    reconnectInterval: (attempt) =>
      Math.min(1000 * Math.pow(2, attempt), 30000), // exponential backoff
  });

  // Handle incoming messages
  React.useEffect(() => {
    if (!lastMessage) return;

    try {
      const data = JSON.parse(lastMessage.data);

      switch (data.type) {
        case 'message':
          addMessage(data);
          break;

        case 'read_receipt':
          updateMessageStatus(data.message_id, data.conversation_id, 'read');
          break;

        case 'typing_start':
          setTypingStatus(data.conversation_id, data.sender_username, true);
          break;

        case 'typing_stop':
          setTypingStatus(data.conversation_id, data.sender_username, false);
          break;

        case 'presence':
          console.log('👤 Presence update:', data);
          break;

        default:
          console.log('ℹ️ Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('⚠️ Failed to parse WebSocket message:', error);
    }
  }, [lastMessage,addMessage,updateMessageStatus,setTypingStatus]);

  // Send helpers
  const startTyping = (conversationId) => {
    sendJsonMessage({ type: 'typing_start', conversation_id: conversationId });
  };

  const stopTyping = (conversationId) => {
    sendJsonMessage({ type: 'typing_stop', conversation_id: conversationId });
  };

  const value = {
    isConnected: readyState === ReadyState.OPEN,
    sendMessage: sendJsonMessage,
    startTyping,
    stopTyping,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
