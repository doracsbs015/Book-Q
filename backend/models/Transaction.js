const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date, default: null },
  fineAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'returned', 'overdue'], default: 'active' }
});

module.exports = mongoose.model('Transaction', transactionSchema);
