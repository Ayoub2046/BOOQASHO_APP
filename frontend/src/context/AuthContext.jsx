import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL, apiFetch, friendlyFetchError } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('booqasho_user');
    const savedToken = localStorage.getItem('booqasho_token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retries = 0;
    const maxRetries = 10;

    const check = () => {
      apiFetch('/health')
        .then(({ data }) => {
          if (!cancelled) {
            setServerOnline(true);
            setDbConnected(data?.database !== 'Mock In-Memory DB');
          }
        })
        .catch(() => {
          if (!cancelled && ++retries < maxRetries) {
            setTimeout(check, 2000);
          } else if (!cancelled) {
            setServerOnline(false);
            setDbConnected(false);
          }
        });
    };

    check();
    return () => { cancelled = true; };
  }, []);

  const login = async (email, password) => {
    try {
      const { response, data: resData } = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok || !resData?.success) {
        throw new Error(resData?.message || 'Login details are incorrect.');
      }

      setUser(resData.user);
      setToken(resData.token);
      localStorage.setItem('booqasho_user', JSON.stringify(resData.user));
      localStorage.setItem('booqasho_token', resData.token);
      setServerOnline(true);

      return { success: true };
    } catch (error) {
      return { success: false, message: friendlyFetchError(error) };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }
    } catch (e) {}

    setUser(null);
    setToken(null);
    localStorage.removeItem('booqasho_user');
    localStorage.removeItem('booqasho_token');
  };

  const apiRequest = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const { response, data } = await apiFetch(endpoint, { ...options, headers });

      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error(data?.message || 'Fadlan dib u gali system-ka (Session Expired).');
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Cilad ayaa dhacday.');
      }

      return data;
    } catch (error) {
      throw new Error(friendlyFetchError(error));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, apiRequest, dbConnected, serverOnline }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be nested within an AuthProvider.');
  }
  return context;
};
