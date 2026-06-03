import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap, LogOut, Ghost, Crown } from 'lucide-react';

export default function Navbar() {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.65rem 1.5rem',
      background: 'rgba(10,10,24,0.7)', backdropFilter: 'blur(20px) saturate(1.6)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      {/* Left — brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        onClick={() => navigate('/dashboard')}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 30, height: 30, borderRadius: 'var(--r-sm)',
          background: 'linear-gradient(135deg, var(--violet-600), var(--violet-400))',
          boxShadow: '0 0 16px rgba(124,58,237,0.3)',
        }}>
          <Zap size={15} color="white" fill="white" />
        </div>
        <span className="font-display" style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          Quiz Battle
        </span>
      </div>

      {/* Right — user chip + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.3rem 0.7rem', borderRadius: 'var(--r-full)',
          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
          fontSize: '0.78rem', color: 'var(--text-secondary)',
        }}>
          {isGuest ? <Ghost size={13} style={{ color: 'var(--amber-400)' }} /> : <Crown size={13} style={{ color: 'var(--violet-300)' }} />}
          <span style={{ fontWeight: 500 }}>{user || 'Player'}</span>
          {isGuest && <span className="chip chip--amber" style={{ padding: '0.15rem 0.4rem', fontSize: '0.6rem', marginLeft: '0.15rem' }}>GUEST</span>}
        </div>

        <button onClick={handleLogout} className="btn btn-ghost btn-sm"
          style={{ gap: '0.35rem', fontSize: '0.78rem', padding: '0.35rem 0.7rem' }}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </nav>
  );
}
