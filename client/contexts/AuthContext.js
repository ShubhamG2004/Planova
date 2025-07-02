import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Load user on initial render
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          if (isMounted) {
            setLoading(false);
          }
          return;
        }
        
        const { data } = await api.get('/auth/me');
        if (isMounted) {
          setUser(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Auth check failed:', err);
          setError(err.response?.data?.message || 'Authentication check failed');
          logout(false); // Silent logout without redirect
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback((shouldRedirect = true) => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    queryClient.clear();
    
    if (shouldRedirect) {
      router.push('/auth/login');
    }
  }, [queryClient, router]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      return data;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      logout();
      throw err;
    }
  }, [logout]);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};