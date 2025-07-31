import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockCases } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { Case } from '@/types';

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
  const [cases] = useState<Case[]>(mockCases);

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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white border-b shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">ResolveIt</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
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
            Welcome back, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-muted-foreground">
            Manage your cases and track dispute resolution progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.total}</p>
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
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-primary" />
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button 
            variant="professional" 
            onClick={onCreateCase}
            className="sm:w-auto w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Case
          </Button>
        </div>

        {/* Cases List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Cases</CardTitle>
            <CardDescription>
              Track the progress of your dispute resolution cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No cases yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first case
                </p>
                <Button variant="professional" onClick={onCreateCase}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Case
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cases.map((case_) => (
                  <div 
                    key={case_.id}
                    className="border rounded-lg p-4 hover:shadow-card transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
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
                        View
                      </Button>
                    </div>
                    
                    <h4 className="font-semibold text-lg mb-2">{case_.title}</h4>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {case_.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>vs. {case_.oppositePartyName}</span>
                      <span>Created {new Date(case_.createdAt).toLocaleDateString()}</span>
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