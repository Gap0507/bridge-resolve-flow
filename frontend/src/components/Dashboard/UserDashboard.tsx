import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { casesApi, Case } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserDashboardProps {
  onCreateCase: () => void;
  onViewCase: (caseId: string) => void;
}

const statusConfig = {
  'Pending Verification': { color: 'bg-warning', icon: AlertCircle, label: 'Pending' },
  'Verified': { color: 'bg-primary', icon: CheckCircle, label: 'Verified' },
  'Awaiting Response': { color: 'bg-warning', icon: Clock, label: 'Awaiting' },
  'Accepted': { color: 'bg-success', icon: CheckCircle, label: 'Accepted' },
  'Rejected': { color: 'bg-destructive', icon: XCircle, label: 'Rejected' },
  'Panel Created': { color: 'bg-primary', icon: CheckCircle, label: 'Panel Created' },
  'Mediation in Progress': { color: 'bg-primary', icon: Clock, label: 'In Progress' },
  'Resolved': { color: 'bg-success', icon: CheckCircle, label: 'Resolved' },
  'Unresolved': { color: 'bg-destructive', icon: XCircle, label: 'Unresolved' },
};

export function UserDashboard({ onCreateCase, onViewCase }: UserDashboardProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserCases();
  }, []);

  const loadUserCases = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await casesApi.getUserCases();
      if (response.success && response.data?.cases) {
        setCases(response.data.cases);
      } else {
        setError('Failed to load cases');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load cases');
      toast({
        title: "Error",
        description: "Failed to load your cases. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Case['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge variant="secondary" className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const stats = {
    total: cases.length,
    pending: cases.filter(c => c.status === 'Pending Verification').length,
    inProgress: cases.filter(c => ['Awaiting Response', 'Panel Created', 'Mediation in Progress'].includes(c.status)).length,
    resolved: cases.filter(c => c.status === 'Resolved').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                    ResolveIt
                  </h1>
                  <p className="text-xs text-muted-foreground">Dispute Resolution Platform</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Avatar className="ring-2 ring-primary/20">
                  <AvatarImage src={user?.photo} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Button variant="glass" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  ResolveIt
                </h1>
                <p className="text-xs text-muted-foreground">Dispute Resolution Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Avatar className="ring-2 ring-primary/20">
                <AvatarImage src={user?.photo} alt={user?.name} />
                <AvatarFallback className="bg-gradient-primary text-white">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="glass" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-primary-glow bg-clip-text text-transparent mb-4">
              Welcome back, {user?.name?.split(' ')[0]} ✨
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your comprehensive dashboard for managing disputes and tracking resolution progress
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slide-up">
          <Card className="glass hover-lift border-primary/20 bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground mb-1">{stats.total}</p>
                  <p className="text-sm text-muted-foreground font-medium">Total Cases</p>
                </div>
                <div className="p-3 bg-gradient-primary rounded-xl shadow-lg shadow-primary/25">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">📊 All time</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover-lift border-warning/20 bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground mb-1">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground font-medium">Pending Review</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-warning to-orange-400 rounded-xl shadow-lg shadow-warning/25">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">⏳ Awaiting verification</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover-lift border-blue-400/20 bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground mb-1">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground font-medium">In Progress</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">🔄 Active cases</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover-lift border-success/20 bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground mb-1">{stats.resolved}</p>
                  <p className="text-sm text-muted-foreground font-medium">Resolved</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-success to-emerald-500 rounded-xl shadow-lg shadow-success/25">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">✅ Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mb-12 animate-scale-in">
          <Button 
            variant="premium" 
            size="lg"
            onClick={onCreateCase}
            className="sm:w-auto w-full group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
            Create New Case
          </Button>
          <Button 
            variant="glass" 
            size="lg"
            className="sm:w-auto w-full"
          >
            <FileText className="w-5 h-5 mr-2" />
            Case Templates
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="sm:w-auto w-full"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            Help & Support
          </Button>
        </div>

        {/* Cases List */}
        <Card className="glass border-primary/20 bg-gradient-card animate-fade-in">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Your Cases
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Track the progress of your dispute resolution cases
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="glass" size="sm" onClick={loadUserCases}>
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Error loading cases</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadUserCases} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {!error && cases.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/25">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">No cases yet</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Ready to resolve a dispute? Create your first case to get started with our resolution process.
                </p>
                <Button variant="premium" size="lg" onClick={onCreateCase}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Case
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {cases.map((case_, index) => (
                  <div 
                    key={case_._id}
                    className="glass border border-white/10 rounded-xl p-6 hover-lift group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary font-semibold">
                          {case_.caseType}
                        </Badge>
                        {getStatusBadge(case_.status)}
                      </div>
                      <Button 
                        variant="glass" 
                        size="sm"
                        onClick={() => onViewCase(case_._id)}
                        className="group-hover:border-primary/40 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                    
                    <h4 className="font-bold text-xl mb-3 text-foreground group-hover:text-primary transition-colors">
                      {case_.title}
                    </h4>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                      {case_.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-medium">vs. {case_.oppositePartyName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted/20 px-3 py-1 rounded-full">
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
    </div>
  );
}