import { motion } from 'framer-motion';
import {
  Building,
  Calendar,
  Edit,
  Filter,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';

const Admin = () => {
  const [selectedTab, setSelectedTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const users = [
    {
      id: 1,
      firstName: 'Davis',
      lastName: 'Don',
      email: 'davis.don@workguard360.com',
      role: 'Super Admin',
      department: 'Engineering',
      jobTitle: 'Chief Technology Officer',
      phone: '+1 (555) 123-4567',
      badgeNumber: 'WG-2024-0001',
      accessLevel: 10,
      status: 'active',
      lastLogin: '2024-01-15T10:30:00Z',
      joinDate: '2023-01-15T00:00:00Z'
    },
    {
      id: 2,
      firstName: 'Mike',
      lastName: 'Nakuru',
      email: 'mike.Nakuru@workguard360.com',
      role: 'Security Manager',
      department: 'Security',
      jobTitle: 'Head of Security',
      phone: '+1 (555) 234-5678',
      badgeNumber: 'WG-2024-0002',
      accessLevel: 8,
      status: 'active',
      lastLogin: '2024-01-15T09:15:00Z',
      joinDate: '2023-02-01T00:00:00Z'
    },
    {
      id: 3,
      firstName: 'Grace',
      lastName: 'Davis',
      email: 'Grace.davis@workguard360.com',
      role: 'HR Manager',
      department: 'Human Resources',
      jobTitle: 'HR Director',
      phone: '+1 (555) 345-6789',
      badgeNumber: 'WG-2024-0003',
      accessLevel: 7,
      status: 'active',
      lastLogin: '2024-01-15T08:45:00Z',
      joinDate: '2023-03-10T00:00:00Z'
    },
    {
      id: 4,
      firstName: 'Alex',
      lastName: 'njoroge',
      email: 'alex.njoroge@workguard360.com',
      role: 'Employee',
      department: 'Engineering',
      jobTitle: 'Senior Software Engineer',
      phone: '+1 (555) 456-7890',
      badgeNumber: 'WG-2024-0004',
      accessLevel: 5,
      status: 'active',
      lastLogin: '2024-01-15T07:30:00Z',
      joinDate: '2023-04-20T00:00:00Z'
    },
    {
      id: 5,
      firstName: 'Lisa',
      lastName: 'Wanjala',
      email: 'lisa.wanjala@workguard360.com',
      role: 'Employee',
      department: 'Marketing',
      jobTitle: 'Marketing Specialist',
      phone: '+1 (555) 567-8901',
      badgeNumber: 'WG-2024-0005',
      accessLevel: 3,
      status: 'inactive',
      lastLogin: '2024-01-10T16:20:00Z',
      joinDate: '2023-05-15T00:00:00Z'
    }
  ];

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

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'text-green-400 bg-green-400/20 border-green-400/30'
      : 'text-red-400 bg-red-400/20 border-red-400/30';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} days ago`;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
          <p className="text-gray-400">Manage users, roles, and system configuration.</p>
        </div>
        <Button variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Tabs */}
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

      {/* Users Tab */}
      {selectedTab === 'users' && (
        <>
          {/* Filters */}
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

          {/* Users Table */}
          <GlassCard>
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
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
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
                            <div className="text-gray-400 text-sm flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{user.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                          {user.role}
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-white text-sm">{formatLastLogin(user.lastLogin)}</div>
                        <div className="text-gray-400 text-xs flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Joined {formatDate(user.joinDate)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
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
            </div>
          </GlassCard>
        </>
      )}

      {/* Roles Tab */}
      {selectedTab === 'roles' && (
        <GlassCard>
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Roles & Permissions</h3>
            <p className="text-gray-400">Role management interface coming soon.</p>
          </div>
        </GlassCard>
      )}

      {/* Departments Tab */}
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