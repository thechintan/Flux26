const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

// Get or Create a Chat session
router.post('/start', auth, async (req, res) => {
  try {
    const { productId, farmerId } = req.body;
    const buyerId = req.user.id;
    
    let chat = await Chat.findOne({ productId, buyerId, farmerId })
       .populate('buyerId', 'name email role')
       .populate('farmerId', 'name email role')
       .populate('productId', 'name price image');
       
    if (!chat) {
       chat = new Chat({ productId, buyerId, farmerId, messages: [] });
       await chat.save();
       chat = await Chat.findById(chat._id)
         .populate('buyerId', 'name email role')
         .populate('farmerId', 'name email role')
         .populate('productId', 'name price image');
    }
    
    res.json(chat);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get all chats for the logged in user
router.get('/my-chats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const isFarmer = req.user.role === 'farmer';
    
    const query = isFarmer ? { farmerId: userId } : { buyerId: userId };
    
    const chats = await Chat.find(query)
      .populate('buyerId', 'name email role')
      .populate('farmerId', 'name email role')
      .populate('productId', 'name price image')
      .sort({ lastUpdated: -1 });
      
    res.json(chats);
  } catch(err) {
    res.status(500).send('Server error');
  }
});

// Get a single chat specifically (useful for polling real-time updates)
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('buyerId', 'name email role')
      .populate('farmerId', 'name email role')
      .populate('productId', 'name price image');
    
    if (!chat) return res.status(404).json({ msg: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Append a new message
router.post('/:chatId/message', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const senderId = req.user.id;
    
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ msg: 'Chat not found' });
    
    chat.messages.push({ senderId, text, timestamp: new Date() });
    chat.lastUpdated = new Date();
    await chat.save();
    
    // Return updated chat
    const updatedChat = await Chat.findById(req.params.chatId)
      .populate('buyerId', 'name email role')
      .populate('farmerId', 'name email role')
      .populate('productId', 'name price image');
      
    res.json(updatedChat);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
