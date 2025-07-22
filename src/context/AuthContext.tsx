import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password }, {
        headers: { 'Content-Type': 'application/json' },
      });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token); // Optional token storage
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  return <AuthContext.Provider value={{ user, login }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
