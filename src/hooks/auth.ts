import axios from 'axios';

const API_URL = 'https://workguard360.onrender.com/api';

export const useAuth = () => {
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      const { token, user } = response.data;

      // You can store the token in localStorage or context if needed
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (error: any) {
      if (error.response && error.response.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  };

  return { login };
};
