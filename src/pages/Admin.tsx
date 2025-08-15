import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Shield, 
  Building,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Eye,
  UserPlus
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import api from '../lib/api';
import { User, PaginatedResponse } from '../lib/types';
import { formatDate, formatRelativeTime } from '../lib/utils';
import { toast } from 'react-hot-toast';

const Admin = () => {
  const [selectedTab, setSelectedTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', { page, search: searchTerm, department: selectedDepartment }],
    queryFn: async (): Promise<PaginatedResponse<User>> => {
      const params: any = { page, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      if (selectedDepartment !== 'all') params.department = selectedDepartment;
      
      const { data } = await api.get('/users', { params });
      return data;
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete(`/users/${userId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
    },
  });

  const departments = ['Engineering', 'Security', 'Human Resources', 'Marketing', 'Finance', 'Operations'];

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'departments', label: 'Departments', icon: Building }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'Admin':
        return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
      case 'Security Manager':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'HR Manager':
        return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'Employee':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getStatusColor = (status: boolean) => {
    return status 
      ? 'text-green-400 bg-green-400/20 border-green-400/30'
      : 'text-red-400 bg-red-400/20 border-red-400/30';
  };

  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
          <p className="text-gray-400">Manage users, roles, and system configuration.</p>
        </div>
        <Button variant="primary">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <GlassCard>
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTab === tab.id
                  ? 'bg-gradient-to-r from-sky-400/20 to-blue-500/20 text-sky-400 border border-sky-400/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      {selectedTab === 'users' && (
        <>
          <GlassCard>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Role</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Department</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Access Level</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Last Login</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-all duration-200"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-gray-400 text-sm flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="text-gray-400 text-sm flex items-center space-x-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role.name)}`}>
                            {user.role.name}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white">{user.department}</div>
                          <div className="text-gray-400 text-sm">{user.jobTitle}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-white/10 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-sky-400 to-blue-500 h-2 rounded-full"
                                style={{ width: `${user.accessLevel * 10}%` }}
                              />
                            </div>
                            <span className="text-white text-sm">{user.accessLevel}/10</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.isActive)}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white text-sm">
                            {user.lastLogin ? formatRelativeTime(user.lastLogin) : 'Never'}
                          </div>
                          <div className="text-gray-400 text-xs flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Joined {formatDate(user.createdAt)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteUserMutation.mutate(user._id)}
                              disabled={deleteUserMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-gray-400 text-sm">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </>
      )}

      {selectedTab === 'roles' && (
        <GlassCard>
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Roles & Permissions</h3>
            <p className="text-gray-400">Role management interface coming soon.</p>
          </div>
        </GlassCard>
      )}

      {selectedTab === 'departments' && (
        <GlassCard>
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Department Management</h3>
            <p className="text-gray-400">Department configuration interface coming soon.</p>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
};

export default Admin;