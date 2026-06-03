import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import toast from 'react-hot-toast';
import {
  Zap, User, Lock, Eye, EyeOff, LogIn, Gamepad2, Swords, ArrowRight
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginAsGuest } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) return toast.error('Fill in both fields');
    setLoading(true);
    try { await login(form.username.trim(), form.password); navigate('/dashboard'); }
    catch (err) { toast.error(err?.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    try { await loginAsGuest(); navigate('/dashboard'); }
    catch { toast.error('Could not start guest session'); }
    finally { setGuestLoading(false); }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <AnimatedBackground />

      <div className="card-animated-border anim-scale-in" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div className="card-glow__inner" style={{ padding: '2.75rem 2.25rem' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }} data-stagger>
            <div className="anim-float" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 64, height: 64, borderRadius: 'var(--r-xl)',
              background: 'linear-gradient(135deg, var(--violet-600), var(--violet-400))',
              boxShadow: '0 0 40px rgba(124,58,237,0.35)', marginBottom: '1rem',
            }}>
              <Zap size={30} color="white" fill="white" />
            </div>

            <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              <span className="text-gradient">Quiz Battle</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Enter the arena. Dominate the trivia.
            </p>

            <div style={{ marginTop: '1rem' }}>
              <span className="chip chip--rose chip--live">
                <Swords size={11} /> LIVE BATTLES
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }} data-stagger>
            <div className="field">
              <label className="field__label">Username</label>
              <div className="field__input-wrap">
                <User size={16} className="field__icon" />
                <input className="field__input" type="text" placeholder="Enter your username"
                  value={form.username} onChange={set('username')} autoComplete="username" />
              </div>
            </div>

            <div className="field">
              <label className="field__label">Password</label>
              <div className="field__input-wrap">
                <Lock size={16} className="field__icon" />
                <input className="field__input" type={showPwd ? 'text' : 'password'}
                  placeholder="Enter your password" value={form.password}
                  onChange={set('password')} autoComplete="current-password"
                  style={{ paddingRight: '2.75rem' }} />
                <button type="button" className="field__toggle" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: '0.25rem' }}>
              {loading ? <span className="spinner" /> : <><LogIn size={18} /> Enter Battle</>}
            </button>

            <div className="divider">or continue as</div>

            <button type="button" className="btn btn-accent btn-lg btn-full" onClick={handleGuest} disabled={guestLoading}>
              {guestLoading ? <span className="spinner" /> : <><Gamepad2 size={18} /> Play as Guest</>}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '-0.5rem' }}>
              Guest sessions are temporary. Stats won't be saved.
            </p>
          </form>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', animation: 'fade-up 0.5s var(--ease-out-expo) 0.4s both' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              New challenger?{' '}
              <Link to="/register" style={{ color: 'var(--cyan-400)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                Create Account <ArrowRight size={14} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
