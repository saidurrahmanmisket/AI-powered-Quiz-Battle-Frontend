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
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ClansPage from './pages/ClansPage';

/* ---------- Layout wrapper ---------- */
const AppLayout = () => {
  const { token } = useAuth();
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isGamePage = location.pathname.startsWith('/game/');
  const showNav = token && !isAuthPage && !isGamePage;

  return (
    <>
      {showNav && <Navbar />}
      <Routes>
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/dashboard"       element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/lobby"           element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
        <Route path="/game/:roomId"    element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
        <Route path="/leaderboard"     element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
        <Route path="/clans"           element={<ProtectedRoute><ClansPage /></ProtectedRoute>} />
        <Route path="/"                element={<Navigate to="/dashboard" replace />} />
        <Route path="*"                element={<Navigate to="/dashboard" replace />} />
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
