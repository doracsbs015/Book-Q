import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';

const Home = () => {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/books/trending')
      .then(res => setTrending(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <div className="hero-section">
        <h1 className="hero-title">Your Digital Library,<br />Reimagined</h1>
        <p className="hero-subtitle">Discover, borrow, and manage thousands of books — all in one place.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', position: 'relative' }}>
          <Link to="/books" className="btn" style={{ background: 'white', color: 'var(--purple-700)', fontWeight: 600, padding: '12px 28px' }}>
            Browse Books
          </Link>
          {!user && (
            <Link to="/register" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', padding: '12px 28px' }}>
              Get Started
            </Link>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 48, position: 'relative' }}>
          {[['1000+', 'Books Available'], ['500+', 'Active Members'], ['24/7', 'Digital Access']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{val}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.75 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div className="page-container" style={{ paddingTop: 40 }}>
        <div className="section-header">
          <h2 className="section-title">🔥 <span>Trending</span> This Week</h2>
          <Link to="/books" className="btn btn-outline btn-sm">View All</Link>
        </div>
        {loading ? (
          <div className="loading-spinner" />
        ) : (
          <div className="books-grid">
            {trending.slice(0, 6).map(book => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}

        {/* Features */}
        <div style={{ marginTop: 60 }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 32 }}>Why <span>LibraryOS</span>?</h2>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
            {[
              { icon: '📚', title: 'Vast Collection', desc: 'Access thousands of books across every genre and category.' },
              { icon: '⚡', title: 'Instant Borrowing', desc: 'Borrow books digitally — no waiting in queues.' },
              { icon: '🔔', title: 'Smart Reservations', desc: 'Join the queue when a book is unavailable. We notify you automatically.' },
              { icon: '🤖', title: 'AI Recommendations', desc: 'Get personalized book suggestions based on your reading history.' },
            ].map(f => (
              <div key={f.title} className="card" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
