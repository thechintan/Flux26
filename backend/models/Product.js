const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  location: { type: String, required: true },
  image: { type: String, default: '' },
  media: [{ type: String }],
  description: { type: String },
  category: { 
    type: String, 
    enum: ['Vegetables', 'Fruits', 'Anaj', 'Daal', 'Masala', 'Damaged', 'Other'],
    default: 'Other'
  },
  subCategory: { type: String },
  isDamaged: { type: Boolean, default: false },
  lastNegotiatedPrice: { type: Number, default: null },
  contactNumber: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
