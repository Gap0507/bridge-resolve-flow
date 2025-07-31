import { useState } from 'react';
import { mockCases } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Scale,
  Users
} from 'lucide-react';
import { Case } from '@/types';

interface CaseDetailsProps {
  caseId: string;
  onBack: () => void;
}

const statusConfig = {
  'Pending Verification': { color: 'bg-warning', icon: AlertCircle, label: 'Pending Verification' },
  'Verified': { color: 'bg-primary', icon: CheckCircle, label: 'Verified' },
  'Awaiting Response': { color: 'bg-warning', icon: Clock, label: 'Awaiting Response' },
  'Accepted': { color: 'bg-success', icon: CheckCircle, label: 'Accepted' },
  'Rejected': { color: 'bg-destructive', icon: XCircle, label: 'Rejected' },
  'Panel Created': { color: 'bg-primary', icon: Users, label: 'Panel Created' },
  'Mediation in Progress': { color: 'bg-primary', icon: Scale, label: 'Mediation in Progress' },
  'Resolved': { color: 'bg-success', icon: CheckCircle, label: 'Resolved' },
  'Unresolved': { color: 'bg-destructive', icon: XCircle, label: 'Unresolved' },
};

export function CaseDetails({ caseId, onBack }: CaseDetailsProps) {
  const [case_, setCase] = useState<Case | null>(
    mockCases.find(c => c.id === caseId) || null
  );

  if (!case_) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Case not found</h3>
            <p className="text-muted-foreground mb-4">
              The requested case could not be found.
            </p>
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white border-b shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Case Details</h1>
                <p className="text-sm text-muted-foreground">Case ID: {case_.id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="outline">{case_.caseType}</Badge>
              {getStatusBadge(case_.status)}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Case Title and Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{case_.title}</CardTitle>
                <CardDescription className="text-base">
                  {case_.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(case_.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(case_.updatedAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Opposite Party</p>
                  <p className="text-sm text-muted-foreground">
                    {case_.oppositePartyName}
                  </p>
                </div>
              </div>
            </div>

            {case_.isPendingInCourt && (
              <div className="mt-6 p-4 bg-warning/5 border border-warning/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <h4 className="font-medium text-warning">Court Proceeding</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      This case is pending in court or with police authorities.
                    </p>
                    {case_.firNumber && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">FIR Number:</span> {case_.firNumber}
                      </p>
                    )}
                    {case_.courtName && (
                      <p className="text-sm">
                        <span className="font-medium">Court:</span> {case_.courtName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="parties">Parties</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="panel">Panel</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Case Timeline</CardTitle>
                <CardDescription>
                  Track the progress of your case through each stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {case_.timeline.map((event, index) => {
                    const config = statusConfig[event.status];
                    const Icon = config.icon;
                    const isLast = index === case_.timeline.length - 1;
                    
                    return (
                      <div key={event.id} className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color} text-white`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {!isLast && <div className="w-0.5 h-6 bg-border mt-2" />}
                        </div>
                        
                        <div className="flex-1 pb-6">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <time className="text-xs text-muted-foreground">
                              {formatDate(event.createdAt)}
                            </time>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by {event.createdBy}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parties Tab */}
          <TabsContent value="parties">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Opposite Party</CardTitle>
                  <CardDescription>Contact information and details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{case_.oppositePartyName}</p>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{case_.oppositePartyEmail}</p>
                      <p className="text-sm text-muted-foreground">Email Address</p>
                    </div>
                  </div>
                  
                  {case_.oppositePartyPhone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{case_.oppositePartyPhone}</p>
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {case_.witnesses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Witnesses</CardTitle>
                    <CardDescription>People who can testify about this case</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {case_.witnesses.map(witness => (
                        <div key={witness.id} className="p-3 border rounded-lg">
                          <div className="flex items-center space-x-3 mb-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {witness.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{witness.name}</p>
                              <p className="text-xs text-muted-foreground">{witness.relationship}</p>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>{witness.email}</p>
                            {witness.phone && <p>{witness.phone}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Evidence Tab */}
          <TabsContent value="evidence">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Evidence</CardTitle>
                <CardDescription>
                  Documents, images, audio, and video files related to this case
                </CardDescription>
              </CardHeader>
              <CardContent>
                {case_.proofFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No evidence uploaded</h3>
                    <p className="text-muted-foreground">
                      No supporting documents have been uploaded for this case.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {case_.proofFiles.map(file => (
                      <div key={file.id} className="border rounded-lg p-4 hover:shadow-card transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <span className="text-xs text-muted-foreground uppercase">
                              {file.type}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <h4 className="font-medium text-sm mb-2">{file.name}</h4>
                        <div className="text-xs text-muted-foreground">
                          <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          <p>Uploaded {formatDate(file.uploadedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Panel Tab */}
          <TabsContent value="panel">
            <Card>
              <CardHeader>
                <CardTitle>Mediation Panel</CardTitle>
                <CardDescription>
                  Assigned mediators for this case resolution
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!case_.assignedPanel ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No panel assigned</h3>
                    <p className="text-muted-foreground">
                      A mediation panel will be assigned once both parties agree to proceed.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6 p-4 bg-success/5 border border-success/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <div>
                          <h4 className="font-medium text-success">Panel Assigned</h4>
                          <p className="text-sm text-muted-foreground">
                            Assigned on {formatDate(case_.assignedPanel.assignedAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {case_.assignedPanel.members.map(member => (
                        <div key={member.id} className="border rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <Avatar>
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span>{member.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{member.phone}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}