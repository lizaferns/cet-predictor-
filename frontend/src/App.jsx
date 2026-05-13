import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Lock,
  User,
  Mail,
  Phone,
  Search,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import config from './config';
import Landing from './pages/Landing';

// API Configuration
const API_BASE = config.API_BASE;

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login', 'register', 'forgot'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Prediction State
  const [filters, setFilters] = useState({ categories: [], cities: [], courses: [] });
  const [input, setInput] = useState({
    percentile: 95.0,
    category: 'GOPENS',
    city_filter: 'All Cities',
    course_filter: 'All Courses'
  });
  const [results, setResults] = useState(null);

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');

  // Fetch filters on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axios.get(`${API_BASE}/filters`);
        setFilters(res.data);
      } catch (err) {
        console.error("Failed to fetch filters", err);
      }
    };
    fetchFilters();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { email, password } = e.target.elements;
      const res = await axios.post(`${API_BASE}/login`, {
        email: email.value,
        password: password.value
      });
      if (res.data.success) {
        setUser({ name: res.data.name, email: res.data.email });
        setSuccess(`Welcome back, ${res.data.name}!`);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { name, email, phone, password, confirm } = e.target.elements;

      // Phone validation
      const phoneVal = phone.value;
      if (phoneVal.length !== 10) return setError("Phone number must be exactly 10 digits");
      if (!/^[6-9]/.test(phoneVal)) return setError("Phone number must start with 6, 7, 8 or 9");

      if (password.value !== confirm.value) return setError("Passwords do not match");

      const res = await axios.post(`${API_BASE}/register`, {
        name: name.value,
        username: name.value,
        email: email.value,
        phone: phone.value,
        password: password.value
      });
      if (res.data.success) {
        setSuccess(res.data.message);
        setAuthView('login');
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const email = e.target.email.value;
      const res = await axios.post(`${API_BASE}/forgot-password`, { email });
      if (res.data.success) {
        setForgotEmail(email);
        setForgotStep(2);
        setSuccess("✅ Email Verified! OTP sent to inbox");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Error sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const otp = e.target.otp.value;
      const res = await axios.post(`${API_BASE}/verify-otp`, { email: forgotEmail, otp });
      if (res.data.success) {
        setForgotOtp(otp);
        setForgotStep(3);
        setSuccess("✅ OTP Verified");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotStep3 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { password, confirm } = e.target.elements;
      if (password.value !== confirm.value) return setError("Passwords do not match");

      const res = await axios.post(`${API_BASE}/reset-password`, {
        email: forgotEmail,
        otp: forgotOtp,
        new_password: password.value
      });
      if (res.data.success) {
        setSuccess("✅ Password reset successfully! Please login");
        setAuthView('login');
        setForgotStep(1);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/predict`, input);
      setResults(res.data);
    } catch (err) {
      setError("Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  if (showLanding) {
    return <Landing onGetStarted={() => setShowLanding(false)} />;
  }

  if (!user) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="auth-card"
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '1rem', marginBottom: '1rem' }}>
              <GraduationCap size={40} className="text-gradient" />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Maharashtra CET Predictor</h2>
            <p style={{ color: 'var(--text-muted)' }}>2024 Engineering Admission Guide</p>
          </div>

          <AnimatePresence mode="wait">
            {authView === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
              >
                <div className="input-group">
                  <label className="label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input name="email" type="email" className="input" style={{ paddingLeft: '3rem' }} placeholder="yourname@gmail.com" required />
                  </div>
                </div>
                <div className="input-group">
                  <label className="label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input name="password" type="password" className="input" style={{ paddingLeft: '3rem' }} placeholder="••••••••" required />
                  </div>
                </div>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={16} /> {error}</div>}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                  <button type="button" onClick={() => setAuthView('forgot')} style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', marginBottom: '0.5rem' }}>Forgot Password?</button>
                  <div style={{ color: 'var(--text-muted)' }}>Don't have an account? <button type="button" onClick={() => setAuthView('register')} style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontWeight: '600', cursor: 'pointer' }}>Register Now</button></div>
                </div>
              </motion.form>
            )}

            {authView === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRegister}
              >
                <div className="input-group">
                  <label className="label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input name="name" type="text" className="input" style={{ paddingLeft: '3rem' }} placeholder="John Doe" required />
                  </div>
                </div>
                <div className="input-group">
                  <label className="label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input name="email" type="email" className="input" style={{ paddingLeft: '3rem' }} placeholder="name@example.com" required />
                  </div>
                </div>
                <div className="input-group">
                  <label className="label">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      name="phone"
                      type="tel"
                      className="input"
                      style={{ paddingLeft: '3rem' }}
                      placeholder="10-digit number"
                      required
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="label">Password</label>
                    <input name="password" type="password" className="input" placeholder="••••" required />
                  </div>
                  <div className="input-group">
                    <label className="label">Confirm</label>
                    <input name="confirm" type="password" className="input" placeholder="••••" required />
                  </div>
                </div>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
                <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Already have an account? <button type="button" onClick={() => setAuthView('login')} style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontWeight: '600', cursor: 'pointer' }}>Login</button></div>
                </div>
              </motion.form>
            )}

            {authView === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Reset Password</h3>
                {forgotStep === 1 && (
                  <form onSubmit={handleForgotStep1}>
                    <div className="input-group">
                      <label className="label">Enter Registered Email</label>
                      <input name="email" type="email" className="input" required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                  </form>
                )}
                {forgotStep === 2 && (
                  <form onSubmit={handleForgotStep2}>
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      OTP sent to {forgotEmail}
                    </div>
                    <div className="input-group">
                      <label className="label">6-Digit OTP</label>
                      <input name="otp" type="text" className="input" maxLength={6} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </form>
                )}
                {forgotStep === 3 && (
                  <form onSubmit={handleForgotStep3}>
                    <div className="input-group">
                      <label className="label">New Password</label>
                      <input name="password" type="password" className="input" required />
                    </div>
                    <div className="input-group">
                      <label className="label">Confirm New Password</label>
                      <input name="confirm" type="password" className="input" required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                      {loading ? 'Resetting...' : 'Update Password'}
                    </button>
                  </form>
                )}
                {error && <div style={{ color: 'var(--danger)', marginTop: '1rem' }}>{error}</div>}
                {success && <div style={{ color: 'var(--success)', marginTop: '1rem' }}>{success}</div>}
                <button type="button" onClick={() => setAuthView('login')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', width: '100%', marginTop: '1rem' }}>Back to Login</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <GraduationCap size={32} className="text-gradient" />
          <h1 style={{ fontSize: '1.25rem' }}>CET Predictor</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
          </div>
          <button onClick={() => setUser(null)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>

          {/* Sidebar - Inputs */}
          <aside>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: 'var(--shadow)', position: 'sticky', top: '100px' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={20} style={{ color: 'var(--accent)' }} />
                Input Score
              </h3>

              <div className="input-group">
                <label className="label">Your CET Percentile</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={input.percentile}
                  onChange={(e) => setInput({ ...input, percentile: parseFloat(e.target.value) })}
                />
              </div>

              <div className="input-group">
                <label className="label">Category</label>
                <select
                  className="input"
                  value={input.category}
                  onChange={(e) => setInput({ ...input, category: e.target.value })}
                >
                  {filters.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="label">City Preference</label>
                <select
                  className="input"
                  value={input.city_filter}
                  onChange={(e) => setInput({ ...input, city_filter: e.target.value })}
                >
                  <option value="All Cities">All Cities</option>
                  {filters.cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="label">Course Preference</label>
                <select
                  className="input"
                  value={input.course_filter}
                  onChange={(e) => setInput({ ...input, course_filter: e.target.value })}
                >
                  <option value="All Courses">All Courses</option>
                  {filters.courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button
                onClick={handlePredict}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Predict My Colleges'}
              </button>
            </div>
          </aside>

          {/* Results Area */}
          <section>
            {!results ? (
              <div style={{ background: 'white', padding: '4rem', borderRadius: '20px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
                <Search size={64} style={{ color: 'var(--border)', marginBottom: '1.5rem' }} />
                <h2 style={{ marginBottom: '1rem' }}>Ready to start your search?</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
                  Enter your percentile and category in the sidebar to find the best engineering colleges for your score.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Stats Grid */}
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: 'var(--danger)' }}>
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{results.stretch_picks}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stretch Picks</div>
                    </div>
                  </div>
                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', color: 'var(--secondary)' }}>
                      <Zap size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{results.results.length - results.safe_picks - results.stretch_picks}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Good Matches</div>
                    </div>
                  </div>
                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{results.safe_picks}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Safe Picks</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                  <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>College Predictions</h3>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{results.summary}</div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: '#f8fafc' }}>
                        <tr>
                          <th style={{ padding: '1rem 2rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>College & Course</th>
                          <th style={{ padding: '1rem 2rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>City</th>
                          <th style={{ padding: '1rem 2rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Cutoff</th>
                          <th style={{ padding: '1rem 2rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.results.map((r, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td data-label="College & Course" style={{ padding: '1.25rem 2rem' }}>
                              <div style={{ fontWeight: '600', color: '#0f172a' }}>{r.college_name}</div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.course_name}</div>
                            </td>
                            <td data-label="City" style={{ padding: '1.25rem 2rem', fontSize: '0.9rem' }}>{r.city_name}</td>
                            <td data-label="Cutoff" style={{ padding: '1.25rem 2rem' }}>
                              <div style={{ fontWeight: '700' }}>{r.cutoff}%ile</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>+{r.margin.toFixed(2)}% Margin</div>
                            </td>
                            <td data-label="Status" style={{ padding: '1.25rem 2rem' }}>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '99px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                background: r.tier === 'safe' ? 'rgba(16, 185, 129, 0.1)' : r.tier === 'match' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                color: r.tier === 'safe' ? 'var(--success)' : r.tier === 'match' ? 'var(--secondary)' : 'var(--accent)',
                                textTransform: 'capitalize'
                              }}>
                                {r.tier}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Counselor Advice */}
                <div style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #1e3a8a, #4f46e5)', borderRadius: '20px', padding: '2rem', color: 'white', boxShadow: 'var(--shadow-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <CheckCircle2 size={24} />
                    <h3 style={{ color: 'white', fontSize: '1.25rem' }}>AI Expert Counselor Advice</h3>
                  </div>
                  <div style={{ opacity: 0.9, lineHeight: 1.7 }}>
                    {results.results.length > 0 ? (
                      <div>
                        <p style={{ marginBottom: '1rem' }}>Based on your **{input.percentile}%ile** in the **{input.category}** category, you have excellent options available.</p>
                        <ul style={{ paddingLeft: '1.25rem' }}>
                          <li style={{ marginBottom: '0.5rem' }}>Prioritize **{results.results[0].college_name}** as a strong safe pick.</li>
                          <li style={{ marginBottom: '0.5rem' }}>Consider institutional rounds for colleges where the margin is thin.</li>
                          <li>Your percentile allows you to be competitive in major cities like Mumbai and Pune.</li>
                        </ul>
                      </div>
                    ) : (
                      <p>Try adjusting your filters to see more recommendations.</p>
                    )}
                  </div>
                </div>

              </motion.div>
            )}
          </section>
        </div>
      </main>

      <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        © 2024 Maharashtra CET Predictor. Built with React & FastAPI.
      </footer>
    </div>
  );
}

export default App;
