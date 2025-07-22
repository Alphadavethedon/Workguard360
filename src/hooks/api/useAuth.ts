import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { User } from '../../lib/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const useAuth = () => {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const { data } = await api.post('/auth/login', credentials);
      return data;
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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      queryClient.clear();
      toast.success('Logged out successfully');
    },
  });

  const getCurrentUser = useQuery({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<User> => {
      const { data } = await api.get('/auth/me');
      return data;
    },
    enabled: !!localStorage.getItem('authToken'),
    retry: false,
  });

  return {
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    user: getCurrentUser.data,
    isLoadingUser: getCurrentUser.isLoading,
    isAuthenticated: !!getCurrentUser.data && !!localStorage.getItem('authToken'),
  };
};