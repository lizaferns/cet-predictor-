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
        if (value.trim().length < 2) error = 'Oops! Your name is a bit too short. Please enter your full name.';
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) error = "That email doesn't look quite right. Could you double-check the format?";
        break;
      case 'phone':
        if (value.length !== 10) {
          error = 'The phone number should be exactly 10 digits.';
        } else if (!/^[6-9]/.test(value)) {
          error = 'The phone number should start with 6, 7, 8, or 9.';
        }
        break;
      case 'password':
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
        if (!passwordRegex.test(value)) {
          error = 'Passwords need 8+ chars, uppercase, lowercase, number, and special char.';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          error = "Wait, those passwords don't match! Let's try typing them again.";
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
          ? "Wait, those passwords don't match! Let's try typing them again." 
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
      setError('Please enter the verification code sent to your email.');
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
        setSuccess(response.data.message || 'Hooray! Account created! Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.data.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Oh no! Something went wrong on our end.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
      <div className="card w-full max-w-md bg-white shadow-2xl relative z-10 p-8 rounded-[2.5rem] border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-500/20">
            <UserPlus className="text-white" size={32} />
          </div>
        </div>
        <h2 className="text-4xl font-black text-center text-slate-900 mb-2 tracking-tight">Join Us</h2>
        <p className="text-slate-500 text-center mb-10 font-medium">Verify your email to start predicting</p>
        
        {error && (
          <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm flex items-center gap-2 font-bold animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-100 text-green-600 p-4 rounded-2xl mb-6 text-sm flex items-center gap-2 font-bold animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {!otpSent ? (
            <>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} className="text-blue-600" /> Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:outline-none transition-all ${fieldErrors.name ? 'border-red-200' : ''}`}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
                {fieldErrors.name && <p className="text-[10px] text-red-500 font-bold px-2">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} className="text-blue-600" /> Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:outline-none transition-all ${fieldErrors.email ? 'border-red-200' : ''}`}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {fieldErrors.email && <p className="text-[10px] text-red-500 font-bold px-2">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone size={14} className="text-blue-600" /> Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:outline-none transition-all ${fieldErrors.phone ? 'border-red-200' : ''}`}
                  placeholder="1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {fieldErrors.phone && <p className="text-[10px] text-red-500 font-bold px-2">{fieldErrors.phone}</p>}
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Lock size={14} className="text-blue-600" /> Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:outline-none transition-all ${fieldErrors.password ? 'border-red-200' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                {formData.password && (
                  <div className="flex items-center gap-2 mt-1 px-2">
                    <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          getPasswordStrength(formData.password) === 'Weak' ? 'bg-red-500 w-1/3' :
                          getPasswordStrength(formData.password) === 'Medium' ? 'bg-yellow-500 w-2/3' :
                          'bg-green-500 w-full'
                        }`}
                      ></div>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      getPasswordStrength(formData.password) === 'Weak' ? 'text-red-500' :
                      getPasswordStrength(formData.password) === 'Medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {getPasswordStrength(formData.password)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Lock size={14} className="text-blue-600" /> Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:outline-none transition-all ${fieldErrors.confirmPassword ? 'border-red-200' : ''}`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={otpLoading || !isDetailsValid()}
                className={`font-black py-4 w-full rounded-2xl shadow-xl transition-all flex items-center justify-center mt-6 gap-2 ${
                  !isDetailsValid() 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95'
                }`}
              >
                {otpLoading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20} /> SEND VERIFICATION CODE</>}
              </button>
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-600" /> Verification Code
                </label>
                <input
                  name="otp"
                  type="text"
                  required
                  maxLength="6"
                  className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl p-6 font-black text-slate-900 text-center text-3xl tracking-[1em] focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="000000"
                  value={formData.otp}
                  onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})}
                />
                <p className="text-center text-xs text-slate-400 font-medium">Check your email for the 6-digit code</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black py-5 w-full rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'COMPLETE REGISTRATION'}
              </button>

              <button 
                type="button" 
                onClick={() => setOtpSent(false)} 
                className="w-full text-slate-500 text-sm hover:text-blue-600 font-bold transition-colors"
              >
                Change Details
              </button>
            </div>
          )}
        </form>

        <p className="text-center mt-8 text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-black hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
