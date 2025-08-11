import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Save, Shield, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Permission, Role } from '../../lib/types';
import { Button } from '../ui/Button';

const roleSchema = z.object({
  name: z.string().min(3, 'Role name must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleFormProps {
  role?: Role;
  permissions: Permission[];
  onSubmit: (data: RoleFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const RoleForm = ({ role, permissions, onSubmit, onCancel, isLoading }: RoleFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      permissions: role?.permissions.map((p) => p.id) || [],
    },
  });

  // Group permissions by resource for better display
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const { resource } = permission;
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-sky-400" />
            {role ? 'Edit Role' : 'Create New Role'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Role Name</label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                placeholder="e.g., Security Manager"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <input
                {...register('description')}
                type="text"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                placeholder="A short description of the role"
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Permissions</label>
            <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-lg max-h-60 overflow-y-auto">
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <div key={resource}>
                  <h4 className="font-semibold text-white capitalize mb-2 border-b border-white/10 pb-1">
                    {resource}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {perms.map((permission) => (
                      <label key={permission.id} className="flex items-center space-x-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          value={permission.id}
                          {...register('permissions')}
                          className="w-4 h-4 text-sky-400 bg-white/5 border-white/10 rounded"
                        />
                        <span>{permission.action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {errors.permissions && <p className="text-red-400 text-sm mt-1">{errors.permissions.message}</p>}
          </div>

          <div className="flex gap-3 pt-6 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
