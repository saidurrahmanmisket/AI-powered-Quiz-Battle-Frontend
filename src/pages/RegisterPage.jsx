import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'Username is required';
    else if (form.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const { username, email, password } = form;
      const res = await authApi.register({ username, email, password });
      toast.success(res.data.message || 'Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      if (err.response?.data?.errors) {
        // Validation errors from backend
        setErrors(err.response.data.errors);
      } else {
        const msg = err.response?.data?.message || 'Registration failed. Try again.';
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrength = (password) => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthScore = getStrength(form.password);
  const strengthColors = ['#ef4444', '#f59e0b', '#eab308', '#10b981'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      {/* Animated background */}
      <div className="bg-animated">
        <div className="bg-grid" />
      </div>

      {/* Card */}
      <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 460, padding: '2.5rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="font-display gradient-text" style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
            JOIN THE BATTLE
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Create your account and start competing
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Username */}
          <div className="form-group animate-fade-in-up">
            <label className="form-label">Username</label>
            <input
              id="reg-username"
              className={`form-input ${errors.username ? 'error' : ''}`}
              type="text"
              name="username"
              placeholder="Choose a battle name"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
            />
            {errors.username && <span className="form-error">⚠ {errors.username}</span>}
          </div>

          {/* Email */}
          <div className="form-group animate-fade-in-up">
            <label className="form-label">Email</label>
            <input
              id="reg-email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              name="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">⚠ {errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group animate-fade-in-up">
            <label className="form-label">Password</label>
            <input
              id="reg-password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {/* Password strength bar */}
            {form.password && (
              <div style={{ display: 'flex', gap: '4px', marginTop: '0.25rem', alignItems: 'center' }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 4, borderRadius: 999,
                    background: i < strengthScore ? strengthColors[strengthScore - 1] : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.3s ease',
                  }} />
                ))}
                <span style={{ fontSize: '0.7rem', color: strengthScore > 0 ? strengthColors[strengthScore - 1] : 'var(--color-text-muted)', marginLeft: '0.5rem', minWidth: 36 }}>
                  {form.password ? strengthLabels[Math.max(0, strengthScore - 1)] : ''}
                </span>
              </div>
            )}
            {errors.password && <span className="form-error">⚠ {errors.password}</span>}
          </div>

          {/* Confirm password */}
          <div className="form-group animate-fade-in-up">
            <label className="form-label">Confirm Password</label>
            <input
              id="reg-confirm-password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              type="password"
              name="confirmPassword"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {form.confirmPassword && form.password === form.confirmPassword && (
              <span style={{ color: 'var(--color-success)', fontSize: '0.8rem' }}>✓ Passwords match</span>
            )}
            {errors.confirmPassword && <span className="form-error">⚠ {errors.confirmPassword}</span>}
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-full animate-fade-in-up"
            style={{ marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner" /> Creating Account...</>
            ) : (
              '🚀 Create Account'
            )}
          </button>
        </form>

        {/* Login link */}
        <p style={{ textAlign: 'center', marginTop: '1.75rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Already a warrior?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--color-primary-glow)', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
