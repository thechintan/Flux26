const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all products (supports advanced filtering)
router.get('/', async (req, res) => {
  try {
    const { search, category, subCategory, isDamaged } = req.query;
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      if (category.toLowerCase() === 'damaged/unsold' || category.toLowerCase() === 'damaged') {
        query.category = 'Damaged/Unsold';
      } else {
        query.category = new RegExp(`^${category}$`, 'i');
      }
    }
    if (subCategory) query.subCategory = new RegExp(`^${subCategory}$`, 'i');
    if (isDamaged === 'true') query.isDamaged = true;

    // We populate 'phone' from farmer so the buyer can see it on detail page
    const products = await Product.find(query).populate('farmer', 'name location phone email').sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get farmer's products
router.get('/my-products', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') return res.status(403).json({ msg: 'Access denied' });
    const products = await Product.find({ farmer: req.user.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Add new product with Media
router.post('/', [auth, upload.array('media', 5)], async (req, res) => {
  try {
    if (req.user.role !== 'farmer') return res.status(403).json({ msg: 'Access denied' });
    
    const { name, price, quantity, location, description, category, subCategory, isDamaged, image, contactNumber } = req.body;
    
    let mediaUrls = [];
    if (req.files && req.files.length > 0) {
       mediaUrls = req.files.map(file => `/uploads/${file.filename}`);
    } else if (image) {
       mediaUrls = [image];
    }

    const newProduct = new Product({
      farmer: req.user.id,
      name,
      price: Number(price),
      quantity: Number(quantity),
      location,
      media: mediaUrls,
      image: mediaUrls.length > 0 ? mediaUrls[0] : '',
      description,
      category: category || 'Other',
      subCategory: subCategory || '',
      isDamaged: isDamaged === 'true' || isDamaged === true,
      contactNumber: contactNumber || ''
    });
    
    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update product (for farmer)
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    if (product.farmer.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const { name, price, quantity, location, description, category, subCategory, isDamaged } = req.body;
    if (name) product.name = name;
    if (price !== undefined) product.price = Number(price);
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (location) product.location = location;
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (isDamaged !== undefined) product.isDamaged = isDamaged;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
