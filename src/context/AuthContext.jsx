import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('qb_token');
    const storedUser = localStorage.getItem('qb_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('qb_token');
        localStorage.removeItem('qb_user');
      }
    }
    setLoading(false);
  }, []);

  const saveSession = useCallback((tokenValue, userData) => {
    localStorage.setItem('qb_token', tokenValue);
    localStorage.setItem('qb_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await authApi.login({ username, password });
    const { token: jwt, username: uname, email, role, id } = res.data;
    saveSession(jwt, { id, username: uname, email, role, guest: false });
  }, [saveSession]);

  const register = useCallback(async (username, email, password) => {
    await authApi.register({ username, email, password });
  }, []);

  const loginAsGuest = useCallback(async () => {
    const res = await authApi.guest();
    const { token: jwt, username: uname } = res.data;
    saveSession(jwt, { username: uname, guest: true, role: 'ROLE_GUEST' });
  }, [saveSession]);

  const logout = useCallback(() => {
    localStorage.removeItem('qb_token');
    localStorage.removeItem('qb_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token;
  const isGuest = user?.guest === true;

  return (
    <AuthContext.Provider value={{
      // Expose the full user object so components can access username, email, role, etc.
      user,
      // Convenience: the username string (for backward compat with components that treat user as string)
      username: user?.username || null,
      token,
      loading,
      isAuthenticated,
      isGuest,
      login,
      register,
      loginAsGuest,
      saveSession,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
