import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ChevronRight, CheckCircle2, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

const Landing = ({ onGetStarted }) => {
  return (
    <div className="landing-container" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)',
      overflowX: 'hidden'
    }}>
      {/* Hero Section */}
      <nav className="glass" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <GraduationCap size={32} className="text-gradient" />
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>CET Predictor</h1>
        </div>
        <button onClick={onGetStarted} className="btn btn-primary">
          Get Started
        </button>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', minHeight: '70vh' }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 1rem', 
              background: 'white', 
              borderRadius: '99px', 
              boxShadow: 'var(--shadow)',
              marginBottom: '2rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--secondary)'
            }}>
              <Zap size={16} /> 2024 Admission Guide Live
            </div>
            <h1 style={{ fontSize: '4rem', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: '800' }}>
              Your Dream College is <span className="text-gradient">Predictable.</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              Don't leave your engineering career to chance. Get data-backed predictions for Maharashtra CET based on the latest 2024 cutoff reports.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={onGetStarted} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                Start Predicting Now <ChevronRight size={20} />
              </button>
            </div>
            
            <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                <span style={{ fontWeight: '500' }}>Official 2024 Data</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                <span style={{ fontWeight: '500' }}>AI Powered Advice</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            style={{ position: 'relative' }}
          >
            <div style={{ 
              background: 'white', 
              padding: '2rem', 
              borderRadius: '24px', 
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)',
              transform: 'rotate(2deg)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: '700' }}>COEP, Pune</div>
                <div style={{ color: 'var(--success)', fontWeight: '700' }}>99.4%ile</div>
              </div>
              <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', marginBottom: '1rem' }}>
                <div style={{ width: '85%', height: '100%', background: 'var(--secondary)', borderRadius: '5px' }}></div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Highly Recommended based on your score</p>
            </div>

            <div style={{ 
              position: 'absolute',
              top: '-2rem',
              right: '2rem',
              background: 'var(--primary)',
              color: 'white',
              padding: '1rem',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
              transform: 'rotate(-5deg)'
            }}>
              <TrendingUp size={32} />
            </div>

            <div style={{ 
              position: 'absolute',
              bottom: '-2rem',
              left: '2rem',
              background: 'white',
              padding: '1.5rem',
              borderRadius: '20px',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ fontWeight: '700' }}>Safe Choice</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>VJTI Mumbai</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div style={{ marginTop: '8rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '4rem' }}>Why use our predictor?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { icon: <Zap />, title: "Instant Analysis", desc: "Get your college list in milliseconds after entering your percentile." },
              { icon: <TrendingUp />, title: "2024 Real Data", desc: "We use actual cutoff data from the most recent admission cycles." },
              { icon: <ShieldCheck />, title: "Reliable Accuracy", desc: "Our algorithm covers 300+ colleges across Maharashtra." }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                style={{ background: 'white', padding: '2.5rem', borderRadius: '20px', boxShadow: 'var(--shadow)', textAlign: 'left' }}
              >
                <div style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>{f.icon}</div>
                <h3 style={{ marginBottom: '1rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <footer style={{ padding: '4rem 2rem', textAlign: 'center', borderTop: '1px solid var(--border)', marginTop: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <GraduationCap size={24} className="text-gradient" />
          <span style={{ fontWeight: '800' }}>CET PREDICTOR</span>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>© 2024 Maharashtra Engineering Admission Guide. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
