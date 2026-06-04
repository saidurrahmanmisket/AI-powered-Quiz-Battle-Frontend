import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { leaderboardApi } from '../api/client';
import AnimatedBackground from '../components/AnimatedBackground';
import {
  Zap, Swords, Target, TrendingUp, Medal, Users, Flame, Bot, Trophy,
  Clock, ArrowRight, ExternalLink, UserPlus, Gamepad2
} from 'lucide-react';

/* ── Stats skeleton while loading ── */
const EMPTY_STATS = [
  { icon: Target,    label: 'Matches',    value: '—', sub: 'Play your first match',  color: 'var(--violet-400)', bg: 'rgba(124,58,237,0.1)' },
  { icon: Flame,     label: 'Win Streak', value: '0', sub: 'Best: 0',                color: 'var(--amber-400)',  bg: 'rgba(245,158,11,0.1)' },
  { icon: TrendingUp,label: 'Accuracy',   value: '—', sub: 'No data yet',            color: 'var(--cyan-400)',   bg: 'rgba(6,182,212,0.1)' },
  { icon: Medal,     label: 'Rank',       value: '—', sub: 'Register to rank',       color: 'var(--emerald-400)',bg: 'rgba(16,185,129,0.1)' },
];

const features = [
  { icon: Users,  title: 'Matchmaking & Lobby', desc: 'Real-time rooms with synchronized 30-second countdown', color: 'var(--violet-400)', bg: 'rgba(124,58,237,0.12)' },
  { icon: Swords, title: 'Battle Loop',         desc: '10-second rounds, instant elimination, live score updates', color: 'var(--amber-400)', bg: 'rgba(245,158,11,0.12)' },
  { icon: Bot,    title: 'AI Opponents',        desc: 'Smart bots with weighted accuracy (70%) and human-like delays', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  { icon: Trophy, title: 'Global Leaderboard',  desc: 'Track wins, total score, and rank among all players', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
];

export default function DashboardPage() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [recentMatches, setRecentMatches] = useState([]);

  /* Fetch live stats for authenticated users */
  useEffect(() => {
    if (isGuest || !user?.username) return;
    const load = async () => {
      try {
        const [lbRes, histRes] = await Promise.allSettled([
          leaderboardApi.getLeaderboard(),
          leaderboardApi.getMatchHistory?.(),
        ]);

        /* Leaderboard rank & score */
        if (lbRes.status === 'fulfilled') {
          const entries = lbRes.value?.data ?? [];
          const myEntry = entries.find(e => e.username === user.username);
          const rank    = myEntry ? entries.indexOf(myEntry) + 1 : null;
          setStats([
            { icon: Target,     label: 'Matches',    value: myEntry?.gamesPlayed ?? '—', sub: myEntry ? `${myEntry.wins} wins` : 'Play your first match', color: 'var(--violet-400)', bg: 'rgba(124,58,237,0.1)' },
            { icon: Flame,      label: 'Best Score', value: myEntry?.totalScore   ?? '0', sub: 'Cumulative score',         color: 'var(--amber-400)',   bg: 'rgba(245,158,11,0.1)' },
            { icon: TrendingUp, label: 'Win Rate',   value: myEntry ? `${Math.round((myEntry.wins / (myEntry.gamesPlayed || 1)) * 100)}%` : '—', sub: 'Win ratio',  color: 'var(--cyan-400)',    bg: 'rgba(6,182,212,0.1)' },
            { icon: Medal,      label: 'Rank',       value: rank ? `#${rank}` : '—',     sub: rank ? 'On leaderboard' : 'No rank yet', color: 'var(--emerald-400)', bg: 'rgba(16,185,129,0.1)' },
          ]);
        }

        /* Recent match history */
        if (histRes.status === 'fulfilled' && histRes.value?.data) {
          setRecentMatches((histRes.value.data || []).slice(0, 5));
        }
      } catch (e) {
        console.warn('Dashboard stat fetch failed:', e);
      }
    };
    load();
  }, [user?.username, isGuest]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <AnimatedBackground />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>

        {/* ── Hero banner ── */}
        <div
          className="glass glass--interactive shimmer-hover anim-fade-up"
          style={{ padding: '2rem 2.25rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}
        >
          <div>
            <h1 className="font-display" style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              Welcome,{' '}
              <span className="text-gradient">{user?.username || 'Player'}</span>
              {isGuest && (
                <span className="chip chip--amber" style={{ verticalAlign: 'middle', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Gamepad2 size={11} /> GUEST
                </span>
              )}
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

        {/* ── Action buttons ── */}
        <div
          className="anim-fade-up"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}
        >
          <button className="btn btn-primary btn-lg btn-full" onClick={() => navigate('/lobby')}
            style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Swords size={20} /> Find Match</span>
            <ArrowRight size={18} />
          </button>
          
          {isGuest ? (
            <button className="btn btn-secondary btn-lg btn-full" onClick={() => navigate('/leaderboard')}
              style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Trophy size={18} /> Leaderboard</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button className="btn btn-secondary btn-lg btn-full" onClick={() => navigate('/clans')}
              style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} /> Trivia Clans</span>
              <ArrowRight size={18} />
            </button>
          )}

          {isGuest ? (
            <button className="btn btn-ghost btn-lg btn-full" onClick={() => navigate('/register')}
              style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserPlus size={18} /> Register</span>
              <ExternalLink size={16} />
            </button>
          ) : (
            <button className="btn btn-secondary btn-lg btn-full" onClick={() => navigate('/leaderboard')}
              style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Trophy size={18} /> Leaderboard</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="anim-fade-up" style={{ animationDelay: '0.15s', marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            <TrendingUp size={14} /> Your Stats
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {stats.map((s) => (
              <div key={s.label} className="glass glass--interactive shimmer-hover"
                style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 'var(--r-md)', flexShrink: 0, background: s.bg }}>
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

        {/* ── Recent Matches (authenticated only) ── */}
        {!isGuest && recentMatches.length > 0 && (
          <div className="anim-fade-up" style={{ animationDelay: '0.2s', marginBottom: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              <Clock size={14} /> Recent Matches
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentMatches.map((m, i) => (
                <div key={i} className="glass" style={{ padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {m.winner === user?.username
                      ? <Trophy size={15} color="var(--amber-400)" />
                      : <Swords  size={15} color="var(--text-muted)" />}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: m.winner === user?.username ? 'var(--amber-400)' : 'var(--text-secondary)' }}>
                      {m.winner === user?.username ? 'Victory' : m.winner ? `Lost to ${m.winner}` : 'Draw'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {m.score != null ? `${m.score} pts` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Live Features ── */}
        <div className="anim-fade-up" style={{ animationDelay: '0.25s' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            <Zap size={14} /> Live Features
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.75rem' }}>
            {features.map((f) => (
              <div key={f.title} className="glass glass--interactive shimmer-hover" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: f.bg, flexShrink: 0 }}>
                    <f.icon size={18} style={{ color: f.color }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                    <span className="font-display" style={{ fontWeight: 700, fontSize: '0.88rem' }}>{f.title}</span>
                    <span className="chip chip--emerald" style={{ fontSize: '0.55rem', padding: '0.1rem 0.4rem', width: 'fit-content' }}>✓ LIVE</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
