import React, { useState, useEffect } from 'react';
import { X, UserCheck, Crown } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { conversationAPI } from '../../utils/api';
import Avatar from '../common/Avatar';
import Loading from '../common/Loading';

const GroupMembersModal = ({ isOpen, onClose, conversation }) => {
  const { data, loading, execute } = useApi(conversationAPI.getParticipants);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (isOpen && conversation?.id) {
      execute(conversation.id);
    }
  }, [isOpen, conversation, execute]);

  useEffect(() => {
    if (data?.participants) {
      setMembers(data.participants);
    }
  }, [data]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-gray-950 bg-opacity-90 backdrop-blur-sm z-40 flex items-start justify-center pt-7 rounded-xl">
      <div className="bg-gray-900 rounded-2xl p-6 w-4/5 shadow-3xl shadow-purple-800/70 border border-purple-700 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Group Members</h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loading size="lg" className="text-blue-500" />
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl max-h-[70vh] overflow-y-auto custom-scrollbar-dark p-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-4 p-3 mb-2 rounded-lg bg-gray-700/40 hover:bg-gray-700 transition-colors"
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
    </div>
  );
};

export default GroupMembersModal;
