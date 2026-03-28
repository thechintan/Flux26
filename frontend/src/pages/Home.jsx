import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { MapPin, IndianRupee, ShoppingCart, User, MessageCircle, AlertTriangle, History } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiService from '../services/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const searchQ = searchParams.get('search') || '';
  const categoryQ = searchParams.get('category') || '';

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [location.search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await apiService.getProducts(searchQ, categoryQ, '');
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
      <div className="text-center max-w-3xl mx-auto py-12 glass-card border-none bg-white/40 dark:bg-dark-900/40 p-8">
        {searchQ || categoryQ ? (
          <>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
              Showing Results for <span className="text-primary-600">{searchQ || categoryQ}</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium tracking-wide">
              {products.length} products found matching your AI search criteria.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
              Fresh From Farm to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">Your Market</span>
            </h1>
            <p className="text-slate-700 dark:text-slate-300 text-lg font-medium">
              Directly connect with local farmers to get the best wholesale prices for fresh produce. No middlemen, transparent pricing.
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, idx) => (
          <motion.div 
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`glass-card flex flex-col group cursor-pointer bg-white/90 dark:bg-dark-800 ${product.isDamaged ? 'border-red-300/50 dark:border-red-900/30' : ''}`}
            onClick={() => handleAction(product._id)}
          >
            <div className="relative overflow-hidden h-48">
              {product.media && product.media.length > 0 ? (
                product.media[0].match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={`http://localhost:5000${product.media[0]}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <img src={product.media[0].startsWith('http') ? product.media[0] : `http://localhost:5000${product.media[0]}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                )
              ) : (
                <img src={product.image || `https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80`} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              )}
              
              <div className="absolute top-3 right-3 badge bg-white/90 dark:bg-dark-900/80 backdrop-blur-sm px-3 py-1 text-sm text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 font-bold tracking-wider rounded-lg">
                {product.quantity} KG Available
              </div>
              
              {product.isDamaged && (
                 <div className="absolute top-3 left-3 badge bg-red-500/90 text-white backdrop-blur-sm px-3 py-1 text-xs border border-red-400 font-bold tracking-wider rounded-lg flex items-center gap-1 shadow-lg">
                   <AlertTriangle size={14} /> Damaged / Discount
                 </div>
              )}
              
              {product.category && !product.isDamaged && (
                 <div className="absolute bottom-3 left-3 flex gap-1.5">
                   <span className="badge bg-slate-900/80 dark:bg-slate-100/90 backdrop-blur-sm px-3 py-1 text-xs text-white dark:text-slate-900 border border-slate-700 dark:border-slate-300 font-bold tracking-wider rounded-lg uppercase">
                     {product.category}
                   </span>
                   {product.subCategory && (
                     <span className="badge bg-primary-500/90 backdrop-blur-sm px-3 py-1 text-xs text-white border border-primary-400 font-bold tracking-wider rounded-lg uppercase">
                       {product.subCategory}
                     </span>
                   )}
                 </div>
               )}
            </div>
            
            <div className="p-5 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight pr-2">{product.name}</h3>
                <span className="flex items-center text-primary-700 dark:text-primary-400 font-bold bg-primary-100 dark:bg-primary-500/10 px-2 py-1 rounded-lg">
                  <IndianRupee size={16} />{product.price}<span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/kg</span>
                </span>
              </div>
              
              <div className="space-y-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1 truncate max-w-[50%]"><MapPin size={14} className="text-primary-600 dark:text-primary-500 flex-shrink-0" /> {product.location}</span>
                  <span className="flex items-center gap-1 truncate"><User size={14} className="text-primary-600 dark:text-primary-500 flex-shrink-0" /> {product?.farmer?.name || 'Farmer'}</span>
                </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); handleAction(product._id); }}
                className={`mt-5 w-full flex justify-center items-center gap-2 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] ${
                  (user?.role === 'farmer' && (product.farmer?._id === user?.id || product.farmer?._id === user?._id || product.farmer === user?.id || product.farmer === user?._id))
                    ? 'btn-secondary border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50'
                    : 'btn-primary'
                }`}
              >
                {(user?.role === 'farmer' && (product.farmer?._id === user?.id || product.farmer?._id === user?._id || product.farmer === user?.id || product.farmer === user?._id))
                  ? <><History size={18} /> Sold History</>
                  : <><MessageCircle size={18} /> Buy / Negotiate</>}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {!loading && products.length === 0 && (
        <div className="text-center text-slate-600 dark:text-slate-400 py-16 glass-card font-medium text-lg">No products found for this category or search criteria. Try a different term!</div>
      )}
    </motion.div>
  );
};

export default Home;
