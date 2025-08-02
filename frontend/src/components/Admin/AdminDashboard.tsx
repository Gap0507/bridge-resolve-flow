import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi, Case, DashboardStats } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  'Pending Verification': { color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30', icon: AlertTriangle },
  'Verified': { color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', icon: CheckCircle },
  'Awaiting Response': { color: 'bg-orange-500/20 text-orange-500 border-orange-500/30', icon: Clock },
  'Accepted': { color: 'bg-green-500/20 text-green-500 border-green-500/30', icon: CheckCircle },
  'Rejected': { color: 'bg-red-500/20 text-red-500 border-red-500/30', icon: XCircle },
  'Panel Created': { color: 'bg-purple-500/20 text-purple-500 border-purple-500/30', icon: Users },
  'Mediation in Progress': { color: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30', icon: Clock },
  'Resolved': { color: 'bg-green-500/20 text-green-500 border-green-500/30', icon: CheckCircle },
  'Unresolved': { color: 'bg-red-500/20 text-red-500 border-red-500/30', icon: XCircle },
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
      <Badge className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-100">Admin Dashboard</h1>
                  <p className="text-sm text-gray-400">ResolveIt Management Panel</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Avatar className="bg-gray-700">
                  <AvatarImage src={user?.photo} alt={user?.name} />
                  <AvatarFallback className="bg-gray-700 text-gray-100">{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-400">Administrator</p>
                </div>
                <Button variant="outline" onClick={logout} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-400">Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-100">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">ResolveIt Management Panel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
                <Settings className="w-5 h-5" />
              </Button>
              <Avatar className="bg-gray-700">
                <AvatarImage src={user?.photo} alt={user?.name} />
                <AvatarFallback className="bg-gray-700 text-gray-100">{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-100">{user?.name}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              <Button variant="outline" onClick={logout} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-100 mb-2">
            Welcome, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-gray-400">
            Monitor and manage dispute resolution cases across the platform
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-400">{error}</p>
            </div>
            <Button onClick={loadDashboardData} variant="outline" size="sm" className="mt-2 border-gray-600 text-gray-300 hover:bg-gray-700">
              Try Again
            </Button>
          </div>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-100">{stats.totalCases}</p>
                    <p className="text-sm text-gray-400">Total Cases</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-100">{stats.pendingVerification}</p>
                    <p className="text-sm text-gray-400">Pending Verification</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-100">{stats.inProgress}</p>
                    <p className="text-sm text-gray-400">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-100">{stats.resolved}</p>
                    <p className="text-sm text-gray-400">Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100">Overview</TabsTrigger>
            <TabsTrigger value="cases" className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100">All Cases</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100">Quick Actions</CardTitle>
                  <CardDescription className="text-gray-400">Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Pending Cases ({casesByStatus['Pending Verification'].length})
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Users className="w-4 h-4 mr-2" />
                    Assign Mediation Panels
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Reports
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100">Recent Cases</CardTitle>
                  <CardDescription className="text-gray-400">Latest case submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cases.slice(0, 5).map(case_ => (
                      <div key={case_._id} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-750">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-100">{case_.title}</h4>
                          <p className="text-xs text-gray-400">
                            {case_.caseType} • {formatDate(case_.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(case_.status)}
                          <Button size="sm" variant="ghost" onClick={() => onViewCase(case_._id)} className="text-gray-400 hover:text-gray-100">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Distribution */}
            <Card className="mt-6 bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Cases by Status</CardTitle>
                <CardDescription className="text-gray-400">Distribution of cases across different statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(casesByStatus).map(([status, statusCases]) => (
                    <div key={status} className="text-center p-4 border border-gray-700 rounded-lg bg-gray-750">
                      <p className="text-2xl font-bold text-blue-500">{statusCases.length}</p>
                      <p className="text-sm text-gray-400">{status}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cases Tab */}
          <TabsContent value="cases">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <CardTitle className="text-gray-100">All Cases</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage and monitor all dispute resolution cases
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search cases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                      />
                    </div>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-40 bg-gray-700 border-gray-600 text-gray-100">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all" className="text-gray-100">All Statuses</SelectItem>
                        <SelectItem value="Pending Verification" className="text-gray-100">Pending Verification</SelectItem>
                        <SelectItem value="Verified" className="text-gray-100">Verified</SelectItem>
                        <SelectItem value="Awaiting Response" className="text-gray-100">Awaiting Response</SelectItem>
                        <SelectItem value="Accepted" className="text-gray-100">Accepted</SelectItem>
                        <SelectItem value="Rejected" className="text-gray-100">Rejected</SelectItem>
                        <SelectItem value="Panel Created" className="text-gray-100">Panel Created</SelectItem>
                        <SelectItem value="Mediation in Progress" className="text-gray-100">Mediation in Progress</SelectItem>
                        <SelectItem value="Resolved" className="text-gray-100">Resolved</SelectItem>
                        <SelectItem value="Unresolved" className="text-gray-100">Unresolved</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full sm:w-32 bg-gray-700 border-gray-600 text-gray-100">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all" className="text-gray-100">All Types</SelectItem>
                        <SelectItem value="Family" className="text-gray-100">Family</SelectItem>
                        <SelectItem value="Business" className="text-gray-100">Business</SelectItem>
                        <SelectItem value="Criminal" className="text-gray-100">Criminal</SelectItem>
                        <SelectItem value="Property" className="text-gray-100">Property</SelectItem>
                        <SelectItem value="Employment" className="text-gray-100">Employment</SelectItem>
                        <SelectItem value="Other" className="text-gray-100">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCases.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2 text-gray-100">No cases found</h3>
                      <p className="text-gray-400">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  ) : (
                    filteredCases.map(case_ => (
                      <div key={case_._id} className="border border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow bg-gray-750">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="border-gray-600 text-gray-300">{case_.caseType}</Badge>
                            {getStatusBadge(case_.status)}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onViewCase(case_._id)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                        
                        <h4 className="font-semibold text-lg mb-2 text-gray-100">{case_.title}</h4>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {case_.description}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                          <div>
                            <span className="font-medium text-gray-300">ID:</span> {case_._id}
                          </div>
                          <div>
                            <span className="font-medium text-gray-300">Opposite Party:</span> {case_.oppositePartyName}
                          </div>
                          <div>
                            <span className="font-medium text-gray-300">Created:</span> {formatDate(case_.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium text-gray-300">Updated:</span> {formatDate(case_.updatedAt)}
                          </div>
                        </div>

                        {case_.isPendingInCourt && (
                          <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
                            <span className="font-medium text-yellow-500">Court Proceeding:</span>
                            {case_.firNumber && ` FIR ${case_.firNumber}`}
                            {case_.courtName && ` • ${case_.courtName}`}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100">Resolution Rate</CardTitle>
                  <CardDescription className="text-gray-400">Success rate of case resolutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">Resolved Cases</span>
                      <span className="text-sm text-gray-400">
                        {stats?.resolved || 0} / {stats?.totalCases || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full" 
                        style={{ width: `${stats && stats.totalCases > 0 ? (stats.resolved / stats.totalCases) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-2xl font-bold text-green-500">
                      {stats && stats.totalCases > 0 ? Math.round((stats.resolved / stats.totalCases) * 100) : 0}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100">Case Types Distribution</CardTitle>
                  <CardDescription className="text-gray-400">Breakdown by case category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Family', 'Business', 'Criminal', 'Property', 'Employment', 'Other'].map(type => {
                      const count = cases.filter(c => c.caseType === type).length;
                      const percentage = cases.length > 0 ? (count / cases.length) * 100 : 0;
                      
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-300">{type}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-400 w-8">
                              {count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100">Key Metrics</CardTitle>
                  <CardDescription className="text-gray-400">Important platform statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-500">{stats?.totalCases || 0}</p>
                      <p className="text-sm text-gray-400">Total Cases</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-500">{stats?.awaitingResponse || 0}</p>
                      <p className="text-sm text-gray-400">Awaiting Response</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-500">{stats?.resolved || 0}</p>
                      <p className="text-sm text-gray-400">Successfully Resolved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-500">{stats?.rejected || 0}</p>
                      <p className="text-sm text-gray-400">Rejected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}