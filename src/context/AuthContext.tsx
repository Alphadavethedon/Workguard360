import { createContext, useContext, useState } from 'react';
import api from '../api'; // Import the axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token); // Optional
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  return <AuthContext.Provider value={{ user, login }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
