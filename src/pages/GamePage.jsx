import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gameApi } from '../api/client';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import AnimatedBackground from '../components/AnimatedBackground';
import toast from 'react-hot-toast';
import {
  Trophy, Zap, Clock, CheckCircle2, XCircle,
  Shield, Bot, User, Skull, Crown
} from 'lucide-react';

/* ─── Timer Bar ─────────────────────────────────── */
const TimerBar = ({ timeLimit, startTime, freezeActive }) => {
  const [pct, setPct] = useState(100);
  const rafRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 1 - elapsed / (timeLimit * 1000));
      setPct(remaining * 100);
      if (remaining > 0) rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [startTime, timeLimit]);

  const color = freezeActive ? '#06b6d4' : pct > 50 ? '#10b981' : pct > 25 ? '#f59e0b' : '#f43f5e';
  const shadowColor = freezeActive ? '#06b6d4aa' : `${color}88`;

  return (
    <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', marginBottom: '1rem' }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: `linear-gradient(90deg, ${color}, ${color}aa)`,
        borderRadius: 99,
        transition: 'all 0.3s',
        boxShadow: `0 0 12px ${shadowColor}`,
      }} />
    </div>
  );
};

/* ─── Player Chip ────────────────────────────────── */
const PlayerChip = ({ username, score, eliminated, isBot, isMe }) => {
  const displayName = isBot ? username.replace(/^🤖\s*/, '') : username;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      padding: '0.5rem 0.8rem',
      borderRadius: 'var(--r-lg)',
      background: eliminated
        ? 'rgba(244,63,94,0.08)'
        : isMe
          ? 'rgba(99,102,241,0.15)'
          : 'rgba(255,255,255,0.04)',
      border: `1px solid ${eliminated ? 'rgba(244,63,94,0.3)' : isMe ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
      opacity: eliminated ? 0.5 : 1,
      transition: 'all 0.3s',
    }}>
      {isBot ? <Bot size={14} color="var(--violet-400)" /> : <User size={14} color="var(--text-secondary)" />}
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: eliminated ? 'var(--text-muted)' : isMe ? 'var(--violet-300)' : 'var(--text-primary)' }}>
        {displayName}
      </span>
      {eliminated && <Skull size={12} color="#f43f5e" />}
      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: 'var(--amber-400)' }}>
        {score ?? 0}
      </span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN GAME PAGE
═══════════════════════════════════════════════════ */
export default function GamePage() {
  const { roomId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const stompRef = useRef(null);
  const myUsername = user?.username
    || JSON.parse(localStorage.getItem('qb_user') || '{}').username
    || 'Guest';

  /* ---- state ---- */
  const [phase, setPhase] = useState('CONNECTING');
  const [countdown, setCountdown] = useState(3);
  const [allPlayers, setAllPlayers] = useState([]);
  // Use refs for values needed inside WS callbacks to avoid stale closures
  const scoresRef = useRef({});
  const eliminatedRef = useRef(new Set());
  const [scores, setScores] = useState({});
  const [eliminated, setEliminated] = useState(new Set());
  const [question, setQuestion] = useState(null);
  const [qStartTime, setQStartTime] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [gameOver, setGameOver] = useState(null);

  // Casual Mode & Social/Emotes states
  const [gameMode, setGameMode] = useState('COMPETITIVE');
  const [emoteMap, setEmoteMap] = useState({});
  const [lifelinesUsed, setLifelinesUsed] = useState({
    fiftyFifty: false,
    freezeTime: false,
    doublePoints: false
  });
  const [hiddenOptions, setHiddenOptions] = useState(new Set());
  const [doublePointsActive, setDoublePointsActive] = useState(false);
  const [cyanTimer, setCyanTimer] = useState(false);

  // Expire emotes after 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setEmoteMap(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(username => {
          if (next[username] && now - next[username].time > 2500) {
            delete next[username];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  /* ---- WebSocket connect ---- */
  useEffect(() => {
    // handleEvent defined INSIDE useEffect to avoid stale closure issues
    const handleEvent = (event) => {
      const { type, payload } = event;
      if (!type) return; // raw room update, ignore

      switch (type) {
        case 'GAME_STARTING': {
          const players = payload.players || [];
          setAllPlayers(players);
          if (payload.gameMode) {
            setGameMode(payload.gameMode);
          }
          // Init scores for all players
          const initScores = {};
          players.forEach(p => { initScores[p] = 0; });
          scoresRef.current = initScores;
          setScores(initScores);
          eliminatedRef.current = new Set();
          setEliminated(new Set());
          setPhase('COUNTDOWN');
          let c = payload.countdown || 3;
          setCountdown(c);
          const timer = setInterval(() => {
            c--;
            setCountdown(c);
            if (c <= 0) clearInterval(timer);
          }, 1000);
          break;
        }
        case 'QUESTION': {
          // Populate allPlayers from the score keys if not set yet (mid-game join)
          setAllPlayers(prev => {
            if (prev.length > 0) return prev;
            // We don't have the list — leave it empty; score panel will show after ANSWER_RESULT
            return prev;
          });
          setQuestion(payload);
          setQStartTime(Date.now());
          setSelectedOption(null);
          setAnswerResult(null);
          setPhase('QUESTION');
          setHiddenOptions(new Set()); // Reset 50:50 for this round
          setDoublePointsActive(false); // Reset double points for this round
          setCyanTimer(false); // Reset freeze timer state
          break;
        }
        case 'ANSWER_RESULT': {
          const results = payload.playerResults || [];
          const newScores = { ...scoresRef.current };
          const newElim = new Set(eliminatedRef.current);
          const playerNames = [];
          results.forEach(r => {
            newScores[r.username] = r.totalScore;
            if (r.eliminated) newElim.add(r.username);
            playerNames.push(r.username);
          });
          // If allPlayers was empty (mid-game join), populate it now
          if (playerNames.length > 0) {
            setAllPlayers(prev => prev.length > 0 ? prev : playerNames);
          }
          scoresRef.current = newScores;
          eliminatedRef.current = newElim;
          setScores({ ...newScores });
          setEliminated(new Set(newElim));
          setAnswerResult(payload);
          setPhase('ANSWER_RESULT');
          break;
        }
        case 'GAME_OVER': {
          setGameOver(payload);
          setPhase('GAME_OVER');
          break;
        }
        case 'EMOTE': {
          const { username, emote } = payload;
          setEmoteMap(prev => ({
            ...prev,
            [username]: { emote, time: Date.now() }
          }));
          break;
        }
        case 'FREEZE_TIME_ACTIVATED': {
          const { username } = payload;
          setQStartTime(prev => prev + 5000);
          setCyanTimer(true);
          toast(`❄️ Time frozen by ${username}! +5s`, { icon: '❄️' });
          break;
        }
        default:
          break;
      }
    };

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 0,
      onConnect: () => {
        client.subscribe(`/topic/room/${roomId}`, (msg) => {
          try {
            const event = JSON.parse(msg.body);
            handleEvent(event);
          } catch (e) {
            console.error('WS parse error', e);
          }
        });
        client.publish({ destination: `/app/room/${roomId}/join`, body: '' });
      },
      onDisconnect: () => console.log('WS disconnected'),
      onStompError: (frame) => console.error('STOMP error:', frame),
    });
    client.activate();
    stompRef.current = client;
    return () => {
      try {
        client.publish({ destination: `/app/room/${roomId}/leave`, body: '' });
      } catch (_) {}
      client.deactivate();
    };
  }, [roomId, token]); // handleEvent is now defined inside, so no stale-closure issue

  /* ---- Bootstrap game state on mount (handles page refresh / late join) ---- */
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await gameApi.getGameState(roomId);
        const snap = res.data;

        if (snap.gameMode) {
          setGameMode(snap.gameMode);
        }

        // Populate player list if we don't have it yet
        if (snap.players && snap.players.length > 0) {
          setAllPlayers(prev => prev.length > 0 ? prev : snap.players);
          const initScores = {};
          snap.players.forEach(p => {
            initScores[p] = (snap.scores && snap.scores[p]) ?? 0;
          });
          // Only overwrite if we haven't received any WS scores yet
          if (Object.keys(scoresRef.current).length === 0) {
            scoresRef.current = initScores;
            setScores(initScores);
          }
        }

        // If game already active and we're still CONNECTING → move to waiting or active question
        if ((snap.status === 'PLAYING' || snap.status === 'STARTING') && snap.gameActive) {
          if (snap.questionActive && snap.currentQuestion) {
            setQuestion(snap.currentQuestion);
            setQStartTime(Date.now() - (snap.questionElapsedMs || 0));
            setPhase('QUESTION');
          } else {
            setPhase(prev => prev === 'CONNECTING' ? 'WAITING_FOR_QUESTION' : prev);
          }
        }
      } catch (e) {
        console.warn('Could not fetch game snapshot', e);
      }
    };
    // Short delay to let WS connect first — if GAME_STARTING arrives, bootstrap is a no-op
    const t = setTimeout(bootstrap, 1200);
    return () => clearTimeout(t);
  }, [roomId]);

  /* ---- Submit answer ---- */
  const submitAnswer = useCallback((option) => {
    if (!stompRef.current) return;
    setSelectedOption(prev => {
      if (prev) return prev; // already answered
      stompRef.current.publish({
        destination: `/app/room/${roomId}/answer`,
        body: JSON.stringify({ questionId: null, selectedOption: option, doublePoints: doublePointsActive }),
      });
      return option;
    });
  }, [roomId, doublePointsActive]);

  /* ---- Lifelines and Emotes triggers ---- */
  const handleFiftyFifty = async () => {
    if (lifelinesUsed.fiftyFifty || phase !== 'QUESTION') return;
    try {
      const res = await gameApi.getFiftyFifty(roomId);
      setHiddenOptions(new Set(res.data));
      setLifelinesUsed(prev => ({ ...prev, fiftyFifty: true }));
      toast.success('Hiding two wrong options! 🃏');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to use 50:50');
    }
  };

  const handleFreezeTime = () => {
    if (lifelinesUsed.freezeTime || phase !== 'QUESTION') return;
    if (stompRef.current) {
      stompRef.current.publish({
        destination: `/app/room/${roomId}/powerup`,
        body: JSON.stringify({ type: 'FREEZE' }),
      });
      setLifelinesUsed(prev => ({ ...prev, freezeTime: true }));
    }
  };

  const handleDoublePoints = () => {
    if (lifelinesUsed.doublePoints || phase !== 'QUESTION') return;
    setDoublePointsActive(true);
    setLifelinesUsed(prev => ({ ...prev, doublePoints: true }));
    toast.success('Double Points active for this question! 💎');
  };

  const sendEmote = (emote) => {
    if (stompRef.current) {
      try {
        stompRef.current.publish({
          destination: `/app/room/${roomId}/emote`,
          body: JSON.stringify({ emote }),
        });
      } catch (err) {
        console.error('Failed to send emote', err);
      }
    }
  };

  /* ═══ RENDER PHASES ═══════════════════════════════ */

  const cardStyle = {
    position: 'relative', zIndex: 1,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--r-2xl)',
    padding: '2rem',
    backdropFilter: 'blur(20px)',
  };

  /* CONNECTING */
  if (phase === 'CONNECTING') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatedBackground />
      <div className="glass anim-fade-up" style={{ padding: '3rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Entering battle arena…</p>
      </div>
    </div>
  );

  /* WAITING FOR QUESTION */
  if (phase === 'WAITING_FOR_QUESTION') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatedBackground />
      <div className="glass anim-fade-up" style={{ padding: '3rem', textAlign: 'center', position: 'relative', zIndex: 1, minWidth: 320 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'pulse 1.2s ease-in-out infinite' }}>⚡</div>
        <h2 className="font-display text-gradient" style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Battle in Progress</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Syncing with arena… next question incoming!
        </p>
        <div className="spinner" style={{ width: 28, height: 28, margin: '1.25rem auto 0' }} />
      </div>
    </div>
  );

  /* COUNTDOWN */
  if (phase === 'COUNTDOWN') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatedBackground />
      <div style={{ ...cardStyle, textAlign: 'center', minWidth: 360 }}>
        <Zap size={40} color="var(--amber-400)" style={{ marginBottom: '1rem' }} />
        <h1 className="font-display text-gradient" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Battle Starting!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {allPlayers.length} players in the arena
        </p>
        <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--violet-400)', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
          {countdown}
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {allPlayers.map(p => (
            <PlayerChip key={p} username={p} score={0} isMe={p === myUsername}
              isBot={p.startsWith('🤖') || p.startsWith('Bot_')} />
          ))}
        </div>
      </div>
    </div>
  );

  /* GAME OVER */
  if (phase === 'GAME_OVER' && gameOver) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <AnimatedBackground />
      <div style={{ ...cardStyle, width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <Crown size={48} color="var(--amber-400)" style={{ marginBottom: '1rem' }} />
        <h1 className="font-display text-gradient" style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>
          {gameOver.winner
            ? (gameOver.winner === myUsername ? '🎉 You Won!' : `${gameOver.winner} Wins!`)
            : 'Draw — Everyone Eliminated!'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {gameOver.winner === myUsername ? 'Outstanding performance, champion!' : 'Better luck next time!'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(gameOver.rankings || []).map((r) => (
            <div key={r.username} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--r-lg)',
              background: r.rank === 1 ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${r.rank === 1 ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}>
              <span style={{ fontWeight: 900, fontSize: '1rem', color: r.rank === 1 ? 'var(--amber-400)' : 'var(--text-muted)', minWidth: 24 }}>
                #{r.rank}
              </span>
              {r.isBot ? <Bot size={16} color="var(--violet-400)" /> : <User size={16} color="var(--text-secondary)" />}
              <span style={{ fontWeight: 600, flex: 1, textAlign: 'left' }}>{r.username}</span>
              {r.eliminated && <Skull size={14} color="#f43f5e" />}
              <span style={{ fontWeight: 800, color: 'var(--amber-400)' }}>{r.score} pts</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/lobby')}>
            Play Again
          </button>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/leaderboard')}>
            <Trophy size={16} /> Leaderboard
          </button>
        </div>
      </div>
    </div>
  );

  /* BATTLE ARENA (QUESTION + ANSWER_RESULT) */
  const optionLabels = ['A', 'B', 'C', 'D'];
  const myResult = answerResult?.playerResults?.find(r => r.username === myUsername);
  const isEliminated = eliminated.has(myUsername);

  return (
    <div style={{ minHeight: '100vh', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <AnimatedBackground />

      {/* Top bar */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color="var(--amber-400)" />
          <span className="font-display" style={{ fontWeight: 800, fontSize: '1rem' }}>
            Q {question?.questionNumber ?? '--'} / {question?.totalQuestions ?? '--'}
          </span>
          {question?.category && (
            <span className="chip chip--violet" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
              {question.category}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {allPlayers.map(p => (
            <div key={p} title={p} style={{
              width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: eliminated.has(p) ? 'rgba(244,63,94,0.15)' : p === myUsername ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${eliminated.has(p) ? '#f43f5e55' : p === myUsername ? 'var(--violet-400)' : 'rgba(255,255,255,0.1)'}`,
              fontSize: '0.65rem', fontWeight: 700, color: eliminated.has(p) ? '#f43f5e88' : 'var(--text-secondary)',
            }}>
              {p.startsWith('🤖') || p.startsWith('Bot_') ? '🤖' : p.slice(0, 2).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', gap: '1.5rem', maxWidth: 960, margin: '0 auto', width: '100%' }}>

        {/* Left: Question & options */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {phase === 'QUESTION' && question && (
            <TimerBar timeLimit={question.timeLimitSeconds} startTime={qStartTime} freezeActive={cyanTimer} />
          )}

          {question && (
            <div style={{ ...cardStyle, marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Clock size={16} color="var(--text-muted)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{question.timeLimitSeconds}s time limit</span>
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.5, color: 'var(--text-primary)' }}>
                {question.text}
              </h2>
            </div>
          )}

          {isEliminated && phase !== 'GAME_OVER' && (
            <div style={{ ...cardStyle, textAlign: 'center', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)' }}>
              <Skull size={36} color="#f43f5e" style={{ marginBottom: '0.5rem' }} />
              <h3 style={{ color: '#f43f5e', fontWeight: 800 }}>You've been eliminated!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Spectating remaining players…
              </p>
            </div>
          )}

          {question && !isEliminated && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {optionLabels.map((opt) => {
                const text = question.options?.[opt];
                if (!text) return null;
                const isHidden = hiddenOptions.has(opt);
                if (isHidden) {
                  return (
                    <div key={opt} style={{
                      padding: '1rem', borderRadius: 'var(--r-lg)',
                      background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.04)',
                      opacity: 0.2, minHeight: 62
                    }} />
                  );
                }
                const isSelected = selectedOption === opt;
                const showResult = phase === 'ANSWER_RESULT';
                const isCorrect  = showResult && answerResult?.correctAnswer === opt;
                const isWrong    = showResult && isSelected && !isCorrect;

                let bg = 'rgba(255,255,255,0.04)';
                let border = '1px solid rgba(255,255,255,0.08)';
                let color = 'var(--text-primary)';

                if (isCorrect) {
                  bg = 'rgba(16,185,129,0.15)'; border = '1px solid rgba(16,185,129,0.5)'; color = '#10b981';
                } else if (isWrong) {
                  bg = 'rgba(244,63,94,0.15)'; border = '1px solid rgba(244,63,94,0.5)'; color = '#f43f5e';
                } else if (isSelected) {
                  bg = 'rgba(99,102,241,0.15)'; border = '1px solid rgba(99,102,241,0.5)'; color = 'var(--violet-300)';
                }

                return (
                  <button
                    key={opt}
                    onClick={() => submitAnswer(opt)}
                    disabled={!!selectedOption || phase !== 'QUESTION'}
                    style={{
                      padding: '1rem', textAlign: 'left', borderRadius: 'var(--r-lg)',
                      background: bg, border, color,
                      cursor: selectedOption ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.4,
                    }}
                  >
                    <span style={{
                      flexShrink: 0, width: 28, height: 28, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', borderRadius: 'var(--r-md)',
                      background: isCorrect ? '#10b98133' : isWrong ? '#f43f5e33' : 'rgba(255,255,255,0.08)',
                      fontWeight: 800, fontSize: '0.85rem', color: 'inherit',
                    }}>{opt}</span>
                    {text}
                    {isCorrect && <CheckCircle2 size={16} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                    {isWrong  && <XCircle      size={16} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Emotes and Casual Mode Lifelines panels */}
          {question && !isEliminated && (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {/* Emotes Selector */}
              <div className="glass" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--r-xl)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginRight: '0.25rem' }}>Emote:</span>
                {['🤯', '😎', '👍', '👏', 'GG', 'NOOO'].map(emo => (
                  <button key={emo} className="btn btn-ghost" 
                    style={{ padding: '0.25rem 0.5rem', minWidth: 'auto', fontSize: '1rem' }} 
                    onClick={() => sendEmote(emo)}>
                    {emo}
                  </button>
                ))}
              </div>

              {/* Casual Mode Lifelines */}
              {gameMode === 'CASUAL' && phase === 'QUESTION' && (
                <div className="glass" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--r-xl)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginRight: '0.25rem' }}>Lifelines:</span>
                  
                  <button 
                    className={`btn ${lifelinesUsed.fiftyFifty ? 'btn-ghost' : 'btn-primary'}`} 
                    style={{ padding: '0.25rem 0.6rem', minWidth: 'auto', fontSize: '0.75rem', opacity: lifelinesUsed.fiftyFifty ? 0.4 : 1 }} 
                    disabled={lifelinesUsed.fiftyFifty}
                    onClick={handleFiftyFifty}
                  >
                    50:50
                  </button>

                  <button 
                    className={`btn ${lifelinesUsed.freezeTime ? 'btn-ghost' : 'btn-primary'}`} 
                    style={{ padding: '0.25rem 0.6rem', minWidth: 'auto', fontSize: '0.75rem', opacity: lifelinesUsed.freezeTime ? 0.4 : 1 }} 
                    disabled={lifelinesUsed.freezeTime}
                    onClick={handleFreezeTime}
                  >
                    ❄️ Freeze
                  </button>

                  <button 
                    className={`btn ${doublePointsActive ? 'btn-emerald' : lifelinesUsed.doublePoints ? 'btn-ghost' : 'btn-primary'}`} 
                    style={{ padding: '0.25rem 0.6rem', minWidth: 'auto', fontSize: '0.75rem', opacity: lifelinesUsed.doublePoints && !doublePointsActive ? 0.4 : 1 }} 
                    disabled={lifelinesUsed.doublePoints}
                    onClick={handleDoublePoints}
                  >
                    💎 2x
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedOption && phase === 'QUESTION' && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem' }}>
              <div className="spinner" style={{ width: 20, height: 20, display: 'inline-block', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Answer submitted — waiting for others…
            </div>
          )}
        </div>

        {/* Right: Score panel */}
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ ...cardStyle, padding: '1rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              🏆 Scores
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {allPlayers.map(p => (
                <div key={p} style={{ position: 'relative' }}>
                  <PlayerChip username={p}
                    score={scores[p] ?? 0}
                    eliminated={eliminated.has(p)}
                    isBot={p.startsWith('🤖') || p.startsWith('Bot_')}
                    isMe={p === myUsername}
                  />
                  {emoteMap[p] && (
                    <div style={{
                      position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)',
                      marginRight: '0.5rem', background: 'var(--violet-600)', border: '1px solid var(--violet-400)',
                      borderRadius: 'var(--r-md) var(--r-md) 0 var(--r-md)', padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem', whiteSpace: 'nowrap', zIndex: 10,
                      boxShadow: '0 0 12px rgba(124,237,124,0.4)',
                      animation: 'fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
                    }}>
                      {emoteMap[p].emote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {phase === 'ANSWER_RESULT' && myResult && (
            <div style={{
              ...cardStyle, padding: '1rem', textAlign: 'center',
              background: myResult.correct ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
              border: `1px solid ${myResult.correct ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
            }}>
              {myResult.correct
                ? <CheckCircle2 size={28} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                : <XCircle      size={28} color="#f43f5e" style={{ marginBottom: '0.5rem' }} />}
              <p style={{ fontWeight: 700, color: myResult.correct ? '#10b981' : '#f43f5e', fontSize: '0.9rem' }}>
                {myResult.correct ? `+${myResult.points} pts!` : 'Eliminated!'}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Correct: <strong style={{ color: 'var(--text-secondary)' }}>{answerResult?.correctAnswer}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
