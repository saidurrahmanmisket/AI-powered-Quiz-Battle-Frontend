import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      padding: '0.875rem 2rem',
      background: 'rgba(10, 10, 20, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <div
        className="font-display gradient-text"
        style={{ fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}
        onClick={() => navigate('/dashboard')}
      >
        ⚡ QUIZ BATTLE
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isGuest ? (
          <span className="badge badge-cyan">🎭 Guest</span>
        ) : (
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            👤 {user?.username}
          </span>
        )}
        <button
          className="btn btn-ghost"
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
