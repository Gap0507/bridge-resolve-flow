import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { casesApi, authApi, type Case, type User } from '@/services/api';
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Loader2,
  TrendingUp,
  Users,
  Shield,
  Bell,
  Settings,
  LogOut,
  Search,
  Filter,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  Award,
  Zap,
  Sparkles,
  Home,
  BarChart3,
  FolderOpen,
  Activity,
  PieChart,
  Target,
  CheckSquare,
  AlertTriangle,
  UserCheck,
  FileCheck,
  CalendarDays,
  Clock3,
  Scale,
  Menu,
  X
} from 'lucide-react';

// Types
interface UserDashboardProps {
  onCreateCase: () => void;
  onViewCase: (caseId: string) => void;
}

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

type DashboardView = 'overview' | 'cases' | 'analytics' | 'activity';

// Mock Components
const Badge = ({ children, className, variant }: any) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Button = ({ children, className, variant = 'default', size = 'default', onClick, ...props }: any) => {
  const baseClass = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
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

const Card = ({ children, className }: any) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm bg-white border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className }: any) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className }: any) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className }: any) => (
  <p className={`text-sm text-muted-foreground text-gray-500 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className }: any) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Avatar = ({ children, className }: any) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

const AvatarFallback = ({ children, className }: any) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}>
    {children}
  </div>
);

export function UserDashboard({ onCreateCase = () => {}, onViewCase = () => {} }: UserDashboardProps) {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch user cases using React Query
  const { 
    data: casesData, 
    isLoading: casesLoading, 
    error: casesError,
    refetch: refetchCases 
  } = useQuery({
    queryKey: ['userCases', statusFilter],
    queryFn: async () => {
      const response = await casesApi.getUserCases({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 100 // Get all cases for dashboard
      });
      return response.data;
    },
    enabled: !!user, // Only fetch if user is authenticated
  });

  const cases = casesData?.cases || [];
  const isLoading = casesLoading;
  const error = casesError?.message || '';

  const getStatusBadge = (status: Case['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border font-medium`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.oppositePartyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: cases.length,
    pending: cases.filter(c => c.status === 'Pending Verification').length,
    inProgress: cases.filter(c => ['Awaiting Response', 'Panel Created', 'Mediation in Progress'].includes(c.status)).length,
    resolved: cases.filter(c => c.status === 'Resolved').length,
    unresolved: cases.filter(c => c.status === 'Unresolved').length,
  };

  const recentCases = cases.slice(0, 3);
  const activeCases = cases.filter(c => ['Awaiting Response', 'Panel Created', 'Mediation in Progress'].includes(c.status));

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home, count: null },
    { id: 'cases', label: 'All Cases', icon: FolderOpen, count: cases.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null },
    { id: 'activity', label: 'Recent Activity', icon: Activity, count: recentCases.length },
  ];

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
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
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">ResolveIt</h1>
                <p className="text-xs text-gray-500">Dispute Resolution</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Profile Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="w-12 h-12 ring-2 ring-blue-100">
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{user?.name}</h3>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            
            <Button 
              onClick={onCreateCase}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Case
            </Button>
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
                    <Badge className={`${
                      currentView === item.id 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Stats Summary */}
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 text-sm">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Cases</span>
                  <span className="font-semibold text-gray-900">{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active</span>
                  <span className="font-semibold text-blue-600">{stats.inProgress}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Resolved</span>
                  <span className="font-semibold text-green-600">{stats.resolved}</span>
                </div>
              </div>
            </div>
            
            {/* Logout Button */}
            <Button 
              variant="ghost" 
              onClick={handleLogout} 
              className="w-full mt-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-sm text-gray-600">
                  Your comprehensive dashboard for managing disputes and tracking resolution progress
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Content based on current view */}
          {currentView === 'overview' && (
            <div className="space-y-8">
{/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-700 mt-10">{stats.total}</p>
                        <p className="text-xs text-blue-600 font-medium">Total Cases</p>
                      </div>
                      <div className="p-2 bg-blue-200 rounded-xl group-hover:scale-110 transition-transform duration-300 mt-10">
                        <FileText className="w-5 h-5 text-blue-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-amber-700 mt-10">{stats.pending}</p>
                        <p className="text-xs text-amber-600 font-medium">Pending Review</p>
                      </div>
                      <div className="p-2 bg-amber-200 rounded-xl group-hover:scale-110 transition-transform duration-300 mt-10">
                        <Clock className="w-5 h-5 text-amber-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-purple-700 mt-10">{stats.inProgress}</p>
                        <p className="text-xs text-purple-600 font-medium">In Progress</p>
                      </div>
                      <div className="p-2 bg-purple-200 rounded-xl group-hover:scale-110 transition-transform duration-300 mt-10">
                        <TrendingUp className="w-5 h-5 text-purple-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-700 mt-10">{stats.resolved}</p>
                        <p className="text-xs text-green-600 font-medium">Resolved</p>
                      </div>
                      <div className="p-2 bg-green-200 rounded-xl group-hover:scale-110 transition-transform duration-300 mt-10">
                        <CheckCircle className="w-5 h-5 text-green-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity & Active Cases */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg text-gray-900">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span>Recent Activity</span>
                    </CardTitle>
                    <CardDescription>Latest updates on your cases</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentCases.length === 0 ? (
                        <div className="text-center py-8 flex flex-col items-center justify-center">
                          <FileText className="w-12 h-12 text-gray-400 mb-4" />
                          <p className="text-gray-500">No recent activity</p>
                        </div>
                      ) : (
                        recentCases.map((case_, index) => (
                          <div key={case_._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${statusConfig[case_.status].gradient}`}></div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{case_.title}</h4>
                              <p className="text-sm text-gray-500">
                                {case_.caseType} • {new Date(case_.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {getStatusBadge(case_.status)}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Active Cases */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg text-gray-900">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span>Active Cases</span>
                    </CardTitle>
                    <CardDescription>Cases currently in progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeCases.length === 0 ? (
                        <div className="text-center py-8 flex flex-col items-center justify-center">
                          <Clock className="w-12 h-12 text-gray-400 mb-4" />
                          <p className="text-gray-500">No active cases</p>
                        </div>
                      ) : (
                        activeCases.map((case_, index) => (
                          <div key={case_._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{case_.title}</h4>
                              {getStatusBadge(case_.status)}
                            </div>
                            <p className="text-sm text-gray-500 mb-3">
                              vs. {case_.oppositePartyName}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                {new Date(case_.createdAt).toLocaleDateString()}
                              </span>
                              <Button size="sm" variant="outline" onClick={() => onViewCase(case_._id)}>
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentView === 'cases' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">All Cases</CardTitle>
                      <CardDescription className="text-gray-600">
                        Manage and track all your dispute resolution cases
                      </CardDescription>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search cases..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Pending Verification">Pending Verification</option>
                        <option value="Verified">Verified</option>
                        <option value="Awaiting Response">Awaiting Response</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Panel Created">Panel Created</option>
                        <option value="Mediation in Progress">Mediation in Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Unresolved">Unresolved</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="text-center py-8 flex flex-col items-center justify-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2 text-gray-900">Error loading cases</h3>
                      <p className="text-gray-500 mb-4">{error}</p>
                      <Button variant="outline" onClick={() => refetchCases()}>
                        Try Again
                      </Button>
                    </div>
                  )}

                  {!error && filteredCases.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">No cases found</h3>
                      <p className="text-gray-500 mb-8 max-w-md">
                        {cases.length === 0 
                          ? "Ready to resolve a dispute? Create your first case to get started with our resolution process."
                          : "Try adjusting your search or filter criteria"
                        }
                      </p>
                      {cases.length === 0 && (
                        <Button size="lg" onClick={onCreateCase} className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-5 h-5 mr-2" />
                          Create Your First Case
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredCases.map((case_, index) => (
                        <div 
                          key={case_._id}
                          className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 font-semibold">
                                {case_.caseType}
                              </Badge>
                              {getStatusBadge(case_.status)}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onViewCase(case_._id)}
                              className="group-hover:border-blue-500 group-hover:text-blue-600 transition-all duration-200"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                          
                          <h4 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                            {case_.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {case_.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <span className="font-medium text-gray-700">vs. {case_.oppositePartyName}</span>
                            </div>
                            <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                              📅 {new Date(case_.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentView === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gray-900">Resolution Rate</CardTitle>
                    <CardDescription className="text-gray-600">Success rate of your case resolutions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Resolved Cases</span>
                        <span className="text-sm text-gray-500">
                          {stats.resolved} / {stats.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <p className="text-2xl font-bold text-emerald-600">
                        {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-gray-900">Case Status Distribution</CardTitle>
                    <CardDescription className="text-gray-600">Breakdown by case status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries({
                        'Pending': stats.pending,
                        'In Progress': stats.inProgress,
                        'Resolved': stats.resolved,
                        'Unresolved': stats.unresolved
                      }).map(([status, count]) => {
                        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        
                        return (
                          <div key={status} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{status}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500" 
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
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentView === 'activity' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <span>Recent Activity</span>
                  </CardTitle>
                  <CardDescription>Latest updates and timeline of your cases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentCases.length === 0 ? (
                      <div className="text-center py-8 flex flex-col items-center justify-center">
                        <Activity className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">No recent activity</p>
                      </div>
                    ) : (
                      recentCases.map((case_, index) => (
                        <div key={case_._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${statusConfig[case_.status].gradient}`}></div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{case_.title}</h4>
                            <p className="text-sm text-gray-500">
                              {case_.caseType} • {new Date(case_.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(case_.status)}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
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