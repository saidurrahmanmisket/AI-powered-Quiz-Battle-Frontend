import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import {
  Zap, Swords, Target, TrendingUp, Medal, Users, Flame, Bot, Trophy,
  Clock, ArrowRight, ExternalLink, UserPlus, Lock
} from 'lucide-react';

const stats = [
  { icon: Target, label: 'Matches', value: '—', sub: 'Play your first match', color: 'var(--violet-400)', bg: 'rgba(124,58,237,0.1)' },
  { icon: Flame, label: 'Win Streak', value: '0', sub: 'Best: 0', color: 'var(--amber-400)', bg: 'rgba(245,158,11,0.1)' },
  { icon: TrendingUp, label: 'Accuracy', value: '—', sub: 'No data yet', color: 'var(--cyan-400)', bg: 'rgba(6,182,212,0.1)' },
  { icon: Medal, label: 'Rank', value: '—', sub: 'Register to rank', color: 'var(--emerald-400)', bg: 'rgba(16,185,129,0.1)' },
];

const roadmap = [
  { icon: Users, title: 'Matchmaking & Lobby', phase: 2, desc: 'Real-time multiplayer room creation with synchronized countdown' },
  { icon: Swords, title: 'Battle Loop', phase: 3, desc: '10-second question rounds, instant elimination, live rankings' },
  { icon: Bot, title: 'AI Opponents', phase: 4, desc: 'Smart bots with human-like delays and weighted accuracy' },
  { icon: Trophy, title: 'Leaderboards', phase: 5, desc: 'Global rankings, match history, and achievement tracking' },
];

export default function DashboardPage() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <AnimatedBackground />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>

        {/* Hero banner */}
        <div className="glass glass--interactive shimmer-hover anim-fade-up"
          style={{ padding: '2rem 2.25rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <h1 className="font-display" style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Welcome, <span className="text-gradient">{user || 'Player'}</span>
              {isGuest && <span className="chip chip--amber" style={{ marginLeft: '0.65rem', verticalAlign: 'middle' }}>
                <Gamepad2Icon /> GUEST
              </span>}
            </h1>
            {isGuest ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 500 }}>
                You're playing as a guest. Register to save your progress and climb the leaderboard.
              </p>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Ready for battle? Jump into a match and prove your trivia dominance.
              </p>
            )}
          </div>
          <Zap size={52} style={{ color: 'var(--violet-400)', opacity: 0.15, flexShrink: 0 }} />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: isGuest ? '1fr 1fr' : '1fr', gap: '0.75rem', marginBottom: '2rem' }}
          className="anim-fade-up" data-stagger>
          <button className="btn btn-primary btn-lg btn-full" onClick={() => navigate('/lobby')}
            style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Swords size={20} /> Find Match</span>
            <ArrowRight size={18} />
          </button>
          {isGuest && (
            <button className="btn btn-secondary btn-lg btn-full" onClick={() => navigate('/register')}
              style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserPlus size={18} /> Create Account</span>
              <ExternalLink size={16} />
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="anim-fade-up" style={{ animationDelay: '0.15s', marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            <TrendingUp size={14} /> Your Stats
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }} data-stagger>
            {stats.map((s) => (
              <div key={s.label} className="glass glass--interactive shimmer-hover"
                style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 38, height: 38, borderRadius: 'var(--r-md)', flexShrink: 0,
                  background: s.bg,
                }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                  <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1 }}>{s.value}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div className="anim-fade-up" style={{ animationDelay: '0.25s' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            <Clock size={14} /> Coming Soon
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.75rem' }} data-stagger>
            {roadmap.map((r) => (
              <div key={r.phase} className="glass shimmer-hover"
                style={{ padding: '1.25rem', opacity: 0.7, transition: 'opacity 0.3s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <r.icon size={18} style={{ color: 'var(--violet-300)' }} />
                    <span className="font-display" style={{ fontWeight: 700, fontSize: '0.88rem' }}>{r.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span className="chip chip--violet" style={{ fontSize: '0.6rem', padding: '0.15rem 0.45rem' }}>PHASE {r.phase}</span>
                    <Lock size={12} style={{ color: 'var(--text-dim)' }} />
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Small inline icon for guest chip */
function Gamepad2Icon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>;
}
