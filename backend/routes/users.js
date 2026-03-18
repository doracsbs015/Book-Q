const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const { protect, librarian } = require('../middleware/auth');

// Get all users (librarian)
router.get('/', protect, librarian, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get reading history
router.get('/reading-history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('readingHistory', 'title author category coverColor');
    res.json(user.readingHistory || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
