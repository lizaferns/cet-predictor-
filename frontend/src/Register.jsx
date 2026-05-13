import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import config from './config';
import { UserPlus, User, Mail, Lock, Loader2, CheckCircle2, Phone, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (value.trim().length < 2) error = 'Oops! Your name is a bit too short.';
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) error = "Please enter a valid email address.";
        break;
      case 'phone':
        if (value.length !== 10) {
          error = 'Phone number must be 10 digits.';
        } else if (!/^[6-9]/.test(value)) {
          error = 'Phone number must start with 6-9.';
        }
        break;
      case 'password':
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
        if (!passwordRegex.test(value)) {
          error = 'Need 8+ chars, upper, lower, number & symbol.';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          error = "Passwords do not match.";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const isDetailsValid = () => {
    const { name, email, phone, password, confirmPassword } = formData;
    return (
      name.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      phone.length === 10 &&
      /^[6-9]/.test(phone) &&
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password) &&
      password === confirmPassword &&
      !fieldErrors.name && !fieldErrors.email && !fieldErrors.phone && !fieldErrors.password && !fieldErrors.confirmPassword
    );
  };

  const getPasswordStrength = (password) => {
    if (!password) return '';
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === 'phone') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      if (name === 'password') {
        const confirmErr = updated.confirmPassword && updated.confirmPassword !== newValue 
          ? "Passwords do not match." 
          : '';
        setFieldErrors(prevErrs => ({ ...prevErrs, confirmPassword: confirmErr }));
      }
      return updated;
    });

    const error = validateField(name, newValue);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSendOTP = async () => {
    if (!isDetailsValid()) return;
    setOtpLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`${config.API_BASE}/send-registration-otp`, { email: formData.email });
      if (response.data.success) {
        setOtpSent(true);
        setSuccess(response.data.message || 'OTP sent! Please check your email.');
      } else {
        setError(response.data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Error sending OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      setError('Please enter the verification code.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post(`${config.API_BASE}/register`, {
        username: formData.name.toLowerCase().replace(/\s/g, '') + Math.floor(Math.random() * 1000),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        otp: formData.otp
      });
      
      if (response.data.success) {
        setSuccess(response.data.message || 'Account created! Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.data.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faff] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]"></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-500/5 border border-blue-50/50 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-5 rounded-3xl shadow-xl shadow-blue-500/20">
            <UserPlus className="text-white" size={36} />
          </div>
        </div>
        
        <h2 className="text-4xl font-black text-center text-slate-900 mb-2 tracking-tight">Create Account</h2>
        <p className="text-slate-500 text-center mb-10 font-medium">Join us to start predicting</p>
        
        {error && (
          <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 font-bold animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-100 text-green-600 p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 font-bold animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={20} /> {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {!otpSent ? (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} className="text-blue-600" /> Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className={`w-full bg-blue-50/30 border-2 border-blue-100/50 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all ${fieldErrors.name ? 'border-red-200' : ''}`}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} className="text-blue-600" /> Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className={`w-full bg-blue-50/30 border-2 border-blue-100/50 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all ${fieldErrors.email ? 'border-red-200' : ''}`}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone size={14} className="text-blue-600" /> Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  className={`w-full bg-blue-50/30 border-2 border-blue-100/50 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all ${fieldErrors.phone ? 'border-red-200' : ''}`}
                  placeholder="1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Lock size={14} className="text-blue-600" /> Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className={`w-full bg-blue-50/30 border-2 border-blue-100/50 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all ${fieldErrors.password ? 'border-red-200' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Lock size={14} className="text-blue-600" /> Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className={`w-full bg-blue-50/30 border-2 border-blue-100/50 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all ${fieldErrors.confirmPassword ? 'border-red-200' : ''}`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={otpLoading || !isDetailsValid()}
                className={`font-black py-5 w-full rounded-2xl shadow-xl transition-all flex items-center justify-center mt-6 gap-2 ${
                  !isDetailsValid() 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95'
                }`}
              >
                {otpLoading ? <Loader2 className="animate-spin" size={24} /> : <><ArrowRight size={24} /> SEND OTP</>}
              </button>
            </>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  <ShieldCheck size={18} className="text-blue-600" /> Enter 6-Digit Code
                </label>
                <input
                  name="otp"
                  type="text"
                  required
                  maxLength="6"
                  className="w-full bg-blue-50 border-2 border-blue-100 rounded-3xl p-6 font-black text-slate-900 text-center text-4xl tracking-[0.5em] focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="000000"
                  value={formData.otp}
                  onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black py-5 w-full rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={24} /> : 'VERIFY & REGISTER'}
              </button>

              <button 
                type="button" 
                onClick={() => setOtpSent(false)} 
                className="w-full text-slate-500 text-sm hover:text-blue-600 font-bold"
              >
                Go Back
              </button>
            </div>
          )}
        </form>

        <div className="text-center mt-10">
          <p className="text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-black hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
