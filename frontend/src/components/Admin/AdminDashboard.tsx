import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockAllCases, mockDashboardStats } from '@/data/mockData';
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
  BarChart3
} from 'lucide-react';
import { Case, DashboardStats } from '@/types';

const statusConfig = {
  'Pending Verification': { color: 'bg-warning text-warning-foreground', icon: AlertTriangle },
  'Verified': { color: 'bg-primary text-primary-foreground', icon: CheckCircle },
  'Awaiting Response': { color: 'bg-warning text-warning-foreground', icon: Clock },
  'Accepted': { color: 'bg-success text-success-foreground', icon: CheckCircle },
  'Rejected': { color: 'bg-destructive text-destructive-foreground', icon: XCircle },
  'Panel Created': { color: 'bg-primary text-primary-foreground', icon: Users },
  'Mediation in Progress': { color: 'bg-primary text-primary-foreground', icon: Clock },
  'Resolved': { color: 'bg-success text-success-foreground', icon: CheckCircle },
  'Unresolved': { color: 'bg-destructive text-destructive-foreground', icon: XCircle },
};

interface AdminDashboardProps {
  onViewCase: (caseId: string) => void;
}

export function AdminDashboard({ onViewCase }: AdminDashboardProps) {
  const { user, logout } = useAuth();
  const [cases] = useState<Case[]>(mockAllCases);
  const [stats] = useState<DashboardStats>(mockDashboardStats);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

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
      <Badge className={config.color}>
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white border-b shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">ResolveIt Management Panel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-muted-foreground">
            Monitor and manage dispute resolution cases across the platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.totalCases}</p>
                  <p className="text-sm text-muted-foreground">Total Cases</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.pendingVerification}</p>
                  <p className="text-sm text-muted-foreground">Pending Verification</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cases">All Cases</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Pending Cases ({casesByStatus['Pending Verification'].length})
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Assign Mediation Panels
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Reports
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Cases</CardTitle>
                  <CardDescription>Latest case submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cases.slice(0, 5).map(case_ => (
                      <div key={case_.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{case_.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {case_.caseType} • {formatDate(case_.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(case_.status)}
                          <Button size="sm" variant="ghost" onClick={() => onViewCase(case_.id)}>
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
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Cases by Status</CardTitle>
                <CardDescription>Distribution of cases across different statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(casesByStatus).map(([status, statusCases]) => (
                    <div key={status} className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">{statusCases.length}</p>
                      <p className="text-sm text-muted-foreground">{status}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cases Tab */}
          <TabsContent value="cases">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <CardTitle>All Cases</CardTitle>
                    <CardDescription>
                      Manage and monitor all dispute resolution cases
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search cases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-40">
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
                      <SelectTrigger className="w-full sm:w-32">
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
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCases.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No cases found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  ) : (
                    filteredCases.map(case_ => (
                      <div key={case_.id} className="border rounded-lg p-4 hover:shadow-card transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{case_.caseType}</Badge>
                            {getStatusBadge(case_.status)}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onViewCase(case_.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                        
                        <h4 className="font-semibold text-lg mb-2">{case_.title}</h4>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {case_.description}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">ID:</span> {case_.id}
                          </div>
                          <div>
                            <span className="font-medium">Opposite Party:</span> {case_.oppositePartyName}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span> {formatDate(case_.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium">Updated:</span> {formatDate(case_.updatedAt)}
                          </div>
                        </div>

                        {case_.isPendingInCourt && (
                          <div className="mt-3 p-2 bg-warning/5 border border-warning/20 rounded text-xs">
                            <span className="font-medium text-warning">Court Proceeding:</span>
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
              <Card>
                <CardHeader>
                  <CardTitle>Resolution Rate</CardTitle>
                  <CardDescription>Success rate of case resolutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Resolved Cases</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.resolved} / {stats.totalCases}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-success h-3 rounded-full" 
                        style={{ width: `${(stats.resolved / stats.totalCases) * 100}%` }}
                      />
                    </div>
                    <p className="text-2xl font-bold text-success">
                      {Math.round((stats.resolved / stats.totalCases) * 100)}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Case Types Distribution</CardTitle>
                  <CardDescription>Breakdown by case category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Family', 'Business', 'Criminal', 'Property', 'Employment', 'Other'].map(type => {
                      const count = cases.filter(c => c.caseType === type).length;
                      const percentage = (count / cases.length) * 100;
                      
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{type}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-8">
                              {count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                  <CardDescription>Important platform statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">{stats.totalCases}</p>
                      <p className="text-sm text-muted-foreground">Total Cases</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-warning">{stats.awaitingResponse}</p>
                      <p className="text-sm text-muted-foreground">Awaiting Response</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-success">{stats.resolved}</p>
                      <p className="text-sm text-muted-foreground">Successfully Resolved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-destructive">{stats.rejected}</p>
                      <p className="text-sm text-muted-foreground">Rejected</p>
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