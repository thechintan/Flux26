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

// Create order
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'buyer') return res.status(403).json({ msg: 'Only buyers can create orders' });
    
    const { farmer, product, quantity, price } = req.body;
    const newOrder = new Order({
      buyer: req.user.id,
      farmer,
      product,
      quantity,
      price
    });
    
    const order = await newOrder.save();
    res.json(order);
  } catch (err) {
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

module.exports = router;
