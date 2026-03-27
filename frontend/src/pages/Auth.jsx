import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Leaf, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../services/api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'buyer', location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const { data } = await apiService.login(formData.email, formData.password);
        login(data.user, data.token);
      } else {
        const { data } = await apiService.register(formData);
        login(data.user, data.token);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ y: 30, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="glass-card w-full max-w-md p-8 relative overflow-hidden bg-white/95 dark:bg-dark-800"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-primary-600"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-500 mb-4 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <Leaf size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">{isLogin ? 'Sign in to access your dashboard' : 'Join the Smart Agri Supply Network'}</p>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <input type="text" name="name" placeholder="Full Name" className="input-field" onChange={handleChange} required />
          )}

          <input type="email" name="email" placeholder="Email Address" className="input-field" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" className="input-field" onChange={handleChange} required />

          {!isLogin && (
            <div className="space-y-4">
              <input type="text" name="location" placeholder="City, State" className="input-field" onChange={handleChange} required />
              
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block font-medium">I am a:</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer border rounded-lg p-3 flex text-center justify-center items-center transition-all ${formData.role === 'farmer' ? 'bg-primary-50 dark:bg-primary-500/20 border-primary-500 text-primary-700 dark:text-primary-400 font-medium' : 'bg-slate-50 dark:bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'}`}>
                    <input type="radio" name="role" value="farmer" className="hidden" onChange={handleChange} checked={formData.role === 'farmer'} />
                    Farmer
                  </label>
                  <label className={`cursor-pointer border rounded-lg p-3 flex text-center justify-center items-center transition-all ${formData.role === 'buyer' ? 'bg-primary-50 dark:bg-primary-500/20 border-primary-500 text-primary-700 dark:text-primary-400 font-medium' : 'bg-slate-50 dark:bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'}`}>
                    <input type="radio" name="role" value="buyer" className="hidden" onChange={handleChange} checked={formData.role === 'buyer'} />
                    Buyer
                  </label>
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-4 flex justify-center items-center gap-2 text-lg">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (isLogin ? <><LogIn size={20} /> Sign In</> : <><UserPlus size={20} /> Join Network</>)}
          </button>
        </form>

        <div className="mt-6 text-center text-slate-600 dark:text-slate-400 text-sm border-t border-slate-200 dark:border-slate-700/50 pt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary-600 dark:text-primary-400 font-bold hover:underline transition-all">
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
