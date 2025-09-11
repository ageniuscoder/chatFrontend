import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Save, X, Phone, Video, Edit2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../common/Avatar';
import Loading from '../common/Loading';

const ProfilePage = () => {
  const { user, updateProfile, loading, error } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
  });
  const [previewAvatar, setPreviewAvatar] = useState(null);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updateData = {
      username: formData.username
    };

    if (previewAvatar) {
      updateData.profile_picture = previewAvatar;
    }

    const result = await updateProfile(updateData);

    if (result.success) {
      setIsEditing(false);
      setPreviewAvatar(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPreviewAvatar(null);
    setFormData({
      username: user?.username || '',
    });
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 antialiased font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-950 rounded-2xl shadow-xl shadow-purple-900/40 relative overflow-hidden transform transition-all duration-300">
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
          <button
            onClick={() => navigate('/chat')}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white drop-shadow-lg">Profile</h1>

          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-red-400 hover:bg-red-900/40 rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-colors flex items-center space-x-2 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? <Loading size="sm" /> : <Save className="w-4 h-4" />}
                  <span>Save</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors text-sm font-medium"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="relative z-10 p-6">
          <div className="bg-gray-900 rounded-2xl shadow-xl shadow-gray-900/40 overflow-hidden"> {/* Removed 'border border-gray-800' */}
            {/* Avatar and Info Section */}
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 py-8 px-6 text-center">
              <div
                className="relative inline-block cursor-pointer group"
                onClick={handleAvatarClick}
              >
                <Avatar
                  src={previewAvatar || user?.profile_picture}
                  alt={user?.username}
                  size="xl"
                  className="mx-auto transition-all duration-300 transform group-hover:scale-105" // Removed border classes here
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div className="mt-4">
                <h2 className="text-2xl font-extrabold text-white drop-shadow-lg">{user?.username}</h2>
                <p className="text-sm text-gray-400 mt-1">{user?.bio || 'Bio not set'}</p>
              </div>
            </div>

            {/* Profile Actions */}
            <div className="p-4 flex justify-around border-t border-gray-800">
              <button className="flex flex-col items-center text-gray-400 hover:text-green-400 transition-colors">
                <Phone className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Call</span>
              </button>
              <button className="flex flex-col items-center text-gray-400 hover:text-teal-400 transition-colors">
                <Video className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Video</span>
              </button>
              <button className="flex flex-col items-center text-gray-400 hover:text-blue-400 transition-colors">
                <Edit2 className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Edit</span>
              </button>
            </div>

            {/* Profile Details & Form */}
            <div className="p-6">
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-inner shadow-gray-900/50">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Username</h3>
                  <p className="text-base text-white">{user?.username}</p>
                </div>
                {error && (
                  <div className="bg-red-900/40 border border-red-700 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Stats */}
            <div className="border-t border-gray-800 pt-6 px-6 pb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-800 rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-800/30">
                  <p className="text-xl font-bold text-green-400">0</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Messages</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-800/30">
                  <p className="text-xl font-bold text-blue-400">0</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Conversations</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-800/30">
                  <p className="text-xl font-bold text-purple-400">0</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Groups</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;