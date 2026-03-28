const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Get user orders (both farmer and buyer)
router.get('/', auth, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'farmer') {
      orders = await Order.find({ farmer: req.user.id }).populate('buyer', 'name').populate('product', 'name price image');
    } else {
      orders = await Order.find({ buyer: req.user.id }).populate('farmer', 'name location').populate('product', 'name price image');
    }
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get orders for a specific product (sold history for farmer)
router.get('/product/:productId', auth, async (req, res) => {
  try {
    const orders = await Order.find({ product: req.params.productId })
      .populate('buyer', 'name email')
      .populate('farmer', 'name')
      .populate('product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Re-offer: farmer sends a new lower price offer to a past buyer via chat
router.post('/reoffer', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') return res.status(403).json({ msg: 'Only farmers can re-offer' });
    const { productId, buyerId, newPrice } = req.body;
    
    // Create or get chat between farmer and buyer for this product
    const Chat = require('../models/Chat');
    let chat = await Chat.findOne({ productId, buyerId, farmerId: req.user.id });
    if (!chat) {
      chat = new Chat({ productId, buyerId, farmerId: req.user.id, messages: [] });
    }
    
    // Send re-offer message
    chat.messages.push({
      senderId: req.user.id,
      text: `SYSTEM_ACTION:RE_OFFER|PRICE:${newPrice}`,
      timestamp: new Date()
    });
    chat.lastUpdated = new Date();
    await chat.save();
    
    res.json({ msg: 'Re-offer sent to buyer', chatId: chat._id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create order
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'buyer') return res.status(403).json({ msg: 'Only buyers can create orders' });
    
    const { farmer, product: productId, quantity, price } = req.body;
    
    // Validate stock availability
    const Product = require('../models/Product');
    const productDoc = await Product.findById(productId);
    if (!productDoc || !productDoc.isActive) return res.status(404).json({ msg: 'Product not found or inactive' });
    if (quantity > productDoc.quantity) {
      return res.status(400).json({ msg: `Only ${productDoc.quantity} KG available in stock` });
    }
    
    const newOrder = new Order({
      buyer: req.user.id,
      farmer,
      product: productId,
      quantity,
      price
    });
    
    const order = await newOrder.save();
    
    // Reduce product stock and update last negotiated price
    productDoc.quantity -= quantity;
    if (productDoc.quantity <= 0) {
      productDoc.isActive = false;
    }
    productDoc.lastNegotiatedPrice = price;
    await productDoc.save();
    
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create Bulk Orders
router.post('/bulk', auth, async (req, res) => {
  try {
    if (req.user.role !== 'buyer') return res.status(403).json({ msg: 'Only buyers can create orders' });
    
    const { items } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ msg: 'Cart is empty' });

    const Product = require('../models/Product');
    const ordersCreated = [];

    // Loop through items in cart
    for (const item of items) {
      const { farmer, product: productId, quantity, price } = item;
      
      const productDoc = await Product.findById(productId);
      if (!productDoc || !productDoc.isActive) continue; // Skip if invalid
      if (quantity > productDoc.quantity) continue; // Skip to avoid stock discrepancy or could just clamp
      
      const newOrder = new Order({
        buyer: req.user.id,
        farmer,
        product: productId,
        quantity,
        price
      });
      
      const order = await newOrder.save();
      ordersCreated.push(order);
      
      productDoc.quantity -= quantity;
      if (productDoc.quantity <= 0) {
        productDoc.isActive = false;
      }
      productDoc.lastNegotiatedPrice = price;
      await productDoc.save();
    }

    res.json({ msg: 'Orders successfully placed', count: ordersCreated.length, ordersCreated });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update order status (for farmer)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') return res.status(403).json({ msg: 'Only farmers can update order status' });

    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    if (order.farmer.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    order.status = req.body.status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Raise Issue (for buyer)
router.post('/:id/issue', auth, async (req, res) => {
  try {
    if (req.user.role !== 'buyer') return res.status(403).json({ msg: 'Only buyers can raise issues' });

    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    if (order.buyer.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
    if (order.issueStatus !== 'None') return res.status(400).json({ msg: 'Issue already exists' });

    order.issueStatus = 'Raised';
    order.issueReason = req.body.reason || 'Product quality did not match description.';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Resolve Issue (for farmer)
router.post('/:id/resolve-issue', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') return res.status(403).json({ msg: 'Only farmers can resolve issues' });

    const { actionType, amount } = req.body; // actionType: 'Resolved_Discount', 'Resolved_Refund', 'Rejected'
    let order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    if (order.farmer.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
    if (order.issueStatus !== 'Raised') return res.status(400).json({ msg: 'No active issue to resolve' });
    if (!['Resolved_Discount', 'Resolved_Refund', 'Rejected'].includes(actionType)) {
       return res.status(400).json({ msg: 'Invalid action type' });
    }

    order.issueStatus = actionType;
    
    if (actionType === 'Resolved_Discount' && amount) {
       order.resolutionAmount = Number(amount);
       // We reduce unit price effectively or just represent the global discount. 
       // For simplicity, we just adjust the recorded price directly on the order to represent the settled penalty.
       order.price = Math.max(0, order.price - (Number(amount) / order.quantity));
    }
    
    if (actionType === 'Resolved_Refund') {
       order.status = 'Order placed'; // Mock reset or handled locally
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Rate a user (Farmer rates Buyer or Buyer rates Farmer)
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    const User = require('../models/User');
    let targetUserId = null;

    if (req.user.role === 'buyer' && order.buyer.toString() === req.user.id) {
      if (order.isBuyerRated) return res.status(400).json({ msg: 'Already rated' });
      targetUserId = order.farmer;
      order.isBuyerRated = true;
    } else if (req.user.role === 'farmer' && order.farmer.toString() === req.user.id) {
      if (order.isFarmerRated) return res.status(400).json({ msg: 'Already rated' });
      targetUserId = order.buyer;
      order.isFarmerRated = true;
    } else {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ msg: 'Target user not found' });

    targetUser.ratings.push({ rating: Number(rating), comment, byUser: req.user.id, orderId: order._id });
    
    const totalRatings = targetUser.ratings.length;
    const sumRatings = targetUser.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    targetUser.averageRating = sumRatings / totalRatings;

    await targetUser.save();
    await order.save();

    res.json({ msg: 'Rated successfully', order });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
