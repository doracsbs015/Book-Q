const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const { protect, librarian } = require('../middleware/auth');

// Borrow book
router.post('/borrow', protect, async (req, res) => {
  try {
    const { bookId } = req.body;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableCopies <= 0) return res.status(400).json({ message: 'No copies available' });

    // Check if user already borrowed this book
    const existing = await Transaction.findOne({ userId: req.user._id, bookId, status: 'active' });
    if (existing) return res.status(400).json({ message: 'You already have this book' });

    // Create transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      bookId,
      issueDate: null,
      dueDate: new Date(),
      status: 'pending'
    });

    // Populate transaction for response
    await transaction.populate('bookId', 'title author category');
    res.status(201).json({ message: 'Borrow request sent!', transaction });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Return book
router.post('/return', protect, async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.userId.toString() !== req.user._id.toString() && req.user.role !== 'librarian') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (transaction.status === 'returned') return res.status(400).json({ message: 'Book already returned' });

    const returnDate = new Date();
    let fine = 0;
    if (returnDate > transaction.dueDate) {
      const minutesLate = Math.ceil((returnDate - transaction.dueDate) / (1000 * 60));
      fine = minutesLate * (parseInt(process.env.FINE_PER_DAY) || 5);
    }

    transaction.returnDate = returnDate;
    transaction.fineAmount = fine;
    transaction.status = 'returned';
    await transaction.save();

    const book = await Book.findById(transaction.bookId);
    book.availableCopies += 1;

    if (book.reservationQueue.length > 0) {
      const nextUserId = book.reservationQueue.shift();
      const issueDate = new Date();
      const dueDate = new Date(issueDate.getTime() + 1 * 60 * 1000);
      await Transaction.create({ userId: nextUserId, bookId: book._id, issueDate, dueDate });
      book.availableCopies -= 1;
      book.borrowCount += 1;
    }
    await book.save();

    res.json({ message: `Book returned. Fine: ₹${fine}`, fine, transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's active transactions
router.get('/my', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .populate('bookId', 'title author category coverColor')
      .sort({ issueDate: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all transactions (librarian)
router.get('/all', protect, librarian, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'name email')
      .populate('bookId', 'title author')
      .sort({ issueDate: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//new features
// Approve borrow request (librarian only)
router.post('/approve/:id', protect, librarian, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status !== 'pending') return res.status(400).json({ message: 'Not a pending request' });

    const book = await Book.findById(transaction.bookId);
    if (book.availableCopies <= 0) return res.status(400).json({ message: 'No copies available' });

    const issueDate = new Date();
    const dueDate = new Date(issueDate.getTime() + 1 * 60 * 1000);

    transaction.status = 'active';
    transaction.issueDate = issueDate;
    transaction.dueDate = dueDate;
    await transaction.save();

    book.availableCopies -= 1;
    book.borrowCount += 1;
    await book.save();

    await User.findByIdAndUpdate(transaction.userId, {
      $addToSet: { readingHistory: transaction.bookId }
    });

    // update favoriteGenre
    const allTransactions = await Transaction.find({ userId: transaction.userId }).populate('bookId');
    const catCount = {};
    allTransactions.forEach(t => {
      if (t.bookId && t.bookId.category) {
        catCount[t.bookId.category] = (catCount[t.bookId.category] || 0) + 1;
      }
    });
    const topGenre = Object.keys(catCount).sort((a, b) => catCount[b] - catCount[a])[0];
    await User.findByIdAndUpdate(transaction.userId, { favoriteGenre: topGenre });

    res.json({ message: 'Borrow request approved!', transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Reject borrow request (librarian only)
router.post('/reject/:id', protect, librarian, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status !== 'pending') return res.status(400).json({ message: 'Not a pending request' });

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;