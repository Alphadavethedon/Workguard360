import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import api from '../lib/api';
import { Floor, PaginatedResponse } from '../lib/types';
import { formatDate } from '../lib/utils';
import { createFloorSchema, CreateFloorFormData } from '../lib/validations';
import { toast } from 'react-hot-toast';

const Floors = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: floorsData, isLoading } = useQuery({
    queryKey: ['floors', { search: searchTerm }],
    queryFn: async (): Promise<PaginatedResponse<Floor>> => {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      
      const { data } = await api.get('/floors', { params });
      return data;
    },
  });

  const createFloorMutation = useMutation({
    mutationFn: async (floorData: CreateFloorFormData) => {
      const { data } = await api.post('/floors', floorData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floors'] });
      toast.success('Floor created successfully');
      setShowCreateForm(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create floor');
    },
  });

  const deleteFloorMutation = useMutation({
    mutationFn: async (floorId: string) => {
      const { data } = await api.delete(`/floors/${floorId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floors'] });
      toast.success('Floor deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete floor');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFloorFormData>({
    resolver: zodResolver(createFloorSchema),
  });

  const onSubmit = (data: CreateFloorFormData) => {
    createFloorMutation.mutate(data);
  };

  const availableRoles = ['Admin', 'Security Manager', 'HR Manager', 'Employee'];

  const floors = floorsData?.data?.floors || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Floor Management</h1>
          <p className="text-gray-400">Manage building floors and role-based access permissions.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Floor
        </Button>
      </div>

      <GlassCard>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search floors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Building className="w-6 h-6 text-sky-400" />
                Add New Floor
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Floor Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  placeholder="Executive Floor"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Floor Level
                </label>
                <input
                  {...register('level', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  placeholder="5"
                />
                {errors.level && (
                  <p className="text-red-400 text-sm mt-1">{errors.level.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  placeholder="High-security executive offices and meeting rooms"
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Access Roles
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableRoles.map((role) => (
                    <label key={role} className="flex items-center space-x-2">
                      <input
                        {...register('accessRoles')}
                        type="checkbox"
                        value={role}
                        className="rounded border-white/20 bg-white/5 text-sky-400 focus:ring-sky-400"
                      />
                      <span className="text-gray-300 text-sm">{role}</span>
                    </label>
                  ))}
                </div>
                {errors.accessRoles && (
                  <p className="text-red-400 text-sm mt-1">{errors.accessRoles.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-6 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={createFloorMutation.isPending}
                >
                  {createFloorMutation.isPending ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Building className="w-4 h-4 mr-2" />
                  )}
                  {createFloorMutation.isPending ? 'Creating...' : 'Add Floor'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      <GlassCard>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : floors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {floors.map((floor, index) => (
              <motion.div
                key={floor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white/5 rounded-lg border border-white/10 p-6 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{floor.name}</h3>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Building className="w-4 h-4" />
                      <span>Level {floor.level}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {floor.isActive ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-300 text-sm">{floor.description}</p>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-300 mb-2 flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Access Roles:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {floor.accessRoles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-1 bg-blue-400/20 text-blue-400 rounded text-xs"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span>Created: {formatDate(floor.createdAt)}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteFloorMutation.mutate(floor._id)}
                    disabled={deleteFloorMutation.isPending}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No floors found</h3>
            <p className="text-gray-400 mb-4">Add your first floor to get started.</p>
            <Button variant="primary" onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Floor
            </Button>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default Floors;