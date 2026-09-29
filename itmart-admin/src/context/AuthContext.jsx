import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('itmart_admin_profile');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('itmart_admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    // Verify the stored token is still valid and refresh the profile
    authApi
      .getMe()
      .then((res) => {
        setAdmin(res.data);
        localStorage.setItem('itmart_admin_profile', JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem('itmart_admin_token');
        localStorage.removeItem('itmart_admin_profile');
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('itmart_admin_token', res.data.token);
    localStorage.setItem('itmart_admin_profile', JSON.stringify(res.data.admin));
    setAdmin(res.data.admin);
    return res.data.admin;
  };

  const logout = () => {
    localStorage.removeItem('itmart_admin_token');
    localStorage.removeItem('itmart_admin_profile');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
