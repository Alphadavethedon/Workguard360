import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { User } from '../../lib/types';

interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  department: string;
  jobTitle: string;
  phone?: string;
  emergencyContact?: string;
  badgeNumber: string;
  accessLevel: number;
}

interface UpdateUserData extends Partial<CreateUserData> {
  id: string;
  isActive?: boolean;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

interface UsersParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  role?: string;
  isActive?: boolean;
}

export const useUsers = (params: UsersParams = {}) => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['users', params],
    queryFn: async (): Promise<UsersResponse> => {
      const { data } = await api.get('/users', { params });
      return data;
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData): Promise<User> => {
      const { data } = await api.post('/users', userData);
      return data;
    },
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User ${newUser.firstName} ${newUser.lastName} created successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: UpdateUserData): Promise<User> => {
      const { data } = await api.put(`/users/${userData.id}`, userData);
      return data;
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User ${updatedUser.firstName} ${updatedUser.lastName} updated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      await api.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  return {
    users: usersQuery.data?.users || [],
    total: usersQuery.data?.total || 0,
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
};