import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Phone, VideoIcon, MoreVertical, Paperclip, Smile, MessageCircle, Search, ArrowLeft } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext.jsx';
import { useWebSocketContext } from '../../contexts/WebSocketContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Avatar from '../common/Avatar';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { formatLastSeen } from '../../utils/dateUtils';
import GroupMembersModal from './GroupMembersModal.jsx';
import EmojiPicker from './EmojiPicker'; // Extracted to separate component

const ChatWindow = ({ onBack }) => {
  const [message, setMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const inputContainerRef = useRef(null);
  
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

  // Calculate responsive dimensions
  const [textareaMaxHeight, setTextareaMaxHeight] = useState('120px');
  const [pickerDimensions, setPickerDimensions] = useState({ width: 0, height: 0 });

  const calculateDimensions = useCallback(() => {
    // Textarea max height
    const headerHeight = 70;
    const footerHeight = 80;
    const availableHeight = window.innerHeight;
    const max = (availableHeight - headerHeight - footerHeight) * 0.3;
    setTextareaMaxHeight(`${max}px`);

    // Picker dimensions
    if (inputContainerRef.current) {
      const { width, top } = inputContainerRef.current.getBoundingClientRect();
      const pickerWidth = width * 0.75;
      const availableHeight = top - 20;
      const pickerHeight = availableHeight * 0.9;
      setPickerDimensions({ width: pickerWidth, height: pickerHeight });
    }
  }, []);

  const updateTextareaHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, [calculateDimensions]);

  useEffect(() => {
    updateTextareaHeight();
  }, [message, updateTextareaHeight]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages, typingUsers]);

  useEffect(() => {
    if (activeConversation && conversationMessages.length > 0) {
      const unreadMessageIds = conversationMessages
        .filter(msg => msg.sender_id !== user.id && msg.status !== 'read')
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        markAsRead(activeConversation.id, unreadMessageIds);
      }
    }
  }, [activeConversation, conversationMessages, user, markAsRead]);

  useEffect(() => {
    setShowMembersModal(false);
  }, [activeConversation]);

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

  const insertEmojiAtCaret = (emoji) => {
    const el = inputRef.current;
    if (!el) {
      setMessage(prev => prev + emoji);
      return;
    }
    
    const start = el.selectionStart || message.length;
    const end = el.selectionEnd || message.length;
    const newMessage = message.slice(0, start) + emoji + message.slice(end);
    
    setMessage(newMessage);
    setTimeout(() => {
      el.focus();
      const caretPos = start + emoji.length;
      el.setSelectionRange(caretPos, caretPos);
    }, 0);
  };

  if (!activeConversation) {
    return null;
  }

  return (
    <>
      <style>
        {`
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-scale-in {
            animation: scaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
        `}
      </style>
      
      <div className="flex flex-col h-full bg-gray-900 rounded-xl shadow-lg shadow-green-900/30 relative overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-800/80 backdrop-blur-sm relative z-10 shadow-md shadow-green-900/20">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1 rounded-full text-white hover:bg-gray-700 transition-colors md:hidden"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <Avatar
              src={activeConversation.avatar}
              alt={activeConversation.name}
              size="md"
              online={activeConversation.is_online}
            />
            <div>
              <div
                onClick={() => activeConversation.is_group && setShowMembersModal(true)}
                className={`cursor-${activeConversation.is_group ? 'pointer' : 'default'}`}
              >
                <h2 className="font-extrabold text-white text-lg drop-shadow-md">{activeConversation.name}</h2>
              </div>
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
              msg.type === 'system_message' ? (
                <div key={msg.id} className="text-center my-4">
                  <span className="inline-block text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full shadow-inner shadow-gray-900/50">
                    {msg.content}
                  </span>
                </div>
              ) : (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.sender_id === user.id}
                  showAvatar={
                    index === 0 ||
                    (conversationMessages[index - 1]?.sender_id !== msg.sender_id &&
                    conversationMessages[index - 1]?.type !== 'system_message')
                  }
                  showTime={
                    index === conversationMessages.length - 1 ||
                    new Date(conversationMessages[index + 1]?.sent_at) - new Date(msg.sent_at) > 300000
                  }
                />
              )
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div ref={inputContainerRef} className="p-4 border-t border-gray-800 bg-gray-800/80 backdrop-blur-sm relative z-10 shadow-lg shadow-green-900/20">
          <div className="flex items-end space-x-3">
            <button className="p-2 bg-gray-700/60 text-gray-300 rounded-full hover:bg-gray-700 hover:text-green-400 transition-all duration-300 shadow-md shadow-gray-900/40 transform hover:scale-105">
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
                style={{ minHeight: '40px', maxHeight: textareaMaxHeight, overflowY: 'auto' }}
              />
              <div className="absolute right-2 bottom-2">
                <div className="relative">
                  <button
                    ref={emojiButtonRef}
                    onClick={() => setShowEmojiPicker(s => !s)}
                    aria-haspopup="dialog"
                    aria-expanded={showEmojiPicker}
                    className="p-1 text-gray-400 hover:text-yellow-400 transition-colors duration-300"
                    type="button"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  {showEmojiPicker && (
                    <EmojiPicker
                      onSelect={insertEmojiAtCaret}
                      onClose={() => setShowEmojiPicker(false)}
                      anchorRef={emojiButtonRef}
                      pickerWidth={pickerDimensions.width}
                      pickerHeight={pickerDimensions.height}
                    />
                  )}
                </div>
              </div>
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

      <GroupMembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        conversation={activeConversation}
      />
    </>
  );
};

export default ChatWindow;