import React, { createContext, useContext, useState, useEffect } from 'react';
import { conversationAPI, messageAPI } from '../utils/api';
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
    } catch (error) {
      setError('Failed to fetch conversations',error);
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
        // simple dedupe by id
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
    const tempId = Date.now();
    const now = new Date().toISOString();
    try {
      const tempMessage = {
        id: tempId,
        conversation_id: conversationId,
        content,
        status: 'sending',
        created_at: now,
        sent_at: now, // FIX: Add sent_at field to temporary message
        sender_id: user.id,
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
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].map(msg => 
          msg.id === tempId ? { ...msg, id: response.data.message_id, status: 'sent' } : msg
        )
      }));

      return response.data;
    } catch (error) {
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

      // Update message status locally right away
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].map(msg => 
          messageIds.includes(msg.id) ? { ...msg, status: 'read' } : msg
        )
      }));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const createPrivateChat = async (userId) => {
    try {
      const response = await conversationAPI.createPrivateChat({ user_id: userId });
      const newConversation = response.data;

      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newConversation);

      return newConversation;
    } catch (error) {
      console.log(error)
      setError('Failed to create conversation');
      return null;
    }
  };

  const selectConversation = async (conversation) => {
    setActiveConversation(conversation);
    if (!messages[conversation.id]) {
      await fetchMessages(conversation.id);
    }
  };

  const addMessage = (message) => {
    let added=false;
    setMessages(prev => {
      const existingMessages = prev[message.conversation_id] || [];
      // FIX: Check for duplicate only by ID, not by content
      const isDuplicate = existingMessages.some(
        msg => msg.id === message.id
      );

      if (isDuplicate) {
        return prev;
      }
      added=true;

      return {
        ...prev,
        [message.conversation_id]: [
          ...existingMessages,
          message
        ]
      };
    });

    // Update conversation last message
    if(added){
      setConversations(prev => prev.map(conv =>
        conv.id === message.conversation_id
          ? { ...conv, last_message: message }
          : conv
      ));
    }
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
      // Add user as typing
      return {
        ...prev,
        [conversationId]: { ...conversationTyping, [userId]: true }
      };
    } else {
      // Remove user from typing map
      const { [userId]: _, ...rest } = conversationTyping;

      if (Object.keys(rest).length === 0) {
        // No one left typing → remove whole conversation entry
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
    selectConversation,
    addMessage,
    updateMessageStatus,
    setTypingStatus,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};