const loginMutation = useMutation({
  mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/login', credentials);

    // map backend response to frontend expected format
    return {
      user: {
        id: data._id,
        email: data.email,
        firstName: data.firstName || 'Admin', // fallback if firstName not present
        lastName: data.lastName || '',
      },
      token: data.token,
      refreshToken: '', // empty for now
    };
  },
  onSuccess: (data) => {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    queryClient.setQueryData(['currentUser'], data.user);
    toast.success(`Welcome back, ${data.user.firstName}!`);
  },
  onError: (error: any) => {
    toast.error(error.response?.data?.message || 'Login failed');
  },
});
