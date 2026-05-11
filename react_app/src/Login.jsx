import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
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
      const response = await axios.post('/api/login', { email, password });
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
      <div className="card w-full max-w-md bg-white shadow-2xl relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-500/20">
            <LogIn className="text-white" size={32} />
          </div>
        </div>
        <h2 className="text-4xl font-black text-center text-slate-900 mb-2">Welcome Back</h2>
        <p className="text-slate-500 text-center mb-10 font-medium">Sign in to access your predictor</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-6 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Mail size={16} className="text-blue-600" /> Email Address
            </label>
            <input
              type="email"
              required
              className="input-field border-slate-200 bg-white text-slate-900 focus:border-blue-500"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Lock size={16} className="text-blue-600" /> Password
              </label>
              <Link to="/forgot-password" display="inline-block" className="text-xs text-blue-600 hover:underline font-bold">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              className="input-field border-slate-200 bg-white text-slate-900 focus:border-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 w-full rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'SIGN IN'}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-black hover:underline">
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
