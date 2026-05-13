import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, GraduationCap, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('name');

  const handleLogout = () => {
    localStorage.removeItem('name');
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center fixed top-0 w-full z-50">
      <Link to="/" className="flex items-center gap-2 text-slate-900 font-bold text-xl">
        <GraduationCap className="text-blue-600" size={32} />
        <span className="tracking-tighter">CET Predictor</span>
      </Link>
      
      <div className="flex items-center gap-6">
        {name ? (
          <>
            <div className="flex items-center gap-2 text-slate-700 border-l border-slate-200 pl-6">
              <User size={18} className="text-blue-600" />
              <span className="font-semibold">{name}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-700 hover:text-red-600 transition-colors font-bold px-4 py-2 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-100"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Login</Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
