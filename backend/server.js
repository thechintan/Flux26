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

const seedData = require('./seedData');

const seedDatabase = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('Seeding initial data...');
    const farmer = new User({ name: 'Ramesh Singh', email: 'farmer@test.com', password: 'password', role: 'farmer', location: 'Punjab, India' });
    const buyer = new User({ name: 'Raj Kumar', email: 'buyer@test.com', password: 'password', role: 'buyer', location: 'Delhi, India' });
    await farmer.save();
    await buyer.save();

    // Seed products from seedData (36 sample products)
    const insertOperations = seedData.map(p => new Product({ ...p, farmer: farmer._id }));
    await Product.insertMany(insertOperations);

    console.log('Database seeding complete: Created 36 Sample Products.');
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