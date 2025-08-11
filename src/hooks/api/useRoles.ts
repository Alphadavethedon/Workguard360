import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { Role, Permission } from '../../lib/types';

interface RoleData {
  name: string;
  description: string;
  permissions: string[];
}

interface UpdateRoleData extends RoleData {
  id: string;
}

export const useRoles = () => {
  const queryClient = useQueryClient();

  const rolesQuery = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await api.get('/roles');
      return data;
    },
  });

  const permissionsQuery = useQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data } = await api.get('/permissions');
      return data;
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: async (roleData: RoleData): Promise<Role> => {
      const { data } = await api.post('/roles', roleData);
      return data;
    },
    onSuccess: (newRole) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(`Role "${newRole.name}" created successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create role');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (roleData: UpdateRoleData): Promise<Role> => {
      const { data } = await api.put(`/roles/${roleData.id}`, roleData);
      return data;
    },
    onSuccess: (updatedRole) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(`Role "${updatedRole.name}" updated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string): Promise<void> => {
      await api.delete(`/roles/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    },
  });

  return {
    roles: rolesQuery.data || [],
    isLoadingRoles: rolesQuery.isLoading,
    rolesError: rolesQuery.error,
    permissions: permissionsQuery.data || [],
    isLoadingPermissions: permissionsQuery.isLoading,
    permissionsError: permissionsQuery.error,
    createRole: createRoleMutation.mutate,
    isCreatingRole: createRoleMutation.isPending,
    updateRole: updateRoleMutation.mutate,
    isUpdatingRole: updateRoleMutation.isPending,
    deleteRole: deleteRoleMutation.mutate,
    isDeletingRole: deleteRoleMutation.isPending,
  };
};
