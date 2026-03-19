import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Verify session on mount — cookies are sent automatically
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data } = await API.get('/auth/me');
        const userData = data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch {
        // Session invalid — clear local state
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };

    if (user) {
      verifySession();
    } else {
      setInitializing(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      // Tokens are set as httpOnly cookies by the server
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', { name, email, password });
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch {
      // Logout even if server call fails
    }
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    initializing,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
