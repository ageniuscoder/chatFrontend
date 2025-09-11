import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, VideoIcon, MoreVertical, Paperclip, Smile, MessageCircle } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext.jsx';
import { useWebSocketContext } from '../../contexts/WebSocketContext.jsx';
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
  const { startTyping, stopTyping } = useWebSocketContext();

  const conversationMessages = messages[activeConversation?.id] || [];
  const conversationTypingUsers = Object.keys(typingUsers[activeConversation?.id] || {});

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages, typingUsers]); // Scroll when messages or typing status changes

  useEffect(() => {
    if (activeConversation && conversationMessages.length > 0) {
      const unreadMessageIds = conversationMessages
        .filter(msg => msg.sender_id !== user.id && msg.status !== 'read')
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        markAsRead(activeConversation.id, unreadMessageIds);
      }
    }
  }, [activeConversation, conversationMessages, user]);

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
    
    if (activeConversation) {
      startTyping(activeConversation.id);
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
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
    <div className="flex flex-col h-full bg-gray-900 rounded-xl shadow-lg shadow-green-900/30 relative overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-800/80 backdrop-blur-sm relative z-10 shadow-md shadow-green-900/20">
        <div className="flex items-center space-x-3">
          <Avatar
            src={activeConversation.avatar}
            alt={activeConversation.name}
            size="md" // Smaller size
            online={activeConversation.is_online}
          />
          <div>
            <h2 className="font-extrabold text-white text-lg drop-shadow-md">{activeConversation.name}</h2>
            <div className="text-sm text-gray-400">
              {conversationTypingUsers.length > 0 ? (
                <TypingIndicator users={conversationTypingUsers} />
              ) : activeConversation.is_group ? (
                `${activeConversation.participant_count || 2} members`
              ) : activeConversation.is_online ? (
                <span className="text-green-400">online</span>
              ) : (
                formatLastSeen(activeConversation.last_seen)
              )}
            </div>
          </div>
        </div>
        
        {/* Updated Button Group */}
        <div className="flex items-center space-x-1">
          <button className="p-2 rounded-full text-green-400 hover:bg-gray-700 hover:text-green-300 transition-all duration-300 transform hover:scale-110">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full text-teal-400 hover:bg-gray-700 hover:text-teal-300 transition-all duration-300 transform hover:scale-110">
            <VideoIcon className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-gray-300 transition-all duration-300 transform hover:scale-110">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar-dark p-4 space-y-3 relative">
        {conversationMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p className="text-base font-semibold text-gray-300">No messages yet. Start the conversation!</p>
            <MessageCircle className="w-16 h-16 mx-auto mt-4 text-green-600 opacity-50 animate-pulse-slow" />
          </div>
        ) : (
          conversationMessages.map((msg, index) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === user.id}
              showAvatar={
                index === 0 ||
                (conversationMessages[index - 1].sender_id !== msg.sender_id)
              }
              showTime={
                index === conversationMessages.length - 1 ||
                new Date(conversationMessages[index + 1].sent_at) - new Date(msg.sent_at) > 300000
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-800/80 backdrop-blur-sm relative z-10 shadow-lg shadow-green-900/20">
        <div className="flex items-end space-x-3">
          <button className="p-2 bg-gray-700/60 text-gray-300 rounded-full hover:bg-gray-700 hover:text-green-400 transition-all duration-300 shadow-md shadow-gray-900/40">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full pl-4 pr-10 py-2 bg-gray-700 border border-transparent rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400 text-sm resize-none transition-all duration-300 shadow-inner shadow-gray-900/60 custom-scrollbar-dark"
              rows="1"
              style={{
                minHeight: '40px',
                maxHeight: '120px',
                overflowY: 'auto'
              }}
            />
            <button className="absolute right-2 bottom-2 p-1 text-gray-400 hover:text-yellow-400 transition-colors duration-300">
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-3 bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-full hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-800/40"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;