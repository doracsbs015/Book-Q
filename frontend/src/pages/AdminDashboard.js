import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const CATEGORIES = ['Fiction', 'Classic', 'Non-Fiction', 'Dystopia', 'Self-Help', 'Science Fiction', 'Fantasy', 'Psychology', 'Finance', 'Science', 'Business', 'History', 'Biography', 'Romance', 'Mystery'];

const emptyBook = { title: '', author: '', category: '', description: '', totalCopies: 1, availableCopies: 1 };

const AdminDashboard = () => {
  const { addToast } = useToast();
  const [tab, setTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState(emptyBook);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    try {
      const [bRes, uRes, tRes] = await Promise.all([
        axios.get('/api/books'),
        axios.get('/api/users'),
        axios.get('/api/transactions/all'),
      ]);
      setBooks(bRes.data);
      setUsers(uRes.data);
      setTransactions(tRes.data);
    } catch { addToast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmitBook = async (e) => {
    e.preventDefault();
    try {
      if (editBook) {
        await axios.put(`/api/books/${editBook._id}`, form);
        addToast('Book updated!', 'success');
      } else {
        await axios.post('/api/books', { ...form, availableCopies: form.totalCopies });
        addToast('Book added!', 'success');
      }
      setShowAddModal(false);
      setEditBook(null);
      setForm(emptyBook);
      fetchAll();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await axios.delete(`/api/books/${id}`);
      addToast('Book deleted', 'success');
      fetchAll();
    } catch { addToast('Failed to delete', 'error'); }
  };

  const handleReturn = async (transactionId) => {
    try {
      const res = await axios.post('/api/transactions/return', { transactionId });
      addToast(`Returned. Fine: ₹${res.data.fine}`, res.data.fine > 0 ? 'error' : 'success');
      fetchAll();
    } catch (err) { addToast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const openEdit = (book) => {
    setEditBook(book);
    setForm({ title: book.title, author: book.author, category: book.category, description: book.description || '', totalCopies: book.totalCopies, availableCopies: book.availableCopies });
    setShowAddModal(true);
  };

  const totalFines = transactions.reduce((s, t) => s + (t.fineAmount || 0), 0);
  const activeCount = transactions.filter(t => t.status === 'active' || t.status === 'overdue').length;
  const overdueCount = transactions.filter(t => t.status === 'overdue').length;

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-spinner" style={{ marginTop: 80 }} />;

  return (
    <div className="page-container">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: 'var(--dark)', marginBottom: 4 }}>
          Librarian <span style={{ color: 'var(--purple-600)' }}>Dashboard</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your library inventory and members</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Books', value: books.length, icon: '📚' },
          { label: 'Total Members', value: users.length, icon: '👥' },
          { label: 'Active Borrows', value: activeCount, icon: '📖' },
          { label: 'Overdue', value: overdueCount, icon: '⚠️', alert: overdueCount > 0 },
          { label: 'Total Fines', value: `₹${totalFines}`, icon: '💰', alert: totalFines > 0 },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ border: s.alert ? '1.5px solid #f59e0b' : undefined }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.alert ? '#d97706' : undefined }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--purple-50)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {[['books', '📚 Books'], ['users', '👥 Users'], ['transactions', '📋 Transactions'], ['fines', '💰 Fines']].map(([key, label]) => (
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

      {/* Books Tab */}
      {tab === 'books' && (
        <div>
          <div className="section-header">
            <input
              className="input"
              style={{ maxWidth: 300 }}
              placeholder="Search books..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => { setEditBook(null); setForm(emptyBook); setShowAddModal(true); }}>
              + Add Book
            </button>
          </div>
          <div className="table-container card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr><th>Title</th><th>Author</th><th>Category</th><th>Total</th><th>Available</th><th>Borrowed</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredBooks.map(b => (
                  <tr key={b._id}>
                    <td><strong>{b.title}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{b.author}</td>
                    <td><span className="badge badge-category">{b.category}</span></td>
                    <td>{b.totalCopies}</td>
                    <td>
                      <span className={`badge ${b.availableCopies > 0 ? 'badge-available' : 'badge-unavailable'}`}>
                        {b.availableCopies}
                      </span>
                    </td>
                    <td>{b.borrowCount}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(b)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBook(b._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="table-container card" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Books Read</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.75rem', background: 'linear-gradient(135deg, var(--purple-500), var(--purple-700))' }}>
                        {u.name[0]}
                      </div>
                      <strong>{u.name}</strong>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(u.createdAt)}</td>
                  <td>{u.readingHistory?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transactions Tab */}
      {tab === 'transactions' && (
        <div className="table-container card" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>User</th><th>Book</th><th>Issued</th><th>Due</th><th>Status</th><th>Fine</th><th>Action</th></tr></thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t._id}>
                  <td>{t.userId?.name || 'Unknown'}</td>
                  <td><strong>{t.bookId?.title || 'Unknown'}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(t.issueDate)}</td>
                  <td style={{ color: t.status === 'overdue' ? '#ef4444' : 'inherit' }}>{formatDate(t.dueDate)}</td>
                  <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                  <td style={{ color: t.fineAmount > 0 ? '#ef4444' : 'inherit', fontWeight: t.fineAmount > 0 ? 600 : 400 }}>
                    {t.fineAmount > 0 ? `₹${t.fineAmount}` : '—'}
                  </td>
                  <td>
                    {(t.status === 'active' || t.status === 'overdue') && (
                      <button className="btn btn-success btn-sm" onClick={() => handleReturn(t._id)}>Return</button>
                    )}
                    {t.status === 'returned' && <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Returned {formatDate(t.returnDate)}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fines Tab */}
      {tab === 'fines' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, var(--purple-700), var(--purple-900))', borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: 'white' }}>
            <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 6 }}>Total Fines Collected</div>
            <div style={{ fontSize: '2.5rem', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>₹{totalFines}</div>
            <div style={{ fontSize: '0.82rem', opacity: 0.7, marginTop: 6 }}>From {transactions.filter(t => t.fineAmount > 0).length} transactions</div>
          </div>
          <div className="table-container card" style={{ padding: 0 }}>
            <table>
              <thead><tr><th>User</th><th>Book</th><th>Days Overdue</th><th>Fine Amount</th><th>Status</th></tr></thead>
              <tbody>
                {transactions.filter(t => t.fineAmount > 0).map(t => {
                  const daysLate = t.dueDate ? Math.ceil((new Date(t.returnDate || new Date()) - new Date(t.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
                  return (
                    <tr key={t._id}>
                      <td><strong>{t.userId?.name || 'Unknown'}</strong></td>
                      <td>{t.bookId?.title || 'Unknown'}</td>
                      <td style={{ color: '#ef4444', fontWeight: 600 }}>{Math.max(0, daysLate)} days</td>
                      <td style={{ color: '#ef4444', fontWeight: 700 }}>₹{t.fineAmount}</td>
                      <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                    </tr>
                  );
                })}
                {transactions.filter(t => t.fineAmount > 0).length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px' }}>No fines recorded yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Book Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editBook ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleSubmitBook}>
              {[['Title', 'title', 'text'], ['Author', 'author', 'text'], ['Description', 'description', 'text']].map(([label, key, type]) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input className="input" type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={key !== 'description'} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Total Copies</label>
                  <input className="input" type="number" min={1} value={form.totalCopies}
                    onChange={e => setForm({ ...form, totalCopies: +e.target.value, availableCopies: +e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Available Copies</label>
                  <input className="input" type="number" min={0} max={form.totalCopies} value={form.availableCopies}
                    onChange={e => setForm({ ...form, availableCopies: +e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {editBook ? 'Update Book' : 'Add Book'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => { setShowAddModal(false); setEditBook(null); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
