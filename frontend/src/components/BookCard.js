import React from 'react';
import { useNavigate } from 'react-router-dom';

const COVER_COLORS = [
  'linear-gradient(135deg, #7c3aed, #4c1d95)',
  'linear-gradient(135deg, #6d28d9, #3730a3)',
  'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  'linear-gradient(135deg, #a855f7, #7c3aed)',
  'linear-gradient(135deg, #5b21b6, #1e1b4b)',
  'linear-gradient(135deg, #9333ea, #4c1d95)',
];

const getColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length];
};

const BookCard = ({ book, onBorrow, onReserve, userTransactions = [] }) => {
  const navigate = useNavigate();
  const color = getColor(book.title);
  const isAvailable = book.availableCopies > 0;
  const activeBorrow = userTransactions.find(
    t => t.bookId?._id === book._id && t.status === 'active'
  );

  return (
    <div className="card" style={{ overflow: 'hidden', cursor: 'pointer' }}
      onClick={() => navigate(`/books/${book._id}`)}>
      <div
        className="book-cover"
        style={{ background: color, minHeight: '200px' }}
        onClick={e => { e.stopPropagation(); navigate(`/books/${book._id}`); }}
      >
        <div className="book-cover-spine" />
        <span style={{ position: 'relative', zIndex: 1, padding: '0 12px' }}>{book.title}</span>
      </div>
      <div style={{ padding: '14px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: '0.95rem', marginBottom: 4, color: 'var(--dark)', lineHeight: 1.3 }}>
          {book.title}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{book.author}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="badge badge-category">{book.category}</span>
          <span className={`badge ${isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
            {isAvailable ? `${book.availableCopies} avail.` : 'Unavailable'}
          </span>
        </div>
        {onBorrow && !activeBorrow && (
          <button
            className={`btn ${isAvailable ? 'btn-primary' : 'btn-outline'} btn-sm`}
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={e => { e.stopPropagation(); isAvailable ? onBorrow(book._id) : onReserve(book._id); }}
          >
            {isAvailable ? '📖 Borrow' : '🔔 Reserve'}
          </button>
        )}
        {activeBorrow && (
          <span className="badge badge-active" style={{ display: 'block', textAlign: 'center', padding: '6px' }}>
            Currently Borrowed
          </span>
        )}
      </div>
    </div>
  );
};

export default BookCard;
