const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('farmer', 'name location');
    res.json(products);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get farmer's products
router.get('/my-products', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') return res.status(403).json({ msg: 'Access denied' });
    const products = await Product.find({ farmer: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Add new product
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') return res.status(403).json({ msg: 'Access denied' });
    
    const { name, price, quantity, location, image, description } = req.body;
    const newProduct = new Product({
      farmer: req.user.id,
      name,
      price,
      quantity,
      location,
      image,
      description
    });
    
    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    if (product.farmer.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await product.deleteOne();
    res.json({ msg: 'Product removed' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
