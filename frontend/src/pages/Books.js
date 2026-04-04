import React, { useEffect, useState, useCallback } from 'react';
import axios from '../utils/api';
import BookCard from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['All', 'Fiction', 'Classic', 'Non-Fiction', 'Romance novel', 'Self-Help', 'Science Fiction', 'Fantasy', 'Psychology', 'Finance', 'Science', 'Business'];

const Books = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [books, setBooks] = useState([]);
  const [userTransactions, setUserTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [searching, setSearching] = useState(false);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      if (search.trim()) {
        setSearching(true);
        const res = await axios.get(`/api/books/search?q=${encodeURIComponent(search)}`);
        setBooks(res.data);
        setSearching(false);
      } else {
        const res = await axios.get('/api/books');
        setBooks(res.data);
      }
    } catch { addToast('Failed to load books', 'error'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchBooks, 300);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  useEffect(() => {
    if (user) {
      axios.get('/api/transactions/my').then(res => setUserTransactions(res.data)).catch(() => {});
    }
  }, [user]);

  const handleBorrow = async (bookId) => {
    if (!user) { addToast('Please login to borrow books', 'error'); return; }
    try {
      await axios.post('/api/transactions/borrow', { bookId });
      addToast('Borrow request sent! Awaiting librarian approval.', 'success');
      fetchBooks();
      const res = await axios.get('/api/transactions/my');
      setUserTransactions(res.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to borrow', 'error');
    }
  };

  const handleReserve = async (bookId) => {
    if (!user) { addToast('Please login to reserve books', 'error'); return; }
    try {
      const res = await axios.post(`/api/books/${bookId}/reserve`);
      addToast(res.data.message, 'success');
      fetchBooks();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reserve', 'error');
    }
  };

  const filtered = category === 'All' ? books : books.filter(b => b.category === category);

  return (
    <div className="page-container">
      {/* Search Bar */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: 16, color: 'var(--dark)' }}>
          Library <span style={{ color: 'var(--purple-600)' }}>Collection</span>
        </h1>
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search by title, author, or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="btn btn-sm"
            style={{
              background: category === cat ? 'linear-gradient(135deg, var(--purple-600), var(--purple-800))' : 'white',
              color: category === cat ? 'white' : 'var(--purple-700)',
              border: `1.5px solid ${category === cat ? 'transparent' : 'var(--purple-200)'}`,
              boxShadow: category === cat ? '0 2px 12px rgba(124,58,237,0.3)' : 'none',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading-spinner" />
      ) : (
        <>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 16 }}>
            {searching ? 'Searching...' : `${filtered.length} book${filtered.length !== 1 ? 's' : ''} found`}
            {search && <span> for "<strong>{search}</strong>"</span>}
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
              <h3>No books found</h3>
              <p>Try a different search term or category</p>
            </div>
          ) : (
            <div className="books-grid">
              {filtered.map(book => (
                <BookCard
                  key={book._id}
                  book={book}
                  onBorrow={user ? handleBorrow : null}
                  onReserve={user ? handleReserve : null}
                  userTransactions={userTransactions}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Books;
