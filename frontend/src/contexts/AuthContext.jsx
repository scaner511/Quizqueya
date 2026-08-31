import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('quizqueya_user'));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('quizqueya_token'));
  const [loading, setLoading] = useState(true);

  const storeSession = (newToken, newUser) => {
    localStorage.setItem('quizqueya_token', newToken);
    localStorage.setItem('quizqueya_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    storeSession(data.token, data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    storeSession(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('quizqueya_token');
    localStorage.removeItem('quizqueya_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
    localStorage.setItem('quizqueya_user', JSON.stringify(data.user));
    return data.user;
  }, []);

  // Al recargar, refresca el perfil desde el servidor si hay token
  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
          localStorage.setItem('quizqueya_user', JSON.stringify(data.user));
        } catch {
          // token inválido
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  // Actualiza jugador localmente tras una partida/respuesta
  const updateUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('quizqueya_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
