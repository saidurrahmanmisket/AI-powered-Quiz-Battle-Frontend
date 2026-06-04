import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import toast from 'react-hot-toast';
import {
  ShieldCheck, User, Mail, Lock, Eye, EyeOff, ArrowLeft, UserPlus, Check, X
} from 'lucide-react';

const rules = [
  { id: 'len', label: '6+ characters', test: (p) => p.length >= 6 },
  { id: 'upper', label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'num', label: 'Number', test: (p) => /\d/.test(p) },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const set = (k) => (e) => { setForm((p) => ({ ...p, [k]: e.target.value })); if (k === 'password') setTouched(true); };

  const strength = useMemo(() => {
    const passed = rules.filter((r) => r.test(form.password)).length;
    return { score: passed, label: ['', 'Weak', 'Fair', 'Strong'][passed], color: ['', 'var(--rose-500)', 'var(--amber-400)', 'var(--emerald-400)'][passed] };
  }, [form.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.password) return toast.error('All fields required');
    if (form.password !== form.confirmPassword) return toast.error('Passwords don\'t match');
    if (strength.score < 1) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.username.trim(), form.email.trim(), form.password);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      const data = err?.response?.data;
      // Backend validation errors come as { errors: { field: message } }
      if (data?.errors) {
        const firstError = Object.values(data.errors)[0];
        toast.error(firstError || 'Validation failed');
      } else {
        toast.error(data?.message || 'Registration failed. Please try again.');
      }
    }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <AnimatedBackground />

      <div className="card-animated-border anim-scale-in" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div className="card-glow__inner" style={{ padding: '2.25rem 2.25rem' }}>

          {/* Back */}
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'none', marginBottom: '1.25rem', transition: 'color 0.2s' }}>
            <ArrowLeft size={14} /> Back to login
          </Link>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div className="anim-float" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 60, height: 60, borderRadius: 'var(--r-xl)',
              background: 'linear-gradient(135deg, var(--cyan-500), var(--emerald-400))',
              boxShadow: '0 0 36px rgba(6,182,212,0.3)', marginBottom: '0.85rem',
            }}>
              <ShieldCheck size={28} color="white" />
            </div>
            <h1 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              <span className="text-gradient">Create Account</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Join the arena. Climb the leaderboard.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} data-stagger>
            <div className="field">
              <label className="field__label">Username</label>
              <div className="field__input-wrap">
                <User size={16} className="field__icon" />
                <input className="field__input" placeholder="Choose your battle name"
                  value={form.username} onChange={set('username')} autoComplete="username" />
              </div>
            </div>

            <div className="field">
              <label className="field__label">Email</label>
              <div className="field__input-wrap">
                <Mail size={16} className="field__icon" />
                <input className="field__input" type="email" placeholder="your@email.com"
                  value={form.email} onChange={set('email')} autoComplete="email" />
              </div>
            </div>

            <div className="field">
              <label className="field__label">Password</label>
              <div className="field__input-wrap">
                <Lock size={16} className="field__icon" />
                <input className="field__input" type={showPwd ? 'text' : 'password'}
                  placeholder="Create a strong password" value={form.password}
                  onChange={set('password')} style={{ paddingRight: '2.75rem' }} />
                <button type="button" className="field__toggle" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength */}
              {touched && (
                <div style={{ animation: 'fade-up 0.3s ease both' }}>
                  <div className="strength-bar" style={{ marginTop: '0.4rem' }}>
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="strength-bar__segment"
                        style={n <= strength.score ? { background: strength.color, boxShadow: `0 0 8px ${strength.color}55` } : {}} />
                    ))}
                    {strength.label && <span className="strength-bar__label" style={{ color: strength.color }}>{strength.label}</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem 0.75rem', marginTop: '0.45rem' }}>
                    {rules.map((r) => {
                      const ok = r.test(form.password);
                      return (
                        <span key={r.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.68rem', fontWeight: 500, color: ok ? 'var(--emerald-400)' : 'var(--text-dim)', transition: 'color 0.25s' }}>
                          {ok ? <Check size={11} /> : <X size={11} />} {r.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="field">
              <label className="field__label">Confirm Password</label>
              <div className="field__input-wrap">
                <Lock size={16} className="field__icon" />
                <input className="field__input" type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password" value={form.confirmPassword}
                  onChange={set('confirmPassword')} style={{ paddingRight: '2.75rem' }} />
                <button type="button" className="field__toggle" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: '0.25rem' }}>
              {loading ? <span className="spinner" /> : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1.5rem' }}>
            Already a challenger?{' '}
            <Link to="/login" style={{ color: 'var(--violet-300)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
