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
        // Default to 'all' for city and course
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
      console.log("Sending prediction request:", formData);
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
      safe: "border-green-500/30 bg-green-500/5",
      good: "border-blue-500/30 bg-blue-500/5",
      stretch: "border-orange-500/30 bg-orange-500/5"
    };
    
    const iconStyles = {
      safe: "text-green-500",
      good: "text-blue-500",
      stretch: "text-orange-500"
    };

    return (
      <div className={`card border-l-4 ${typeStyles[type]} p-4 transition-transform hover:scale-[1.02]`}>
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-white text-lg leading-tight">{item.college_name}</h4>
          {type === 'safe' && <CheckCircle className={iconStyles[type]} size={20} />}
          {type === 'good' && <TrendingUp className={iconStyles[type]} size={20} />}
          {type === 'stretch' && <Sparkles className={iconStyles[type]} size={20} />}
        </div>
        <div className="text-sm text-slate-400 mb-4">
          <p>{item.course_name}</p>
          <p>{item.city_name}</p>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          <div>
            <span className="text-xs text-slate-500 block uppercase">Last Year Cutoff</span>
            <span className="text-xl font-bold text-white">{item.cutoff}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block uppercase">Margin</span>
            <span className={`text-lg font-semibold ${item.margin >= 0 ? 'text-green-400' : 'text-orange-400'}`}>
              {item.margin > 0 ? `+${item.margin}` : item.margin}
            </span>
          </div>
        </div>
        <div className="mt-4 bg-slate-800/50 p-2 rounded text-xs text-slate-300 italic">
          "{item.advice}"
        </div>
      </div>
    );
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-4">College Predictor 2024</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">Enter your MHT-CET percentile and preferences to find the best colleges for your career.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Search Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Search size={20} className="text-primary-light" /> Search Criteria
            </h3>
            
            <form onSubmit={handlePredict} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">CET Percentile</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className={`input-field ${error && error.includes('Percentiles') ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="e.g. 98.5"
                  value={formData.percentile}
                  onChange={(e) => {
                    setFormData({...formData, percentile: e.target.value});
                    if (error) setError('');
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Category</label>
                <select 
                  className="input-field"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {filters.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Preferred City</label>
                <select 
                  className="input-field"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                >
                  <option value="all">All Cities</option>
                  {filters.cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Course</label>
                <select 
                  className="input-field"
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
                className="btn-primary w-full mt-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Predict Colleges'}
              </button>
            </form>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {!results && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Sparkles size={48} className="mb-4 opacity-20" />
              <p>Enter your details and click Predict to see results</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64 text-primary-light">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="animate-pulse">Analyzing thousands of cutoff records...</p>
            </div>
          )}

          {results && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="bg-primary/20 border border-primary-light/30 p-6 rounded-xl text-white">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="text-yellow-400" /> Prediction Summary
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  We found <span className="text-white font-bold">{results.length}</span> colleges matching your criteria. 
                  Below are the best matches ranked by safety margin.
                </p>
              </div>

              {/* Safe Picks */}
              <div>
                <h3 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2">
                  <CheckCircle size={24} /> Safe Picks ({results.filter(r => r.tier === 'safe').length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.filter(r => r.tier === 'safe').slice(0, 40).map((r, i) => <ResultCard key={i} item={r} type="safe" />)}
                  {results.filter(r => r.tier === 'safe').length === 0 && <p className="text-slate-500 italic">No safe matches found.</p>}
                  {results.filter(r => r.tier === 'safe').length > 40 && <p className="col-span-full text-center text-slate-500 text-sm">Showing top 40 results. Refine your search for more specific matches.</p>}
                </div>
              </div>

              {/* Good Matches */}
              <div>
                <h3 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                  <TrendingUp size={24} /> Good Matches ({results.filter(r => r.tier === 'match').length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.filter(r => r.tier === 'match').slice(0, 40).map((r, i) => <ResultCard key={i} item={r} type="good" />)}
                  {results.filter(r => r.tier === 'match').length === 0 && <p className="text-slate-500 italic">No direct matches found.</p>}
                  {results.filter(r => r.tier === 'match').length > 40 && <p className="col-span-full text-center text-slate-500 text-sm">Showing top 40 results.</p>}
                </div>
              </div>

              {/* Stretch */}
              <div>
                <h3 className="text-xl font-bold text-orange-400 mb-6 flex items-center gap-2">
                  <Sparkles size={24} /> Stretch Colleges ({results.filter(r => r.tier === 'stretch').length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.filter(r => r.tier === 'stretch').slice(0, 40).map((r, i) => <ResultCard key={i} item={r} type="stretch" />)}
                  {results.filter(r => r.tier === 'stretch').length === 0 && <p className="text-slate-500 italic">No stretch colleges found.</p>}
                  {results.filter(r => r.tier === 'stretch').length > 40 && <p className="col-span-full text-center text-slate-500 text-sm">Showing top 40 results.</p>}
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
