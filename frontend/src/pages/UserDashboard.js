import React, { useEffect, useState } from 'react';
import axios from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookCard from '../components/BookCard';
import ChatWindow from '../components/chatWindow';
import { getSocket } from '../utils/socket';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const isOverdue = (due) => due && new Date() > new Date(due);

const UserDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [readers, setReaders] = useState([]);
  const [myGenre, setMyGenre] = useState(null);
  const [readerSearch, setReaderSearch] = useState('');
  const [tab, setTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [chatUser, setChatUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Socket — unread badge listener
  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket();
    socket.emit('join', { userId: user._id });
    socket.emit('get_unread_counts', { userId: user._id });

    socket.on('unread_counts', (counts) => setUnreadCounts(counts));
    socket.on('messages_read', () => {
      socket.emit('get_unread_counts', { userId: user._id });
    });

    return () => {
      socket.off('unread_counts');
      socket.off('messages_read');
    };
  }, [user._id]);

  const fetchData = async () => {
    try {
      const [txRes, recRes, histRes, readersRes] = await Promise.all([
        axios.get('/api/transactions/my'),
        axios.get('/api/books/recommendations'),
        axios.get('/api/users/reading-history'),
        axios.get('/api/users/readers'),
      ]);
      setTransactions(txRes.data);
      setRecommendations(recRes.data);
      setReadingHistory(histRes.data);
      setReaders(readersRes.data.readers);
      setMyGenre(readersRes.data.myGenre);
    } catch { addToast('Failed to load dashboard', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const pending = transactions.filter(t => t.status === 'pending');
  const active = transactions.filter(t => t.status === 'active' || t.status === 'overdue');
  const returned = transactions.filter(t => t.status === 'returned');

  const totalFine = transactions
    .filter(t => t.status !== 'returned')
    .reduce((sum, t) => sum + (t.fineAmount || 0), 0);

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  const filteredReaders = readers.filter(r =>
    r.name.toLowerCase().includes(readerSearch.toLowerCase()) ||
    r.email.toLowerCase().includes(readerSearch.toLowerCase())
  );

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

      {/* Banners */}
      {pending.length > 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#92400e', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span><strong>{pending.length} borrow request(s) pending approval</strong> by the librarian.</span>
        </div>
      )}
      {active.length > 0 && (
        <div style={{ background: '#d1fae5', border: '1px solid #10b981', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#065f46', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span><strong>You have {active.length} active book(s)!</strong> A reserved book may have been assigned to you.</span>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Pending Approval', value: pending.length, alert: pending.length > 0 },
          { label: 'Currently Borrowed', value: active.length },
          { label: 'Books Returned', value: returned.length },
          { label: 'Outstanding Fines', value: `₹${totalFine}`, alert: totalFine > 0 },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ border: s.alert ? '1.5px solid #f59e0b' : undefined }}>
            <div className="stat-value" style={{ color: s.alert ? '#d97706' : undefined }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {totalFine > 0 && (
        <div className="fine-alert">
          <span><strong>You have outstanding fines of ₹{totalFine}.</strong> Please visit the library to return overdue books.</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--purple-50)', padding: 4, borderRadius: 10, width: 'fit-content', flexWrap: 'wrap' }}>
        {['pending', 'active', 'history', 'recommendations', 'readingHistory', 'readers'].map(key => (
          <button key={key} onClick={() => setTab(key)}
            className="btn btn-sm"
            style={{
              background: tab === key ? 'linear-gradient(135deg, var(--purple-600), var(--purple-800))' : 'transparent',
              color: tab === key ? 'white' : 'var(--purple-700)',
              boxShadow: tab === key ? '0 2px 12px rgba(124,58,237,0.3)' : 'none',
              position: 'relative'
            }}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
            {key === 'readers' && totalUnread > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: '#ef4444', color: 'white',
                borderRadius: '50%', width: 18, height: 18,
                fontSize: '0.65rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(239,68,68,0.5)'
              }}>{totalUnread > 99 ? '99+' : totalUnread}</span>
            )}
          </button>
        ))}
      </div>

      {/* Pending Tab */}
      {tab === 'pending' && (
        <div>
          {pending.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>⏳</div>
              <h3>No pending requests</h3>
              <p>Your borrow requests will appear here awaiting librarian approval</p>
            </div>
          ) : (
            <div className="table-container card" style={{ padding: 0 }}>
              <table><thead><tr><th>Book</th><th>Author</th><th>Requested</th><th>Status</th></tr></thead>
                <tbody>
                  {pending.map(t => (
                    <tr key={t._id}>
                      <td><strong>{t.bookId?.title || 'Unknown'}</strong></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{t.bookId?.author}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatDate(t.createdAt)}</td>
                      <td><span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>⏳ Awaiting Approval</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Active Tab */}
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
                <table><thead><tr><th>Book</th><th>Author</th><th>Issued</th><th>Due Date</th><th>Fine</th><th>Status</th></tr></thead>
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

      {/* History Tab */}
      {tab === 'history' && (
        <div>
          {returned.length === 0 ? (
            <div className="empty-state"><h3>No return history yet</h3></div>
          ) : (
            <div className="table-container card" style={{ padding: 0 }}>
              <table><thead><tr><th>Book</th><th>Author</th><th>Issued</th><th>Returned</th><th>Fine Paid</th></tr></thead>
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

      {/* For You Tab */}
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
                      addToast('Borrow request sent! Awaiting librarian approval.', 'success');
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

      {/* Reading History Tab */}
      {tab === 'readingHistory' && (
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
            All books you've ever borrowed:
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

      {/* Connect Tab */}
      {tab === 'readers' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: 'var(--dark)', marginBottom: 6 }}>
              Connect with Readers
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 14 }}>
              {myGenre
                ? <>Readers who love <strong style={{ color: 'var(--purple-600)' }}>{myGenre}</strong> like you are highlighted. Chat with anyone!</>
                : <>Borrow and return a book to unlock your favourite genre match. Chat with anyone below!</>
              }
            </p>
            <input
              className="input"
              style={{ maxWidth: 300 }}
              placeholder="🔍 Search by name or email..."
              value={readerSearch}
              onChange={e => setReaderSearch(e.target.value)}
            />
          </div>

          {filteredReaders.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>👥</div>
              <h3>No readers found</h3>
              <p>Try a different search term</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {filteredReaders.map(reader => (
                <div key={reader._id} className="card" style={{
                  padding: 20,
                  border: reader.sameGenre ? '2px solid var(--purple-400)' : '1.5px solid var(--purple-100)',
                  position: 'relative',
                  transition: 'box-shadow 0.2s'
                }}>
                  {reader.sameGenre && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'linear-gradient(135deg, var(--purple-500), var(--purple-700))',
                      color: 'white', fontSize: '0.68rem', fontWeight: 700,
                      padding: '3px 8px', borderRadius: 20
                    }}>✨ Same Genre</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%',
                      background: reader.sameGenre
                        ? 'linear-gradient(135deg, var(--purple-500), var(--purple-700))'
                        : 'linear-gradient(135deg, #94a3b8, #64748b)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0
                    }}>
                      {reader.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '0.95rem' }}>{reader.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{reader.email}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    {reader.favoriteGenre ? (
                      <span className="badge badge-category">📚 {reader.favoriteGenre}</span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>No genre yet</span>
                    )}
                  </div>
                  {/* Chat button with per-user unread badge */}
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center', position: 'relative' }}
                    onClick={() => setChatUser(reader)}
                  >
                    💬 Chat
                    {unreadCounts[reader._id] > 0 && (
                      <span style={{
                        position: 'absolute', top: -6, right: -6,
                        background: '#ef4444', color: 'white',
                        borderRadius: '50%', width: 18, height: 18,
                        fontSize: '0.65rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(239,68,68,0.5)'
                      }}>{unreadCounts[reader._id]}</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat Window */}
      {chatUser && (
        <ChatWindow
          currentUser={user}
          otherUser={chatUser}
          onClose={() => setChatUser(null)}
        />
      )}
    </div>
  );
};

export default UserDashboard;