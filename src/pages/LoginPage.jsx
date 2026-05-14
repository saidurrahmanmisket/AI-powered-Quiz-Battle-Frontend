import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { saveSession } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'Username is required';
    if (!form.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(form);
      saveSession(res.data.token, res.data);
      toast.success(`Welcome back, ${res.data.username}! ⚡`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Try again.';
      toast.error(msg);
      setErrors({ password: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      const res = await authApi.guest();
      saveSession(res.data.token, res.data);
      toast.success(`Playing as ${res.data.username} 🎭`);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to start guest session. Try again.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      {/* Animated background */}
      <div className="bg-animated">
        <div className="bg-grid" />
      </div>

      {/* Card */}
      <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 440, padding: '2.5rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="font-display gradient-text animate-float" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
            ⚡ QUIZ BATTLE
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Enter the arena. Dominate the trivia.
          </p>
        </div>

        {/* Live badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-purple" style={{ animation: 'pulse-glow 2.5s ease-in-out infinite' }}>
            🔴 LIVE BATTLES
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group animate-fade-in-up">
            <label className="form-label">Username</label>
            <input
              id="login-username"
              className={`form-input ${errors.username ? 'error' : ''}`}
              type="text"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
            />
            {errors.username && <span className="form-error">⚠ {errors.username}</span>}
          </div>

          <div className="form-group animate-fade-in-up">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            {errors.password && <span className="form-error">⚠ {errors.password}</span>}
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full animate-fade-in-up"
            style={{ marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner" /> Authenticating...</>
            ) : (
              '🎮 Enter Battle'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="divider" style={{ margin: '1.5rem 0' }}>or</div>

        {/* Guest login */}
        <button
          id="guest-login"
          className="btn btn-gold btn-full"
          onClick={handleGuestLogin}
          disabled={guestLoading}
        >
          {guestLoading ? (
            <><span className="spinner" style={{ color: '#0a0a0f' }} /> Joining...</>
          ) : (
            '🎭 Play as Guest'
          )}
        </button>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.75rem' }}>
          Guest sessions are temporary and stats won't be saved.
        </p>

        {/* Register link */}
        <p style={{ textAlign: 'center', marginTop: '1.75rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          New challenger?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--color-primary-glow)', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
