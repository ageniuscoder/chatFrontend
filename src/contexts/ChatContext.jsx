import React, { createContext, useContext, useState, useEffect } from 'react';
import { conversationAPI, messageAPI} from '../utils/api';
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
  const { user,isAuthenticated } = useAuth();
  const PAGE_SIZE = 50;

  useEffect(() => {
    // ✅ Only fetch conversations if the user is authenticated
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]); 

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

      // Update message status in the messages state
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId]?.map(msg =>
          messageIds.includes(msg.id) ? { ...msg, status: 'read' } : msg
        ) || []
      }));

      // Immediately reset the unread count for the conversation
      setConversations(prev => prev.map(conv =>
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      ));

    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

 // Updated createPrivateChat function
const createPrivateChat = async (userId) => {
    try {
        const response = await conversationAPI.createPrivateChat({ other_user_id: userId });
        const newConversationId = response.data.conversation_id;

        // Fetch all conversations again to get the new one
        const updatedConversations = await fetchConversations();

        // Find and set the newly created conversation as active
        const newConversation = updatedConversations.find(conv => conv.id === newConversationId);
        if (newConversation) {
            setActiveConversation(newConversation);
            return newConversation;
        }

        setError('Failed to find the new conversation');
        return null;
    } catch (error) {
        console.error('Failed to create conversation', error);
        setError('Failed to create conversation');
        return null;
    }
};


// Updated createGroupChat function
const createGroupChat = async (groupData) => {
    try {
        const response = await conversationAPI.createGroupChat(groupData);
        const newConversationId= response.data.conversation_id;

        // Fetch all conversations again to get the new one
        const updatedConversations=await fetchConversations();
        
        // Find and set the newly created conversation as active
        const newConversation = updatedConversations.find(conv => conv.id === newConversationId);
        if (newConversation) {
            setActiveConversation(newConversation);
        }
        return { success: true };
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
    // Update conversations list in a separate pass which correctly increaments unread count in realTime
    setConversations(prev => {
        return prev.map(conv => {
            if (conv.id === message.conversation_id) {
                // Check if the message is from another user and the conversation is not active
                const isNewUnread = message.sender_id !== user.id && (!activeConversation || activeConversation.id !== message.conversation_id);
                return {
                    ...conv,
                    last_message: message,
                    // Increment unread count only for new, unread messages
                    unread_count: conv.unread_count + (isNewUnread ? 1 : 0)
                };
            }
            return conv;
        });
    });
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


// for marking lastSeen and online
  const updatePresenceStatus = (userId, status, lastSeenTimestamp) => {
    const isOnline = status === 'online'; // Derive the boolean flag from the status string
    
    setConversations(prev => prev.map(conv => {
      if (!conv.is_group && conv.other_user_id === userId) {
        return {
          ...conv,
          last_seen: lastSeenTimestamp,
          is_online: isOnline, // FIX: Update the online status here
        };
      }
      return conv;
    }));

    setActiveConversation(prev => {
      if (prev && !prev.is_group && prev.other_user_id === userId) {
        return {
          ...prev,
          last_seen: lastSeenTimestamp,
          is_online: isOnline, // FIX: Update the online status here
        };
      }
      return prev;
    });
  };

  // After
const addParticipantToGroup = async (conversationId, userId) => {
    try {
      const response = await conversationAPI.addParticipant(conversationId, { user_id: userId });
      if (response.status === 200) {
        // The WebSocket event will now handle the UI update.
        // We only return success here.
        return { success: true };
      }
      return { success: false, error: response.data.error || 'Failed to add member' };
    } catch (err) {
      console.error('Failed to add participant', err);
      return { success: false, error: err.response?.data?.error || 'An unexpected error occurred' };
    }
};

  // After
const removeParticipantFromGroup = async (conversationId, userId) => {
    try {
      const response = await conversationAPI.removeParticipant(conversationId, userId);
      if (response.status === 200) {
        // The WebSocket event will handle the UI update.
        // We only return success here.
        return { success: true };
      }
      return { success: false, error: response.data.error || 'Failed to remove member' };
    } catch (err) {
      console.error('Failed to remove participant', err);
      return { success: false, error: err.response?.data?.error || 'An unexpected error occurred' };
    }
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
    updatePresenceStatus,
    addParticipantToGroup,
    removeParticipantFromGroup,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};