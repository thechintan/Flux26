const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['INFO', 'OFFER_RECEIVED', 'OFFER_ACCEPTED', 'PAYMENT_COMPLETED', 'ORDER_UPDATED'],
    default: 'INFO'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    // Polimorphic ID (could be Chat, Order, or Product depending on type)
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
