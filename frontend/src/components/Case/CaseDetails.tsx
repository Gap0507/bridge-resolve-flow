import { useState, useEffect } from 'react';
import { casesApi, Case } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Users, 
  Download,
  Eye,
  Loader2,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CaseDetailsProps {
  caseId: string;
  onBack: () => void;
}

const statusConfig = {
  'Pending Verification': { color: 'bg-warning text-warning-foreground', icon: AlertCircle },
  'Verified': { color: 'bg-primary text-primary-foreground', icon: CheckCircle },
  'Awaiting Response': { color: 'bg-warning text-warning-foreground', icon: Clock },
  'Accepted': { color: 'bg-success text-success-foreground', icon: CheckCircle },
  'Rejected': { color: 'bg-destructive text-destructive-foreground', icon: XCircle },
  'Panel Created': { color: 'bg-primary text-primary-foreground', icon: Users },
  'Mediation in Progress': { color: 'bg-primary text-primary-foreground', icon: Clock },
  'Resolved': { color: 'bg-success text-success-foreground', icon: CheckCircle },
  'Unresolved': { color: 'bg-destructive text-destructive-foreground', icon: XCircle },
};

export function CaseDetails({ caseId, onBack }: CaseDetailsProps) {
  const { toast } = useToast();
  const [case_, setCase] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCaseDetails();
  }, [caseId]);

  const loadCaseDetails = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await casesApi.getCase(caseId);
      if (response.success && response.data?.case) {
        setCase(response.data.case);
      } else {
        setError('Failed to load case details');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load case details');
      toast({
        title: "Error",
        description: "Failed to load case details. Please try again.",
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
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      case 'document':
        return '📄';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading case details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !case_) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error loading case</h3>
            <p className="text-muted-foreground mb-4">{error || 'Case not found'}</p>
            <Button onClick={loadCaseDetails} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              <p className="text-sm text-muted-foreground">Case ID: {case_._id}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Case Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">{case_.title}</h2>
              <div className="flex items-center space-x-3 mb-4">
                <Badge variant="outline">{case_.caseType}</Badge>
                {getStatusBadge(case_.status)}
                <span className="text-sm text-muted-foreground">
                  Created {formatDate(case_.createdAt)}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-muted-foreground text-lg leading-relaxed">
            {case_.description}
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="witnesses">Witnesses</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Case Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Case Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Case Type</p>
                      <p className="font-medium">{case_.caseType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(case_.status)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created</p>
                      <p className="font-medium">{formatDate(case_.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{formatDate(case_.updatedAt)}</p>
                    </div>
                  </div>

                  {case_.isPendingInCourt && (
                    <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                      <h4 className="font-medium text-warning mb-2">Court Proceeding</h4>
                      <div className="space-y-2 text-sm">
                        {case_.firNumber && (
                          <p><span className="font-medium">FIR Number:</span> {case_.firNumber}</p>
                        )}
                        {case_.courtName && (
                          <p><span className="font-medium">Court:</span> {case_.courtName}</p>
                        )}
                        {case_.policeStation && (
                          <p><span className="font-medium">Police Station:</span> {case_.policeStation}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {case_.resolutionDetails && (
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <h4 className="font-medium text-success mb-2">Resolution Details</h4>
                      <p className="text-sm">{case_.resolutionDetails}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Opposite Party */}
              <Card>
                <CardHeader>
                  <CardTitle>Opposite Party</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{case_.oppositePartyName}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{case_.oppositePartyEmail}</span>
                      </div>
                      {case_.oppositePartyPhone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{case_.oppositePartyPhone}</span>
                        </div>
                      )}
                      {case_.oppositePartyAddress && (
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <span>
                            {case_.oppositePartyAddress.street}, {case_.oppositePartyAddress.city}, {case_.oppositePartyAddress.state} {case_.oppositePartyAddress.zipCode}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mediation Panel */}
              {case_.assignedPanel && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Mediation Panel</CardTitle>
                    <CardDescription>
                      Assigned on {formatDate(case_.assignedPanel.assignedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {case_.assignedPanel.members.map((member, index) => (
                        <div key={member._id} className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {member.role}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>{member.email}</p>
                            <p>{member.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Case Timeline</CardTitle>
                <CardDescription>Track the progress of your case</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {case_.timeline.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No timeline events yet</p>
                    </div>
                  ) : (
                    case_.timeline.map((event, index) => (
                      <div key={event._id} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          {index < case_.timeline.length - 1 && (
                            <div className="w-0.5 h-8 bg-border mx-auto mt-2" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{event.title}</h4>
                            {getStatusBadge(event.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>By {event.createdBy}</span>
                            <span>{formatDate(event.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Supporting Documents</CardTitle>
                <CardDescription>
                  {case_.proofFiles.length} file(s) uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                {case_.proofFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No files uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {case_.proofFiles.map((file) => (
                      <div key={file._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getFileIcon(file.type)}</span>
                            <div>
                              <p className="font-medium text-sm truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(file.uploadedAt)}
                          </span>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Witnesses Tab */}
          <TabsContent value="witnesses">
            <Card>
              <CardHeader>
                <CardTitle>Witnesses</CardTitle>
                <CardDescription>
                  {case_.witnesses.length} witness(es) added
                </CardDescription>
              </CardHeader>
              <CardContent>
                {case_.witnesses.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No witnesses added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {case_.witnesses.map((witness) => (
                      <div key={witness._id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">{witness.name}</h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4" />
                                <span>{witness.email}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4" />
                                <span>{witness.phone}</span>
                              </div>
                              <p><span className="font-medium">Relationship:</span> {witness.relationship}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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