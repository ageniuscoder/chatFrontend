import React, { useState } from 'react';
import { Search, Plus, Settings, LogOut, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useChat } from '../../contexts/ChatContext.jsx';
import { useWebSocketContext } from '../../contexts/WebSocketContext.jsx';
import Avatar from '../common/Avatar';
import { formatMessageTime } from '../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

const ConversationsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const { conversations, selectConversation, activeConversation, loading } = useChat();
  const { isConnected } = useWebSocketContext();
  const navigate = useNavigate();

  const filteredConversations = Array.isArray(conversations) ? conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToProfile = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  return (
    <>
      {/* Header with App Name, Logo, and User Profile */}
      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl mb-3 shadow-lg shadow-purple-900/30 relative overflow-visible">
        {/* Inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-10 animate-pulse-slow"></div>

        {/* App Logo and Name */}
        <div className="flex items-center space-x-2 relative z-10">
          <MessageCircle className="w-8 h-8 text-purple-400 mr-2 animate-pulse-fast" />
          <span className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg">MmChat</span>
        </div>

        {/* User Profile */}
        <div className="relative z-30"> {/* Increased z-index for this container */}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center p-1 rounded-full border-2 border-transparent hover:border-purple-500 transition-all duration-300 transform hover:scale-105"
          >
            <Avatar
              src={user?.profile_picture}
              alt={user?.username}
              size="md"
              online={isConnected}
            />
          </button>
          {showUserMenu && (
            // Stylish dropdown with high z-index
            <div className="absolute right-0 top-full mt-3 w-56 bg-gray-900 rounded-2xl shadow-3xl shadow-purple-800/70 border border-purple-700 py-2 z-50 animate-fade-in-down transform translate-x-1/4">
              <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700 mb-1 font-bold tracking-wide">
                <span className="text-white drop-shadow-md">{user?.username}</span>
              </div>
              <button
                onClick={goToProfile}
                className="w-full text-left px-4 py-2 text-md text-gray-200 hover:bg-purple-900/50 hover:text-purple-300 flex items-center space-x-3 transition-colors duration-200"
              >
                <User className="w-5 h-5 text-purple-400" />
                <span>Profile</span>
              </button>
              <button className="w-full text-left px-4 py-2 text-md text-gray-200 hover:bg-purple-900/50 hover:text-purple-300 flex items-center space-x-3 transition-colors duration-200">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>Settings</span>
              </button>
              <div className="border-t border-gray-700 my-2"></div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-md text-red-400 hover:bg-red-900/40 flex items-center space-x-3 transition-colors duration-200 rounded-b-xl"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-2 bg-gray-800 rounded-xl mb-3 shadow-lg shadow-blue-900/30 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 text-sm transition-all duration-300 shadow-inner shadow-gray-900/50"
          />
          {/* Plus icon inside the search bar */}
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-purple-700/50 text-white rounded-full hover:bg-purple-600 transition-all duration-300 transform hover:scale-110 shadow-lg shadow-purple-800/40">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="px-3 py-2 bg-yellow-900/40 border border-yellow-700 rounded-lg mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse-slow shadow-lg shadow-yellow-700"></div>
            <span className="text-xs text-yellow-300 font-medium">Connecting...</span>
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar-dark p-2 bg-gray-800 rounded-xl shadow-lg shadow-purple-900/30">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-6 h-6 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin-slow"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-6 text-gray-600">
            <div className="mb-3">
              <MessageCircle className="w-12 h-12 mx-auto text-purple-600 opacity-60" />
            </div>
            <p className="text-base font-semibold text-white">No active conversations</p>
            <p className="text-xs text-gray-400 mt-1">Start a new one.</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => selectConversation(conversation)}
              className={`p-3 mb-2 rounded-lg cursor-pointer transition-all duration-300 relative overflow-hidden group
                ${activeConversation?.id === conversation.id
                  ? 'bg-blue-800/50 shadow-lg shadow-blue-700/40 border border-blue-600 transform scale-[1.01]'
                  : 'bg-gray-700/40 hover:bg-gray-700/60 border border-gray-700'
                }
              `}
            >
              {activeConversation?.id === conversation.id && (
                <div className="absolute inset-0 bg-blue-500 opacity-10 blur-md animate-pulse-light"></div>
              )}
              <div className="flex items-center space-x-3 relative z-10">
                <Avatar
                  src={conversation.avatar}
                  alt={conversation.name}
                  size="md"
                  online={conversation.is_online}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-extrabold text-white text-base truncate drop-shadow-md">
                      {conversation.name}
                    </h3>
                    {conversation.last_message && (
                      <span className="text-xs text-gray-400 flex-shrink-0 group-hover:text-blue-300">
                        {formatMessageTime(conversation.last_message?.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-300 truncate group-hover:text-white">
                      {conversation.last_message?.content || 'No messages yet'}
                    </p>
                    {conversation.unread_count > 0 && (
                      <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center flex-shrink-0 shadow-lg shadow-purple-800/50 animate-bounce-slow">
                        {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default ConversationsList;