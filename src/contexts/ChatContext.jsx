import React, { createContext, useContext, useState, useEffect } from 'react';
import { conversationAPI, messageAPI, featureAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const { user } = useAuth();
  const PAGE_SIZE = 50;

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await conversationAPI.getConversations();
      setConversations(response.data.conversations);
      return response.data.conversations;
    } catch (error) {
      setError('Failed to fetch conversations', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId, page = 1) => {
    try {
      const response = await conversationAPI.getMessages(conversationId, {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE
      });

      const apiMessages = response.data.messages || [];
      const conversationMessages = [...apiMessages].reverse(); // safer: copy then reverse

      if (page === 1) {
        setMessages(prev => ({ ...prev, [conversationId]: conversationMessages }));
      } else {
        setMessages(prev => {
          const existing = prev[conversationId] || [];
          const merged = [
            ...conversationMessages,
            ...existing.filter(m => !conversationMessages.some(n => n.id === m.id))
          ];
          return { ...prev, [conversationId]: merged };
        });
      }

      return response.data;
    } catch (err) {
      console.error('Failed to fetch messages', err);
      setError(`Failed to fetch messages: ${err.message || err}`);
      return null;
    }
  };

  const sendMessage = async (conversationId, content) => {
    // Generate a robust temporary ID
    const tempId = `temp-${Date.now().toString()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    try {
      const tempMessage = {
        id: tempId,
        conversation_id: conversationId,
        content,
        status: 'sending',
        created_at: now,
        sent_at: now,
        sender_id: user.id,
        sender_username: user.username,
      };

      // Add temporary message locally
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), tempMessage]
      }));

      const response = await messageAPI.sendMessage({
        conversation_id: conversationId,
        content
      });

      // Update temporary message ID with the real one from the server
      setMessages(prev => {
        const existingMessages = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: existingMessages.map(msg =>
            msg.id === tempId ? { ...msg, id: response.data.message_id, status: 'sent' } : msg
          )
        };
      });

      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].filter(msg => msg.id !== tempId)
      }));
      setError('Failed to send message');
      return null;
    }
  };

  const markAsRead = async (conversationId, messageIds) => {
    try {
      if (!Array.isArray(messageIds) || messageIds.length === 0) return;

      await messageAPI.markAsRead({
        message_ids: messageIds
      });

      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId]?.map(msg =>
          messageIds.includes(msg.id) ? { ...msg, status: 'read' } : msg
        ) || []
      }));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

 const createPrivateChat = async (userId) => {
    try {
        const response = await conversationAPI.createPrivateChat({ other_user_id: userId });
        const newConversationId = response.data.conversation_id;

        // Fetch the updated list of conversations and get the newly created one.
        // We get the conversations directly from the function's return value,
        // which guarantees we're working with the most up-to-date data.
        const updatedConversations = await fetchConversations(); 

        const newConversation = updatedConversations.find(conv => conv.id === newConversationId);

        if (newConversation) {
            // Set the active conversation to the newly created one.
            setActiveConversation(newConversation);
            return newConversation; // Return the new conversation object.
        }

        // If for some reason the conversation wasn't found,
        // it's a failure.
        setError('Failed to find the new conversation');
        return null;
    } catch (error) {
        console.error('Failed to create conversation', error);
        setError('Failed to create conversation');
        return null;
    }
};


  const createGroupChat = async (groupData) => {
    try {
      const response = await conversationAPI.createGroupChat(groupData);
      const newConversationId= response.data.conversation_id;
      const updatedConversations=await fetchConversations();
      const newConversation = updatedConversations.find(conv => conv.id === newConversationId);
      if (newConversation) {
        // Now you are sure newConversation is not undefined
        // setConversations is already handled by fetchConversations, so we only need to set the active one
        setActiveConversation(newConversation);
      }
    } catch (error) {
      console.error(error);
      setError('Failed to create group');
      return null;
    }
  }


  const selectConversation = async (conversation) => {
    setActiveConversation(conversation);
    if (!messages[conversation.id]) {
      await fetchMessages(conversation.id);
    }
  };

  const addMessage = (message) => {
    setMessages(prev => {
      const existingMessages = prev[message.conversation_id] || [];
      
      // Check for a temporary message to replace (for the sender's UI)
      const tempMessageIndex = existingMessages.findIndex(
        msg => typeof msg.id === 'string' && msg.id.startsWith('temp-') && msg.content === message.content && msg.sender_id === message.sender_id
      );

      if (tempMessageIndex !== -1) {
        // A temporary message was found. Replace it with the new message from the server.
        const updatedMessages = [...existingMessages];
        updatedMessages[tempMessageIndex] = {
          ...message,
          status: 'sent',
        };
        return {
          ...prev,
          [message.conversation_id]: updatedMessages
        };
      }

      // Check for a message with the same real ID to avoid duplicates (for both sender and receiver)
      const isDuplicate = existingMessages.some(
        msg => msg.id === message.id
      );

      if (isDuplicate) {
        // It's a duplicate we've already processed, do nothing.
        return prev;
      }

      // It's a new, unique message. Add it to the end of the conversation.
      return {
        ...prev,
        [message.conversation_id]: [
          ...existingMessages,
          message
        ]
      };
    });

    // Update conversation last message
    setConversations(prev => prev.map(conv =>
      conv.id === message.conversation_id
        ? { ...conv, last_message: message }
        : conv
    ));
  };

  const updateMessageStatus = (messageId, conversationId, status) => {
    setMessages(prev => ({
      ...prev,
      [conversationId]: prev[conversationId]?.map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      ) || []
    }));
  };

  const setTypingStatus = (conversationId, userId, isTyping) => {
    setTypingUsers(prev => {
      const conversationTyping = prev[conversationId] || {};

      if (isTyping) {
        return {
          ...prev,
          [conversationId]: { ...conversationTyping, [userId]: true }
        };
      } else {
        const { [userId]: _, ...rest } = conversationTyping;

        if (Object.keys(rest).length === 0) {
          const { [conversationId]: __, ...remaining } = prev;
          return remaining;
        }

        return {
          ...prev,
          [conversationId]: rest
        };
      }
    });
  };

  const value = {
    conversations,
    activeConversation,
    messages,
    loading,
    error,
    typingUsers,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    createPrivateChat,
    createGroupChat, // Add this line
    selectConversation,
    addMessage,
    updateMessageStatus,
    setTypingStatus,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};