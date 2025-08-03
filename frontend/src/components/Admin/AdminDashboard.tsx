import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi, Case, DashboardStats } from '@/services/api';
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
  Clock3
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
    default: "bg-primary text-primary-foreground hover:bg-primary/90 bg-blue-600 hover:bg-blue-700 text-white",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground border-gray-300 hover:bg-gray-50",
    ghost: "hover:bg-accent hover:text-accent-foreground hover:bg-gray-100"
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
}

export function AdminDashboard({ onViewCase }: AdminDashboardProps) {
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
                    <CustomButton variant="outline" className="w-full justify-start bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Pending Cases ({casesByStatus['Pending Verification'].length})
                    </CustomButton>
                    <CustomButton variant="outline" className="w-full justify-start bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Users className="w-4 h-4 mr-2" />
                      Assign Mediation Panels
                    </CustomButton>
                    <CustomButton variant="outline" className="w-full justify-start bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50">
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
                        <SelectTrigger className="w-full sm:w-40 bg-white border-gray-300">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="Pending Verification">Pending Verification</SelectItem>
                          <SelectItem value="Verified">Verified</SelectItem>
                          <SelectItem value="Awaiting Response">Awaiting Response</SelectItem>
                          <SelectItem value="Accepted">Accepted</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                          <SelectItem value="Panel Created">Panel Created</SelectItem>
                          <SelectItem value="Mediation in Progress">Mediation in Progress</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                          <SelectItem value="Unresolved">Unresolved</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-32 bg-white border-gray-300">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Family">Family</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Criminal">Criminal</SelectItem>
                          <SelectItem value="Property">Property</SelectItem>
                          <SelectItem value="Employment">Employment</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
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
                        <p className="text-sm text-blue-700">Bulk actions and case management tools</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <CustomButton 
                          variant="outline" 
                          size="sm"
                          className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Bulk Verify
                        </CustomButton>
                        <CustomButton 
                          variant="outline" 
                          size="sm"
                          className="bg-white border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Assign Panel
                        </CustomButton>
                        <CustomButton 
                          variant="outline" 
                          size="sm"
                          className="bg-white border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Export Data
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
                      filteredCases.map(case_ => (
                        <div key={case_._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <CustomBadge variant="outline" className="border-gray-300 text-gray-700 bg-white">{case_.caseType}</CustomBadge>
                              {getStatusBadge(case_.status)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <CustomButton 
                                variant="outline" 
                                size="sm"
                                onClick={() => onViewCase(case_._id)}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </CustomButton>
                              <CustomButton 
                                variant="outline" 
                                size="sm"
                                className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-white"
                              >
                                <Settings className="w-4 h-4 mr-2" />
                                Manage
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

                          {/* Admin Status Control */}
                          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-700">Status:</span>
                                <Select defaultValue={case_.status}>
                                  <SelectTrigger className="w-40 bg-white border-gray-300">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Pending Verification">Pending Verification</SelectItem>
                                    <SelectItem value="Verified">Verified</SelectItem>
                                    <SelectItem value="Awaiting Response">Awaiting Response</SelectItem>
                                    <SelectItem value="Accepted">Accepted</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                    <SelectItem value="Panel Created">Panel Created</SelectItem>
                                    <SelectItem value="Mediation in Progress">Mediation in Progress</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                    <SelectItem value="Unresolved">Unresolved</SelectItem>
                                  </SelectContent>
                                </Select>
                                <CustomButton 
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  Update Status
                                </CustomButton>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CustomButton 
                                  variant="outline" 
                                  size="sm"
                                  className="border-green-300 text-green-700 hover:bg-green-50 bg-white"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approve
                                </CustomButton>
                                <CustomButton 
                                  variant="outline" 
                                  size="sm"
                                  className="border-red-300 text-red-700 hover:bg-red-50 bg-white"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Reject
                                </CustomButton>
                              </div>
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
                      ))
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