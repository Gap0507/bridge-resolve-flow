import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi, casesApi, Case, DashboardStats } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  FileText, 
  Users, 
  TrendingUp, 
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Loader2,
  Settings,
  Bell,
  LogOut,
  Scale,
  Menu,
  X,
  Plus,
  AlertCircle,
  Star,
  Award,
  Zap,
  Sparkles,
  Home,
  FolderOpen,
  Activity,
  PieChart,
  Target,
  CheckSquare,
  UserCheck,
  FileCheck,
  CalendarDays,
  Clock3,
  Save,
  UserPlus,
  Gavel,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  'Pending Verification': { 
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', 
    icon: AlertCircle, 
    label: 'Pending',
    gradient: 'from-amber-500 to-orange-500'
  },
  'Verified': { 
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', 
    icon: CheckCircle, 
    label: 'Verified',
    gradient: 'from-blue-500 to-cyan-500'
  },
  'Awaiting Response': { 
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', 
    icon: Clock, 
    label: 'Awaiting',
    gradient: 'from-orange-500 to-red-500'
  },
  'Accepted': { 
    color: 'bg-green-500/10 text-green-600 border-green-500/20', 
    icon: CheckCircle, 
    label: 'Accepted',
    gradient: 'from-green-500 to-emerald-500'
  },
  'Rejected': { 
    color: 'bg-red-500/10 text-red-600 border-red-500/20', 
    icon: XCircle, 
    label: 'Rejected',
    gradient: 'from-red-500 to-pink-500'
  },
  'Panel Created': { 
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', 
    icon: Users, 
    label: 'Panel Created',
    gradient: 'from-purple-500 to-indigo-500'
  },
  'Mediation in Progress': { 
    color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20', 
    icon: Clock, 
    label: 'In Progress',
    gradient: 'from-indigo-500 to-blue-500'
  },
  'Resolved': { 
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', 
    icon: CheckCircle, 
    label: 'Resolved',
    gradient: 'from-emerald-500 to-green-500'
  },
  'Unresolved': { 
    color: 'bg-red-500/10 text-red-600 border-red-500/20', 
    icon: XCircle, 
    label: 'Unresolved',
    gradient: 'from-red-500 to-rose-500'
  },
};

type DashboardView = 'overview' | 'cases' | 'analytics';

// Custom components matching UserDashboard style
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

const CustomBadge = ({ children, className, variant }: any) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const CustomButton = ({ children, className, variant = 'default', size = 'default', onClick, ...props }: any) => {
  const baseClass = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-blue-600 hover:bg-blue-700 text-white hover:text-white",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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

interface AdminDashboardProps {
  onViewCase: (caseId: string) => void;
  onViewProfile?: () => void;
}

export function AdminDashboard({ onViewCase, onViewProfile = () => {} }: AdminDashboardProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [cases, setCases] = useState<Case[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  
  // New state for admin actions
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState<{
    caseId: string;
    status: Case['status'];
    resolutionDetails?: string;
  } | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPanelModal, setShowPanelModal] = useState(false);
  const [panelData, setPanelData] = useState<{
    caseId: string;
    members: Array<{
      name: string;
      role: 'Lawyer' | 'Religious Leader' | 'Community Representative';
      email: string;
      phone: string;
    }>;
  }>({
    caseId: '',
    members: [
      { name: '', role: 'Lawyer', email: '', phone: '' },
      { name: '', role: 'Religious Leader', email: '', phone: '' },
      { name: '', role: 'Community Representative', email: '', phone: '' }
    ]
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const [statsResponse, casesResponse] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getAllCases()
      ]);

      if (statsResponse.success && statsResponse.data?.stats) {
        setStats(statsResponse.data.stats);
      }

      if (casesResponse.success && casesResponse.data?.cases) {
        setCases(casesResponse.data.cases);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load dashboard data');
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.oppositePartyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    const matchesType = typeFilter === 'all' || case_.caseType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle case selection for bulk actions
  const handleCaseSelection = (caseId: string) => {
    setSelectedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  const handleSelectAllCases = () => {
    if (selectedCases.length === filteredCases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(filteredCases.map(c => c._id));
    }
  };

  // Update case status with debouncing
  const [updatingCases, setUpdatingCases] = useState<Set<string>>(new Set());
  
  const handleUpdateCaseStatus = async (caseId: string, status: Case['status'], resolutionDetails?: string) => {
    // Prevent duplicate requests for the same case
    if (updatingCases.has(caseId)) {
      return;
    }
    
    try {
      setUpdatingCases(prev => new Set(prev).add(caseId));
      setIsUpdatingStatus(true);
      
      const response = await adminApi.updateCaseStatus(caseId, status, resolutionDetails);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Case status updated successfully",
        });
        
        // Refresh cases data
        await loadDashboardData();
        setShowStatusModal(false);
        setStatusUpdateData(null);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update case status",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update case status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
      setUpdatingCases(prev => {
        const newSet = new Set(prev);
        newSet.delete(caseId);
        return newSet;
      });
    }
  };

  // Assign panel to case
  const handleAssignPanel = async (caseId: string, members: Array<{
    name: string;
    role: 'Lawyer' | 'Religious Leader' | 'Community Representative';
    email: string;
    phone: string;
  }>) => {
    try {
      // Validate that at least one field is filled per member
      const validMembers = members.filter(member => {
        const hasName = member.name && member.name.trim().length > 0;
        const hasEmail = member.email && member.email.trim().length > 0;
        const hasPhone = member.phone && member.phone.trim().length > 0;
        return hasName || hasEmail || hasPhone;
      });
      
      if (validMembers.length < 3) {
        toast({
          title: "Validation Error",
          description: "Please fill in at least one field (name, email, or phone) for all 3 panel members",
          variant: "destructive",
        });
        return;
      }

      // Check if we have at least one of each required role
      const roles = validMembers.map(m => m.role);
      if (!roles.includes('Lawyer') || !roles.includes('Religious Leader') || !roles.includes('Community Representative')) {
        toast({
          title: "Validation Error",
          description: "Panel must include one Lawyer, one Religious Leader, and one Community Representative",
          variant: "destructive",
        });
        return;
      }

      const response = await adminApi.assignPanel(caseId, validMembers);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Panel assigned successfully",
        });
        
        // Refresh cases data
        await loadDashboardData();
        setShowPanelModal(false);
        setPanelData({
          caseId: '',
          members: [
            { name: '', role: 'Lawyer', email: '', phone: '' },
            { name: '', role: 'Religious Leader', email: '', phone: '' },
            { name: '', role: 'Community Representative', email: '', phone: '' }
          ]
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to assign panel",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Panel assignment error:', error);
      let errorMessage = "Failed to assign panel";
      
      if (error.message && error.message.includes('Validation failed')) {
        errorMessage = "Please check that all panel member information is valid (name, email, phone)";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Bulk update case statuses
  const handleBulkUpdateStatus = async (status: Case['status'], resolutionDetails?: string) => {
    if (selectedCases.length === 0) {
      toast({
        title: "Warning",
        description: "Please select cases to update",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await adminApi.bulkUpdateCaseStatus(selectedCases, status, resolutionDetails);
      
      if (response.success) {
        toast({
          title: "Success",
          description: `Updated ${response.data?.modifiedCount || 0} cases successfully`,
        });
        
        // Refresh cases data
        await loadDashboardData();
        setSelectedCases([]);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update cases",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update cases",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Case['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <CustomBadge className={`${config.color} border font-medium`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </CustomBadge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const casesByStatus = {
    'Pending Verification': cases.filter(c => c.status === 'Pending Verification'),
    'Awaiting Response': cases.filter(c => c.status === 'Awaiting Response'),
    'In Progress': cases.filter(c => ['Panel Created', 'Mediation in Progress'].includes(c.status)),
    'Resolved': cases.filter(c => c.status === 'Resolved'),
    'Rejected': cases.filter(c => c.status === 'Rejected'),
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home, count: null },
    { id: 'cases', label: 'All Cases', icon: FolderOpen, count: cases.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">ResolveIt</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            <CustomButton
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </CustomButton>
          </div>

          {/* User Profile Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="w-12 h-12 ring-2 ring-blue-100">
                <AvatarImage src={user?.photo} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{user?.name}</h3>
                <p className="text-xs text-gray-500 truncate">Administrator</p>
              </div>
            </div>
            
            <CustomButton 
              onClick={logout}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </CustomButton>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as DashboardView)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    currentView === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.count !== null && (
                    <CustomBadge className={`${
                      currentView === item.id 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.count}
                    </CustomBadge>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Stats Summary */}
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 text-sm">Platform Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Cases</span>
                  <span className="font-semibold text-gray-900">{stats?.totalCases || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-semibold text-blue-600">{stats?.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Resolved</span>
                  <span className="font-semibold text-green-600">{stats?.resolved || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CustomButton
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </CustomButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-sm text-gray-600">
                  Admin dashboard for managing dispute resolution platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CustomButton variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </CustomButton>
              <CustomButton 
                variant="ghost" 
                size="sm"
                onClick={onViewProfile}
                className="flex items-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Profile</span>
              </CustomButton>
              <CustomButton variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </CustomButton>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-red-600">{error}</p>
              </div>
              <CustomButton onClick={loadDashboardData} variant="outline" size="sm" className="mt-2">
                Try Again
              </CustomButton>
            </div>
          )}

          {/* Content based on current view */}
          {currentView === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards - Matching UserDashboard style */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <CustomCard className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                  <CustomCardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-700 mt-10">{stats?.totalCases || 0}</p>
                        <p className="text-xs text-blue-600 font-medium">Total Cases</p>
                      </div>
                      <div className="p-2 bg-blue-200 rounded-xl group-hover:scale-110 transition-transform duration-300 mt-10">
                        <FileText className="w-5 h-5 text-blue-700" />
                      </div>
                    </div>
                  </CustomCardContent>
                </CustomCard>
                
                <CustomCard className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl">
                  <CustomCardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-amber-700 mt-10">{stats?.pendingVerification || 0}</p>
                        <p className="text-xs text-amber-600 font-medium">Pending Review</p>
                      </div>
                      <div className="p-2 bg-amber-200 rounded-xl group-hover:scale-110 transition-transform duration-300 mt-10">
                        <Clock className="w-5 h-5 text-amber-700" />
                      </div>
                    </div>
                  </CustomCardContent>
                </CustomCard>
                
                <CustomCard className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                  <CustomCardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-purple-700 mt-10">{stats?.inProgress || 0}</p>
                        <p className="text-xs text-purple-600 font-medium">In Progress</p>
                      </div>
                      <div className="p-2 bg-purple-200 rounded-xl group-hover:scale-110 transition-transform duration-300 mt-10">
                        <TrendingUp className="w-5 h-5 text-purple-700" />
                      </div>
                    </div>
                  </CustomCardContent>
                </CustomCard>
                
                <CustomCard className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                  <CustomCardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-700 mt-10">{stats?.resolved || 0}</p>
                        <p className="text-xs text-green-600 font-medium">Resolved</p>
                      </div>
                      <div className="p-2 bg-green-200 rounded-xl group-hover:scale-110 transition-transform duration-300 mt-10">
                        <CheckCircle className="w-5 h-5 text-green-700" />
                      </div>
                    </div>
                  </CustomCardContent>
                </CustomCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <CustomCard className="group hover:shadow-lg transition-all duration-300">
                  <CustomCardHeader>
                    <CustomCardTitle className="text-gray-900">Quick Actions</CustomCardTitle>
                    <CustomCardDescription className="text-gray-600">Common administrative tasks</CustomCardDescription>
                  </CustomCardHeader>
                  <CustomCardContent className="space-y-3">
                    <CustomButton 
                      variant="outline" 
                      className="w-full justify-start bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setSelectedCases(casesByStatus['Pending Verification'].map(c => c._id));
                        setCurrentView('cases');
                        setStatusFilter('Pending Verification');
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Pending Cases ({casesByStatus['Pending Verification'].length})
                    </CustomButton>
                    <CustomButton 
                      variant="outline" 
                      className="w-full justify-start bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        const pendingCases = cases.filter(c => c.status === 'Pending Verification');
                        if (pendingCases.length > 0) {
                          setSelectedCases([pendingCases[0]._id]);
                          setPanelData({
                            caseId: pendingCases[0]._id,
                            members: [
                              { name: '', role: 'Lawyer', email: '', phone: '' },
                              { name: '', role: 'Religious Leader', email: '', phone: '' },
                              { name: '', role: 'Community Representative', email: '', phone: '' }
                            ]
                          });
                          setShowPanelModal(true);
                        } else {
                          toast({
                            title: "No Cases Available",
                            description: "No pending cases available for panel assignment",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Assign Mediation Panels
                    </CustomButton>
                    <CustomButton 
                      variant="outline" 
                      className="w-full justify-start bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setCurrentView('analytics');
                        toast({
                          title: "Reports Generated",
                          description: "Analytics and reports are now available in the Analytics tab",
                        });
                      }}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate Reports
                    </CustomButton>
                  </CustomCardContent>
                </CustomCard>

                {/* Recent Cases */}
                <CustomCard className="group hover:shadow-lg transition-all duration-300">
                  <CustomCardHeader>
                    <CustomCardTitle className="text-gray-900">Recent Cases</CustomCardTitle>
                    <CustomCardDescription className="text-gray-600">Latest case submissions</CustomCardDescription>
                  </CustomCardHeader>
                  <CustomCardContent>
                    <div className="space-y-3">
                      {cases.slice(0, 5).map(case_ => (
                        <div key={case_._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900">{case_.title}</h4>
                            <p className="text-xs text-gray-500">
                              {case_.caseType} • {formatDate(case_.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(case_.status)}
                            <CustomButton size="sm" variant="ghost" onClick={() => onViewCase(case_._id)} className="text-gray-400 hover:text-gray-900">
                              <Eye className="w-3 h-3" />
                            </CustomButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CustomCardContent>
                </CustomCard>
              </div>

              {/* Status Distribution */}
              <CustomCard className="group hover:shadow-lg transition-all duration-300">
                <CustomCardHeader>
                  <CustomCardTitle className="text-gray-900">Cases by Status</CustomCardTitle>
                  <CustomCardDescription className="text-gray-600">Distribution of cases across different statuses</CustomCardDescription>
                </CustomCardHeader>
                <CustomCardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(casesByStatus).map(([status, statusCases]) => (
                      <div key={status} className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-2xl font-bold text-blue-600">{statusCases.length}</p>
                        <p className="text-sm text-gray-600">{status}</p>
                      </div>
                    ))}
                  </div>
                </CustomCardContent>
              </CustomCard>
            </div>
          )}

          {currentView === 'cases' && (
            <div className="space-y-6">
              <CustomCard className="group hover:shadow-lg transition-all duration-300">
                <CustomCardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div>
                      <CustomCardTitle className="text-gray-900">All Cases</CustomCardTitle>
                      <CustomCardDescription className="text-gray-600">
                        Manage and monitor all dispute resolution cases
                      </CustomCardDescription>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search cases..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-full sm:w-64 bg-white border-gray-300"
                        />
                      </div>
                      
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40 bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="all" className="text-gray-900">All Statuses</SelectItem>
                          <SelectItem value="Pending Verification" className="text-gray-900">Pending Verification</SelectItem>
                          <SelectItem value="Verified" className="text-gray-900">Verified</SelectItem>
                          <SelectItem value="Awaiting Response" className="text-gray-900">Awaiting Response</SelectItem>
                          <SelectItem value="Accepted" className="text-gray-900">Accepted</SelectItem>
                          <SelectItem value="Rejected" className="text-gray-900">Rejected</SelectItem>
                          <SelectItem value="Panel Created" className="text-gray-900">Panel Created</SelectItem>
                          <SelectItem value="Mediation in Progress" className="text-gray-900">Mediation in Progress</SelectItem>
                          <SelectItem value="Resolved" className="text-gray-900">Resolved</SelectItem>
                          <SelectItem value="Unresolved" className="text-gray-900">Unresolved</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-32 bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="all" className="text-gray-900">All Types</SelectItem>
                          <SelectItem value="Family" className="text-gray-900">Family</SelectItem>
                          <SelectItem value="Business" className="text-gray-900">Business</SelectItem>
                          <SelectItem value="Criminal" className="text-gray-900">Criminal</SelectItem>
                          <SelectItem value="Property" className="text-gray-900">Property</SelectItem>
                          <SelectItem value="Employment" className="text-gray-900">Employment</SelectItem>
                          <SelectItem value="Other" className="text-gray-900">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CustomCardHeader>
                <CustomCardContent>
                  {/* Admin Actions Bar */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Admin Actions</h4>
                        <p className="text-sm text-blue-700">
                          {selectedCases.length > 0 
                            ? `${selectedCases.length} case(s) selected`
                            : 'Select cases to perform bulk actions'
                          }
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <CustomButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedCases(filteredCases.filter(c => c.status === 'Pending Verification').map(c => c._id))}
                          className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Select Pending
                        </CustomButton>
                        <CustomButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleBulkUpdateStatus('Verified')}
                          disabled={selectedCases.length === 0}
                          className="bg-white border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Bulk Verify
                        </CustomButton>
                        <CustomButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleBulkUpdateStatus('Rejected')}
                          disabled={selectedCases.length === 0}
                          className="bg-white border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Bulk Reject
                        </CustomButton>
                        <CustomButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (selectedCases.length === 1) {
                              const selectedCase = cases.find(c => c._id === selectedCases[0]);
                              const existingPanel = selectedCase?.assignedPanel;
                              let members: Array<{
                                name: string;
                                role: 'Lawyer' | 'Religious Leader' | 'Community Representative';
                                email: string;
                                phone: string;
                              }> = [
                                { name: '', role: 'Lawyer', email: '', phone: '' },
                                { name: '', role: 'Religious Leader', email: '', phone: '' },
                                { name: '', role: 'Community Representative', email: '', phone: '' }
                              ];
                              
                              if (existingPanel && existingPanel.members && existingPanel.members.length > 0) {
                                // Autofill with existing panel data
                                members = existingPanel.members.map(member => ({
                                  name: member.name || '',
                                  role: member.role as 'Lawyer' | 'Religious Leader' | 'Community Representative',
                                  email: member.email || '',
                                  phone: member.phone || ''
                                }));
                              }
                              
                              setPanelData({
                                caseId: selectedCases[0],
                                members: members
                              });
                              setShowPanelModal(true);
                            }
                          }}
                          disabled={selectedCases.length !== 1}
                          className="bg-white border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800 disabled:opacity-50"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          {selectedCases.length === 1 && cases.find(c => c._id === selectedCases[0])?.assignedPanel ? 'Edit Panel' : 'Assign Panel'}
                        </CustomButton>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredCases.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2 text-gray-900">No cases found</h3>
                        <p className="text-gray-500">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Select All Checkbox */}
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={selectedCases.length === filteredCases.length && filteredCases.length > 0}
                            onChange={handleSelectAllCases}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            Select all ({filteredCases.length} cases)
                          </span>
                        </div>

                        {filteredCases.map(case_ => (
                          <div key={case_._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={selectedCases.includes(case_._id)}
                                  onChange={() => handleCaseSelection(case_._id)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <CustomBadge variant="outline" className="border-gray-300 text-gray-700 bg-white">{case_.caseType}</CustomBadge>
                                {getStatusBadge(case_.status)}
                              </div>
                              <div className="flex items-center space-x-2">
                                <CustomButton 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => onViewCase(case_._id)}
                                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 bg-white"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </CustomButton>
                                <CustomButton 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setStatusUpdateData({
                                      caseId: case_._id,
                                      status: case_.status,
                                      resolutionDetails: case_.resolutionDetails
                                    });
                                    setShowStatusModal(true);
                                  }}
                                  className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 bg-white"
                                >
                                  <Settings className="w-4 h-4 mr-2" />
                                  Update Status
                                </CustomButton>
                                <CustomButton 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    // Check if case already has an assigned panel
                                    const existingPanel = case_.assignedPanel;
                                    let members: Array<{
                                      name: string;
                                      role: 'Lawyer' | 'Religious Leader' | 'Community Representative';
                                      email: string;
                                      phone: string;
                                    }> = [
                                      { name: '', role: 'Lawyer', email: '', phone: '' },
                                      { name: '', role: 'Religious Leader', email: '', phone: '' },
                                      { name: '', role: 'Community Representative', email: '', phone: '' }
                                    ];
                                    
                                    if (existingPanel && existingPanel.members && existingPanel.members.length > 0) {
                                      // Autofill with existing panel data
                                      members = existingPanel.members.map(member => ({
                                        name: member.name || '',
                                        role: member.role as 'Lawyer' | 'Religious Leader' | 'Community Representative',
                                        email: member.email || '',
                                        phone: member.phone || ''
                                      }));
                                    }
                                    
                                    setPanelData({
                                      caseId: case_._id,
                                      members: members
                                    });
                                    setShowPanelModal(true);
                                  }}
                                  className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800 bg-white cursor-pointer"
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  {case_.assignedPanel ? 'Edit Panel' : 'Assign Panel'}
                                </CustomButton>
                              </div>
                            </div>
                            
                            <h4 className="font-semibold text-lg mb-2 text-gray-900">{case_.title}</h4>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {case_.description}
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-3">
                              <div>
                                <span className="font-medium text-gray-700">ID:</span> {case_._id}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Opposite Party:</span> {case_.oppositePartyName}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Created:</span> {formatDate(case_.createdAt)}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Updated:</span> {formatDate(case_.updatedAt)}
                              </div>
                            </div>



                            {case_.isPendingInCourt && (
                              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                                <span className="font-medium text-amber-700">Court Proceeding:</span>
                                {case_.firNumber && ` FIR ${case_.firNumber}`}
                                {case_.courtName && ` • ${case_.courtName}`}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CustomCardContent>
              </CustomCard>
            </div>
          )}

          {currentView === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CustomCard className="group hover:shadow-lg transition-all duration-300">
                  <CustomCardHeader>
                    <CustomCardTitle className="text-gray-900">Resolution Rate</CustomCardTitle>
                    <CustomCardDescription className="text-gray-600">Success rate of case resolutions</CustomCardDescription>
                  </CustomCardHeader>
                  <CustomCardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Resolved Cases</span>
                        <span className="text-sm text-gray-500">
                          {stats?.resolved || 0} / {stats?.totalCases || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full" 
                          style={{ width: `${stats && stats.totalCases > 0 ? (stats.resolved / stats.totalCases) * 100 : 0}%` }}
                        />
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {stats && stats.totalCases > 0 ? Math.round((stats.resolved / stats.totalCases) * 100) : 0}%
                      </p>
                    </div>
                  </CustomCardContent>
                </CustomCard>

                <CustomCard className="group hover:shadow-lg transition-all duration-300">
                  <CustomCardHeader>
                    <CustomCardTitle className="text-gray-900">Case Types Distribution</CustomCardTitle>
                    <CustomCardDescription className="text-gray-600">Breakdown by case category</CustomCardDescription>
                  </CustomCardHeader>
                  <CustomCardContent>
                    <div className="space-y-3">
                      {['Family', 'Business', 'Criminal', 'Property', 'Employment', 'Other'].map(type => {
                        const count = cases.filter(c => c.caseType === type).length;
                        const percentage = cases.length > 0 ? (count / cases.length) * 100 : 0;
                        
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{type}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-500 w-8">
                                {count}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CustomCardContent>
                </CustomCard>

                <CustomCard className="lg:col-span-2 group hover:shadow-lg transition-all duration-300">
                  <CustomCardHeader>
                    <CustomCardTitle className="text-gray-900">Key Metrics</CustomCardTitle>
                    <CustomCardDescription className="text-gray-600">Important platform statistics</CustomCardDescription>
                  </CustomCardHeader>
                  <CustomCardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">{stats?.totalCases || 0}</p>
                        <p className="text-sm text-gray-500">Total Cases</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-amber-600">{stats?.awaitingResponse || 0}</p>
                        <p className="text-sm text-gray-500">Awaiting Response</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">{stats?.resolved || 0}</p>
                        <p className="text-sm text-gray-500">Successfully Resolved</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-red-600">{stats?.rejected || 0}</p>
                        <p className="text-sm text-gray-500">Rejected</p>
                      </div>
                    </div>
                  </CustomCardContent>
                </CustomCard>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && statusUpdateData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Update Case Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <Select 
                  value={statusUpdateData.status} 
                  onValueChange={(value: Case['status']) => setStatusUpdateData(prev => prev ? {...prev, status: value} : null)}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="Pending Verification" className="text-gray-900">Pending Verification</SelectItem>
                    <SelectItem value="Verified" className="text-gray-900">Verified</SelectItem>
                    <SelectItem value="Awaiting Response" className="text-gray-900">Awaiting Response</SelectItem>
                    <SelectItem value="Accepted" className="text-gray-900">Accepted</SelectItem>
                    <SelectItem value="Rejected" className="text-gray-900">Rejected</SelectItem>
                    <SelectItem value="Panel Created" className="text-gray-900">Panel Created</SelectItem>
                    <SelectItem value="Mediation in Progress" className="text-gray-900">Mediation in Progress</SelectItem>
                    <SelectItem value="Resolved" className="text-gray-900">Resolved</SelectItem>
                    <SelectItem value="Unresolved" className="text-gray-900">Unresolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Details (Optional)
                </label>
                <textarea
                  value={statusUpdateData.resolutionDetails || ''}
                  onChange={(e) => setStatusUpdateData(prev => prev ? {...prev, resolutionDetails: e.target.value} : null)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter resolution details..."
                />
              </div>
              <div className="flex space-x-3">
                <CustomButton
                  onClick={() => handleUpdateCaseStatus(statusUpdateData.caseId, statusUpdateData.status, statusUpdateData.resolutionDetails)}
                  disabled={isUpdatingStatus}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Update Status
                </CustomButton>
                <CustomButton
                  variant="outline"
                  onClick={() => {
                    setShowStatusModal(false);
                    setStatusUpdateData(null);
                  }}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel Assignment Modal */}
      {showPanelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {panelData.caseId && cases.find(c => c._id === panelData.caseId)?.assignedPanel ? 'Edit Mediation Panel' : 'Assign Mediation Panel'}
              </h3>
              <CustomButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPanelModal(false);
                  setPanelData({
                    caseId: '',
                    members: [
                      { name: '', role: 'Lawyer', email: '', phone: '' },
                      { name: '', role: 'Religious Leader', email: '', phone: '' },
                      { name: '', role: 'Community Representative', email: '', phone: '' }
                    ]
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </CustomButton>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Panel must include at least one Lawyer, one Religious Leader, and one Community Representative. 
              At least one field (name, email, or phone) must be filled for each member.
            </p>
            
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-3 text-gray-900">Panel Member {index}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <Input
                        placeholder="Enter name"
                        value={panelData.members[index - 1]?.name || ''}
                        onChange={(e) => {
                          const newMembers = [...panelData.members];
                          newMembers[index - 1] = { ...newMembers[index - 1], name: e.target.value };
                          setPanelData(prev => ({ ...prev, members: newMembers }));
                        }}
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <Select
                        value={panelData.members[index - 1]?.role || ''}
                        onValueChange={(value: 'Lawyer' | 'Religious Leader' | 'Community Representative') => {
                          const newMembers = [...panelData.members];
                          newMembers[index - 1] = { ...newMembers[index - 1], role: value };
                          setPanelData(prev => ({ ...prev, members: newMembers }));
                        }}
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="Lawyer" className="text-gray-900">Lawyer</SelectItem>
                          <SelectItem value="Religious Leader" className="text-gray-900">Religious Leader</SelectItem>
                          <SelectItem value="Community Representative" className="text-gray-900">Community Representative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <Input
                        type="email"
                        placeholder="Enter email"
                        value={panelData.members[index - 1]?.email || ''}
                        onChange={(e) => {
                          const newMembers = [...panelData.members];
                          newMembers[index - 1] = { ...newMembers[index - 1], email: e.target.value };
                          setPanelData(prev => ({ ...prev, members: newMembers }));
                        }}
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <Input
                        placeholder="Enter phone"
                        value={panelData.members[index - 1]?.phone || ''}
                        onChange={(e) => {
                          const newMembers = [...panelData.members];
                          newMembers[index - 1] = { ...newMembers[index - 1], phone: e.target.value };
                          setPanelData(prev => ({ ...prev, members: newMembers }));
                        }}
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex space-x-3">
                <CustomButton
                  onClick={() => {
                    const caseId = panelData.caseId || (selectedCases.length === 1 ? selectedCases[0] : '');
                    if (caseId) {
                      console.log('Assigning panel for case:', caseId);
                      console.log('Panel members:', panelData.members);
                      
                      // Filter out empty members and validate data
                      const validMembers = panelData.members.filter(member => {
                        const hasName = member.name && member.name.trim().length > 0;
                        const hasEmail = member.email && member.email.trim().length > 0;
                        const hasPhone = member.phone && member.phone.trim().length > 0;
                        return hasName || hasEmail || hasPhone;
                      }).map(member => ({
                        name: member.name.trim() || '',
                        role: member.role,
                        email: member.email.trim() || '',
                        phone: member.phone.trim() || ''
                      }));
                      
                      console.log('Valid members:', validMembers);
                      
                      if (validMembers.length !== 3) {
                        toast({
                          title: "Validation Error",
                          description: "Please fill in at least one field (name, email, or phone) for all 3 panel members",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      handleAssignPanel(caseId, validMembers);
                    } else {
                      toast({
                        title: "Error",
                        description: "No case selected for panel assignment",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={!panelData.caseId && selectedCases.length !== 1}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white hover:text-white"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Assign Panel
                </CustomButton>
                <CustomButton
                  variant="outline"
                  onClick={() => {
                    setShowPanelModal(false);
                    setPanelData({
                      caseId: '',
                      members: [
                        { name: '', role: 'Lawyer', email: '', phone: '' },
                        { name: '', role: 'Religious Leader', email: '', phone: '' },
                        { name: '', role: 'Community Representative', email: '', phone: '' }
                      ]
                    });
                  }}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  Cancel
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}