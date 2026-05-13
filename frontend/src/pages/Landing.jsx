import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Zap, GraduationCap, ChevronRight, BarChart3, MapPin, Search, Users, Trophy, Star, ArrowRight, CheckCircle2 } from 'lucide-react';

const Landing = ({ onGetStarted }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="landing-root relative min-h-screen bg-white selection:bg-blue-100 overflow-x-hidden">
      {/* Light Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

      <div className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Section with Student Image */}
        <div className="hero-grid grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-40">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-left"
          >
            <motion.div 
              variants={itemVariants}
              className="badge-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold mb-10"
            >
              <Star size={14} className="fill-blue-500" /> 
              <span>MHT-CET Predictor 2024-25</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="hero-title text-6xl md:text-8xl font-black text-slate-900 tracking-tight mb-10 leading-[0.9]">
              Find Your <br />
              <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">Perfect Fit.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="hero-subtitle text-xl md:text-2xl text-blue-600/80 max-w-xl mb-14 font-medium leading-relaxed">
              Don't leave your career to chance. Get a data-backed prediction of your dream college based on the latest 2024 cutoff reports.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 items-center">
              <button onClick={onGetStarted} className="get-started-btn group bg-blue-600 hover:bg-blue-700 text-white font-black py-6 px-14 rounded-[2.5rem] text-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-500/30 active:scale-95 border-none cursor-pointer">
                <span>START PREDICTING</span>
                <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-blue-500/10 blur-[100px] rounded-full"></div>
            <div className="hero-image-wrapper relative rounded-[3rem] overflow-hidden border-[12px] border-white shadow-2xl rotate-3 hover:rotate-0 transition-all duration-700">
              <img src="/assets/student.png" alt="Engineering Student" className="w-full h-full object-cover" />
              <div className="hero-card absolute bottom-8 left-8 right-8 glass p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500 rounded-full p-1"><CheckCircle2 className="text-white" size={20} /></div>
                  <div>
                    <div className="text-slate-900 font-black text-lg">Goal Reached!</div>
                    <div className="text-blue-700 text-sm font-bold">Admitted to COEP Pune</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Featured Colleges Gallery */}
        <div className="mb-40">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="section-title text-5xl font-black text-slate-900 mb-6 tracking-tight">Iconic Engineering Colleges</h2>
            <p className="text-blue-600 font-bold text-xl">The actual destinations our students aim for.</p>
          </motion.div>

          <div className="college-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { img: '/assets/coep.png', name: 'COEP, Pune', desc: 'The legendary College of Engineering, Pune. Known for its heritage and elite engineering programs.', tags: ['Established 1854', 'Tier 1'] },
              { img: '/assets/vjti.png', name: 'VJTI, Mumbai', desc: 'Veermata Jijabai Technological Institute. A premier engineering institute in the heart of Mumbai.', tags: ['Top Placements', 'Research Hub'] },
              { img: '/assets/amravati.png', name: 'GCE, Amravati', desc: 'A leading government engineering college serving central Maharashtra with excellence.', tags: ['Govt Owned', 'Innovation'] }
            ].map((college, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -15 }}
                className="college-card group relative rounded-[3rem] overflow-hidden shadow-2xl bg-white border border-slate-100 flex flex-col"
              >
                <div className="h-72 overflow-hidden relative">
                  <img src={college.img} alt={college.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-6 left-6 flex gap-2">
                    {college.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/90 backdrop-blur shadow-sm text-blue-600 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-10 flex flex-col flex-grow">
                  <h3 className="text-3xl font-black text-slate-900 mb-6">{college.name}</h3>
                  <p className="text-blue-600/80 text-base font-medium leading-relaxed mb-8">
                    {college.desc}
                  </p>
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-blue-600 font-black text-sm uppercase tracking-tighter">View Details</span>
                    <ArrowRight className="text-blue-600 group-hover:translate-x-2 transition-transform" size={20} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Feature Bento Grid */}
        <div className="bento-grid grid grid-cols-1 md:grid-cols-12 gap-8 mb-40">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bento-item-large md:col-span-8 p-16 bg-slate-50 rounded-[4rem] border border-slate-100 flex flex-col justify-between"
          >
            <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center mb-12 shadow-xl shadow-blue-500/10">
              <Zap className="text-blue-600" size={40} />
            </div>
            <div>
              <h3 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter">Live 2024 Cutoff Data</h3>
              <p className="text-blue-600/80 text-2xl leading-relaxed max-w-2xl font-medium">
                Our algorithm processes official CAP Round I data in real-time. We don't use old data—only the most recent numbers for the 2024-25 admission cycle.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bento-item-small md:col-span-4 p-16 bg-blue-600 rounded-[4rem] text-white flex flex-col justify-between shadow-2xl shadow-blue-600/30"
          >
            <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mb-12">
              <Trophy className="text-white" size={40} />
            </div>
            <div>
              <h3 className="text-4xl font-black mb-8 leading-tight tracking-tighter">99.9% Success Rate</h3>
              <p className="text-blue-50 text-lg font-medium opacity-90 leading-relaxed">
                Thousands of students have secured their dream engineering seats using our tool.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="landing-footer pt-24 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-3 text-3xl font-black text-slate-900 mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap size={32} className="text-white" />
            </div>
            <span className="tracking-tighter">CET PREDICTOR</span>
          </div>
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent mb-12"></div>
          <div className="footer-links grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-400 text-xs font-bold uppercase tracking-widest items-center">
            <div className="text-left mobile-hide">Trusted by students worldwide.</div>
            <div className="flex justify-center gap-10">
              <a href="#" className="hover:text-blue-600 transition-colors no-underline">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors no-underline">Terms</a>
            </div>
            <div className="text-right mobile-center">&copy; 2024 CET PREDICTOR</div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
