import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import Avatar from '../common/Avatar';
import { formatMessageTime } from '../../utils/dateUtils';

const MessageBubble = ({ message, isOwn, showAvatar, showTime }) => {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <Avatar
            src={message.sender_avatar}
            alt={message.sender_username}
            size="sm"
            className="flex-shrink-0"
          />
        )}
        {isOwn && <div className="w-8" />} {/* Spacer for own messages */}

        {/* Message Bubble */}
        <div className={`relative px-4 py-2 rounded-2xl ${
          isOwn 
            ? 'bg-blue-500 text-white' 
            : 'bg-white text-gray-900 border border-gray-200'
        }`}>
          {/* Sender name for group chats */}
          {/* Fix: Use message.sender_username as the API provides this */}
          {!isOwn && message.sender_username && (
            <div className="text-xs text-blue-500 font-medium mb-1">
              {message.sender_username}
            </div>
          )}
          
          {/* Message content */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          {/* Time and status */}
          <div className={`flex items-center justify-end space-x-1 mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-400'
          }`}>
            <span className="text-xs">
              {formatMessageTime(message.sent_at)}
            </span>
            {isOwn && getStatusIcon()}
          </div>

          {/* Message tail */}
          <div className={`absolute bottom-0 w-3 h-3 ${
            isOwn 
              ? 'right-0 translate-x-1 bg-blue-500' 
              : 'left-0 -translate-x-1 bg-white border-l border-b border-gray-200'
          } transform rotate-45`} />
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;