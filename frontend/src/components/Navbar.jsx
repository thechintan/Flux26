import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { CartContext } from '../context/CartContext';
import { Leaf, UserCircle, LogOut, LayoutDashboard, Menu, X, Sun, Moon, ChevronLeft, Search, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { cart, setIsCartOpen } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const categories = ['Vegetables', 'Fruits', 'Grains', 'Lentils', 'Spices'];

  return (
    <nav className="glass sticky top-0 z-50 flex flex-col transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-16">
          <div className="flex flex-shrink-0 items-center gap-2">
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
              <span className="hidden sm:block">SmartAgri</span>
            </Link>
          </div>

          {/* AI Search Bar */}
          <div className="flex-1 max-w-xl mx-4 lg:mx-8 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 to-green-500 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-primary-500" />
              </div>
              <input
                type="text"
                placeholder="Search products, categories..."
                className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-slate-700/60 rounded-full bg-white/80 dark:bg-dark-900 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:text-white transition-all shadow-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex flex-shrink-0 items-center gap-5">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors focus:outline-none rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {!isAuthenticated ? (
              <Link to="/auth" className="btn-primary py-2 px-5 text-sm">
                Login
              </Link>
            ) : (
              <div className="relative flex items-center gap-4">
                {user.role === 'buyer' && (
                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors focus:outline-none rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80"
                  >
                    <ShoppingCart size={22} />
                    {cart.length > 0 && <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full leading-none">{cart.length}</span>}
                  </button>
                )}
                
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none rounded-full p-1 bg-slate-50 hover:bg-slate-100 dark:bg-dark-800 dark:hover:bg-dark-700 border border-slate-200 dark:border-slate-700"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=22c55e`}
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex flex-col items-start leading-tight pr-3 hidden lg:flex">
                    <span className="text-xs font-bold">{user.name}</span>
                    <span className="text-[10px] text-primary-600 dark:text-primary-400 uppercase tracking-wider font-semibold">{user.role}</span>
                  </div>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-dark-800 border border-slate-100 dark:border-slate-700 shadow-2xl overflow-hidden py-2 z-50 origin-top-right"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 block lg:hidden">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium uppercase">{user.role}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                      >
                        <LayoutDashboard size={18} />
                        My Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700/50 transition-colors text-left font-medium border-t border-slate-100 dark:border-slate-700/50"
                      >
                        <LogOut size={18} />
                        Logout Session
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-slate-500 focus:outline-none">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 dark:text-slate-300 focus:outline-none p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Categories Mega Menu Row (Desktop) */}
      <div className="hidden md:flex items-center justify-center gap-8 py-2.5 border-t border-slate-200/50 dark:border-slate-700/30 bg-white/40 dark:bg-dark-900/40 backdrop-blur-md">
        {categories.map(cat => (
          <Link
            key={cat}
            to={`/?category=${cat}`}
            className="text-xs font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors relative group"
          >
            {cat}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all group-hover:w-full"></span>
          </Link>
        ))}
        <div className="h-4 w-px bg-slate-300 dark:bg-slate-600"></div>
        <Link to={`/?category=Damaged/Unsold`} className="text-xs font-bold tracking-wider uppercase text-red-500 hover:text-red-600 transition-colors relative group flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Damaged/Unsold
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all group-hover:w-full"></span>
        </Link>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-dark-800 backdrop-blur-lg"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-4 py-6 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => (
                  <Link
                    key={cat}
                    to={`/?category=${cat}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 text-center uppercase tracking-wider border border-slate-100 dark:border-slate-700 shadow-sm"
                  >
                    {cat}
                  </Link>
                ))}
                <Link
                  to={`/?category=Damaged/Unsold`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50 rounded-lg text-sm font-bold text-center uppercase tracking-wider shadow-sm"
                >
                  Damaged/Unsold
                </Link>
              </div>

              {!isAuthenticated ? (
                <Link to="/auth" className="btn-primary w-full text-center py-3" onClick={() => setMobileMenuOpen(false)}>
                  Login / Signup
                </Link>
              ) : (
                <div className="space-y-2">
                  {user.role === 'buyer' && (
                    <button onClick={() => { setIsCartOpen(true); setMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 btn-secondary w-full py-3 dark:border-slate-700">
                      <ShoppingCart size={18} /> View Cart ({cart.length})
                    </button>
                  )}
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 btn-secondary w-full py-3">
                    <LayoutDashboard size={18} /> {user.role === 'farmer' ? 'Farmer' : 'My'} Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 w-full py-3 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl font-bold">
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
