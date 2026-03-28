const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Get all notifications for user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Mark as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ msg: 'Notification not found' });
    if (notification.recipient.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create notification (internal API route used usually by other controllers, but added here for the prototype mock flow)
router.post('/', auth, async (req, res) => {
  try {
    const { recipientId, message, type, relatedId } = req.body;
    const newNotif = new Notification({
      recipient: recipientId,
      message,
      type,
      relatedId
    });
    const saved = await newNotif.save();
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
