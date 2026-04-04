import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCard from '../components/BookCard';

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

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [book, setBook] = useState(null);
  const [alsoBorrowed, setAlsoBorrowed] = useState([]);
  const [userTransactions, setUserTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/books/${id}`);
        setBook(res.data);
        const also = await axios.get(`/api/books/${id}/also-borrowed`);
        setAlsoBorrowed(also.data);
        if (user) {
          const txn = await axios.get('/api/transactions/my');
          setUserTransactions(txn.data);
        }
      } catch { addToast('Failed to load book', 'error'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, user]);

  const handleBorrow = async () => {
    if (!user) { addToast('Please login to borrow', 'error'); return; }
    try {
      await axios.post('/api/transactions/borrow', { bookId: id });
      addToast('Borrow request sent! Awaiting librarian approval.', 'success');
      const res = await axios.get(`/api/books/${id}`);
      setBook(res.data);
      const txn = await axios.get('/api/transactions/my');
      setUserTransactions(txn.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to borrow', 'error');
    }
  };

  const handleReserve = async () => {
    if (!user) { addToast('Please login to reserve', 'error'); return; }
    try {
      const res = await axios.post(`/api/books/${id}/reserve`);
      addToast(res.data.message, 'success');
      const bookRes = await axios.get(`/api/books/${id}`);
      setBook(bookRes.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reserve', 'error');
    }
  };

  if (loading) return <div className="loading-spinner" style={{ marginTop: 80 }} />;
  if (!book) return <div className="empty-state"><h3>Book not found</h3></div>;

  const isAvailable = book.availableCopies > 0;
  const activeBorrow = userTransactions.find(t => t.bookId?._id === id && t.status === 'active');
  const queuePos = book.reservationQueue?.findIndex(u => u._id === user?._id);
  const color = getColor(book.title);

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: 24 }}>
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40, marginBottom: 48 }}>
        {/* Cover */}
<div>
  <div
    className="book-cover"
    style={{
      background: book.coverImage ? 'none' : color,
      minHeight: '380px',
      fontSize: '1.1rem',
      borderRadius: 16,
      boxShadow: '0 12px 40px rgba(124,58,237,0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    {book.coverImage ? (
      <img
        src={book.coverImage}
        alt={book.title}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 16,
          display: 'block'
        }}
        onError={e => {
          e.target.style.display = 'none';
        }}
      />
    ) : (
      <>
        <div className="book-cover-spine" />
        <span style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}>{book.title}</span>
      </>
    )}
  </div>
</div>

        {/* Info */}
        <div>
          <div style={{ marginBottom: 6 }}>
            <span className="badge badge-category">{book.category}</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: 'var(--dark)', margin: '10px 0 6px', lineHeight: 1.2 }}>{book.title}</h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: 20 }}>by <strong>{book.author}</strong></p>

          {book.description && (
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24, fontSize: '0.95rem' }}>{book.description}</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            {[
              [' Total Copies', book.totalCopies],
              [' Available', book.availableCopies],
              [' Times Borrowed', book.borrowCount],
              [' In Queue', book.reservationQueue?.length || 0],
            ].map(([label, val]) => (
              <div key={label} className="stat-card" style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--purple-700)', fontFamily: "'Playfair Display', serif" }}>{val}</div>
              </div>
            ))}
          </div>

          {activeBorrow ? (
            <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 10, padding: '14px 18px', color: '#1e40af' }}>
              📖 You currently have this book. Return it from your dashboard.
            </div>
          ) : queuePos >= 0 ? (
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '14px 18px', color: '#92400e' }}>
              🔔 You are #{queuePos + 1} in the reservation queue
            </div>
          ) : user ? (
            <div style={{ display: 'flex', gap: 12 }}>
              {isAvailable ? (
                <button className="btn btn-primary" style={{ padding: '12px 28px' }} onClick={handleBorrow}>
                  📖 Borrow This Book
                </button>
              ) : (
                <button className="btn btn-outline" style={{ padding: '12px 28px' }} onClick={handleReserve}>
                  🔔 Join Waitlist
                </button>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>
              <a href="/login" style={{ color: 'var(--purple-600)' }}>Login</a> to borrow or reserve this book
            </p>
          )}
        </div>
      </div>

      {/* People Also Borrowed */}
      {alsoBorrowed.length > 0 && (
        <div>
          <h2 className="section-title">📖 People Also <span>Borrowed</span></h2>
          <div className="books-grid">
            {alsoBorrowed.map(b => (
              <BookCard key={b._id} book={b} onBorrow={user ? async (bid) => {
                try {
                  await axios.post('/api/transactions/borrow', { bookId: bid });
                  addToast('Book borrowed!', 'success');
                } catch (err) { addToast(err.response?.data?.message || 'Failed', 'error'); }
              } : null} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
