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
  const { addMessage, updateMessageStatus, setTypingStatus, updatePresenceStatus } = useChat();

  const token = isAuthenticated ? localStorage.getItem('token') : null;
  const socketUrl = token ? `${WEBSOCKET_URL}?token=${token}` : null;

  // The critical fix is here: using the onMessage callback
  // instead of a separate useEffect hook on lastMessage.
  const { sendJsonMessage, readyState } = useWebSocket(socketUrl, {
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data);

        switch (data.type) {
          case 'message':
            // The API provides `message_id`, but our state management uses `id`.
            // We fix this mismatch by aliasing the ID here before adding the message.
            addMessage({ ...data, id: data.message_id });
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
            // You may want to add a state update here for presence
            updatePresenceStatus(data.sender_id,data.content, data.last_active);
            break;

          default:
            console.log('ℹ️ Unknown WebSocket message type:', data.type);
        }
      } catch (error) {
        console.error('⚠️ Failed to parse WebSocket message:', error);
      }
    },
    shouldReconnect: (closeEvent) => {
      return closeEvent.code !== 1000;
    },
    reconnectAttempts: 5,
    reconnectInterval: (attempt) =>
      Math.min(1000 * Math.pow(2, attempt), 30000), // exponential backoff
  });

  // Send helpers
  const startTyping = (conversationId) => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({ type: 'typing_start', conversation_id: conversationId });
    }
  };

  const stopTyping = (conversationId) => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({ type: 'typing_stop', conversation_id: conversationId });
    }
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