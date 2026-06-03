import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaderboardApi } from '../api/client';
import AnimatedBackground from '../components/AnimatedBackground';
import { Trophy, Medal, Crown, User, ArrowLeft, Zap } from 'lucide-react';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    leaderboardApi.getTop()
      .then(res => setEntries(res.data))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const rankIcon = (rank) => {
    if (rank === 1) return <Crown size={20} color="#fbbf24" />;
    if (rank === 2) return <Medal size={20} color="#94a3b8" />;
    if (rank === 3) return <Medal size={20} color="#cd7f32" />;
    return <span style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: '0.9rem', minWidth: 20, textAlign: 'center' }}>#{rank}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', padding: '1.5rem' }}>
      <AnimatedBackground />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 'var(--r-lg)', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center',
          }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-display text-gradient" style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.1rem' }}>
              Global Leaderboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Top players by total score</p>
          </div>
          <Trophy size={28} color="var(--amber-400)" style={{ marginLeft: 'auto' }} />
        </div>

        {/* Table */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-2xl)', overflow: 'hidden',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '50px 1fr 80px 70px 70px',
            padding: '0.75rem 1.25rem',
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            {['Rank', 'Player', 'Score', 'Wins', 'Games'].map(h => (
              <span key={h} style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {h}
              </span>
            ))}
          </div>

          {loading && (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading leaderboard…</p>
            </div>
          )}

          {!loading && entries.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <Zap size={36} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
              <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No games played yet!</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Be the first to compete.
              </p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/lobby')}>
                Play Now
              </button>
            </div>
          )}

          {entries.map((entry, i) => (
            <div
              key={entry.username}
              style={{
                display: 'grid', gridTemplateColumns: '50px 1fr 80px 70px 70px',
                padding: '1rem 1.25rem', alignItems: 'center',
                borderBottom: i < entries.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                background: entry.rank <= 3 ? `rgba(251,191,36,${0.04 * (4 - entry.rank)})` : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {rankIcon(entry.rank)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--violet-600), var(--violet-400))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem', color: '#fff', flexShrink: 0,
                }}>
                  {entry.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{entry.username}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <span style={{ fontWeight: 800, color: 'var(--amber-400)', fontSize: '0.95rem' }}>
                {entry.totalScore.toLocaleString()}
              </span>
              <span style={{ fontWeight: 700, color: '#10b981' }}>{entry.wins}</span>
              <span style={{ color: 'var(--text-muted)' }}>{entry.gamesPlayed}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/lobby')}>
            <Zap size={16} /> Enter Battle
          </button>
        </div>
      </div>
    </div>
  );
}
