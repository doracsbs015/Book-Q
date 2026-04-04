import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">நூலகத்<span>தோழன்</span></Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/books" className={isActive('/books')}>Books</Link>
            {user.role === 'user' && (
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
            )}
            {user.role === 'librarian' && (
              <Link to="/admin" className={isActive('/admin')}>Admin Panel</Link>
            )}
            <div className="nav-user">
              <div className="avatar">{user.name[0].toUpperCase()}</div>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem' }}>{user.name}</span>
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                style={{ color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive('/login')}>Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
