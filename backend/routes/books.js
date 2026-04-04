const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect, librarian } = require('../middleware/auth');

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search books
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const books = await Book.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    // fallback regex search
    if (books.length === 0) {
      const regex = new RegExp(q, 'i');
      const fallback = await Book.find({
        $or: [{ title: regex }, { author: regex }, { category: regex }]
      });
      return res.json(fallback);
    }
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Trending books (most borrowed)
router.get('/trending', async (req, res) => {
  try {
    const books = await Book.find().sort({ borrowCount: -1 }).limit(10);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Recommendations for logged-in user
router.get('/recommendations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // No favorite genre yet → return top 3 trending
    if (!user.favoriteGenre) {
      const popular = await Book.find().sort({ borrowCount: -1 }).limit(3);
      return res.json(popular);
    }

    // Has favorite genre → recommend from that genre, exclude already borrowed
    const borrowedIds = await Transaction.find({ userId: req.user._id }).distinct('bookId');
    const recs = await Book.find({
      category: user.favoriteGenre,
      _id: { $nin: borrowedIds }
    }).limit(6);

    // If no books left in that genre, fallback to trending
    if (recs.length === 0) {
      const popular = await Book.find({ _id: { $nin: borrowedIds } }).sort({ borrowCount: -1 }).limit(3);
      return res.json(popular);
    }

    res.json(recs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// People also borrowed
router.get('/:id/also-borrowed', protect, async (req, res) => {
  try {
    const usersWhoBorrowed = await Transaction.find({ bookId: req.params.id }).distinct('userId');
    const otherBooks = await Transaction.find({
      userId: { $in: usersWhoBorrowed },
      bookId: { $ne: req.params.id }
    }).distinct('bookId');

    const books = await Book.find({ _id: { $in: otherBooks } }).limit(6);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('reservationQueue', 'name email');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add book (librarian)
router.post('/', protect, librarian, async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update book (librarian)
router.put('/:id', protect, librarian, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete book (librarian)
router.delete('/:id', protect, librarian, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reserve book
router.post('/:id/reserve', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableCopies > 0) return res.status(400).json({ message: 'Book is available, borrow it instead' });
    if (book.reservationQueue.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already in reservation queue' });
    }
    book.reservationQueue.push(req.user._id);
    await book.save();
    const position = book.reservationQueue.length;
    res.json({ message: `Reserved! Position in queue: ${position}`, position });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
