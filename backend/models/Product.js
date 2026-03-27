const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  location: { type: String, required: true },
  image: { type: String, default: '' },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
