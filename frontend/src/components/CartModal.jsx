import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Trash2, IndianRupee } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const CartModal = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const totalAmount = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const generateCartPDF = (cartData, total, orderCount) => {
    const element = document.createElement('div');
    const itemsHtml = cartData.map(c => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${c.product.name}</td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">${c.quantity}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">Rs. ${c.product.price}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Rs. ${c.quantity * c.product.price}</td>
      </tr>
    `).join('');

    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto;">
        <div style="border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #22c55e; margin: 0; font-size: 28px;">SmartAgri Purchase Invoice</h1>
          <p style="margin: 5px 0 0 0; color: #666;">Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div>
            <h3 style="margin-top: 0;">Billed To:</h3>
            <p><strong>Name:</strong> ${user?.name || 'Buyer'}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin-top: 5px; color: #555;">Purchased items: ${orderCount}</p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Product</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Qty (KG)</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0;">Price/KG</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="text-align: right; margin-bottom: 40px;">
          <h2 style="color: #22c55e;">Grand Total: Rs. ${total}</h2>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 14px; margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p>Thank you for using SmartAgri for your wholesale agricultural needs!</p>
          <p>This is a computer-generated receipt.</p>
        </div>
      </div>
    `;

    if (window.html2pdf) {
      window.html2pdf().from(element).save(`SmartAgri_Invoice_${Date.now()}.pdf`);
    } else {
      console.warn('html2pdf not found, cannot generate PDF.');
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setIsCartOpen(false);
      navigate('/auth');
      return;
    }
    
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const items = cart.map(c => ({
        farmer: c.product.farmer?._id || c.product.farmer || c.product.farmerId,
        product: c.product._id,
        quantity: c.quantity,
        price: c.product.price,
      }));

      await apiService.createBulkOrders(items);
      
      // Auto-generate Bill/Invoice PDF for the cart
      generateCartPDF(cart, totalAmount, items.length);

      clearCart();
      setIsCartOpen(false);
      alert('Order placed successfully! Check your Dashboard for logistics updates.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Some items might be out of stock.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />

          {/* Sliding Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-white dark:bg-dark-900 shadow-2xl z-[101] flex flex-col border-l border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-dark-800">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <ShoppingCart className="text-primary-600 dark:text-primary-500" /> My Cart
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors bg-white dark:bg-dark-900 rounded-lg shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-slate-500 dark:text-slate-400">
                  <ShoppingCart size={48} className="mb-4 opacity-50" />
                  <p className="font-semibold text-lg">Your cart is empty</p>
                  <p className="text-sm">Looks like you haven't added any produce yet.</p>
                  <button onClick={() => setIsCartOpen(false)} className="mt-4 btn-primary py-2 px-6">Start Shopping</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product._id} className="flex gap-4 p-3 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-800/50 rounded-xl relative group">
                      <img 
                        src={item.product.media && item.product.media.length ? `http://localhost:5000${item.product.media[0]}` : item.product.image || 'https://images.unsplash.com/photo-1592924357228?w=200'} 
                        alt={item.product.name} 
                        className="w-20 h-20 object-cover rounded-lg shadow-sm"
                      />
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight pr-6">{item.product.name}</h4>
                        <div className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-500 font-bold mb-2">
                          <IndianRupee size={14}/> {item.product.price} <span className="text-slate-500 font-medium text-xs">/kg</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-900 rounded-lg overflow-hidden h-8">
                            <button 
                              onClick={() => { if(item.quantity > 1) updateQuantity(item.product._id, item.quantity - 1) }}
                              className="px-2 h-full flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                            ><Minus size={14}/></button>
                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                            <button 
                              onClick={() => { if(item.quantity < item.product.quantity) updateQuantity(item.product._id, item.quantity + 1) }}
                              className="px-2 h-full flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                            ><Plus size={14}/></button>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.product._id)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ))}
                  
                  <button onClick={clearCart} className="text-xs text-red-500 font-bold hover:underline py-2 w-full text-center">
                    Clear all items
                  </button>
                </div>
              )}
            </div>

            {/* Footer / Checkout */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-dark-900">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600 dark:text-slate-400 font-medium tracking-wide">Grand Total</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white flex items-center">
                    <IndianRupee size={22} className="mr-0.5"/> {totalAmount.toLocaleString()}
                  </span>
                </div>
                
                <button 
                  onClick={handleCheckout} 
                  disabled={loading}
                  className="btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing Order...' : 'Buy Now / Place Order'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartModal;
