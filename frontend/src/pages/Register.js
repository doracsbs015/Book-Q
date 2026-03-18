import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';



const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      addToast(`Welcome, ${user.name}! Account created.`, 'success');
      navigate(user.role === 'librarian' ? '/admin' : '/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
         
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join BookQ today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="input" type="text" placeholder="John Doe"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--purple-600)', fontWeight: 500 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
