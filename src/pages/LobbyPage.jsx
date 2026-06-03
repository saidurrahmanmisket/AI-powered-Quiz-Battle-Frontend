import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGameSocket } from '../hooks/useGameSocket';
import { gameApi } from '../api/client';
import AnimatedBackground from '../components/AnimatedBackground';
import { 
  Users, Shield, Zap, Swords, ArrowLeft, Trophy, 
  Gamepad2, Clock, CheckCircle2, UserPlus, Bot
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LobbyPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [loading, setLoading] = useState(true);

  const { connected, roomData, sendMessage } = useGameSocket(selectedRoomId);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await gameApi.getRooms();
      setRooms(res.data);
    } catch (err) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    const name = `${user}'s Arena`;
    try {
      const res = await gameApi.createRoom(name);
      setRooms([...rooms, res.data]);
      setSelectedRoomId(res.data.id);
      toast.success('Room created!');
    } catch (err) {
      toast.error('Failed to create room');
    }
  };

  if (selectedRoomId && roomData) {
    return <ActiveLobby room={roomData} connected={connected} onLeave={() => setSelectedRoomId(null)} />;
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <AnimatedBackground />
      
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 className="font-display anim-fade-up" style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              Battle <span className="text-gradient">Lobby</span>
            </h1>
            <p className="anim-fade-up" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Join a room or create your own to start the battle.
            </p>
          </div>
          <button className="btn btn-primary anim-fade-up" onClick={handleCreateRoom}>
            <UserPlus size={18} /> Create Room
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <div className="shimmer-hover" style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--violet-500)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }} className="anim-fade-up" data-stagger>
            {rooms.map(room => (
              <div key={room.id} className="glass glass--interactive shimmer-hover" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span className="chip chip--violet" style={{ fontSize: '0.65rem' }}>#{room.id}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <Users size={14} /> {room.players.length}/{room.maxPlayers}
                  </div>
                </div>
                <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{room.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                   {room.status === 'WAITING' ? (
                     <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                       <Clock size={12} /> Waiting for players...
                     </span>
                   ) : (
                     <span style={{ fontSize: '0.75rem', color: 'var(--amber-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                       <Zap size={12} /> In Progress
                     </span>
                   )}
                </div>
                <button 
                  className="btn btn-secondary btn-full" 
                  disabled={room.status !== 'WAITING'}
                  onClick={() => setSelectedRoomId(room.id)}
                >
                  {room.status === 'WAITING' ? 'Join Battle' : 'Spectate'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveLobby({ room, connected, onLeave }) {
  const { user } = useAuth();
  
  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <AnimatedBackground />
      
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
        <button onClick={onLeave} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Back to Lobby
        </button>

        <div className="glass anim-fade-up" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {room.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <span className="chip chip--violet">
                <Users size={12} style={{ marginRight: '0.25rem' }} /> {room.players.length} Players
              </span>
              <span className={`chip ${connected ? 'chip--emerald' : 'chip--amber'}`}>
                {connected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: 'var(--r-xl)', 
            padding: '2rem',
            border: '1px solid var(--border-subtle)',
            marginBottom: '2rem'
          }}>
            <div className="font-display" style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--amber-400)', textShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }}>
              {room.countdown}
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Starting in...
            </p>
          </div>

          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={14} /> Ready Players
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {room.players.map(p => (
                <div key={p} className="glass" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: p === user ? '1px solid var(--violet-500)' : '1px solid var(--border-subtle)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald-400)', boxShadow: '0 0 8px var(--emerald-500)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{p}</span>
                  {p === user && <span style={{ fontSize: '0.6rem', color: 'var(--violet-400)', fontWeight: 800 }}>(YOU)</span>}
                </div>
              ))}
              {Array.from({ length: Math.max(0, 4 - room.players.length) }).map((_, i) => (
                <div key={i} className="glass" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.3, borderStyle: 'dashed' }}>
                  <Bot size={16} style={{ color: 'var(--text-dim)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Searching...</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass anim-fade-up" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(90deg, rgba(124,58,237,0.1), transparent)' }}>
          <Zap size={20} style={{ color: 'var(--violet-400)' }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>Pro Tip:</strong> Speed matters! Faster answers give you more points in the final calculation.
          </p>
        </div>
      </div>
    </div>
  );
}
