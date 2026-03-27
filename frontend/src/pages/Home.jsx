import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, IndianRupee, ShoppingCart, User, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await apiService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="text-center max-w-2xl mx-auto py-12 glass-card border-none bg-white/40 dark:bg-dark-900/40 p-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
          Fresh From Farm to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">Your Market</span>
        </h1>
        <p className="text-slate-700 dark:text-slate-300 text-lg font-medium">
          Directly connect with local farmers to get the best wholesale prices for fresh produce. No middlemen, transparent pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, idx) => (
          <motion.div 
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card flex flex-col group cursor-pointer bg-white/90 dark:bg-dark-800"
            onClick={() => handleAction(product._id)}
          >
            <div className="relative overflow-hidden h-48">
              <img 
                src={product.image || `https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80`} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 badge bg-white/90 dark:bg-dark-900/80 backdrop-blur-sm px-3 py-1 text-sm text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 font-bold tracking-wider rounded-lg">
                {product.quantity} KG Available
              </div>
            </div>
            
            <div className="p-5 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{product.name}</h3>
                <span className="flex items-center text-primary-700 dark:text-primary-400 font-bold bg-primary-100 dark:bg-primary-500/10 px-2 py-1 rounded-lg">
                  <IndianRupee size={16} />{product.price}<span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/kg</span>
                </span>
              </div>
              
              <div className="space-y-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1"><MapPin size={14} className="text-primary-600 dark:text-primary-500" /> {product.location}</span>
                  <span className="flex items-center gap-1"><User size={14} className="text-primary-600 dark:text-primary-500" /> {product.farmerName || 'Farmer'}</span>
                </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); handleAction(product._id); }}
                className="mt-5 w-full btn-primary flex justify-center items-center gap-2 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
              >
                <MessageCircle size={18} /> Buy / Negotiate
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center text-slate-600 dark:text-slate-400 py-12 glass-card font-medium">No products available at the moment.</div>
      )}
    </motion.div>
  );
};

export default Home;
