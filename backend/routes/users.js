const express = require('express');
const router = express.Router();
const User = require('../models/User');
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
    const user = await User.findById(req.user._id).populate('readingHistory', 'title author category coverColor coverImage');
    res.json(user.readingHistory || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all readers (for Connect with Readers feature)
router.get('/readers', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    // Return all users except current user and librarians
    const readers = await User.find({
      role: 'user',
      _id: { $ne: req.user._id }
    }).select('name email favoriteGenre createdAt').sort({ createdAt: -1 });

    // Tag which ones share the same favoriteGenre
    const tagged = readers.map(r => ({
      ...r.toObject(),
      sameGenre: r.favoriteGenre && currentUser.favoriteGenre && r.favoriteGenre === currentUser.favoriteGenre
    }));

    // Sort: same genre first
    tagged.sort((a, b) => b.sameGenre - a.sameGenre);

    res.json({ readers: tagged, myGenre: currentUser.favoriteGenre });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;