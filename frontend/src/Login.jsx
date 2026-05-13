import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import config from './config';
import { LogIn, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${config.API_BASE}/login`, { email, password });
      if (response.data.success) {
        localStorage.setItem('name', response.data.name);
        navigate('/');
      } else {
        setError(response.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Oh no! Something went wrong on our end. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faff] p-4 relative overflow-hidden">
      {/* Light Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]"></div>
      
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-500/5 border border-blue-50/50 relative z-10">
        <div className="flex justify-center mb-8">
          <div className="bg-blue-600 p-5 rounded-3xl shadow-xl shadow-blue-500/20">
            <LogIn className="text-white" size={36} />
          </div>
        </div>
        
        <h2 className="text-4xl font-black text-center text-slate-900 mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-slate-500 text-center mb-10 font-medium">Sign in to continue to Predictor</p>
        
        {error && (
          <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl mb-8 text-sm flex items-center gap-3 font-bold animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Mail size={14} className="text-blue-600" /> Email Address
            </label>
            <input
              type="email"
              required
              className="w-full bg-blue-50/30 border-2 border-blue-100/50 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Lock size={14} className="text-blue-600" /> Password
              </label>
              <Link to="/forgot-password" title="Forgot your password?" className="text-xs text-blue-600 hover:underline font-bold">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              required
              className="w-full bg-blue-50/30 border-2 border-blue-100/50 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'SIGN IN'}
          </button>
        </form>

        <div className="text-center mt-10">
          <p className="text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-black hover:underline">
              Register Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
