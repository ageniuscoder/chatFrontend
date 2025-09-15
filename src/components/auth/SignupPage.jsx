import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, User, Smartphone, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading';
import { toast } from 'react-toastify';

const SignupPage = () => {
  const [step, setStep] = useState(() => Number(localStorage.getItem("signupStep") || 1));

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("signupData");
    if (savedData) {
      return JSON.parse(savedData);
    }
    return {
      username: '',
      phone: '',
      password: '',
      confirmPassword: '',
      otp: ''
    };
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signupInitiate, signupVerify, loading } = useAuth();
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    const result = await signupInitiate({
      username: formData.username,
      phone: formData.phone,
      password: formData.password
    });

    if (result.success) {
      setStep(2);
      localStorage.setItem("signupStep", "2");
      localStorage.setItem("signupData", JSON.stringify(formData));
    } else {
      toast.error(result.error);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();

    const otp = formData.otp.trim();
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    const result = await signupVerify({
      username: formData.username,
      phone: formData.phone,
      password: formData.password,
      otp
    });

    if (result.success) {
      localStorage.removeItem("signupStep");
      localStorage.removeItem("signupData");
      navigate('/chat');
    } else {
      if (Array.isArray(result.error)) {
        result.error.forEach(err => toast.error(err.message));
      } else {
        toast.error(result.error);
      }
    }
  };

  const goBack = () => {
    setStep(1);
    localStorage.setItem("signupStep", "1");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 flex items-center justify-center p-4">
      {/* CSS to hide browser's default password toggle icon */}
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

        {step === 2 && (
          <button
            onClick={goBack}
            className="absolute left-6 top-6 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}

        {/* Logo and App Name */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-xl">
            <MessageCircle size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text mb-1">MmChat</h1>
          <p className="text-xl font-bold bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 text-transparent bg-clip-text text-center tracking-wide">
            {step === 1 ? 'Join the conversation today' : 'Enter the OTP sent to your phone'}
          </p>
        </div>

        {/* Form Content */}
        <div>
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              {/* Username Field */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={20} />
                </span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 border border-gray-700 hover:border-blue-500"
                  placeholder="Username"
                  required
                />
              </div>

              {/* Phone Number Field */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Smartphone size={20} />
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 border border-gray-700 hover:border-blue-500"
                  placeholder="Phone Number (e.g. +919876543210)"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 bg-gray-800 bg-opacity-50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 border border-gray-700 hover:border-blue-500 hide-password-toggle"
                  placeholder="Password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 bg-gray-800 bg-opacity-50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 border border-gray-700 hover:border-blue-500 hide-password-toggle"
                  placeholder="Confirm Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-full font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transition-transform transform hover:scale-105"
              >
                {loading ? <Loading size="sm" className="text-white" /> : 'Sign Up'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-gray-400 mb-2">We sent a verification code to:</p>
                <p className="font-semibold text-white text-lg">{formData.phone}</p>
              </div>

              <div className="relative">
                <input
                  ref={(el) => otpRefs.current[0] = el}
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                  className="w-full py-4 bg-gray-800 bg-opacity-50 text-white rounded-xl text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 border border-gray-700 hover:border-blue-500"
                  placeholder="------"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-full font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transition-transform transform hover:scale-105"
              >
                {loading ? <Loading size="sm" className="text-white" /> : 'Verify & Create Account'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-center text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;