import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Leaf, UserCircle, LogOut, LayoutDashboard, Menu, X, Sun, Moon, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            {location.pathname !== '/' && (
              <button 
                onClick={() => navigate(-1)} 
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-full transition-colors flex items-center justify-center mr-1"
                aria-label="Go Back"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 text-primary-600 dark:text-primary-500 font-bold text-xl tracking-tight transition-transform hover:scale-105 duration-200">
              <Leaf className="h-6 w-6" />
              <span>SmartAgri</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 font-medium transition-colors">Marketplace</Link>
            
            <button 
              onClick={toggleTheme} 
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors focus:outline-none rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {!isAuthenticated ? (
              <Link to="/auth" className="btn-primary">
                Login / Signup
              </Link>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none"
                >
                  <img 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=22c55e`} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full border border-primary-500/30"
                  />
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold">{user.name}</span>
                    <span className="text-xs text-primary-600 dark:text-primary-400 capitalize">{user.role}</span>
                  </div>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden py-1 z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link 
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)} 
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <LayoutDashboard size={16} /> 
                        Dashboard
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <button 
              onClick={toggleTheme} 
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors focus:outline-none"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:outline-none p-1 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden glass-card mx-2 mt-2 mb-4 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-4 py-4 space-y-4">
              <Link 
                to="/" 
                className="block text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Marketplace
              </Link>
              
              {!isAuthenticated ? (
                <Link 
                  to="/auth" 
                  className="btn-primary w-full text-center block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login / Signup
                </Link>
              ) : (
                <>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex items-center gap-3">
                    <img 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=22c55e`} 
                      alt="avatar" 
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="text-slate-800 dark:text-white font-medium">{user.name}</div>
                      <div className="text-primary-600 dark:text-primary-400 text-sm capitalize">{user.role}</div>
                    </div>
                  </div>
                  <Link 
                    to="/dashboard"
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 py-2 hover:text-primary-600 dark:hover:text-primary-400"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="flex w-full items-center gap-2 text-red-500 dark:text-red-400 py-2 hover:text-red-600 dark:hover:text-red-300 text-left"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
