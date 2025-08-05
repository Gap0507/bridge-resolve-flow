import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi, authApi, type User } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Key,
  Users,
  UserCheck,
  UserX,
  Crown,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminProfileProps {
  onBack: () => void;
}

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Custom components matching app style
const CustomCard = ({ children, className }: any) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm bg-white border-gray-200 ${className}`}>
    {children}
  </div>
);

const CustomCardHeader = ({ children, className }: any) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CustomCardTitle = ({ children, className }: any) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CustomCardDescription = ({ children, className }: any) => (
  <p className={`text-sm text-muted-foreground text-gray-500 ${className}`}>
    {children}
  </p>
);

const CustomCardContent = ({ children, className }: any) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const CustomButton = ({ children, className, variant = 'default', size = 'default', onClick, ...props }: any) => {
  const baseClass = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
    destructive: "bg-red-600 hover:bg-red-700 text-white"
  };
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8"
  };
  
  return (
    <button 
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const CustomBadge = ({ children, className }: any) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
    {children}
  </span>
);

export function AdminProfile({ onBack }: AdminProfileProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // User management states
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: ''
  });
  
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Load all users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await adminApi.getAllUsers();
      if (response.success && response.data?.users) {
        setUsers(response.data.users);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUpdatingProfile(true);
      
      const response = await authApi.updateProfile({
        name: profileData.name,
        phone: profileData.phone
      });
      
      if (response.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsChangingPassword(true);
      
      const response = await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        toast({
          title: "Password Changed",
          description: "Your password has been changed successfully",
        });
        
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to change password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const response = await adminApi.updateUserRole(userId, newRole);
      if (response.success) {
        toast({
          title: "Role Updated",
          description: `User role updated to ${newRole}`,
        });
        loadUsers(); // Reload users
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update user role",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await adminApi.deleteUser(userId);
      if (response.success) {
        toast({
          title: "User Deleted",
          description: "User has been deleted successfully",
        });
        loadUsers(); // Reload users
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 text-gray-900">Access Denied</h3>
          <p className="text-gray-500 mb-4">You need admin privileges to access this page</p>
          <CustomButton variant="outline" onClick={onBack}>
            Go Back
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-xl border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">ResolveIt</h1>
                <p className="text-xs text-gray-500">Admin Profile</p>
              </div>
            </div>
            <CustomButton
              variant="ghost"
              size="sm"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </CustomButton>
          </div>

          {/* Profile Overview */}
          <div className="flex-1 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4">Admin Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">Full Name</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">Email Address</p>
                    </div>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                        <p className="text-xs text-gray-500">Phone Number</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">Member Since</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Crown className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{user.role}</p>
                      <p className="text-xs text-gray-500">Account Type</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-gray-50 to-purple-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 text-sm">System Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Users</span>
                    <span className="font-semibold text-gray-900">{users.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Admins</span>
                    <span className="font-semibold text-purple-600">{users.filter(u => u.role === 'admin').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Regular Users</span>
                    <span className="font-semibold text-blue-600">{users.filter(u => u.role === 'user').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
              <p className="text-sm text-gray-600">Manage your account and system users</p>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500">
                <TabsTrigger 
                  value="profile" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="password" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Password
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                >
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <CustomCard className="bg-white border border-gray-200 shadow-sm">
                  <CustomCardHeader className="bg-white border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CustomCardTitle className="text-gray-900">Update Profile</CustomCardTitle>
                        <CustomCardDescription className="text-gray-600">Update your personal information</CustomCardDescription>
                      </div>
                    </div>
                  </CustomCardHeader>
                  <CustomCardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-black">
                            Full Name *
                          </Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="Enter your full name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-black">
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            disabled
                            className="h-12 bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                            placeholder="Email cannot be changed"
                          />
                          <p className="text-xs text-gray-500">Email address cannot be modified</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-black">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <CustomButton
                          type="submit"
                          disabled={isUpdatingProfile}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {isUpdatingProfile ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                        </CustomButton>
                      </div>
                    </form>
                  </CustomCardContent>
                </CustomCard>
              </TabsContent>

              {/* Password Tab */}
              <TabsContent value="password">
                <CustomCard className="bg-white border border-gray-200 shadow-sm">
                  <CustomCardHeader className="bg-white border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CustomCardTitle className="text-gray-900">Change Password</CustomCardTitle>
                        <CustomCardDescription className="text-gray-600">Update your password securely</CustomCardDescription>
                      </div>
                    </div>
                  </CustomCardHeader>
                  <CustomCardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-sm font-medium text-black">
                          Current Password *
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            required
                            className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black pr-10"
                            placeholder="Enter your current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-sm font-medium text-black">
                            New Password *
                          </Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                              required
                              className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black pr-10"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-sm font-medium text-black">
                            Confirm Password *
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              required
                              className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black pr-10"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <CustomButton
                          type="submit"
                          disabled={isChangingPassword}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isChangingPassword ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Key className="w-4 h-4 mr-2" />
                          )}
                          {isChangingPassword ? 'Changing...' : 'Change Password'}
                        </CustomButton>
                      </div>
                    </form>
                  </CustomCardContent>
                </CustomCard>
              </TabsContent>

              {/* User Management Tab */}
              <TabsContent value="users">
                <CustomCard className="bg-white border border-gray-200 shadow-sm">
                  <CustomCardHeader className="bg-white border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CustomCardTitle className="text-gray-900">User Management</CustomCardTitle>
                        <CustomCardDescription className="text-gray-600">Manage system users and their roles</CustomCardDescription>
                      </div>
                    </div>
                  </CustomCardHeader>
                  <CustomCardContent>
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={filterRole}
                          onChange={(e) => setFilterRole(e.target.value)}
                          className="h-10 px-3 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">All Roles</option>
                          <option value="user">Users</option>
                          <option value="admin">Admins</option>
                        </select>
                      </div>
                    </div>

                    {/* Users List */}
                    <div className="space-y-4">
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                          <span className="ml-2 text-gray-600">Loading users...</span>
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No users found</p>
                        </div>
                      ) : (
                        filteredUsers.map((userItem) => (
                          <div key={userItem._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{userItem.name}</h4>
                                  <p className="text-sm text-gray-600">{userItem.email}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <CustomBadge 
                                      className={userItem.role === 'admin' 
                                        ? 'bg-purple-100 text-purple-700 border-purple-200' 
                                        : 'bg-blue-100 text-blue-700 border-blue-200'
                                      }
                                    >
                                      {userItem.role}
                                    </CustomBadge>
                                    <span className="text-xs text-gray-500">
                                      Joined {new Date(userItem.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {userItem.role === 'user' ? (
                                  <CustomButton
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateUserRole(userItem._id, 'admin')}
                                    className="text-purple-600 border-purple-300 hover:bg-purple-50"
                                  >
                                    <Crown className="w-4 h-4 mr-1" />
                                    Make Admin
                                  </CustomButton>
                                ) : (
                                  <CustomButton
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateUserRole(userItem._id, 'user')}
                                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                  >
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Make User
                                  </CustomButton>
                                )}
                                
                                <CustomButton
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(userItem._id)}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </CustomButton>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CustomCardContent>
                </CustomCard>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
} 