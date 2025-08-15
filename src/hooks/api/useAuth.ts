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

  const loginMutation = useMutation<LoginResponse, any, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      // call backend
      const { data } = await api.post('/auth/login', credentials);

      // Backend currently returns: { _id, email, token, ... }
      // Map that response to the frontend expected shape
      const mappedUser: User = {
        // Keep fields minimal and safe — map what backend provides
        id: data._id ?? data.id ?? '',
        email: data.email ?? '',
        firstName: data.firstName ?? data.givenName ?? '', // fallbacks
        lastName: data.lastName ?? data.familyName ?? '',
        // include any other fields your User type expects if available:
        // ...data.otherFields
      } as unknown as User;

      const result: LoginResponse = {
        user: mappedUser,
        token: data.token,
        refreshToken: data.refreshToken ?? '',
      };

      return result;
    },
    onSuccess: (data) => {
      // persist tokens + user
      try {
        localStorage.setItem('authToken', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        } else {
          localStorage.removeItem('refreshToken');
        }
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch (e) {
        // localStorage might fail in some environments — fail silently
        // but still continue
      }

      queryClient.setQueryData(['currentUser'], data.user);
      toast.success(`Welcome back, ${data.user.firstName || data.user.email}!`);
    },
    onError: (error: any) => {
      // show a helpful message from the server if available
      const message = error?.response?.data?.message || 'Login failed';
      toast.error(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // If backend has a logout endpoint, hit it; otherwise this will 404
      // Keep it safe: try/catch handled by React Query
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (error: any) => {
      // still clear local state on logout attempt failure (optional)
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      queryClient.clear();
      const message = error?.response?.data?.message || 'Logout failed';
      toast.error(message);
    },
  });

  const getCurrentUser = useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<User> => {
      const { data } = await api.get('/auth/me');
      // assume backend returns user object directly
      return data as User;
    },
    enabled: !!localStorage.getItem('authToken'),
    retry: false,
    initialData: () => {
      try {
        const raw = localStorage.getItem('user');
        return raw ? (JSON.parse(raw) as User) : null;
      } catch {
        return null;
      }
    },
  });

  return {
    // expose async functions so callers can await them
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    // status flags
    isLoggingIn: loginMutation.isLoading,
    isLoggingOut: logoutMutation.isLoading,
    // user data
    user: getCurrentUser.data ?? null,
    isLoadingUser: getCurrentUser.isLoading,
    isAuthenticated: !!getCurrentUser.data && !!localStorage.getItem('authToken'),
    // expose the raw mutation objects if needed (optional)
    _raw: {
      loginMutation,
      logoutMutation,
      getCurrentUser,
    },
  };
};
