import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, User, Mail, Lock, Loader2, CheckCircle2, Phone } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
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

  const isFormValid = () => {
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
      // Special case for confirmPassword when password changes
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

  const handleRegister = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    setFieldErrors({});
    setSuccess('');
    
    try {
      const response = await axios.post('/api/register', {
        username: formData.name.toLowerCase().replace(/\s/g, ''),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      
      if (response.data.success) {
        setSuccess(response.data.message || 'Hooray! Your account is ready. Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(response.data.message || 'Something went wrong with the registration.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Oh no! Something went wrong on our end. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
      <div className="card w-full max-w-md bg-white shadow-2xl relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-500/20">
            <UserPlus className="text-white" size={32} />
          </div>
        </div>
        <h2 className="text-4xl font-black text-center text-slate-900 mb-2">Create Account</h2>
        <p className="text-slate-500 text-center mb-10 font-medium">Join us to start predicting your future</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-6 text-sm flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded mb-6 text-sm flex items-center gap-2">
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User size={16} className="text-blue-600" /> Full Name
            </label>
            <input
              name="name"
              type="text"
              required
              className={`input-field border-slate-200 bg-white text-slate-900 focus:border-blue-500 ${fieldErrors.name ? 'border-red-500 focus:border-red-500' : ''}`}
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
            />
            {fieldErrors.name && <p className="text-[10px] text-red-500 font-bold">{fieldErrors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Mail size={16} className="text-blue-600" /> Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              className={`input-field border-slate-200 bg-white text-slate-900 focus:border-blue-500 ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            {fieldErrors.email && <p className="text-[10px] text-red-500 font-bold">{fieldErrors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Phone size={16} className="text-blue-600" /> Phone Number
            </label>
            <input
              name="phone"
              type="tel"
              required
              className={`input-field border-slate-200 bg-white text-slate-900 focus:border-blue-500 ${fieldErrors.phone ? 'border-red-500 focus:border-red-500' : ''}`}
              placeholder="1234567890"
              value={formData.phone}
              onChange={handleChange}
            />
            {fieldErrors.phone && <p className="text-[10px] text-red-500 font-bold">{fieldErrors.phone}</p>}
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Lock size={16} className="text-blue-600" /> Password
            </label>
            <input
              name="password"
              type="password"
              required
              className={`input-field border-slate-200 bg-white text-slate-900 focus:border-blue-500 ${fieldErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            {fieldErrors.password && <p className="text-[10px] text-red-500 font-bold">{fieldErrors.password}</p>}
            {formData.password && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      getPasswordStrength(formData.password) === 'Weak' ? 'bg-red-500 w-1/3' :
                      getPasswordStrength(formData.password) === 'Medium' ? 'bg-yellow-500 w-2/3' :
                      'bg-green-500 w-full'
                    }`}
                  ></div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${
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
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Lock size={16} className="text-blue-600" /> Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              className={`input-field border-slate-200 bg-white text-slate-900 focus:border-blue-500 ${fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {fieldErrors.confirmPassword && <p className="text-[10px] text-red-500 font-bold">{fieldErrors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || success || !isFormValid()}
            className={`font-black py-4 w-full rounded-2xl shadow-xl transition-all flex items-center justify-center mt-4 ${
              !isFormValid() 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95'
            }`}
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'REGISTER'}
          </button>
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
