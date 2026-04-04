import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/api';
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

  {/* Kalam Quote Banner — top, prominent */}
  <div style={{
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: 14,
    padding: '22px 32px',
    maxWidth: 640,
    margin: '0 auto 36px auto',
    textAlign: 'center',
  }}>
    <p style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: '1.15rem',
      color: 'white',
      lineHeight: 1.8,
      marginBottom: 6,
      fontStyle: 'italic'
    }}>
      "ஒரு சிறந்த புத்தகம் நூறு நல்ல நண்பர்களுக்குச் சமம். ஆனால், ஒரு நல்ல நண்பன் ஒரு நூலகத்திற்கே சமம்!"
    </p>
    <p style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: '0.9rem',
      color: 'rgba(255,255,255,0.8)',
      lineHeight: 1.7,
      marginBottom: 12,
      fontStyle: 'italic'
    }}>
      "One good book is equal to a hundred good friends. <br /> But one good friend is equal to a whole library."
    </p>
    <p style={{
      fontSize: '0.76rem',
      color: 'rgba(255,255,255,0.6)',
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }}>
      Dr. A.P.J. Abdul Kalam / டாக்டர் ஏ.பி.ஜே. அப்துல் கலாம்
    </p>
  </div>

  {/* Main heading — smaller, below quote */}
  <h1 className="hero-title" style={{ fontSize: '1.6rem', marginBottom: 10 }}>
    Find Good Books. Find Good Friends.
  </h1>
  <p className="hero-subtitle" style={{ fontSize: '0.95rem', marginBottom: 28 }}>
    Discover books you'll love and connect with readers who share your interests, all in one place.
  </p>

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
    {[['100+', 'Books Available'], ['100+', 'Active Members'], ['24/7', 'Digital Access']].map(([val, label]) => (
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
          <h2 className="section-title">Trending <span>This Week</span></h2>
          <Link to="/books" className="btn btn-outline btn-sm">View All</Link>
        </div>
        {loading ? (
          <div className="loading-spinner" />
        ) : (
          <div className="books-grid">
            {trending.slice(0, 5).map(book => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}

        {/* Features */}
        <div style={{ marginTop: 60 }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 8 }}>
            Why <span>ShelfMate</span>?
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 36 }}>
            A smart library system built for modern readers
          </p>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
            {[
              {
                title: 'Curated Collection',
                desc: 'Browse a wide collection of books across every genre from classic literature to modern science.'
              },
              {
                title: 'Borrow & Reserve',
                desc: 'Request books instantly. When unavailable, join the queue and get auto-assigned when returned.'
              },
              {
                title: 'Smart Recommendations',
                desc: 'Get personalized book suggestions based on your reading history and favourite genre.'
              },
              {
                title: 'Connect with Readers',
                desc: 'Discover readers who share your interests and chat with them in real time.'
              },
              {
                title: 'Reading History',
                desc: 'Track every book you have ever borrowed. Your reading journey, always saved.'
              },
              {
                title: 'Fine & Due Tracking',
                desc: 'Stay on top of due dates. Fines are calculated automatically so there are no surprises.'
              },
            ].map(f => (
              <div key={f.title} className="card" style={{ padding: '24px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 8, fontFamily: "'Playfair Display', serif", color: 'var(--purple-700)' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ textAlign: 'center', marginTop: 60, paddingBottom: 20 }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            ShelfMate - Smart lending. Real connections.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;