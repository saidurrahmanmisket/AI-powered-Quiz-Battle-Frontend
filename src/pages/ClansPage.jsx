import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clanApi } from '../api/client';
import AnimatedBackground from '../components/AnimatedBackground';
import { Users, PlusCircle, Trophy, LogOut, ArrowLeft, Search, ShieldAlert, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClansPage() {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [myClan, setMyClan] = useState(null);
  const [hasClan, setHasClan] = useState(false);
  const [clans, setClans] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create clan form state
  const [form, setForm] = useState({ name: '', tag: '', description: '' });
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (isGuest) return;
    loadClanData();
  }, [isGuest]);

  const loadClanData = async () => {
    try {
      setLoading(true);
      const [myRes, lbRes, allRes] = await Promise.allSettled([
        clanApi.getMyClan(),
        clanApi.getLeaderboard(),
        clanApi.searchClans(),
      ]);

      if (myRes.status === 'fulfilled') {
        setHasClan(myRes.value.data.hasClan);
        setMyClan(myRes.value.data.clan || null);
      }

      if (lbRes.status === 'fulfilled') {
        setLeaderboard(lbRes.value.data);
      }

      if (allRes.status === 'fulfilled') {
        setClans(allRes.value.data);
      }
    } catch {
      toast.error('Failed to load clan data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClan = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.tag.trim()) return toast.error('Name and Tag are required');
    if (form.tag.trim().length > 4) return toast.error('Tag must be 4 characters or less');

    try {
      await clanApi.createClan(form.name.trim(), form.tag.trim(), form.description.trim());
      toast.success('Clan created successfully!');
      setForm({ name: '', tag: '', description: '' });
      setShowCreate(false);
      loadClanData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create clan');
    }
  };

  const handleJoinClan = async (clanId) => {
    try {
      await clanApi.joinClan(clanId);
      toast.success('Joined clan!');
      loadClanData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join clan');
    }
  };

  const handleLeaveClan = async () => {
    if (!window.confirm('Are you sure you want to leave your clan?')) return;
    try {
      await clanApi.leaveClan();
      toast.success('Left clan successfully');
      loadClanData();
    } catch (err) {
      toast.error('Failed to leave clan');
    }
  };

  if (isGuest) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatedBackground />
        <div className="glass anim-fade-up" style={{ padding: '3rem', textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 400 }}>
          <ShieldAlert size={48} color="var(--amber-400)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Registered Players Only</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Guests cannot join or create clans. Register an account to play with friends, compete in clans, and climb the leaderboard!
          </p>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/register')}>Register Now</button>
        </div>
      </div>
    );
  }

  const filteredClans = clans.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <AnimatedBackground />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 960, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="font-display text-gradient" style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            Trivia Clans
          </h1>
          <div>
            {!hasClan && !showCreate && (
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                <PlusCircle size={16} /> Create Clan
              </button>
            )}
            {showCreate && (
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* Left side: Clan Info, search, create form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Show Create Clan Form */}
              {showCreate && (
                <div className="glass anim-fade-up" style={{ padding: '1.75rem' }}>
                  <h2 className="font-display text-gradient" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                    Forge a New Clan
                  </h2>
                  <form onSubmit={handleCreateClan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>CLAN NAME</label>
                        <input className="field__input" type="text" placeholder="e.g. Brainiacs"
                          value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} required />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>TAG</label>
                        <input className="field__input" type="text" placeholder="BRAN" maxLength={4}
                          value={form.tag} onChange={(e) => setForm(prev => ({ ...prev, tag: e.target.value }))} required />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>DESCRIPTION</label>
                      <textarea className="field__input" placeholder="What is your clan about?" rows={3} style={{ resize: 'none', fontFamily: 'inherit' }}
                        value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                      Establish Clan
                    </button>
                  </form>
                </div>
              )}

              {/* Show My Clan Info if in a Clan */}
              {hasClan && myClan && (
                <div className="glass anim-fade-up" style={{
                  padding: '2rem',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(0,0,0,0.1))',
                  border: '1px solid rgba(99,102,241,0.3)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                      <span className="chip chip--violet" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>
                        🛡️ YOUR CLAN
                      </span>
                      <h2 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1 }}>
                        {myClan.name}{' '}
                        <span style={{ color: 'var(--amber-400)', fontSize: '1.1rem', fontWeight: 900 }}>
                          [{myClan.tag}]
                        </span>
                      </h2>
                    </div>
                    <button className="btn btn-ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', color: '#f43f5e' }} onClick={handleLeaveClan}>
                      <LogOut size={12} /> Leave
                    </button>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    {myClan.description || 'No description provided.'}
                  </p>
                  <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                    <div>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Score</p>
                      <p className="font-display" style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--amber-400)' }}>{myClan.points}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Clan Browser (Only show if not in clan and not creating one) */}
              {!hasClan && !showCreate && (
                <div className="glass anim-fade-up" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        className="field__input"
                        style={{ paddingLeft: '2.25rem' }}
                        type="text"
                        placeholder="Search clans by name or tag..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredClans.map(clan => (
                      <div key={clan.id} className="glass glass--interactive" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {clan.name}
                            <span style={{ fontSize: '0.75rem', color: 'var(--amber-400)', fontWeight: 800 }}>
                              [{clan.tag}]
                            </span>
                          </h3>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {clan.description || 'No description.'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Points</p>
                            <p className="font-display" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--amber-400)' }}>{clan.points}</p>
                          </div>
                          <button className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }} onClick={() => handleJoinClan(clan.id)}>
                            Join
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredClans.length === 0 && (
                      <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No clans found. Establish your own!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Clan Leaderboard */}
            <div className="glass anim-fade-up" style={{ padding: '1.5rem', animationDelay: '0.1s' }}>
              <h2 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <Trophy size={14} color="var(--amber-400)" /> Top Clans
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {leaderboard.map((c, index) => (
                  <div key={c.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--r-lg)',
                    background: index === 0 ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${index === 0 ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.05)'}`,
                  }}>
                    <span style={{ fontWeight: 900, fontSize: '0.9rem', color: index === 0 ? 'var(--amber-400)' : 'var(--text-muted)', minWidth: 20 }}>
                      #{index + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        {c.name}{' '}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          [{c.tag}]
                        </span>
                      </p>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--amber-400)' }}>
                      {c.points} pts
                    </span>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Leaderboard is empty.
                  </p>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
