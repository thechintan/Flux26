import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PackageSearch, PlusCircle, LayoutList, IndianRupee, Truck, Calendar, Sparkles, MessageCircle, Send, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [myChats, setMyChats] = useState([]);

  // Active Chat State
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [liveMessage, setLiveMessage] = useState('');
  const scrollRef = useRef(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '', location: '', image: '', description: '' });
  const [aiPriceLoading, setAiPriceLoading] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeChat?.messages]);

  useEffect(() => {
    let interval;
    if (activeChatId && activeTab === 'messages') {
      interval = setInterval(async () => {
        try {
          const { data } = await apiService.getChat(activeChatId);
          setActiveChat(data);
        } catch (e) { }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeChatId, activeTab]);

  const fetchDashboardData = async () => {
    try {
      const ordersRes = await apiService.getOrders(user.id || user._id, user.role);
      setOrders(ordersRes.data);
      
      const chatsRes = await apiService.getMyChats();
      setMyChats(chatsRes.data);

      if (user.role === 'farmer') {
        const prodRes = await apiService.getMyProducts(user.id || user._id);
        setMyProducts(prodRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiPricing = async () => {
    if (!newProduct.name || !newProduct.quantity) return alert("Enter crop name and quantity first");
    setAiPriceLoading(true);
    try {
      const { data } = await apiService.getAiPrice(newProduct.name, Number(newProduct.quantity));
      setSuggestedPrice(data.suggestedPrice);
      setNewProduct(prev => ({ ...prev, price: data.suggestedPrice.toString() }));
    } catch (err) {
      console.error(err);
    } finally {
      setAiPriceLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await apiService.addProduct({ ...newProduct, price: Number(newProduct.price), quantity: Number(newProduct.quantity) }, user);
      setActiveTab('listings');
      setNewProduct({ name: '', price: '', quantity: '', location: '', image: '', description: '' });
      setSuggestedPrice(null);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await apiService.updateOrderStatus(orderId, status);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!liveMessage.trim() || !activeChatId) return;
    const sentText = liveMessage;
    setLiveMessage('');
    setActiveChat(prev => ({ ...prev, messages: [...(prev?.messages || []), { senderId: user.id || user._id, text: sentText, timestamp: new Date() }] }));
    try {
      const { data } = await apiService.sendMessage(activeChatId, sentText);
      setActiveChat(data);
      fetchDashboardData();
    } catch(err) { console.error(err); }
  };

  if (!user) return <div className="text-center py-20 text-slate-600 dark:text-slate-400">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }}
        className="w-full md:w-64 space-y-2 flex flex-col"
      >
        <div className="glass-card p-6 mb-4 mt-2 bg-white/95 dark:bg-dark-800">
          <div className="flex flex-col items-center">
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=22c55e`} alt="av" className="w-20 h-20 rounded-full mb-3 shadow-[0_0_15px_rgba(34,197,94,0.3)]"/>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user.name}</h3>
            <span className="badge mt-1 uppercase">{user.role}</span>
          </div>
        </div>

        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-500/50' : 'hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'}`}>
          <LayoutList size={20} /> Overview
        </button>
        <button 
          onClick={() => { setActiveTab('messages'); setActiveChatId(null); setActiveChat(null); }} 
          className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'messages' ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-500/50' : 'hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'}`}
        >
          <div className="flex items-center gap-3"><MessageCircle size={20} /> Inbox</div>
          {myChats.length > 0 && <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{myChats.length}</span>}
        </button>
        {user.role === 'farmer' && (
          <button onClick={() => setActiveTab('add')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'add' ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-500/50' : 'hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'}`}>
            <PlusCircle size={20} /> Add Product
          </button>
        )}
        {user.role === 'farmer' && (
          <button onClick={() => setActiveTab('listings')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'listings' ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-500/50' : 'hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'}`}>
            <PackageSearch size={20} /> My Listings
          </button>
        )}
        <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'orders' ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-500/50' : 'hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'}`}>
          <Truck size={20} /> Orders & Logistics
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <motion.main 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex-grow space-y-6"
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-green-500 dark:from-primary-400 dark:to-green-300">Dashboard Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 flex items-center justify-between bg-white/95 dark:bg-dark-800">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1 font-medium">Total {user.role === 'farmer' ? 'Earnings' : 'Spent'}</p>
                  <h4 className="text-2xl font-bold flex items-center text-slate-900 dark:text-white"><IndianRupee size={22} className="text-primary-600 dark:text-primary-500 mt-1 mr-1" /> {orders.reduce((acc, o) => acc + (o.price * o.quantity), 0).toLocaleString()}</h4>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-500 flex items-center justify-center">
                  <IndianRupee size={24} />
                </div>
              </div>
              <div className="glass-card p-6 flex items-center justify-between bg-white/95 dark:bg-dark-800">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1 font-medium">Active Orders</p>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{orders.filter(o => o.status !== 'Delivered').length}</h4>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center">
                  <Truck size={24} />
                </div>
              </div>
              {user.role === 'farmer' && (
                <div className="glass-card p-6 flex items-center justify-between bg-white/95 dark:bg-dark-800">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 mb-1 font-medium">Total Listings</p>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{myProducts.length}</h4>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 flex items-center justify-center">
                    <PackageSearch size={24} />
                  </div>
                </div>
              )}
            </div>
            
            <div className="glass-card p-6 bg-white/95 dark:bg-dark-800">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white"><Calendar size={20} className="text-primary-600 dark:text-primary-500"/> Recent Activity</h3>
              {orders.length === 0 ? <p className="text-slate-500 dark:text-slate-400 font-medium">No recent activity detected.</p> : (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((o, i) => (
                     <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl">
                       <div className="flex flex-col">
                         <span className="font-bold text-slate-800 dark:text-slate-200">Order #{o._id?.slice(-6).toUpperCase()}</span>
                         <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Status: {o.status}</span>
                       </div>
                       <span className="font-mono font-bold text-primary-600 dark:text-primary-400 flex items-center"><IndianRupee size={14}/>{o.price * o.quantity}</span>
                     </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'add' && user.role === 'farmer' && (
          <div className="glass-card p-8 relative overflow-hidden bg-white/95 dark:bg-dark-800">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 dark:bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <h2 className="text-2xl font-bold mb-6 flex items-center text-slate-900 dark:text-white"><PlusCircle className="mr-3 text-primary-600 dark:text-primary-500" /> New Product Listing</h2>
             
             <form onSubmit={handleAddProduct} className="space-y-5 relative z-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                   <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1 block">Crop Name</label>
                   <input required type="text" className="input-field" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Organic Wheat" />
                 </div>
                 <div>
                   <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1 block">Quantity (KG)</label>
                   <input required type="number" min="1" className="input-field" value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} placeholder="e.g. 100" />
                 </div>
               </div>
               
               <div className="p-5 rounded-xl border border-primary-200 dark:border-primary-500/20 bg-primary-50 dark:bg-primary-900/10">
                 <div className="flex justify-between items-center mb-4">
                   <h4 className="font-bold text-primary-700 dark:text-primary-400 flex items-center gap-2"><Sparkles size={18} /> AI Price Recommendation</h4>
                   <button type="button" onClick={handleAiPricing} disabled={aiPriceLoading} className="btn-secondary text-xs flex items-center gap-2 py-1.5 hover:bg-primary-100 dark:hover:bg-primary-500/20 hover:text-primary-600 dark:hover:text-primary-400">
                     {aiPriceLoading ? <div className="w-3 h-3 border-2 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin"></div> : "Generate Suggestion"}
                   </button>
                 </div>
                 <div className="flex gap-4 items-center">
                    <div className="flex-grow">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1 block">Unit Price (₹ / KG)</label>
                      <input required type="number" step="0.01" className="input-field bg-white dark:bg-dark-900 border-primary-300 dark:border-primary-500/50 text-xl font-mono text-primary-700 dark:text-primary-400" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="0.00" />
                    </div>
                    {suggestedPrice && (
                      <div className="w-1/3 text-center transition-all bg-white dark:bg-transparent rounded-lg p-2 shadow-sm dark:shadow-none border border-primary-100 dark:border-none">
                        <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Market Fair Price</span>
                        <span className="text-2xl font-bold text-primary-600 dark:text-primary-500 drop-shadow-sm">₹{suggestedPrice}</span>
                      </div>
                    )}
                 </div>
                 <p className="text-xs font-medium text-slate-500 mt-3">* Price varies based on real-time market demand and quantity bulk discounts.</p>
               </div>

               <div>
                 <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1 block">Location</label>
                 <input required type="text" className="input-field" value={newProduct.location} onChange={e => setNewProduct({...newProduct, location: e.target.value})} placeholder="e.g. Punjab, India" />
               </div>

               <div>
                 <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1 block">Product Description (optional)</label>
                 <textarea className="input-field h-24 resize-none" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Describe quality, variety, farming methods..." />
               </div>

               <button type="submit" className="btn-primary w-full py-3 mt-2 font-bold text-lg">
                 List Product on Marketplace
               </button>
             </form>
          </div>
        )}

        {/* Listings and Orders components... */}
        {activeTab === 'listings' && user.role === 'farmer' && (
          <div className="glass-card p-8 bg-white/95 dark:bg-dark-800">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white"><PackageSearch className="text-primary-600 dark:text-primary-500"/> Managing My Products</h2>
            <div className="space-y-4">
               {myProducts.length === 0 ? <p className="text-slate-600 dark:text-slate-400 font-medium">You haven't listed any products yet.</p> : myProducts.map(p => (
                 <div key={p._id} className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl flex items-center justify-between hover:border-primary-400 dark:hover:border-primary-500/30 transition-all">
                   <div className="flex items-center gap-4">
                     <img src={p.image || `https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&q=80`} alt={p.name} className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                     <div>
                       <h4 className="font-bold text-lg text-slate-900 dark:text-white">{p.name}</h4>
                       <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{p.quantity} KG Available • {p.location}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <span className="block font-bold text-primary-600 dark:text-primary-400 flex items-center justify-end"><IndianRupee size={16}/>{p.price}/kg</span>
                     <button className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white mt-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-800 rounded px-2 py-1 transition-colors">Edit</button>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
           <div className="glass-card p-8 min-h-[500px] bg-white/95 dark:bg-dark-800">
             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white"><Truck className="text-primary-600 dark:text-primary-500" /> Logistics & Orders</h2>
             <div className="space-y-4">
                {orders.length === 0 ? <p className="text-slate-600 dark:text-slate-400 font-medium w-full text-center mt-20">No active orders found.</p> : orders.map(o => (
                  <div key={o._id} className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-lg text-slate-900 dark:text-white">Order #{o._id?.slice(-6).toUpperCase()}</h4>
                          <span className={`badge ${o.status === 'Delivered' ? 'bg-green-100 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400' : 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400'}`}>
                            {o.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Amount: <strong className="text-slate-900 dark:text-white font-bold tracking-tight">₹{o.quantity * o.price}</strong> ({o.quantity}kg @ ₹{o.price}/kg)</p>
                      </div>
                      
                      {user.role === 'farmer' && o.status !== 'Delivered' && (
                        <div className="flex gap-2">
                           <select 
                            className="input-field py-1 text-sm bg-white dark:bg-dark-900"
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                           >
                              <option value="Order placed">Order placed</option>
                              <option value="Packed">Packed</option>
                              <option value="In transit">In transit</option>
                              <option value="Delivered">Delivered</option>
                           </select>
                        </div>
                      )}
                    </div>

                    {/* Delivery Status Progress Bar */}
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                       <div className="flex justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2 relative px-2 tracking-wide text-center">
                           <span className={o.status === "Order placed" || o.status === "Packed" || o.status === "In transit" || o.status === "Delivered" ? "text-primary-600 dark:text-primary-400" : ""}>Placed</span>
                           <span className={o.status === "Packed" || o.status === "In transit" || o.status === "Delivered" ? "text-primary-600 dark:text-primary-400" : ""}>Packed</span>
                           <span className={o.status === "In transit" || o.status === "Delivered" ? "text-primary-600 dark:text-primary-400" : ""}>In Transit</span>
                           <span className={o.status === "Delivered" ? "text-primary-600 dark:text-primary-400" : ""}>Delivered</span>
                       </div>
                       <div className="w-full h-2 bg-slate-200 dark:bg-dark-800 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-1000 ease-out" 
                                style={{ width: o.status === 'Delivered' ? '100%' : o.status === 'In transit' ? '75%' : o.status === 'Packed' ? '50%' : '25%' }}></div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        )}

        {activeTab === 'messages' && (
          <div className="glass-card flex overflow-hidden bg-white/95 dark:bg-dark-800 min-h-[600px] h-[75vh]">
            {/* Chats List Sidebar */}
            <div className={`w-full md:w-1/3 border-r border-slate-200 dark:border-slate-700/50 flex flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-dark-900">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2"><MessageCircle size={20} className="text-primary-600 dark:text-primary-500"/> Negotiations</h3>
              </div>
              <div className="flex-grow overflow-y-auto custom-scrollbar">
                {myChats.length === 0 ? <p className="p-6 text-center text-slate-500 text-sm">No active negotiations.</p> : myChats.map(c => {
                  const partnerName = user.role === 'farmer' ? c.buyerId?.name : c.farmerId?.name;
                  const preview = c.messages.length > 0 ? c.messages[c.messages.length - 1].text : 'No messages yet...';
                  return (
                    <button 
                      key={c._id} 
                      onClick={() => { setActiveChatId(c._id); setActiveChat(c); }}
                      className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-700/30 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/20 ${activeChatId === c._id ? 'bg-primary-50 dark:bg-primary-500/10 border-l-4 border-l-primary-500 text-primary-900' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-900 dark:text-white truncate pr-2">{c.productId?.name || 'Deleted Product'}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(c.lastUpdated).toLocaleDateString()}</span>
                      </div>
                      <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 capitalize block mb-1">With: {partnerName}</span>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{preview}</p>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Active Chat Thread */}
            <div className={`w-full md:w-2/3 flex flex-col bg-slate-50/50 dark:bg-dark-900/50 ${!activeChatId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
              {!activeChatId ? (
                <div className="text-center text-slate-400 dark:text-slate-500 flex flex-col items-center">
                  <MessageCircle size={48} className="mb-4 opacity-50" />
                  <p>Select a conversation to continue negotiating.</p>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-dark-800 flex items-center gap-3">
                    <button onClick={() => setActiveChatId(null)} className="md:hidden p-2 bg-slate-100 dark:bg-slate-700 rounded-full mr-2"><ChevronRight className="rotate-180" size={16}/></button>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{activeChat?.productId?.name}</h4>
                      <p className="text-xs text-primary-600 font-semibold tracking-wide">Negotiating with {user.role === 'farmer' ? activeChat?.buyerId?.name : activeChat?.farmerId?.name}</p>
                    </div>
                  </div>
                  
                  <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4 custom-scrollbar">
                     {activeChat?.messages.map((msg, i) => {
                       const isMe = msg.senderId === user.id || msg.senderId === user._id;
                       return (
                         <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 px-4 shadow-sm flex flex-col ${
                              isMe ? 'bg-primary-600 text-white rounded-2xl rounded-tr-none' : 'bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none text-slate-800 dark:text-slate-200'
                            }`}>
                               <span className="break-words font-medium">{msg.text}</span>
                               <span className={`text-[9px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                                 {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </span>
                            </div>
                         </div>
                       )
                     })}
                  </div>
                  
                  <div className="p-4 bg-white dark:bg-dark-800 border-t border-slate-200 dark:border-slate-700/50">
                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                      <input 
                        type="text" 
                        required
                        placeholder="Offer a price..." 
                        value={liveMessage}
                        onChange={e => setLiveMessage(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-full py-2.5 px-4 pr-12 outline-none focus:ring-1 focus:ring-primary-500 font-medium" 
                      />
                      <button type="submit" disabled={!liveMessage.trim()} className="absolute right-1 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center disabled:opacity-50 hover:bg-primary-600 transition-colors shadow-md">
                        <Send size={14} className="-ml-0.5" />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </motion.main>
    </div>
  );
};

export default Dashboard;
