import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { IndianRupee, MapPin, Send, MessageCircle, AlertCircle, CheckCircle, Scale, ShoppingCart, CalendarDays, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Real Negotiation State
  const [chatId, setChatId] = useState(null);
  const [chat, setChat] = useState([]);
  const [liveMessage, setLiveMessage] = useState('');
  
  // Checkout State
  const [quantity, setQuantity] = useState('');
  const [checkoutPrice, setCheckoutPrice] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat]);

  // Polling for live chat updates
  useEffect(() => {
    let interval;
    if (chatId) {
      interval = setInterval(async () => {
        try {
          const { data } = await apiService.getChat(chatId);
          setChat(data.messages);
        } catch (e) {
          console.error(e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [chatId]);

  const fetchProduct = async () => {
    try {
      const { data } = await apiService.getProducts();
      const p = data.find(item => item._id === id || item._id === Number(id));
      if(p) {
        setProduct(p);
        setCheckoutPrice(p.price.toString());
        setQuantity(Math.min(10, p.quantity).toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleStartNegotiation = async () => {
    if (!isAuthenticated) return navigate('/auth');
    if (user.role === 'farmer') return alert('Farmers cannot buy from themselves.');

    try {
      const fId = product.farmerId || (product.farmer && product.farmer._id) || product.farmer;
      const { data } = await apiService.startOrGetChat(product._id, fId);
      setChatId(data._id);
      setChat(data.messages);
      
      if (data.messages.length === 0) {
        const initialRes = await apiService.sendMessage(data._id, `Hi! I am interested in buying ${product.name}.`);
        setChat(initialRes.data.messages);
      }
    } catch(err) {
      console.error("Failed to start chat:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!liveMessage.trim() || !chatId) return;

    const sentText = liveMessage;
    setLiveMessage('');
    
    setChat(prev => [...prev, { senderId: user.id || user._id, text: sentText, timestamp: new Date() }]);

    try {
      const { data } = await apiService.sendMessage(chatId, sentText);
      setChat(data.messages);
    } catch(err) {
      console.error('Failed to send message:', err);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        farmer: product.farmerId || product.farmer?._id || product.farmer,
        product: product._id,
        quantity: Number(quantity),
        price: Number(checkoutPrice),
      };
      await apiService.createOrder(orderData);
      alert("Order successfully placed!");
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !product) return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Image, Header & Description (Takes 2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
           {/* Theater Image Box */}
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-black/95 flex justify-center items-center h-[28rem] rounded-xl overflow-hidden relative shadow-lg">
             <img src={product.image || `https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1000&q=80`} alt={product.name} className="h-full object-contain" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
             <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="badge bg-yellow-400 text-yellow-900 border-none font-bold shadow-md">FEATURED</span>
                <span className="badge bg-white/20 text-white backdrop-blur-sm border-white/30 truncate max-w-xs">{product.location}</span>
             </div>
           </motion.div>

           {/* Title & Basic Details */}
           <div className="glass-card p-6 bg-white/95 dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{product.name}</h1>
             <p className="text-slate-600 dark:text-slate-400 font-medium mb-4 flex items-center gap-2">Available Quantity: <span className="text-slate-900 dark:text-white font-bold">{product.quantity} KG</span></p>
           </div>

           {/* Overview Block */}
           <div className="glass-card p-6 bg-white/95 dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">Overview</h2>
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex gap-3">
                  <User className="text-slate-400 mt-0.5" size={24}/>
                  <div>
                    <span className="block text-xs uppercase font-bold tracking-wider text-slate-500 mb-1">Owner</span>
                    <span className="font-bold text-slate-900 dark:text-white">{product.farmerName || '1st'}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="text-slate-400 mt-0.5" size={24}/>
                  <div>
                    <span className="block text-xs uppercase font-bold tracking-wider text-slate-500 mb-1">Location</span>
                    <span className="font-bold text-slate-900 dark:text-white break-words">{product.location}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CalendarDays className="text-slate-400 mt-0.5" size={24}/>
                  <div>
                    <span className="block text-xs uppercase font-bold tracking-wider text-slate-500 mb-1">Posting Date</span>
                    <span className="font-bold text-slate-900 dark:text-white">TODAY</span>
                  </div>
                </div>
             </div>
           </div>
           
           {/* Description Block */}
           {product.description && (
             <div className="glass-card p-6 bg-white/95 dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
               <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">Description</h2>
               <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{product.description}</p>
             </div>
           )}
        </div>

        {/* Right Column: Pricing & Seller Cards (Takes 1/3 width) */}
        <div className="space-y-4">
           
           {/* Price Box */}
           <div className="glass-card p-6 bg-white/95 dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-900/20 rounded-bl-full -mr-10 -mt-10 z-0"></div>
             
             <div className="relative z-10">
               <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-center mb-6">
                 ₹ {product.price}
               </h2>
               
               {/* Checkout Expandable - Hidden until "Make Offer" clicked if we wanted, or always visible */}
               <div className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl mb-4">
                  <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2"><ShoppingCart size={16}/> Direct Order</h3>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Qty (KG)</label>
                      <input type="number" min="1" max={product.quantity} value={quantity} onChange={e=>setQuantity(e.target.value)} className="w-full bg-white dark:bg-dark-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm font-bold text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Offer (₹/KG)</label>
                      <input type="number" value={checkoutPrice} onChange={e=>setCheckoutPrice(e.target.value)} className="w-full bg-white dark:bg-dark-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm font-bold text-slate-900 dark:text-white" />
                    </div>
                  </div>
                  <button onClick={handlePlaceOrder} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                    Make offer
                  </button>
               </div>
             </div>
           </div>

           {/* Seller Profiling Box */}
           <div className="glass-card p-6 bg-white/95 dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4 mb-5">
                 <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${product.farmerName || 'F'}&backgroundColor=0f172a`} alt="seller" className="w-14 h-14 rounded-full shadow-sm" />
                 <div>
                   <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Posted By</p>
                   <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{product.farmerName || 'Verified Seller'}</p>
                   <p className="text-xs text-slate-500 mt-0.5">Member since Oct 2025</p>
                 </div>
                 <div className="ml-auto text-slate-400">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"></path></svg>
                 </div>
              </div>

              {!isAuthenticated ? (
                <button onClick={() => navigate('/auth')} className="w-full block text-center bg-transparent border-2 border-slate-900 dark:border-slate-300 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-bold py-3 rounded-lg transition-colors">
                  Login to chat
                </button>
              ) : user.role === 'buyer' && !chatId ? (
                <button onClick={handleStartNegotiation} className="w-full block text-center bg-transparent border-2 border-slate-900 dark:border-slate-300 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-bold py-3 rounded-lg transition-colors">
                  Chat with seller
                </button>
              ) : null}
           </div>

           {/* Live OLX-style Threaded Chat Dropdown Array */}
           {chatId && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card flex flex-col h-[450px] bg-white/95 dark:bg-dark-800 rounded-xl shadow-xl border border-primary-200 dark:border-primary-900/50 overflow-hidden relative">
                <div className="bg-primary-600 p-4 text-white font-bold flex items-center justify-between shadow-md z-10">
                   <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${product.farmerName || 'F'}&backgroundColor=ffffff`} className="w-8 h-8 rounded-full border border-white" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border border-primary-600 rounded-full"></span>
                      </div>
                      <span>{product.farmerName || 'Seller'}</span>
                   </div>
                   <MessageCircle size={18} />
                </div>

                <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-dark-900/30 custom-scrollbar z-0 relative">
                   {chat.map((msg, i) => {
                     const isMe = msg.senderId === user.id || msg.senderId === user._id;
                     return (
                       <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-2.5 px-3 shadow-sm ${
                            isMe 
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 rounded-xl rounded-tr-sm text-sm' 
                            : 'bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl rounded-tl-sm text-sm'
                          }`}>
                             <p className="break-words font-medium">{msg.text}</p>
                             <p className={`text-[9px] mt-1 text-right block ${isMe ? 'text-blue-500/80' : 'text-slate-400'}`}>
                               {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </p>
                          </div>
                       </div>
                     )
                   })}
                </div>

                <div className="p-3 bg-white dark:bg-dark-800 border-t border-slate-200 dark:border-slate-700 z-10 shrink-0">
                   <form onSubmit={handleSendMessage} className="relative flex items-center border border-slate-300 dark:border-slate-600 rounded-full overflow-hidden bg-slate-50 dark:bg-dark-900 focus-within:border-primary-500">
                      <input 
                        type="text" 
                        required
                        placeholder="Type a message..." 
                        value={liveMessage}
                        onChange={e => setLiveMessage(e.target.value)}
                        className="w-full bg-transparent text-slate-900 dark:text-slate-200 outline-none py-2.5 px-4 pr-12 text-sm" 
                      />
                      <button type="submit" disabled={!liveMessage.trim()} className="absolute right-1 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center disabled:opacity-50">
                        <Send size={14} className="-ml-0.5" />
                      </button>
                   </form>
                </div>
             </motion.div>
           )}

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
