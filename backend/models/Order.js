const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['Order placed', 'Packed', 'In transit', 'Delivered'], default: 'Order placed' },
  issueStatus: { type: String, enum: ['None', 'Raised', 'Resolved_Discount', 'Resolved_Refund', 'Rejected'], default: 'None' },
  issueReason: { type: String },
  resolutionAmount: { type: Number, default: 0 },
  isBuyerRated: { type: Boolean, default: false },
  isFarmerRated: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
