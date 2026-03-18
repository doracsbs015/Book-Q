const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  isbn: { type: String, default: '' },
  coverColor: { type: String, default: '#7c3aed' },
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  reservationQueue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  borrowCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

bookSchema.index({ title: 'text', author: 'text', category: 'text' });

module.exports = mongoose.model('Book', bookSchema);
