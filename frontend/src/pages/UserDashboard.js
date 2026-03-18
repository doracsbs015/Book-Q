import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCard from '../components/BookCard';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const isOverdue = (due) => due && new Date() > new Date(due);

const UserDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [tab, setTab] = useState('active');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [txRes, recRes, histRes] = await Promise.all([
        axios.get('/api/transactions/my'),
        axios.get('/api/books/recommendations'),
        axios.get('/api/users/reading-history'),
      ]);
      setTransactions(txRes.data);
      setRecommendations(recRes.data);
      setReadingHistory(histRes.data);
    } catch { addToast('Failed to load dashboard', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const active = transactions.filter(t => t.status === 'active' || t.status === 'overdue');
  const returned = transactions.filter(t => t.status === 'returned');
  const totalFine = transactions.reduce((sum, t) => sum + (t.fineAmount || 0), 0);

  if (loading) return <div className="loading-spinner" style={{ marginTop: 80 }} />;

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: 'var(--dark)', marginBottom: 4 }}>
          Welcome back, <span style={{ color: 'var(--purple-600)' }}>{user?.name}</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your borrowed books and discover new reads</p>
      </div>

      {/* Queue notification banner */}
      {active.length > 0 && (
        <div style={{ background: '#d1fae5', border: '1px solid #10b981', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#065f46', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>📬</span>
          <span><strong>You have {active.length} active book(s)!</strong> A reserved book may have been assigned to you. Check below.</span>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Currently Borrowed', value: active.length, icon: '📚' },
          { label: 'Total Borrowed', value: transactions.length, icon: '📖' },
          { label: 'Books Returned', value: returned.length, icon: '✅' },
          { label: 'Outstanding Fines', value: `₹${totalFine}`, icon: '💰', alert: totalFine > 0 },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ border: s.alert ? '1.5px solid #f59e0b' : undefined }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.alert ? '#d97706' : undefined }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {totalFine > 0 && (
        <div className="fine-alert">
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <span><strong>You have outstanding fines of ₹{totalFine}.</strong> Please visit the library to return overdue books.</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--purple-50)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {[['active', '📚 Active'], ['history', '📋 History'], ['recommendations', '✨ For You'], ['readingHistory', '🕐 Reading History']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className="btn btn-sm"
            style={{
              background: tab === key ? 'linear-gradient(135deg, var(--purple-600), var(--purple-800))' : 'transparent',
              color: tab === key ? 'white' : 'var(--purple-700)',
              boxShadow: tab === key ? '0 2px 12px rgba(124,58,237,0.3)' : 'none',
            }}
          >{label}</button>
        ))}
      </div>

      {/* Active Borrows */}
      {tab === 'active' && (
        <div>
          {active.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
              <h3>No active borrows</h3>
              <p>Head to the library to borrow some books!</p>
            </div>
          ) : (
            <>
              <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 10, padding: '10px 16px', marginBottom: 14, color: '#1e40af', fontSize: '0.85rem' }}>
                ℹ️ To return a book, please visit the library. Only the librarian can process returns.
              </div>
              <div className="table-container card" style={{ padding: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Author</th>
                      <th>Issued</th>
                      <th>Due Date</th>
                      <th>Fine</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.map(t => (
                      <tr key={t._id}>
                        <td><strong>{t.bookId?.title || 'Unknown'}</strong></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{t.bookId?.author}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{formatDate(t.issueDate)}</td>
                        <td style={{ color: isOverdue(t.dueDate) ? '#ef4444' : 'inherit', fontWeight: isOverdue(t.dueDate) ? 600 : 400 }}>
                          {formatDate(t.dueDate)} {isOverdue(t.dueDate) && '⚠️'}
                        </td>
                        <td style={{ color: t.fineAmount > 0 ? '#ef4444' : 'inherit', fontWeight: 600 }}>
                          {t.fineAmount > 0 ? `₹${t.fineAmount}` : '—'}
                        </td>
                        <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div>
          {returned.length === 0 ? (
            <div className="empty-state"><h3>No return history yet</h3></div>
          ) : (
            <div className="table-container card" style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr><th>Book</th><th>Author</th><th>Issued</th><th>Returned</th><th>Fine Paid</th></tr>
                </thead>
                <tbody>
                  {returned.map(t => (
                    <tr key={t._id}>
                      <td><strong>{t.bookId?.title || 'Unknown'}</strong></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{t.bookId?.author}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatDate(t.issueDate)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatDate(t.returnDate)}</td>
                      <td style={{ color: t.fineAmount > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                        {t.fineAmount > 0 ? `₹${t.fineAmount}` : 'No fine'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {tab === 'recommendations' && (
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
            ✨ Based on your reading history, you might enjoy these books:
          </p>
          {recommendations.length === 0 ? (
            <div className="empty-state"><h3>Borrow some books first to get recommendations!</h3></div>
          ) : (
            <div className="books-grid">
              {recommendations.map(book => (
                <BookCard key={book._id} book={book} userTransactions={transactions}
                  onBorrow={async (bid) => {
                    try {
                      await axios.post('/api/transactions/borrow', { bookId: bid });
                      addToast('Book borrowed! Due in 1 minute.', 'success');
                      fetchData();
                    } catch (err) { addToast(err.response?.data?.message || 'Failed', 'error'); }
                  }}
                  onReserve={async (bid) => {
                    try {
                      const res = await axios.post(`/api/books/${bid}/reserve`);
                      addToast(res.data.message, 'success');
                    } catch (err) { addToast(err.response?.data?.message || 'Failed', 'error'); }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reading History */}
      {tab === 'readingHistory' && (
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
            🕐 All books you've ever borrowed:
          </p>
          {readingHistory.length === 0 ? (
            <div className="empty-state"><h3>No reading history yet</h3></div>
          ) : (
            <div className="books-grid">
              {readingHistory.map(book => <BookCard key={book._id} book={book} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;