import React, { useState } from 'react';
import { X, Search, UserPlus, Users, MessageCircle } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import Avatar from '../common/Avatar';
import { useApi } from '../../hooks/useApi';
import { featureAPI } from '../../utils/api';
import {toast} from 'react-toastify';

const CreateChatModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('private');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');

  const { createPrivateChat, createGroupChat } = useChat();
  const { data: searchResults, loading: searchLoading, execute: searchUsers } = useApi(featureAPI.searchUsers);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    if (query.length > 2) {
      await searchUsers(query);
    }
  };

  const handleCreatePrivateChat = async (userId) => {
   const chat= await createPrivateChat(userId);
   if(chat){
    onClose();
   }
  };

  const handleCreateGroupChat = async (e) => {
    e.preventDefault();
    if (selectedMembers.length === 0 || !groupName) {
      toast.error("Please provide a group name and select at least one member.");
      return;
    }
    const memberIDs = selectedMembers.map(m => m.id);
    await createGroupChat({ name: groupName, member_ids: memberIDs });
    onClose();
  };

  const handleAddMember = (user) => {
    if (!selectedMembers.some(member => member.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
      setSearchTerm('');
    }
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(member => member.id !== userId));
  };

  if (!isOpen) return null;

  const users = searchResults?.users || [];

  return (
    <div className="absolute inset-0 bg-gray-950 bg-opacity-90 backdrop-blur-sm z-40 flex items-center justify-center rounded-xl">
      <div className="bg-gray-900 rounded-2xl p-6 w-[calc(100%-1.5rem)] shadow-3xl shadow-purple-800/70 border border-purple-700 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Create New Chat</h2>

        {/* Tabs */}
        <div className="flex justify-center mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('private')}
            className={`flex-1 text-center py-2 px-4 transition-colors font-medium relative z-10
              ${activeTab === 'private'
                ? 'text-purple-400 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-0.5 after:bg-purple-400 after:shadow-lg after:shadow-purple-500/50'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            Private Chat
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`flex-1 text-center py-2 px-4 transition-colors font-medium relative z-10
              ${activeTab === 'group'
                ? 'text-purple-400 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-0.5 after:bg-purple-400 after:shadow-lg after:shadow-purple-500/50'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            Group Chat
          </button>
        </div>

        {/* Private Chat Tab */}
        {activeTab === 'private' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
              <input
                type="text"
                placeholder="Search for a user by username..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-sm"
              />
            </div>
            {searchLoading && <p className="text-center text-gray-400 animate-pulse">Searching...</p>}
            {!searchLoading && searchTerm.length > 2 && users.length === 0 && <p className="text-center text-gray-500">No users found.</p>}
            {users.length > 0 && (
              <div className="bg-gray-800 rounded-xl max-h-60 overflow-y-auto custom-scrollbar-dark p-2">
                {users.map(user => (
                  <div
                    key={user.id}
                    onClick={() => handleCreatePrivateChat(user.id)}
                    className="flex items-center space-x-3 p-3 mb-2 rounded-lg cursor-pointer bg-gray-700/40 hover:bg-gray-700 transition-colors"
                  >
                    <Avatar src={user.profile_picture} alt={user.username} size="md" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{user.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Group Chat Tab */}
        {activeTab === 'group' && (
          <form onSubmit={handleCreateGroupChat} className="space-y-6">
            <div>
              <label htmlFor="groupName" className="text-gray-300 text-sm font-medium">Group Name</label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                placeholder="Enter group name"
                required
              />
            </div>
            <div>
              <label htmlFor="memberSearch" className="text-gray-300 text-sm font-medium">Add Members</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type="text"
                  id="memberSearch"
                  placeholder="Search users to add..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-sm"
                />
              </div>
            </div>
            {searchLoading && <p className="text-center text-gray-400 animate-pulse">Searching...</p>}
            {!searchLoading && searchTerm.length > 2 && users.length === 0 && <p className="text-center text-gray-500">No users found.</p>}
            {users.length > 0 && (
              <div className="bg-gray-800 rounded-xl max-h-40 overflow-y-auto custom-scrollbar-dark p-2">
                {users.map(user => (
                  <div
                    key={user.id}
                    onClick={() => handleAddMember(user)}
                    className="flex items-center space-x-3 p-3 mb-2 rounded-lg cursor-pointer bg-gray-700/40 hover:bg-gray-700 transition-colors"
                  >
                    <Avatar src={user.profile_picture} alt={user.username} size="md" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{user.username}</p>
                    </div>
                    <UserPlus size={20} className="text-purple-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
            {selectedMembers.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-3">
                <h4 className="text-white font-medium mb-2">Selected Members:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map(member => (
                    <div
                      key={member.id}
                      className="bg-purple-900/40 text-purple-200 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                    >
                      <span>{member.username}</span>
                      <button type="button" onClick={() => handleRemoveMember(member.id)} className="text-purple-400 hover:text-white">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg text-white font-bold text-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-purple-800/50 transform hover:scale-105"
            >
              Create Group
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateChatModal;