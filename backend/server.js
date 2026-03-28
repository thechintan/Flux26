const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notification');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', require('./routes/predict'));

// AI logic mock endpoint
app.post('/api/ai/suggest-price', (req, res) => {
  const { crop, quantity } = req.body;
  // Mock AI Logic
  const basePrice = Math.floor(Math.random() * 50) + 10;
  const suggestedPrice = basePrice * (quantity > 100 ? 0.9 : 1);
  res.json({ suggestedPrice: Math.round(suggestedPrice), demandLevel: 'High' });
});

// Database Connection
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('./models/Product');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('Seeding initial data...');
    const farmer = new User({ name: 'Ramesh Singh', email: 'farmer@test.com', password: 'password', role: 'farmer', location: 'Punjab, India' });
    const buyer = new User({ name: 'Raj Kumar', email: 'buyer@test.com', password: 'password', role: 'buyer', location: 'Delhi, India' });
    await farmer.save();
    await buyer.save();

    const p1 = new Product({ farmer: farmer._id, name: 'Organic Wheat', price: 25, quantity: 1500, location: 'Punjab, India', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&q=80', description: 'Premium quality organic wheat directly from farms.', category: 'Anaj' });
    const p2 = new Product({ farmer: farmer._id, name: 'Fresh Tomatoes', price: 40, quantity: 50, location: 'Haryana, India', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80', description: 'Fresh red tomatoes, perfect for cooking.', category: 'Vegetables' });
    const p3 = new Product({ farmer: farmer._id, name: 'Basmati Rice', price: 75, quantity: 400, location: 'Punjab, India', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', description: 'Export quality long-grain Basmati.', category: 'Anaj' });

    await Promise.all([p1.save(), p2.save(), p3.save()]);
    console.log('Database seeding completed successfully.');
    console.log('----------------------------------------------------');
    console.log('Test Accounts available:');
    console.log('Farmer: farmer@test.com | Password: password');
    console.log('Buyer: buyer@test.com | Password: password');
    console.log('----------------------------------------------------');
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/smart-agri', {
      serverSelectionTimeoutMS: 2000
    });
    console.log('MongoDB Connected to local instance.');
    await seedDatabase();
  } catch (err) {
    console.log('Local MongoDB not found on port 27017. Falling back to In-Memory Cloud DB...');
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('In-Memory MongoDB successfully spun up.');
    await seedDatabase();
  }
};

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});