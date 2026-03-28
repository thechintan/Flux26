import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PackageSearch, PlusCircle, LayoutList, IndianRupee, Truck, Calendar, Sparkles, MessageCircle, Send, ChevronRight, CheckCircle, Upload, AlertTriangle, Link as LinkIcon, XCircle, CreditCard, Edit3, Trash2, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [myChats, setMyChats] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Active Chat State
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [liveMessage, setLiveMessage] = useState('');
  const scrollRef = useRef(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '', location: '', description: '', category: 'Vegetables', subCategory: '', isDamaged: false, contactNumber: '' });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [issuePhotos, setIssuePhotos] = useState([]);
  const [showMapPicker, setShowMapPicker] = useState(false);

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
      
      const notifRes = await apiService.getNotifications();
      setNotifications(notifRes.data);

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
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('price', newProduct.price);
      formData.append('quantity', newProduct.quantity);
      formData.append('location', newProduct.location);
      formData.append('description', newProduct.description);
      formData.append('category', newProduct.category);
      formData.append('subCategory', newProduct.subCategory);
      formData.append('isDamaged', newProduct.isDamaged);
      formData.append('contactNumber', newProduct.contactNumber);
      for (let i = 0; i < mediaFiles.length; i++) {
        formData.append('media', mediaFiles[i]);
      }

      await apiService.addProduct(formData);
      setActiveTab('listings');
      setNewProduct({ name: '', price: '', quantity: '', location: '', description: '', category: 'Vegetables', subCategory: '', isDamaged: false, contactNumber: '' });
      setMediaFiles([]);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePickLocation = () => {
    setShowMapPicker(true);
  };

  const handleMapClick = (e) => {
    const lat = e.latlng?.lat || e.latLng?.lat();
    const lng = e.latlng?.lng || e.latLng?.lng();
    // Use reverse geocoding via Nominatim (free)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(r => r.json())
      .then(data => {
        const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setNewProduct(prev => ({ ...prev, location: addr }));
        setShowMapPicker(false);
      })
      .catch(() => {
        setNewProduct(prev => ({ ...prev, location: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
        setShowMapPicker(false);
      });
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(r => r.json())
        .then(data => {
          setNewProduct(prev => ({ ...prev, location: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        })
        .catch(() => {
          setNewProduct(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        });
    }, () => alert('Location access denied'));
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

  const handleAcceptOffer = async () => {
    if (!activeChat) return;
    // Find the last MAKE_OFFER message to get price/qty
    const offerMsg = [...(activeChat.messages || [])].reverse().find(m => m.text.includes('SYSTEM_ACTION:MAKE_OFFER'));
    if (!offerMsg) return alert('No formal offer found to accept.');
    const priceMatch = offerMsg.text.match(/PRICE:(\d+)/);
    const qtyMatch = offerMsg.text.match(/QTY:(\d+)/);
    try {
      await apiService.sendMessage(activeChatId, `SYSTEM_ACTION:OFFER_ACCEPTED|QTY:${qtyMatch?.[1] || 1}|PRICE:${priceMatch?.[1] || 0}`);
      const { data } = await apiService.getChat(activeChatId);
      setActiveChat(data);
      fetchDashboardData();
      alert("Offer accepted! The buyer will be notified to make payment.");
    } catch (err) { console.error(err); }
  };

  const handleDenyOffer = async () => {
    if (!activeChat) return;
    try {
      await apiService.sendMessage(activeChatId, `SYSTEM_ACTION:OFFER_DENIED`);
      const { data } = await apiService.getChat(activeChatId);
      setActiveChat(data);
      fetchDashboardData();
      alert("Offer denied.");
    } catch (err) { console.error(err); }
  };

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentChat, setPaymentChat] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ method: 'card', cardNumber: '', expiry: '', cvv: '', upiId: '' });

  const openPaymentModal = (chat) => {
    setPaymentChat(chat);
    setShowPaymentModal(true);
    setPaymentForm({ method: 'card', cardNumber: '', expiry: '', cvv: '', upiId: '' });
  };

  const handleConfirmPayment = async () => {
    if (!paymentChat) return;
    if (paymentForm.method === 'card' && (!paymentForm.cardNumber || !paymentForm.expiry || !paymentForm.cvv)) return alert('Fill all card details.');
    if (paymentForm.method === 'upi' && !paymentForm.upiId) return alert('Enter UPI ID.');
    
    // Parse price/qty from the accepted offer message
    const acceptMsg = [...(paymentChat.messages || [])].reverse().find(m => m.text.includes('SYSTEM_ACTION:OFFER_ACCEPTED'));
    const priceMatch = acceptMsg?.text.match(/PRICE:(\d+)/);
    const qtyMatch = acceptMsg?.text.match(/QTY:(\d+)/);
    const price = Number(priceMatch?.[1]) || paymentChat.productId?.price || 0;
    const qty = Number(qtyMatch?.[1]) || 1;

    try {
      await apiService.createOrder({
        farmer: paymentChat.farmerId._id,
        product: paymentChat.productId._id,
        price,
        quantity: qty,
      });
      setShowPaymentModal(false);
      setPaymentChat(null);
      alert('Payment Successful! Order has been placed and logistics informed.');
      fetchDashboardData();
      setActiveTab('orders');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.msg || 'Payment failed. Please try again.');
    }
  };

  // Manage products
  const [editingProductId, setEditingProductId] = useState(null);
  const [editProductData, setEditProductData] = useState({ price: '', quantity: '' });

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await apiService.deleteProduct(id);
      fetchDashboardData();
    } catch (err) { console.error(err); }
  };

  const handleEditProduct = (p) => {
    setEditingProductId(p._id);
    setEditProductData({ price: p.price.toString(), quantity: p.quantity.toString() });
  };

  const handleSaveProduct = async (id) => {
    try {
      await apiService.updateProduct(id, { price: Number(editProductData.price), quantity: Number(editProductData.quantity) });
      setEditingProductId(null);
      fetchDashboardData();
    } catch (err) { console.error(err); }
  };

  const [issueReason, setIssueReason] = useState('');
  const [activeIssueOrderId, setActiveIssueOrderId] = useState(null);
  
  const handleRaiseIssue = async (orderId) => {
    if (!issueReason.trim()) return alert('Enter a reason');
    try {
      // Build reason string with photo info
      let fullReason = issueReason;
      if (issuePhotos.length > 0) {
        fullReason += ` [${issuePhotos.length} photo proof(s) attached]`;
      }
      await apiService.raiseOrderIssue(orderId, fullReason);
      setActiveIssueOrderId(null);
      setIssueReason('');
      setIssuePhotos([]);
      fetchDashboardData();
      alert('Issue reported with photo proof to the seller.');
    } catch(err) { console.error(err); }
  }

  const handleResolveIssue = async (orderId, actionType) => {
    let amount = 0;
    if (actionType === 'Resolved_Discount') {
       amount = prompt("Enter the total discount / fine amount (₹) to deduct from the order:");
       if (!amount || isNaN(amount)) return;
    }
    try {
      await apiService.resolveOrderIssue(orderId, actionType, amount);
      fetchDashboardData();
      alert('Issue resolved officially.');
    } catch(err) { console.error(err); }
  }

  if (!user) return <div className="text-center py-20">Loading...</div>;

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

        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-500/50' : 'hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-400 font-medium'}`}>
          <LayoutList size={20} /> Overview
        </button>
        <button onClick={() => { setActiveTab('messages'); setActiveChatId(null); setActiveChat(null); }} className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'messages' ? 'bg-primary-50 text-primary-700 border border-primary-200 dark:border-primary-500/50 dark:bg-primary-900/40 dark:text-primary-400' : 'hover:bg-slate-100 text-slate-600 font-medium dark:hover:bg-slate-800 dark:text-slate-400'}`}>
          <div className="flex items-center gap-3"><MessageCircle size={20} /> Inbox</div>
          {myChats.length > 0 && <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{myChats.length}</span>}
        </button>
        {user.role === 'farmer' && (
          <button onClick={() => setActiveTab('add')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'add' ? 'bg-primary-50 text-primary-700 border border-primary-200 dark:border-primary-500/50 dark:bg-primary-900/40 dark:text-primary-400' : 'hover:bg-slate-100 text-slate-600 font-medium dark:hover:bg-slate-800 dark:text-slate-400'}`}>
            <PlusCircle size={20} /> Add Product
          </button>
        )}
        {user.role === 'farmer' && (
          <button onClick={() => setActiveTab('listings')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'listings' ? 'bg-primary-50 text-primary-700 border border-primary-200 dark:border-primary-500/50 dark:bg-primary-900/40 dark:text-primary-400' : 'hover:bg-slate-100 text-slate-600 font-medium dark:hover:bg-slate-800 dark:text-slate-400'}`}>
            <PackageSearch size={20} /> My Listings
          </button>
        )}
        <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'orders' ? 'bg-primary-50 text-primary-700 border border-primary-200 dark:border-primary-500/50 dark:bg-primary-900/40 dark:text-primary-400' : 'hover:bg-slate-100 text-slate-600 font-medium dark:hover:bg-slate-800 dark:text-slate-400'}`}>
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

            {/* Buyer Notifications Block */}
            {user.role === 'buyer' && myChats.some(c => c.messages.some(m => m.text.includes('SYSTEM_ACTION:OFFER_ACCEPTED'))) && (
              <div className="glass-card p-6 border-l-4 border-l-green-500 bg-white dark:bg-dark-800 shadow-md">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3"><CheckCircle className="text-green-500" size={20}/> Seller Accepted — Payment Required</h3>
                 <div className="space-y-3">
                   {myChats.filter(c => c.messages.some(m => m.text.includes('SYSTEM_ACTION:OFFER_ACCEPTED'))).map(c => {
                     const acceptMsg = [...c.messages].reverse().find(m => m.text.includes('OFFER_ACCEPTED'));
                     const priceMatch = acceptMsg?.text.match(/PRICE:(\d+)/);
                     const qtyMatch = acceptMsg?.text.match(/QTY:(\d+)/);
                     return (
                       <div key={c._id} className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Offer Accepted for <Link to={`/product/${c.productId._id}`} className="text-primary-600 hover:underline">{c.productId.name}</Link></p>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">₹{priceMatch?.[1] || '?'}/kg × {qtyMatch?.[1] || '?'}kg = <strong>₹{(Number(priceMatch?.[1]||0) * Number(qtyMatch?.[1]||0)).toLocaleString()}</strong></p>
                        </div>
                        <button onClick={() => openPaymentModal(c)} className="btn-primary py-2 px-5 !bg-green-600 hover:!bg-green-700 shadow-lg shadow-green-600/20 flex items-center gap-2"><CreditCard size={16}/> Pay Now</button>
                      </div>
                     );
                   })}
                 </div>
              </div>
            )}
            
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
             
             <form onSubmit={handleAddProduct} className="space-y-6 relative z-10">
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

               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                   <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1 block">Main Category</label>
                   <select required className="input-field" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                     {['Vegetables', 'Fruits', 'Anaj', 'Daal', 'Masala', 'Damaged', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1 block">Sub Category</label>
                   <input type="text" className="input-field" value={newProduct.subCategory} onChange={e => setNewProduct({...newProduct, subCategory: e.target.value})} placeholder="e.g. Tomato, Potato, Basmati..." />
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                   <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1 block">Unit Price (₹ / KG)</label>
                   <input required type="number" step="0.01" className="input-field text-xl font-mono text-primary-700 dark:text-primary-400" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="0.00" />
                 </div>
                 <div>
                   <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1 block">📞 Contact Number</label>
                   <input required type="tel" className="input-field" value={newProduct.contactNumber} onChange={e => setNewProduct({...newProduct, contactNumber: e.target.value})} placeholder="e.g. +91 98765-43210" />
                 </div>
               </div>

               <div>
                 <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1 block flex items-center gap-2"><Upload size={16}/> Upload Product Photos/Videos</label>
                 <input type="file" multiple accept="image/*,video/*" onChange={(e) => setMediaFiles(Array.from(e.target.files))} className="input-field !py-3 bg-slate-50 dark:bg-dark-900 border-dashed border-2 hover:border-primary-500 cursor-pointer" />
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium tracking-wide">Select multiple photos or quick videos showing crop quality to build buyer trust.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div>
                   <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1 block">📍 Location</label>
                   <input required type="text" className="input-field" value={newProduct.location} onChange={e => setNewProduct({...newProduct, location: e.target.value})} placeholder="e.g. Punjab, India" />
                   <div className="flex gap-2 mt-2">
                     <button type="button" onClick={handleGetCurrentLocation} className="text-xs font-bold text-primary-600 hover:text-primary-800 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg border border-primary-200 dark:border-primary-800 flex items-center gap-1 transition-colors">📍 Use Live Location</button>
                     <button type="button" onClick={handlePickLocation} className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors">🗺️ Pick on Map</button>
                   </div>
                 </div>
                 <div className="flex items-center mt-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${newProduct.isDamaged ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white dark:bg-dark-900 border-slate-300 dark:border-slate-700 group-hover:border-primary-400'}`}>
                        {newProduct.isDamaged && <CheckCircle size={14} strokeWidth={4} />}
                      </div>
                      <input type="checkbox" className="hidden" checked={newProduct.isDamaged} onChange={(e) => setNewProduct({...newProduct, isDamaged: e.target.checked})} />
                      <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-red-500 transition-colors flex items-center gap-1"><AlertTriangle size={16} /> Mark as Damaged / Discount</span>
                    </label>
                 </div>
               </div>

               {/* Map Picker Modal */}
               {showMapPicker && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                   <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                     <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                       <h3 className="font-bold text-lg text-slate-900 dark:text-white">📍 Pick Location on Map</h3>
                       <button onClick={() => setShowMapPicker(false)} className="text-slate-500 hover:text-slate-800 font-bold text-xl">✕</button>
                     </div>
                     <div className="p-4">
                       <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Click anywhere on the map to select your location. The full address will be auto-filled.</p>
                       <iframe 
                         src="https://www.openstreetmap.org/export/embed.html?bbox=68.0,6.5,97.5,37.5&layer=mapnik" 
                         className="w-full h-[400px] rounded-xl border border-slate-200 dark:border-slate-700"
                         title="Location Picker"
                       ></iframe>
                       <p className="text-xs text-slate-400 mt-2">For exact location, use the <strong>"Use Live Location"</strong> button which uses your device GPS.</p>
                       <button onClick={() => { handleGetCurrentLocation(); setShowMapPicker(false); }} className="btn-primary w-full mt-3 py-2.5 font-bold">Use My Current GPS Location</button>
                     </div>
                   </div>
                 </div>
               )}

               <div>
                 <label className="text-sm font-semibold text-slate-700 dark:text-slate-400 mb-1 block">Description (optional)</label>
                 <textarea className="input-field h-24 resize-none" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Describe quality, variety, farming methods..." />
               </div>

               <button type="submit" className="btn-primary w-full py-3.5 mt-2 font-bold text-lg">
                 List Product on Marketplace
               </button>
             </form>
          </div>
        )}

        {/* Listings components... */}
        {activeTab === 'listings' && user.role === 'farmer' && (
          <div className="glass-card p-8 bg-white/95 dark:bg-dark-800">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white"><PackageSearch className="text-primary-600 dark:text-primary-500"/> Managing My Produce</h2>
            <div className="space-y-4">
               {myProducts.length === 0 ? <p className="text-slate-600 dark:text-slate-400 font-medium tracking-wide">You haven't listed any products yet. Time to sow the seed!</p> : myProducts.map(p => (
                 <div key={p._id} className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl flex items-center justify-between hover:border-primary-400 dark:hover:border-primary-500/30 transition-all">
                   <div className="flex items-center gap-4">
                     <img src={p.media && p.media.length ? `http://localhost:5000${p.media[0]}` : p.image || `https://images.unsplash.com/photo-1592924357228?w=200`} alt={p.name} className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-sm" />
                     <div>
                       <h4 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                         {p.name} 
                         {p.isDamaged && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded-sm uppercase tracking-wider font-extrabold border border-red-200">Damaged</span>}
                       </h4>
                       <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{p.quantity} KG • {p.category}{p.subCategory ? ` > ${p.subCategory}` : ''}</p>
                     </div>
                   </div>
                   <div className="text-right flex flex-col items-end gap-2">
                     {editingProductId === p._id ? (
                       <div className="flex items-center gap-2">
                         <input type="number" value={editProductData.price} onChange={e => setEditProductData({...editProductData, price: e.target.value})} className="w-20 input-field !py-1 !text-sm" placeholder="Price" />
                         <input type="number" value={editProductData.quantity} onChange={e => setEditProductData({...editProductData, quantity: e.target.value})} className="w-20 input-field !py-1 !text-sm" placeholder="Qty" />
                         <button onClick={() => handleSaveProduct(p._id)} className="text-xs font-bold text-green-600 hover:text-green-800 border border-green-300 bg-green-50 rounded px-2 py-1"><CheckCircle size={14}/></button>
                         <button onClick={() => setEditingProductId(null)} className="text-xs font-bold text-slate-500 hover:text-slate-700 border border-slate-300 rounded px-2 py-1"><XCircle size={14}/></button>
                       </div>
                     ) : (
                       <>
                         <span className="block font-bold text-primary-600 dark:text-primary-400 flex items-center justify-end"><IndianRupee size={16}/>{p.price}/kg</span>
                         <div className="flex gap-1.5">
                           <button onClick={() => handleEditProduct(p)} className="text-xs font-medium text-slate-500 hover:text-blue-600 border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-800 rounded px-2.5 py-1.5 transition-colors shadow-sm flex items-center gap-1"><Edit3 size={12}/> Edit</button>
                           <button onClick={() => handleDeleteProduct(p._id)} className="text-xs font-medium text-red-500 hover:text-red-700 border border-red-200 dark:border-red-800 bg-white dark:bg-dark-800 rounded px-2.5 py-1.5 transition-colors shadow-sm flex items-center gap-1"><Trash2 size={12}/> Delete</button>
                         </div>
                       </>
                     )}
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Orders Logisitcs component */}
        {activeTab === 'orders' && (
           <div className="glass-card p-8 min-h-[500px] bg-white/95 dark:bg-dark-800">
             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white"><Truck className="text-primary-600 dark:text-primary-500" /> Logistics & Orders</h2>
             <div className="space-y-4">
                {orders.length === 0 ? <p className="text-slate-600 dark:text-slate-400 font-medium w-full text-center mt-20">No active orders found.</p> : orders.map(o => (
                  <div key={o._id} className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl transition-all shadow-sm">
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
                            className="input-field py-1.5 font-semibold text-sm bg-white dark:bg-dark-900 shadow-sm border-slate-300 dark:border-slate-600 border"
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                           >
                              <option value="Order placed">Order Confirmed</option>
                              <option value="Packed">Packed</option>
                              <option value="In transit">Out for Delivery</option>
                              <option value="Delivered">Delivered Done</option>
                           </select>
                        </div>
                      )}
                    </div>

                    {/* Dispute Status Block */}
                    {o.issueStatus && o.issueStatus !== 'None' && (
                       <div className={`mt-4 p-3 rounded-lg border flex flex-col gap-2 ${
                         o.issueStatus === 'Raised' ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 
                         'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30'
                       }`}>
                          <div className="flex items-center gap-2 font-bold text-sm">
                            {o.issueStatus === 'Raised' ? <AlertTriangle className="text-red-600" size={16}/> : <CheckCircle className="text-yellow-600" size={16}/>}
                            <span className={o.issueStatus === 'Raised' ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'}>
                              {o.issueStatus === 'Raised' ? 'Quality Issue / Scam Reported' : `Issue Completed: ${o.issueStatus.replace('Resolved_', '')}`}
                            </span>
                          </div>
                          
                          {o.issueReason && <p className="text-xs text-slate-600 dark:text-slate-400 font-medium bg-white/50 dark:bg-dark-900/50 p-2 rounded border border-slate-100 dark:border-slate-800">"{o.issueReason}"</p>}
                          
                          {user.role === 'farmer' && o.issueStatus === 'Raised' && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              <button onClick={() => handleResolveIssue(o._id, 'Resolved_Discount')} className="btn-secondary !text-xs !py-1.5 !px-3 font-bold border-yellow-400 text-yellow-700 hover:bg-yellow-100">Offer Partial Refund</button>
                              <button onClick={() => handleResolveIssue(o._id, 'Resolved_Refund')} className="btn-secondary !text-xs !py-1.5 !px-3 font-bold border-red-400 text-red-700 hover:bg-red-100">Full Refund / Cancel</button>
                              <button onClick={() => handleResolveIssue(o._id, 'Rejected')} className="btn-secondary !text-xs !py-1.5 !px-3 font-bold border-slate-300">Reject Claim</button>
                            </div>
                          )}
                       </div>
                    )}

                    {/* Buyer Report Button */}
                    {user.role === 'buyer' && o.status !== 'Order placed' && (!o.issueStatus || o.issueStatus === 'None') && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {activeIssueOrderId === o._id ? (
                          <div className="flex flex-col gap-2">
                            <input type="text" value={issueReason} onChange={e => setIssueReason(e.target.value)} placeholder="Describe the issue (e.g., Damaged goods, rotten, not as described)" className="input-field !text-sm !py-2" />
                            <div>
                              <label className="text-xs font-bold text-red-600 mb-1 block">📸 Upload Photo Proof</label>
                              <input type="file" multiple accept="image/*" onChange={(e) => setIssuePhotos(Array.from(e.target.files))} className="input-field !text-xs !py-1.5 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 border-dashed border-2" />
                              {issuePhotos.length > 0 && <p className="text-xs text-green-600 mt-1 font-medium">✓ {issuePhotos.length} photo(s) selected</p>}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleRaiseIssue(o._id)} className="btn-primary !bg-red-600 hover:!bg-red-700 !text-xs !py-1.5 w-auto px-4 shadow-red-500/20 shadow-lg">Submit Report</button>
                              <button onClick={() => { setActiveIssueOrderId(null); setIssueReason(''); setIssuePhotos([]); }} className="btn-secondary !text-xs !py-1.5">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setActiveIssueOrderId(o._id)} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"><AlertTriangle size={14}/> Report Quality Issue / Fraud</button>
                        )}
                      </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                       <div className="flex justify-between text-[11px] font-extrabold text-slate-400 dark:text-slate-500 mb-2 relative px-2 tracking-wider text-center uppercase">
                           <span className={o.status === "Order placed" || o.status === "Packed" || o.status === "In transit" || o.status === "Delivered" ? "text-primary-600 dark:text-primary-400" : ""}>Confirmed</span>
                           <span className={o.status === "Packed" || o.status === "In transit" || o.status === "Delivered" ? "text-primary-600 dark:text-primary-400" : ""}>Packed</span>
                           <span className={o.status === "In transit" || o.status === "Delivered" ? "text-primary-600 dark:text-primary-400" : ""}>On Delivery</span>
                           <span className={o.status === "Delivered" ? "text-primary-600 dark:text-primary-400" : ""}>Done</span>
                       </div>
                       <div className="w-full h-3 bg-slate-200 dark:bg-dark-800 rounded-full overflow-hidden shadow-inner">
                           <div className="h-full bg-gradient-to-r from-primary-600 to-green-400 transition-all duration-1000 ease-out relative" 
                                style={{ width: o.status === 'Delivered' ? '100%' : o.status === 'In transit' ? '75%' : o.status === 'Packed' ? '50%' : '25%' }}>
                                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        )}

        {/* Chattings / Inbox */}
        {activeTab === 'messages' && (
          <div className="glass-card flex overflow-hidden bg-white/95 dark:bg-dark-800 min-h-[600px] h-[75vh]">
            {/* Chats List Sidebar */}
            <div className={`w-full md:w-1/3 border-r border-slate-200 dark:border-slate-700/50 flex flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-dark-900 border-t border-l">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2"><MessageCircle size={20} className="text-primary-600 dark:text-primary-500"/> Negotiations</h3>
              </div>
              <div className="flex-grow overflow-y-auto custom-scrollbar">
                {myChats.length === 0 ? <p className="p-6 text-center text-slate-500 text-sm font-medium">No active negotiations in your inbox.</p> : myChats.map(c => {
                  const partnerName = user.role === 'farmer' ? c.buyerId?.name : c.farmerId?.name;
                  const lastMsg = c.messages.length > 0 ? c.messages[c.messages.length - 1].text : 'No messages yet...';
                  // Clean preview: don't show raw SYSTEM_ACTION text
                  const preview = lastMsg.startsWith('SYSTEM_ACTION:') ? (lastMsg.includes('MAKE_OFFER') ? '📦 Formal Offer Sent' : lastMsg.includes('ACCEPTED') ? '✅ Offer Accepted' : lastMsg.includes('DENIED') ? '❌ Offer Denied' : lastMsg.includes('RE_OFFER') ? '🏷️ Re-offer Sent' : 'System Message') : lastMsg;
                  return (
                    <button 
                      key={c._id} 
                      onClick={() => { setActiveChatId(c._id); setActiveChat(c); }}
                      className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-700/30 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/20 ${activeChatId === c._id ? 'bg-primary-50 dark:bg-primary-500/10 border-l-4 border-l-primary-500 text-primary-900' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-900 dark:text-white truncate pr-2">{c.productId?.name || 'Item'}</span>
                      </div>
                      <span className="text-xs font-bold text-primary-600 dark:text-primary-400 capitalize block mb-1">👤 With: {partnerName}</span>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate tracking-wide">{preview}</p>
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
                  <p className="font-medium tracking-wide">Select a conversation to continue negotiating.</p>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-dark-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setActiveChatId(null)} className="md:hidden p-2 bg-slate-100 dark:bg-slate-700 rounded-full mr-2"><ChevronRight className="rotate-180" size={16}/></button>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">{activeChat?.productId?.name} <LinkIcon size={14} className="text-slate-400" /></h4>
                        <p className="text-xs text-primary-600 font-bold tracking-wider uppercase mt-1">Chatting with {user.role === 'farmer' ? activeChat?.buyerId?.name : activeChat?.farmerId?.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Context Sensitive Notification Banners */}
                  {user.role === 'farmer' && activeChat?.messages?.some(m => m.text.includes('SYSTEM_ACTION:MAKE_OFFER')) && !activeChat?.messages?.some(m => m.text.includes('SYSTEM_ACTION:OFFER_ACCEPTED') || m.text.includes('SYSTEM_ACTION:OFFER_DENIED')) && (() => {
                     const offerMsg = [...(activeChat.messages || [])].reverse().find(m => m.text.includes('SYSTEM_ACTION:MAKE_OFFER'));
                     const priceM = offerMsg?.text.match(/PRICE:(\d+)/);
                     const qtyM = offerMsg?.text.match(/QTY:(\d+)/);
                     return (
                       <div className="bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-700/50 p-3 px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
                         <div>
                            <p className="font-bold text-yellow-800 dark:text-yellow-400 flex items-center gap-1.5"><ShoppingCart size={16} /> Buyer Offer Received</p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-500 font-medium mt-1">₹{priceM?.[1]}/kg × {qtyM?.[1]}kg = ₹{(Number(priceM?.[1]||0)*Number(qtyM?.[1]||0)).toLocaleString()}</p>
                         </div>
                         <div className="flex gap-2 shrink-0">
                           <button onClick={handleAcceptOffer} className="btn-primary !bg-green-600 hover:!bg-green-700 text-xs !py-2 px-4 flex items-center gap-1.5 shadow-lg"><CheckCircle size={14} /> Accept</button>
                           <button onClick={handleDenyOffer} className="btn-primary !bg-red-600 hover:!bg-red-700 text-xs !py-2 px-4 flex items-center gap-1.5 shadow-lg"><XCircle size={14} /> Deny</button>
                         </div>
                       </div>
                     );
                  })()}

                  {user.role === 'buyer' && activeChat?.messages?.some(m => m.text.includes('SYSTEM_ACTION:OFFER_ACCEPTED')) && (
                     <div className="bg-green-50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-700/50 p-3 px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
                        <div>
                           <p className="font-bold text-green-800 dark:text-green-400 flex items-center gap-1.5"><CheckCircle size={16} /> Seller Accepted Your Offer!</p>
                           <p className="text-xs text-green-700 dark:text-green-500 font-medium mt-1">Complete payment to finalize your order.</p>
                        </div>
                        <button onClick={() => openPaymentModal(activeChat)} className="btn-primary !bg-green-600 hover:!bg-green-700 text-xs !py-2 px-4 shadow-lg shrink-0 flex items-center gap-1.5"><CreditCard size={16}/> Pay Now</button>
                     </div>
                  )}
                  
                  <div ref={scrollRef} className="flex-grow p-5 overflow-y-auto space-y-4 custom-scrollbar">
                     {activeChat?.messages.map((msg, i) => {
                       const isMe = msg.senderId === user.id || msg.senderId === user._id;
                       const isSystem = msg.text.startsWith("SYSTEM_ACTION:");
                       
                       if(isSystem) {
                         if (msg.text.includes('MAKE_OFFER')) {
                           const qtyM = msg.text.match(/QTY:(\d+)/);
                           const priceM = msg.text.match(/PRICE:(\d+)/);
                           return (
                             <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                               <div className={`max-w-[75%] p-3 px-4 rounded-xl shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-dark-800 border border-blue-200 dark:border-blue-800 rounded-tl-none text-slate-800 dark:text-slate-200'}`}>
                                 <p className="font-bold text-sm flex items-center gap-1.5"><ShoppingCart size={14}/> Formal Offer</p>
                                 <p className="text-sm mt-1">Qty: <strong>{qtyM?.[1]} KG</strong> • Price: <strong>₹{priceM?.[1]}/kg</strong></p>
                               </div>
                             </div>
                           );
                         }
                         if (msg.text.includes('OFFER_ACCEPTED')) {
                           return (
                             <div key={i} className="flex justify-center my-4">
                                <span className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-green-200 dark:border-green-500/30">
                                  🤝 Offer Accepted
                                </span>
                             </div>
                           );
                         }
                         if (msg.text.includes('OFFER_DENIED')) {
                           return (
                             <div key={i} className="flex justify-center my-4">
                                <span className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-red-200 dark:border-red-500/30">
                                  ❌ Offer Denied
                                </span>
                             </div>
                           );
                         }
                         if (msg.text.includes('RE_OFFER')) {
                           const priceM = msg.text.match(/PRICE:(\d+)/);
                           return (
                             <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                               <div className={`max-w-[75%] p-3 px-4 rounded-xl shadow-sm ${isMe ? 'bg-yellow-500 text-white rounded-tr-none' : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-tl-none text-yellow-800 dark:text-yellow-300'}`}>
                                 <p className="font-bold text-sm flex items-center gap-1.5">🏷️ {isMe ? 'You Re-offered' : 'Seller Re-offer'}</p>
                                 <p className="text-sm mt-1">New Price: <strong>₹{priceM?.[1]}/kg</strong> — Interested?</p>
                               </div>
                             </div>
                           );
                         }
                         return null;
                       }

                       return (
                         <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3.5 px-4 shadow-sm flex flex-col ${
                              isMe ? 'bg-primary-600 text-white rounded-2xl rounded-tr-none' : 'bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none text-slate-800 dark:text-slate-200'
                            }`}>
                               <span className="break-words font-medium">{msg.text}</span>
                               <span className={`text-[9px] mt-1.5 font-bold tracking-widest uppercase ${isMe ? 'text-primary-200' : 'text-slate-400'} ${isMe ? 'text-right' : 'text-left'}`}>
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
                        placeholder="Type your message or bid..." 
                        value={liveMessage}
                        onChange={e => setLiveMessage(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-full py-3 px-5 pr-14 outline-none focus:ring-2 focus:ring-primary-500 font-medium tracking-wide shadow-inner" 
                      />
                      <button type="submit" disabled={!liveMessage.trim()} className="absolute right-1.5 w-10 h-10 rounded-full bg-primary-500/90 text-white flex items-center justify-center disabled:opacity-50 hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30">
                        <Send size={16} className="-ml-1" />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </motion.main>

      {/* Fake Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-primary-600 p-5 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2"><CreditCard size={20}/> Secure Payment</h3>
              <p className="text-sm mt-1 text-white/80">Complete payment to finalize your order</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2 mb-4">
                <button onClick={() => setPaymentForm({...paymentForm, method: 'card'})} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${paymentForm.method === 'card' ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>💳 Card</button>
                <button onClick={() => setPaymentForm({...paymentForm, method: 'upi'})} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${paymentForm.method === 'upi' ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>📲 UPI</button>
              </div>
              {paymentForm.method === 'card' ? (
                <div className="space-y-3">
                  <input type="text" maxLength="19" placeholder="Card Number (e.g. 4111 1111 1111 1111)" value={paymentForm.cardNumber} onChange={e => setPaymentForm({...paymentForm, cardNumber: e.target.value})} className="input-field !text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" maxLength="5" placeholder="MM/YY" value={paymentForm.expiry} onChange={e => setPaymentForm({...paymentForm, expiry: e.target.value})} className="input-field !text-sm" />
                    <input type="text" maxLength="3" placeholder="CVV" value={paymentForm.cvv} onChange={e => setPaymentForm({...paymentForm, cvv: e.target.value})} className="input-field !text-sm" />
                  </div>
                </div>
              ) : (
                <input type="text" placeholder="Enter UPI ID (e.g. name@upi)" value={paymentForm.upiId} onChange={e => setPaymentForm({...paymentForm, upiId: e.target.value})} className="input-field !text-sm" />
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPaymentModal(false)} className="flex-1 btn-secondary py-2.5 font-bold">Cancel</button>
                <button onClick={handleConfirmPayment} className="flex-1 btn-primary py-2.5 font-bold !bg-green-600 hover:!bg-green-700 flex items-center justify-center gap-2"><CheckCircle size={16}/> Confirm Payment</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
