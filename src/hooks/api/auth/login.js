import { createContext, useContext, useState } from 'react';
import api from '../../../api'; // Make sure this path is correct

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data.user || { email }); // fallback if user info isn't returned
      localStorage.setItem('token', response.data.token); // optional for protected routes
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
