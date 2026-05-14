import { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
      user,
      token,
      loading,
      isAuthenticated,
      isGuest,
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
