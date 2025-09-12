import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Eye, EyeOff, Smartphone, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(() => {
    const storedStep = Number(localStorage.getItem("forgotPasswordStep") || 1);
    console.log(`[STATE] Initializing step to: ${storedStep}`);
    return storedStep;
  });
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("forgotPasswordData");
    if (savedData) {
      console.log("[STATE] Initializing formData from localStorage.");
      return JSON.parse(savedData);
    }
    console.log("[STATE] Initializing formData with empty values.");
    return {
      phone: '',
      otp: '',
      new_password: '',
      confirm_password: ''
    };
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { forgotPassword, resetPassword, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(`[EFFECT] Step or FormData changed. Current step is: ${step}`);
    console.log(`[EFFECT] Saving state to localStorage.`);
    localStorage.setItem("forgotPasswordStep", String(step));
    localStorage.setItem("forgotPasswordData", JSON.stringify(formData));
  }, [step, formData]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if(formData.phone.trim().length < 10){
      toast.error("Please enter a valid phone number.");
      setFormData((prev) => ({ ...prev, phone: '' }));
      return;
    }
    console.log("[FLOW] handleStep1Submit called.");
    const result = await forgotPassword(formData.phone);
    console.log("[API] forgotPassword API response:", result);
    
    if (result.success) {
      console.log("[FLOW] API call succeeded. Calling setStep(2)...");
      setStep(2);
      localStorage.setItem("forgotPasswordStep", "2"); // 🔥 sync localStorage immediately
    } else {
      toast.error(result.error || "Failed to send reset code. Please try again.");
      console.log("[FLOW] API call failed.");
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    console.log("[FLOW] handleStep2Submit called.");

    if (formData.new_password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    const result = await resetPassword({
      phone: formData.phone,
      otp: formData.otp,
      new_password: formData.new_password
    });

    if (result.success) {
      console.log("[FLOW] Password reset successful. Clearing localStorage and navigating.");
      localStorage.removeItem("forgotPasswordStep");
      localStorage.removeItem("forgotPasswordData");
      toast.success("Password reset successful! Please log in with your new password.");
      navigate('/login');
    }else{
      console.log("[FLOW] Password reset failed. Staying on step 2.");
      toast.error(result.error || "Failed to reset password. Please try again.");
      setFormData(prev => ({
          ...prev,
          otp: '',
          new_password: '',
          confirm_password: ''
      }));
    }
  };

  const goBack = () => {
    console.log("[FLOW] goBack called. Current step:", step);
    if (step === 1) {
      navigate('/login');
    } else {
      setStep(1);
      localStorage.setItem("forgotPasswordStep", "1"); // 🔥 sync localStorage immediately
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

        <button
          onClick={goBack}
          className="absolute left-6 top-6 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-xl">
            <MessageCircle size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text mb-1">MmChat</h1>
          <p className="text-xl font-bold bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 text-transparent bg-clip-text text-center tracking-wide">
            {step === 1 ? 'Forgot your password?' : 'Reset your password'}
          </p>
        </div>

        <div>
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Smartphone size={20} />
                </span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 bg-opacity-50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 border border-gray-700 hover:border-blue-500"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-full font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transition-transform transform hover:scale-105"
              >
                {loading ? <Loading size="sm" className="text-white" /> : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-gray-400 mb-2">We sent a reset code to:</p>
                <p className="font-semibold text-white text-lg">{formData.phone}</p>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <MessageCircle size={20} />
                </span>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                  className="w-full pl-12 pr-12 py-3 bg-gray-800 bg-opacity-50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 border border-gray-700 hover:border-blue-500 hide-password-toggle"
                  placeholder="Enter 6-digit code"
                  required
                />
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 bg-gray-800 bg-opacity-50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 border border-gray-700 hover:border-blue-500 hide-password-toggle"
                  placeholder="New Password"
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

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 bg-gray-800 bg-opacity-50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 border border-gray-700 hover:border-blue-500 hide-password-toggle"
                  placeholder="Confirm New Password"
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
                {loading ? <Loading size="sm" className="text-white" /> : 'Reset Password'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-center text-gray-400">
            Remember your password?{' '}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;