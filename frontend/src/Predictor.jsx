import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from './config';
import { Search, Loader2, Sparkles, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

const Predictor = () => {
  const [filters, setFilters] = useState({ categories: [], cities: [], courses: [] });
  const [formData, setFormData] = useState({
    percentile: '',
    category: 'OPEN',
    city: 'all',
    course: 'all'
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await axios.get(`${config.API_BASE}/filters`);
        setFilters(response.data);
        if (response.data.categories.length > 0) setFormData(prev => ({ ...prev, category: response.data.categories[0] }));
        setFormData(prev => ({ ...prev, city: 'all', course: 'all' }));
      } catch (err) {
        console.error("Error fetching filters:", err);
        setError("Failed to load search filters. Please refresh.");
      } finally {
        setFilterLoading(false);
      }
    };
    fetchFilters();
  }, []);

  const handlePredict = async (e) => {
    e.preventDefault();
    const p = parseFloat(formData.percentile);
    if (isNaN(p) || p < 0 || p > 100) {
      setError("Whoops! Percentiles should be between 0 and 100. Please adjust your score.");
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    try {
      const response = await axios.post(`${config.API_BASE}/predict`, {
        percentile: p,
        category: formData.category,
        city_filter: formData.city,
        course_filter: formData.course
      });
      
      if (response.data.results.length === 0) {
        setError("We couldn't find any colleges matching your criteria. Maybe try a lower percentile or different city?");
      } else {
        setResults(response.data.results);
      }
    } catch (err) {
      console.error("Prediction error:", err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Oh no! Something went wrong while predicting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ResultCard = ({ item, type }) => {
    const typeStyles = {
      safe: "border-green-200 bg-green-50/50",
      good: "border-blue-200 bg-blue-50/50",
      stretch: "border-orange-200 bg-orange-50/50"
    };
    
    const iconStyles = {
      safe: "text-green-600",
      good: "text-blue-600",
      stretch: "text-orange-600"
    };

    return (
      <div className={`bg-white rounded-3xl border-2 border-l-8 ${typeStyles[type]} p-8 transition-all hover:shadow-xl hover:-translate-y-1`}>
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-black text-slate-900 text-xl leading-tight">{item.college_name}</h4>
          {type === 'safe' && <CheckCircle className={iconStyles[type]} size={24} />}
          {type === 'good' && <TrendingUp className={iconStyles[type]} size={24} />}
          {type === 'stretch' && <Sparkles className={iconStyles[type]} size={24} />}
        </div>
        <div className="text-sm text-slate-600 mb-6 font-medium">
          <p className="flex items-center gap-2 mb-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {item.course_name}</p>
          <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {item.city_name}</p>
        </div>
        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-black tracking-widest mb-1">Last Year Cutoff</span>
            <span className="text-2xl font-black text-slate-900">{item.cutoff}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-black tracking-widest mb-1">Safety Margin</span>
            <span className={`text-xl font-black ${item.margin >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {item.margin > 0 ? `+${item.margin}` : item.margin}
            </span>
          </div>
        </div>
        <div className="mt-6 bg-slate-50 p-4 rounded-2xl text-xs text-slate-500 italic font-medium border border-slate-100">
          "{item.advice}"
        </div>
      </div>
    );
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Predict Your Future</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Enter your MHT-CET details below to see which elite engineering colleges are within your reach.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Search Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-blue-500/5 border border-slate-100 sticky top-32">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <Search size={24} className="text-blue-600" /> Filters
            </h3>
            
            <form onSubmit={handlePredict} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">CET Percentile</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="e.g. 98.5"
                  value={formData.percentile}
                  onChange={(e) => setFormData({...formData, percentile: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Category</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:outline-none transition-all appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {filters.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Preferred City</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:outline-none transition-all appearance-none"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                >
                  <option value="all">All Cities</option>
                  {filters.cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Course</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:outline-none transition-all appearance-none"
                  value={formData.course}
                  onChange={(e) => setFormData({...formData, course: e.target.value})}
                >
                  <option value="all">All Courses</option>
                  {filters.courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || filterLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'FIND COLLEGES'}
              </button>
            </form>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3">
          {error && (
            <div className="bg-red-50 border-2 border-red-100 text-red-600 p-6 rounded-[2rem] flex items-center gap-4 mb-8 font-bold">
              <AlertCircle size={24} /> {error}
            </div>
          )}

          {!results && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400">
              <Sparkles size={64} className="mb-6 opacity-20" />
              <p className="text-xl font-bold">Waiting for your search criteria...</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-96 text-blue-600">
              <Loader2 size={64} className="animate-spin mb-6" />
              <p className="text-2xl font-black animate-pulse">Running Predictions...</p>
            </div>
          )}

          {results && (
            <div className="space-y-16">
              <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles size={120} />
                </div>
                <h3 className="text-3xl font-black mb-4 flex items-center gap-3">
                  Analysis Complete
                </h3>
                <p className="text-blue-50 text-xl font-medium max-w-2xl leading-relaxed">
                  We found <span className="text-white font-black underline decoration-white/40">{results.length}</span> potential matches based on your percentile.
                </p>
              </div>

              {/* Safe Picks */}
              <div>
                <h3 className="text-2xl font-black text-green-600 mb-8 flex items-center gap-3 px-2">
                  <CheckCircle size={32} /> Safe Picks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {results.filter(r => r.tier === 'safe').slice(0, 40).map((r, i) => <ResultCard key={i} item={r} type="safe" />)}
                  {results.filter(r => r.tier === 'safe').length === 0 && <div className="col-span-full p-12 bg-white rounded-[2rem] border-2 border-slate-100 text-center text-slate-400 font-bold italic">No safe matches found for this criteria.</div>}
                </div>
              </div>

              {/* Good Matches */}
              <div>
                <h3 className="text-2xl font-black text-blue-600 mb-8 flex items-center gap-3 px-2">
                  <TrendingUp size={32} /> Good Matches
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {results.filter(r => r.tier === 'match').slice(0, 40).map((r, i) => <ResultCard key={i} item={r} type="good" />)}
                  {results.filter(r => r.tier === 'match').length === 0 && <div className="col-span-full p-12 bg-white rounded-[2rem] border-2 border-slate-100 text-center text-slate-400 font-bold italic">No direct matches found.</div>}
                </div>
              </div>

              {/* Stretch */}
              <div>
                <h3 className="text-2xl font-black text-orange-600 mb-8 flex items-center gap-3 px-2">
                  <Sparkles size={32} /> Stretch Colleges
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {results.filter(r => r.tier === 'stretch').slice(0, 40).map((r, i) => <ResultCard key={i} item={r} type="stretch" />)}
                  {results.filter(r => r.tier === 'stretch').length === 0 && <div className="col-span-full p-12 bg-white rounded-[2rem] border-2 border-slate-100 text-center text-slate-400 font-bold italic">No stretch colleges found.</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predictor;
