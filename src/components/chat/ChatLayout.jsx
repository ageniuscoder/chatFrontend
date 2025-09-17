import React from 'react';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';
import { useChat } from '../../contexts/ChatContext';
import { MessageCircle } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';

const ChatLayout = () => {
  const { activeConversation, selectConversation } = useChat();
  const isMobile = useMediaQuery({ maxWidth: 768 }); // A common breakpoint for mobile devices

  const handleBack = () => {
    selectConversation(null); // Deselect the active conversation
  };

  return (
    <div className="flex h-screen bg-black text-gray-100 antialiased font-sans">
      <div className="flex-1 flex border border-transparent rounded-lg relative overflow-hidden">
        {/* Neon Border Effect */}
        <div className="absolute inset-0 border border-blue-500 rounded-lg opacity-30 pointer-events-none animate-pulse-light z-0"></div>

        {/* Left Sidebar - Conversations */}
        <div className={`flex flex-col p-3 z-10 relative ${isMobile ? 'w-full' : 'w-80 bg-gray-900 border-r border-gray-800'}`} style={{ display: isMobile && activeConversation ? 'none' : 'flex' }}>
          {/* Top border glow */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 opacity-75"></div>
          {/* Left border glow */}
          <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-purple-500 to-blue-500 opacity-75"></div>
          {/* Bottom border glow */}
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 opacity-75"></div>
          {/* Right border glow */}
          <div className="absolute top-0 right-0 h-full w-0.5 bg-gradient-to-b from-purple-500 to-blue-500 opacity-75"></div>

          <ConversationsList />
        </div>

        {/* Right Panel - Chat Window */}
        <div className={`flex-1 flex flex-col bg-gray-950 p-4 z-10 relative ${isMobile && !activeConversation ? 'hidden' : ''}`}>
          {/* Top border glow */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-500 to-teal-500 opacity-75"></div>
          {/* Right border glow */}
          <div className="absolute top-0 right-0 h-full w-0.5 bg-gradient-to-b from-green-500 to-teal-500 opacity-75"></div>
          {/* Bottom border glow */}
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-500 to-teal-500 opacity-75"></div>
          {/* Left border glow */}
          <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-green-500 to-teal-500 opacity-75"></div>

          {activeConversation ? (
            <ChatWindow onBack={isMobile ? handleBack : null} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-900 rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-30 animate-pulse-slow"></div>
              <div className="text-center text-gray-500 relative z-10">
                <MessageCircle className="w-20 h-20 mx-auto mb-4 text-purple-600 drop-shadow-md animate-bounce-slow" />
                <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">Select a conversation</h3>
                <p className="text-base text-gray-400">Choose a conversation from the sidebar to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;