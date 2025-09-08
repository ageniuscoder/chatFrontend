import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, VideoIcon, MoreVertical } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext.jsx';
import { useWebSocket } from '../../contexts/WebSocketContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Avatar from '../common/Avatar';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { formatLastSeen } from '../../utils/dateUtils';

const ChatWindow = () => {
  const [message, setMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();
  const { 
    activeConversation, 
    messages, 
    sendMessage, 
    markAsRead,
    typingUsers 
  } = useChat();
  const { startTyping, stopTyping } = useWebSocket();

  const conversationMessages = messages[activeConversation?.id] || [];
  const conversationTypingUsers = Object.keys(typingUsers[activeConversation?.id] || {});

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  useEffect(() => {
    // Mark messages as read when conversation becomes active
    if (activeConversation && conversationMessages.length > 0) {
      const unreadMessageIds = conversationMessages
        .filter(msg => !msg.is_current_user && msg.status !== 'read')
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        markAsRead(activeConversation.id, unreadMessageIds);
      }
    }
  }, [activeConversation, conversationMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (message.trim() && activeConversation) {
      await sendMessage(activeConversation.id, message.trim());
      setMessage('');
      stopTyping(activeConversation.id);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Handle typing indicators
    if (activeConversation) {
      startTyping(activeConversation.id);
      
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set new timeout to stop typing
      const timeout = setTimeout(() => {
        stopTyping(activeConversation.id);
      }, 2000);
      
      setTypingTimeout(timeout);
    }
  };

  if (!activeConversation) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <Avatar
            src={activeConversation.avatar}
            alt={activeConversation.name}
            size="md"
            online={activeConversation.is_online}
          />
          <div>
            <h2 className="font-semibold text-gray-900">{activeConversation.name}</h2>
            <div className="text-sm text-gray-500">
              {conversationTypingUsers.length > 0 ? (
                <TypingIndicator users={conversationTypingUsers} />
              ) : activeConversation.participant_count > 2 ? (
                `${activeConversation.participant_count} members`
              ) : activeConversation.is_online ? (
                'online'
              ) : (
                formatLastSeen(activeConversation.last_seen)
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <VideoIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {conversationMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          conversationMessages.map((msg, index) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.is_current_user}
              showAvatar={
                index === 0 ||
                conversationMessages[index - 1].is_current_user !== msg.is_current_user ||
                conversationMessages[index - 1].sender_id !== msg.sender_id
              }
              showTime={
                index === conversationMessages.length - 1 ||
                conversationMessages[index + 1].is_current_user !== msg.is_current_user ||
                new Date(conversationMessages[index + 1].created_at) - new Date(msg.created_at) > 300000 // 5 minutes
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              rows="1"
              style={{
                minHeight: '50px',
                maxHeight: '120px'
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;