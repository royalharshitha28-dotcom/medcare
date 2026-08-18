import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const API_BASE_URL = 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('hms_token');
    const storedUser = localStorage.getItem('hms_user');
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const userData = res.data;
    localStorage.setItem('hms_token', userData.access_token);
    localStorage.setItem('hms_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await api.post('/api/auth/register', userData);
    const data = res.data;
    localStorage.setItem('hms_token', data.access_token);
    localStorage.setItem('hms_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
};
