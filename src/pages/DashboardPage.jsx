import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ label, value, icon, color }) => (
  <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', flex: 1, minWidth: 140 }}>
    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
    <div style={{ fontSize: '2rem', fontWeight: 800, color, fontFamily: 'Orbitron, monospace' }}>{value}</div>
    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>{label}</div>
  </div>
);

const DashboardPage = () => {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingTop: '5rem' }}>
      {/* Background */}
      <div className="bg-animated"><div className="bg-grid" /></div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 }}>

        {/* Welcome banner */}
        <div className="glass-card animate-fade-in-up" style={{ padding: '2.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <div className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                Welcome, <span className="gradient-text">{user?.username}</span>!
              </div>
              {isGuest && <span className="badge badge-gold">🎭 Guest</span>}
            </div>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              {isGuest
                ? 'You\'re playing as a guest. Register to save your stats and climb the leaderboard!'
                : 'Ready to dominate the arena? Jump into a battle!'}
            </p>
          </div>
          <div style={{ fontSize: '4rem' }} className="animate-float">⚡</div>
        </div>

        {/* Stats row (hidden for guests) */}
        {!isGuest && (
          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap' }} className="animate-fade-in-up">
            <StatCard label="Total Games" value={user?.totalGames ?? 0} icon="🎮" color="var(--color-secondary)" />
            <StatCard label="Total Wins" value={user?.totalWins ?? 0} icon="🏆" color="var(--color-accent)" />
            <StatCard label="Win Rate" value={
              user?.totalGames > 0 ? `${Math.round((user.totalWins / user.totalGames) * 100)}%` : '—'
            } icon="📈" color="var(--color-success)" />
          </div>
        )}

        {/* Action buttons */}
        <div className="glass-card animate-fade-in-up" style={{ padding: '2rem' }}>
          <h2 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text-secondary)', letterSpacing: '0.1em' }}>
            ▶ QUICK ACTIONS
          </h2>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              id="find-match-btn"
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/lobby')}
              style={{ flex: 1, minWidth: 200 }}
            >
              ⚔️ Find Match
            </button>

            {!isGuest ? (
              <button
                id="leaderboard-btn"
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/leaderboard')}
                style={{ flex: 1, minWidth: 200 }}
              >
                🏆 Leaderboard
              </button>
            ) : (
              <button
                id="register-from-guest"
                className="btn btn-gold btn-lg"
                onClick={() => navigate('/register')}
                style={{ flex: 1, minWidth: 200 }}
              >
                🚀 Create Account
              </button>
            )}
          </div>
        </div>

        {/* Info card for coming phases */}
        <div className="glass-card animate-fade-in-up" style={{ padding: '2rem', marginTop: '2rem' }}>
          <h2 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
            🚧 COMING SOON
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { phase: 'Phase 2', label: 'Matchmaking & Lobby', icon: '🎲' },
              { phase: 'Phase 3', label: 'Battle Loop', icon: '⚔️' },
              { phase: 'Phase 4', label: 'AI Opponents', icon: '🤖' },
              { phase: 'Phase 5', label: 'Leaderboards', icon: '🏆' },
            ].map(({ phase, label, icon }) => (
              <div key={phase} style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--color-border)',
                opacity: 0.7,
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-primary-glow)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{phase}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
