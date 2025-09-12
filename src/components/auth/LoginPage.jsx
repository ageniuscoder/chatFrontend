import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Eye, EyeOff, User, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ stop refresh

    try {
      const result = await login(formData.username.trim(), formData.password);

      if (result?.success) {
        navigate('/chat', { replace: true }); // ✅ prevents extra refresh
      } else {
        toast.error(result?.error || 'Invalid username or password.');
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 flex items-center justify-center p-4">
      <style>
        {`
          .hide-password-toggle::-ms-reveal,
          .hide-password-toggle::-ms-clear {
            display: none;
          }
          .hide-password-toggle::-webkit-password-toggle-button {
            display: none;
          }
        `}
      </style>

      <div className="relative max-w-md w-full bg-gray-900 bg-opacity-70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-white">

        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-xl">
            <MessageCircle size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text mb-1">
            MmChat
          </h1>
          <p className="text-xl font-bold bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 text-transparent bg-clip-text text-center tracking-wide">
            Sign in to continue chatting
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Username */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <User size={20} />
            </span>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 border border-gray-700 hover:border-blue-500"
              placeholder="Username"
              autoComplete="username"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={20} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-12 py-3 bg-gray-800 bg-opacity-50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 border border-gray-700 hover:border-blue-500 hide-password-toggle"
              placeholder="Password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>


          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-full font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transition-transform transform hover:scale-105"
          >
            {loading ? <Loading size="sm" className="text-white" /> : 'Sign In'}
          </button>

          <div className="text-center mt-4">
            <Link
              to="/forgot-password"
              className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-center text-gray-400">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
