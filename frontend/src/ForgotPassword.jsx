import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import config from './config';
import { Mail, Lock, Loader2, KeyRound, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${config.API_BASE}/forgot-password`, { email });
      if (response.data.success) {
        setMessage(response.data.message || "We've sent a special code to your email!");
        setStep(2);
      } else {
        setError(response.data.message || "Hmm, we couldn't send the code. Is the email correct?");
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Oh no! Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${config.API_BASE}/verify-otp`, { email, otp });
      if (response.data.success) {
        setMessage(response.data.message || "Great! OTP verified. Now let's set a new password.");
        setStep(3);
      } else {
        setError(response.data.message || "That code doesn't seem right. Could you double-check it?");
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "Invalid code. Let's try that again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${config.API_BASE}/reset-password`, { email, otp, new_password: newPassword });
      if (response.data.success) {
        setMessage('Hooray! Your password has been updated. Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(response.data.message || "We couldn't reset your password. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to reset password. Please try again.');
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
            <KeyRound className="text-white" size={32} />
          </div>
        </div>
        
        <div className="flex justify-between mb-8 px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= s ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-400'}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-1 transition-all duration-300 ${step > s ? 'bg-blue-600' : 'bg-slate-100'}`}></div>}
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-black text-center text-slate-900 mb-2">
          {step === 1 && 'Recover Access'}
          {step === 2 && 'Check Your Mail'}
          {step === 3 && 'New Password'}
        </h2>
        <p className="text-slate-500 text-center mb-8 font-medium">
          {step === 1 && "We'll send you a secure code to reset your password."}
          {step === 2 && `We've sent a 6-digit code to ${email}`}
          {step === 3 && "Create a new secure password for your account."}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-6 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}
        {message && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded mb-6 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={18} /> {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Mail size={16} className="text-blue-600" /> Email Address</label>
              <input type="email" required className="input-field border-slate-200 bg-white text-slate-900 focus:border-blue-500" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 w-full rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center">
              {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <><ArrowRight size={20} className="mr-2" /> Send Code</>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><ShieldCheck size={16} className="text-blue-600" /> 6-Digit OTP</label>
              <input type="text" required maxLength="6" className="input-field border-slate-200 bg-white text-slate-900 focus:border-blue-500 text-center text-2xl tracking-widest font-black" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 w-full rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center">
              {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Verify OTP'}
            </button>
            <button type="button" onClick={() => { setStep(1); setError(''); setMessage(''); }} className="w-full text-slate-500 text-sm hover:text-blue-600 font-bold">Change Email</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Lock size={16} className="text-blue-600" /> New Password</label>
              <input type="password" required className="input-field border-slate-200 bg-white text-slate-900 focus:border-blue-500" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 w-full rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center">
              {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="text-center mt-8">
          <Link to="/login" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-bold">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
