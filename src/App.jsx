import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AnimatedBackground from './components/AnimatedBackground';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import LobbyPage from './pages/LobbyPage';
import { Construction } from 'lucide-react';

/* ---------- Coming-soon placeholder ---------- */
const ComingSoonPage = ({ title, phase }) => (
  <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
    <AnimatedBackground />
    <div className="glass anim-fade-up" style={{ padding: '3rem 2.5rem', textAlign: 'center', maxWidth: 420, position: 'relative', zIndex: 1 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 56, height: 56, borderRadius: 'var(--r-xl)',
        background: 'rgba(245, 158, 11, 0.1)', marginBottom: '1.25rem',
      }}>
        <Construction size={28} style={{ color: 'var(--amber-400)' }} />
      </div>
      <h1 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        <span className="text-gradient">{title}</span>
      </h1>
      <span className="chip chip--amber" style={{ marginBottom: '1rem' }}>{phase}</span>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginTop: '0.75rem' }}>
        This feature is currently under construction. Check back soon!
      </p>
    </div>
  </div>
);

/* ---------- Layout wrapper ---------- */
const AppLayout = () => {
  const { token } = useAuth();
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const showNav = token && !isAuthPage;

  return (
    <>
      {showNav && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/lobby" element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

/* ---------- Root ---------- */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              fontFamily: "'Inter', sans-serif", fontSize: '0.85rem',
              borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-lg)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#0a0a18' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#0a0a18' } },
          }}
        />
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
