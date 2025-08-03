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
  MapPin,
  Scale,
  Menu,
  X,
  TrendingUp,
  Shield,
  Bell,
  Settings,
  LogOut,
  Search,
  Filter,
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
  Clock3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CaseDetailsProps {
  caseId: string;
  onBack: () => void;
}

type TabType = 'overview' | 'timeline' | 'files' | 'witnesses';

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

// Custom components matching the UI design
const CustomCard = ({ children, className }: any) => (
  <div className={`rounded-lg border bg-white border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CustomCardHeader = ({ children, className }: any) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CustomCardTitle = ({ children, className }: any) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CustomCardDescription = ({ children, className }: any) => (
  <p className={`text-sm text-gray-500 ${className}`}>
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

const CustomButton = ({ children, className, variant = 'default', size = 'default', onClick, disabled, ...props }: any) => {
  const baseClass = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
    disabled: "border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
  };
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8"
  };
  
  const variantClass = disabled ? variants.disabled : variants[variant];
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export function CaseDetails({ caseId, onBack }: CaseDetailsProps) {
  const { toast } = useToast();
  const [case_, setCase] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

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

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleDownloadFiles = () => {
    if (case_?.proofFiles && case_.proofFiles.length > 0) {
      toast({
        title: "Download Started",
        description: "Preparing files for download...",
      });
      // TODO: Implement actual file download logic
    } else {
      toast({
        title: "No Files",
        description: "No files available for download.",
        variant: "destructive",
      });
    }
  };

  const handleViewTimeline = () => {
    setActiveTab('timeline');
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error || !case_) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CustomButton variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </CustomButton>
          
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2 text-gray-900">Error loading case</h3>
            <p className="text-gray-500 mb-4">{error || 'Case not found'}</p>
            <CustomButton onClick={loadCaseDetails} variant="outline">
              Try Again
            </CustomButton>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
  return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Case Information */}
                <CustomCard className="group hover:shadow-lg transition-all duration-300">
                  <CustomCardHeader>
                <CustomCardTitle>Case Information</CustomCardTitle>
                  </CustomCardHeader>
                  <CustomCardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Case Type</p>
                        <p className="font-medium text-gray-900">{case_.caseType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(case_.status)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created</p>
                        <p className="font-medium text-gray-900">{formatDate(case_.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Updated</p>
                        <p className="font-medium text-gray-900">{formatDate(case_.updatedAt)}</p>
                      </div>
                    </div>

                    {case_.isPendingInCourt && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <h4 className="font-medium text-amber-900 mb-2">Court Proceeding</h4>
                        <div className="space-y-2 text-sm">
                          {case_.firNumber && (
                            <p><span className="font-medium text-amber-700">FIR Number:</span> {case_.firNumber}</p>
                          )}
                          {case_.courtName && (
                            <p><span className="font-medium text-amber-700">Court:</span> {case_.courtName}</p>
                          )}
                          {case_.policeStation && (
                            <p><span className="font-medium text-amber-700">Police Station:</span> {case_.policeStation}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {case_.resolutionDetails && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Resolution Details</h4>
                        <p className="text-sm text-green-700">{case_.resolutionDetails}</p>
                      </div>
                    )}
                  </CustomCardContent>
                </CustomCard>

                {/* Opposite Party */}
                <CustomCard className="group hover:shadow-lg transition-all duration-300">
                  <CustomCardHeader>
                <CustomCardTitle>Opposite Party</CustomCardTitle>
                  </CustomCardHeader>
                  <CustomCardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 text-gray-900">{case_.oppositePartyName}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{case_.oppositePartyEmail}</span>
                        </div>
                        {case_.oppositePartyPhone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{case_.oppositePartyPhone}</span>
                          </div>
                        )}
                        {case_.oppositePartyAddress && (
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span className="text-gray-600">
                              {case_.oppositePartyAddress.street}, {case_.oppositePartyAddress.city}, {case_.oppositePartyAddress.state} {case_.oppositePartyAddress.zipCode}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CustomCardContent>
                </CustomCard>

                {/* Mediation Panel */}
                {case_.assignedPanel && (
                  <CustomCard className="lg:col-span-2 group hover:shadow-lg transition-all duration-300">
                    <CustomCardHeader>
                  <CustomCardTitle>Mediation Panel</CustomCardTitle>
                  <CustomCardDescription>
                        Assigned on {formatDate(case_.assignedPanel.assignedAt)}
                      </CustomCardDescription>
                    </CustomCardHeader>
                    <CustomCardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {case_.assignedPanel.members.map((member, index) => (
                          <div key={member._id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex items-center space-x-3 mb-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                  {member.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{member.name}</p>
                                <CustomBadge variant="outline" className="text-xs bg-white border-blue-300 text-blue-700">
                                  {member.role}
                                </CustomBadge>
                              </div>
                            </div>
                            <div className="space-y-1 text-sm text-gray-500">
                              <p>{member.email}</p>
                              <p>{member.phone}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CustomCardContent>
                  </CustomCard>
                )}
              </div>
        );

      case 'timeline':
        return (
              <CustomCard className="group hover:shadow-lg transition-all duration-300">
                <CustomCardHeader>
              <CustomCardTitle>Case Timeline</CustomCardTitle>
              <CustomCardDescription>Track the progress of your case</CustomCardDescription>
                </CustomCardHeader>
                <CustomCardContent>
                  <div className="space-y-6">
                    {case_.timeline.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No timeline events yet</p>
                      </div>
                    ) : (
                      case_.timeline.map((event, index) => (
                        <div key={event._id} className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            {index < case_.timeline.length - 1 && (
                              <div className="w-0.5 h-8 bg-gray-200 mx-auto mt-2" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900">{event.title}</h4>
                              {getStatusBadge(event.status)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {event.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>By {event.createdBy}</span>
                              <span>{formatDate(event.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CustomCardContent>
              </CustomCard>
        );

      case 'files':
        return (
              <CustomCard className="group hover:shadow-lg transition-all duration-300">
                <CustomCardHeader>
              <CustomCardTitle>Supporting Documents</CustomCardTitle>
              <CustomCardDescription>
                    {case_.proofFiles.length} file(s) uploaded
                  </CustomCardDescription>
                </CustomCardHeader>
                <CustomCardContent>
                  {case_.proofFiles.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No files uploaded yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {case_.proofFiles.map((file) => (
                        <div key={file._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{getFileIcon(file.type)}</span>
                              <div>
                                <p className="font-medium text-sm truncate text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatDate(file.uploadedAt)}
                            </span>
                            <div className="flex space-x-2">
                              <CustomButton size="sm" variant="outline">
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </CustomButton>
                              <CustomButton size="sm" variant="outline">
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </CustomButton>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CustomCardContent>
              </CustomCard>
        );

      case 'witnesses':
        return (
              <CustomCard className="group hover:shadow-lg transition-all duration-300">
                <CustomCardHeader>
              <CustomCardTitle>Witnesses</CustomCardTitle>
              <CustomCardDescription>
                    {case_.witnesses.length} witness(es) added
                  </CustomCardDescription>
                </CustomCardHeader>
                <CustomCardContent>
                  {case_.witnesses.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No witnesses added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {case_.witnesses.map((witness) => (
                        <div key={witness._id} className="p-4 border border-gray-200 rounded-lg bg-white">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium mb-2 text-gray-900">{witness.name}</h4>
                              <div className="space-y-1 text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4" />
                                  <span>{witness.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{witness.phone}</span>
                                </div>
                                <p><span className="font-medium text-gray-700">Relationship:</span> {witness.relationship}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CustomCardContent>
              </CustomCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-xl border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">ResolveIt</h1>
                <p className="text-xs text-gray-500">Case Details</p>
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

          {/* Case Info */}
          <div className="flex-1 p-6">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Case #{case_._id.slice(-8)}</h3>
                  <p className="text-xs text-gray-500">{case_.caseType}</p>
                </div>
              </div>
              
              {getStatusBadge(case_.status)}
            </div>

            {/* Case Stats */}
            <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 text-sm">Case Info</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(case_.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Files</span>
                  <span className="font-semibold text-blue-600">
                    {case_.proofFiles?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Witnesses</span>
                  <span className="font-semibold text-green-600">
                    {case_.witnesses?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <CustomButton 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleDownloadFiles}
                disabled={!case_.proofFiles || case_.proofFiles.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Files
              </CustomButton>
              <CustomButton 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleViewTimeline}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Timeline
              </CustomButton>
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
              <h1 className="text-2xl font-bold text-gray-900">
                {case_.title}
              </h1>
              <p className="text-sm text-gray-600">
                Case #{case_._id.slice(-8)} • {case_.caseType}
              </p>
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
        <main className="flex-1 overflow-y-auto p-6">
          {/* Case Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-gray-900">{case_.title}</h2>
                <div className="flex items-center space-x-3 mb-4">
                  <CustomBadge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 font-semibold">
                    {case_.caseType}
                  </CustomBadge>
                  {getStatusBadge(case_.status)}
                  <span className="text-sm text-gray-500">
                    Created {formatDate(case_.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-lg leading-relaxed">
              {case_.description}
            </p>
          </div>

          {/* Custom Tabs */}
          <div className="space-y-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button 
                  className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabChange('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                    activeTab === 'timeline'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabChange('timeline')}
                >
                  Timeline
                </button>
                <button 
                  className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                    activeTab === 'files'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabChange('files')}
                >
                  Files
                </button>
                <button 
                  className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                    activeTab === 'witnesses'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabChange('witnesses')}
                >
                  Witnesses
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}