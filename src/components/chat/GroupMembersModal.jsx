import React, { useState, useEffect } from 'react';
import { X, UserCheck, Crown, Search, UserPlus, MessageCircle, UserX } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { conversationAPI, featureAPI } from '../../utils/api';
import Avatar from '../common/Avatar';
import Loading from '../common/Loading';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const GroupMembersModal = ({ isOpen, onClose, conversation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { data, loading: membersLoading, execute } = useApi(conversationAPI.getParticipants);
  const { data: searchResults, loading: searchLoading, execute: searchUsers, reset: resetSearchResults } = useApi(featureAPI.searchUsers);
  const { addParticipantToGroup, removeParticipantFromGroup, createPrivateChat } = useChat();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    if (isOpen && conversation?.id) {
      execute(conversation.id);
      setSearchTerm('');
      resetSearchResults();
      setSelectedMember(null);
    }
  }, [isOpen, conversation, execute, resetSearchResults]);

  useEffect(() => {
    if (data?.participants) {
      setMembers(data.participants);
      const currentUserIsAdmin = data.participants.some(p => p.id === user.id && p.is_admin);
      setIsAdmin(currentUserIsAdmin);
    }
  }, [data, user]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    if (query.length > 2) {
      await searchUsers(query);
    } else {
      resetSearchResults();
    }
  };

  const handleAddMember = async (userId) => {
    const result = await addParticipantToGroup(conversation.id, userId);
    if (result.success) {
      toast.success('Member added successfully!');
      execute(conversation.id);
      setSearchTerm('');
      resetSearchResults();
    } else {
      toast.error(result.error || 'Failed to add member.');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (userId === user.id || members.length <= 1) {
      toast.error("Cannot remove this member.");
      return;
    }
    const result = await removeParticipantFromGroup(conversation.id, userId);
    if (result.success) {
      toast.success('Member removed successfully!');
      execute(conversation.id);
      setSelectedMember(null);
    } else {
      toast.error(result.error || 'Failed to remove member.');
    }
  };

  const handleMessageMember = async (userId) => {
    await createPrivateChat(userId);
    onClose();
  };

  if (!isOpen) return null;

  const users = searchResults?.users || [];

  return (
    <div className="absolute inset-0 bg-gray-950 bg-opacity-90 backdrop-blur-sm z-40 flex items-start justify-center pt-7 rounded-xl">
      <div className="bg-gray-900 rounded-2xl p-6 w-[calc(100%-1.5rem)] shadow-3xl shadow-purple-800/70 border border-purple-700 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Group Members</h2>
        
        {isAdmin && (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
              <input
                type="text"
                placeholder="Search for a user to add..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-sm"
              />
            </div>

            {searchLoading && <p className="text-center text-gray-400 animate-pulse">Searching...</p>}
            {!searchLoading && searchTerm.length > 2 && users.length === 0 && <p className="text-center text-gray-500">No users found.</p>}
            {users.length > 0 && (
              <div className="bg-gray-800 rounded-xl max-h-60 overflow-y-auto custom-scrollbar-dark p-2 mb-4">
                {users.map(user => {
                  const isAlreadyMember = members.some(member => member.id === user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => !isAlreadyMember && handleAddMember(user.id)}
                      className={`flex items-center space-x-3 p-3 mb-2 rounded-lg ${isAlreadyMember ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-700 transition-colors'}`}
                    >
                      <Avatar src={user.profile_picture} alt={user.username} size="md" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{user.username}</p>
                      </div>
                      {!isAlreadyMember && (
                        <UserPlus size={20} className="text-purple-400 flex-shrink-0" />
                      )}
                      {isAlreadyMember && (
                        <UserCheck size={20} className="text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {membersLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loading size="lg" className="text-blue-500" />
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl max-h-[70vh] overflow-y-auto custom-scrollbar-dark p-2">
            <h3 className="text-white font-bold text-lg mb-2">Current Members</h3>
            {members.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="flex items-center space-x-4 p-3 mb-2 rounded-lg bg-gray-700/40 hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <Avatar src={member.profile_picture} alt={member.username} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{member.username}</p>
                </div>
                {member.is_admin && (
                  <span className="text-purple-400 flex items-center space-x-1">
                    <Crown size={16} />
                    <span className="text-xs">Admin</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMember && (
        <div className="absolute inset-0 bg-gray-950 bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
          <div className="bg-gray-900 rounded-2xl p-6 w-[calc(100%-1.5rem)] max-w-sm shadow-3xl shadow-purple-800/70 border border-purple-700 relative animate-fade-in-up">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col items-center justify-center mb-6">
              <Avatar src={selectedMember.profile_picture} alt={selectedMember.username} size="lg" />
              <h3 className="text-xl font-bold text-white mt-3">{selectedMember.username}</h3>
            </div>

            <div className="space-y-3">
              {selectedMember.id !== user.id && (
                <button
                  onClick={() => handleMessageMember(selectedMember.id)}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-bold text-sm hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  <MessageCircle size={20} />
                  <span>Message</span>
                </button>
              )}

              {isAdmin && selectedMember.id !== user.id && (
                <button
                  onClick={() => handleRemoveMember(selectedMember.id)}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-red-900/40 border border-red-700 rounded-lg text-red-400 font-bold text-sm hover:bg-red-800/40 transition-all duration-300 transform hover:scale-105"
                >
                  <UserX size={20} />
                  <span>Remove from Group</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupMembersModal;