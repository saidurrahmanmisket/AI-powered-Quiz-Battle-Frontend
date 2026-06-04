import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGameSocket } from '../hooks/useGameSocket';
import { gameApi } from '../api/client';
import AnimatedBackground from '../components/AnimatedBackground';
import {
  Users, Shield, Zap, Swords, ArrowLeft, Trophy,
  Gamepad2, Clock, CheckCircle2, UserPlus, Bot, Crown, Flame,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Room List Page ──────────────────────────────────────────────── */
export default function LobbyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [loading, setLoading] = useState(true);

  const { connected, roomData, gameEvent, sendMessage } = useGameSocket(selectedRoomId);

  // Initial fetch
  useEffect(() => {
    fetchRooms();
  }, []);

  // Poll room list every 5 s when not in a room
  useEffect(() => {
    if (selectedRoomId) return;
    const id = setInterval(fetchRooms, 5000);
    return () => clearInterval(id);
  }, [selectedRoomId]);

  // Handle typed game events from BattleService
  useEffect(() => {
    if (!gameEvent || !selectedRoomId) return;
    if (gameEvent.type === 'GAME_STARTING') {
      toast.success('🚀 Battle starting!', { duration: 2000 });
      // Navigate to the full-screen game arena
      navigate(`/game/${selectedRoomId}`);
    }
  }, [gameEvent, selectedRoomId, navigate]);

  // If the room is already in STARTING / PLAYING state (edge-case: late join via roomData)
  useEffect(() => {
    if (roomData && selectedRoomId && (roomData.status === 'STARTING' || roomData.status === 'PLAYING')) {
      navigate(`/game/${selectedRoomId}`);
    }
  }, [roomData, selectedRoomId, navigate]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await gameApi.getRooms();
      setRooms(res.data);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    const name = `${user?.username || 'Player'}'s Arena`;
    try {
      const res = await gameApi.createRoom(name);
      setRooms((prev) => [...prev, res.data]);
      setSelectedRoomId(res.data.id);
      toast.success('Room created!');
    } catch {
      toast.error('Failed to create room');
    }
  };

  const handleJoin = (roomId) => {
    setSelectedRoomId(roomId);
  };

  /* ─── Active Lobby view ─── */
  if (selectedRoomId) {
    const currentRoom = roomData || rooms.find((r) => r.id === selectedRoomId);
    return (
      <ActiveLobby
        room={currentRoom}
        roomId={selectedRoomId}
        connected={connected}
        onLeave={() => {
          sendMessage(`/room/${selectedRoomId}/leave`, {});
          setSelectedRoomId(null);
        }}
      />
    );
  }

  /* ─── Room browser ─── */
  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <AnimatedBackground />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 className="font-display anim-fade-up" style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              Battle <span className="text-gradient">Lobby</span>
            </h1>
            <p className="anim-fade-up" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Join an open arena or create your own war room.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-ghost anim-fade-up" onClick={() => navigate('/leaderboard')}>
              <Trophy size={16} /> Leaderboard
            </button>
            <button className="btn btn-primary anim-fade-up" onClick={handleCreateRoom}>
              <UserPlus size={18} /> Create Room
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="glass anim-fade-up" style={{
          display: 'flex', gap: '2rem', padding: '1rem 1.5rem',
          marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
            <Zap size={14} color="var(--amber-400)" />
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{rooms.filter(r => r.status === 'WAITING').length}</strong> rooms open
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
            <Flame size={14} color="var(--violet-400)" />
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>
                {rooms.reduce((acc, r) => acc + (r.players?.length || 0), 0)}
              </strong> players online
            </span>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Auto-refreshes every 5s
          </div>
        </div>

        {/* Room grid */}
        {loading && rooms.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
          </div>
        ) : (
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}
            className="anim-fade-up"
          >
            {rooms.map((room) => <RoomCard key={room.id} room={room} onJoin={handleJoin} />)}
            {rooms.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <Swords size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p>No open rooms. Create one to start!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Single Room Card ─────────────────────────────────────────────── */
function RoomCard({ room, onJoin }) {
  const isWaiting = room.status === 'WAITING';
  const isFull = room.players?.length >= room.maxPlayers;
  const canJoin = isWaiting && !isFull;

  return (
    <div className="glass glass--interactive shimmer-hover" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span className={`chip ${isWaiting ? 'chip--emerald' : 'chip--amber'}`} style={{ fontSize: '0.65rem' }}>
          {isWaiting ? '● OPEN' : '⚡ IN BATTLE'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <Users size={14} /> {room.players?.length ?? 0}/{room.maxPlayers}
        </div>
      </div>

      <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        {room.name}
      </h3>

      {/* Player pips */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {Array.from({ length: room.maxPlayers }).map((_, i) => {
          const player = room.players?.[i];
          return (
            <div key={i} style={{
              width: 28, height: 28, borderRadius: '50%', fontSize: '0.6rem', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: player ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${player ? 'var(--violet-400)' : 'rgba(255,255,255,0.08)'}`,
              color: player ? 'var(--violet-300)' : 'var(--text-muted)',
            }}>
              {player ? player.slice(0, 2).toUpperCase() : <Bot size={12} />}
            </div>
          );
        })}
      </div>

      {isWaiting && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Clock size={12} />
          Countdown: <strong style={{ color: 'var(--amber-400)' }}>{room.countdown}s</strong>
        </div>
      )}

      <button
        className={`btn ${canJoin ? 'btn-primary' : 'btn-ghost'} btn-full`}
        disabled={!canJoin}
        onClick={() => canJoin && onJoin(room.id)}
      >
        {canJoin ? <><Swords size={15} /> Join Battle</> : <><Shield size={15} /> {isFull ? 'Full' : 'In Progress'}</>}
      </button>
    </div>
  );
}

/* ─── Active Lobby (waiting room) ─────────────────────────────────── */
function ActiveLobby({ room, roomId, connected, onLeave }) {
  const { user } = useAuth();
  if (!room) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatedBackground />
        <div className="glass anim-fade-up" style={{ padding: '3rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Connecting to room…</p>
        </div>
      </div>
    );
  }

  const playerCount = room.players?.length ?? 0;
  const maxPlayers = room.maxPlayers ?? 4;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <AnimatedBackground />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
        <button onClick={onLeave} className="btn btn-ghost" style={{ padding: '0.5rem 1rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Main card */}
        <div className="glass anim-fade-up" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {room.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="chip chip--violet">
                <Users size={12} style={{ marginRight: '0.25rem' }} /> {playerCount}/{maxPlayers} Players
              </span>
              <span className={`chip ${connected ? 'chip--emerald' : 'chip--amber'}`}>
                {connected ? '● Connected' : '◌ Connecting…'}
              </span>
            </div>
          </div>

          {/* Countdown display */}
          <div style={{
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 'var(--r-xl)',
            padding: '2rem',
            border: '1px solid var(--border-subtle)',
            marginBottom: '2rem',
          }}>
            <div className="font-display" style={{
              fontSize: '4rem', fontWeight: 900, color: 'var(--amber-400)',
              textShadow: '0 0 30px rgba(245,158,11,0.4)',
              lineHeight: 1,
            }}>
              {room.countdown}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Seconds until battle starts
            </p>
            {/* Progress bar */}
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginTop: '1rem', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(room.countdown / 30) * 100}%`,
                background: 'linear-gradient(90deg, var(--violet-500), var(--amber-400))',
                borderRadius: 99,
                transition: 'width 0.9s linear',
              }} />
            </div>
          </div>

          {/* Player slots */}
          <div style={{ textAlign: 'left' }}>
            <h3 style={{
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <Shield size={14} /> Battle Participants
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {/* Filled slots */}
              {(room.players || []).map((p) => (
                <div key={p} className="glass" style={{
                  padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  border: p === user?.username ? '1px solid var(--violet-500)' : '1px solid var(--border-subtle)',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald-400)', boxShadow: '0 0 8px var(--emerald-500)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{p}</span>
                  {p === user?.username && <span style={{ fontSize: '0.6rem', color: 'var(--violet-400)', fontWeight: 800, marginLeft: 'auto' }}>YOU</span>}
                </div>
              ))}
              {/* Empty bot slots */}
              {Array.from({ length: Math.max(0, maxPlayers - playerCount) }).map((_, i) => (
                <div key={i} className="glass" style={{
                  padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  opacity: 0.35, borderStyle: 'dashed',
                }}>
                  <Bot size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI Bot joining…</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="glass anim-fade-up" style={{
          padding: '1.25rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
          background: 'linear-gradient(90deg, rgba(124,58,237,0.12), transparent)',
        }}>
          <Crown size={18} style={{ color: 'var(--amber-400)', flexShrink: 0 }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>Pro Tip:</strong> Answer quickly — speed bonuses can earn up to +50 extra points per question!
          </p>
        </div>
      </div>
    </div>
  );
}
