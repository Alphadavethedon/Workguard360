const login = async (email: string, password: string) => {
  setIsLoading(true);
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, { email, password });

    const token = res.data?.token;
    const user = res.data?.user;

    if (!token || !user) {
      throw new Error('Invalid server response');
    }

    localStorage.setItem('authToken', token);
    setUser(user);
  } catch (error: any) {
    console.error('Login error:', error?.response?.data || error.message);
    throw new Error('Login failed: Invalid credentials or server error.');
  } finally {
    setIsLoading(false);
  }
};
