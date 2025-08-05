import { useState } from 'react';
import { casesApi, CreateCaseData, Witness } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  FileText, 
  AlertCircle, 
  Loader2,
  Shield,
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  Zap,
  Star,
  Award,
  TrendingUp,
  Eye,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Scale,
  Menu
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateCaseFormProps {
  onBack: () => void;
  onSubmit: () => void;
}

interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
}

interface FormWitness {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
}

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

export function CreateCaseForm({ onBack, onSubmit }: CreateCaseFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    caseType: '',
    title: '',
    description: '',
    oppositePartyName: '',
    oppositePartyEmail: '',
    oppositePartyPhone: '',
    isPendingInCourt: false,
    firNumber: '',
    courtName: '',
  });
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [witnesses, setWitnesses] = useState<FormWitness[]>([]);
  const [newWitness, setNewWitness] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: ''
  });
  
  const { toast } = useToast();

  const caseTypes = [
    'Family', 'Business', 'Criminal', 'Property', 'Employment', 'Other'
  ];

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-4 h-4" />;
    if (type.startsWith('video/')) return <FileVideo className="w-4 h-4" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    const newFiles = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      file: file
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const addWitness = () => {
    if (newWitness.name && newWitness.email) {
      setWitnesses(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        ...newWitness
      }]);
      setNewWitness({ name: '', email: '', phone: '', relationship: '' });
    }
  };

  const removeWitness = (id: string) => {
    setWitnesses(prev => prev.filter(w => w.id !== id));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare case data
      const caseData: CreateCaseData = {
        caseType: formData.caseType as any,
        title: formData.title,
        description: formData.description,
        oppositePartyName: formData.oppositePartyName,
        oppositePartyEmail: formData.oppositePartyEmail,
        oppositePartyPhone: formData.oppositePartyPhone,
        isPendingInCourt: formData.isPendingInCourt,
        firNumber: formData.firNumber || undefined,
        courtName: formData.courtName || undefined,
        witnesses: witnesses.map(w => ({
          _id: w.id,
          name: w.name,
          email: w.email,
          phone: w.phone,
          relationship: w.relationship
        }))
      };

      // Create case
      const response = await casesApi.createCase(caseData);
      
      if (response.success && response.data?.case) {
        const caseId = response.data.case._id;
        
        // Upload files if any
        if (files.length > 0) {
          try {
            await casesApi.uploadFiles(caseId, files.map(f => f.file));
          } catch (uploadError) {
            console.error('File upload error:', uploadError);
            toast({
              title: "Warning",
              description: "Case created but some files failed to upload. You can add them later.",
              variant: "destructive",
            });
          }
        }

        toast({
          title: "Case submitted successfully",
          description: "Your case has been submitted for verification",
        });
        onSubmit();
      } else {
        throw new Error(response.message || 'Failed to create case');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Case Details', description: 'Basic information about your case', icon: FileText },
    { number: 2, title: 'Opposite Party', description: 'Information about the other party', icon: Users },
    { number: 3, title: 'Evidence & Witnesses', description: 'Upload proof and add witnesses', icon: Shield },
    { number: 4, title: 'Review & Submit', description: 'Review your case before submission', icon: CheckCircle }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-xl border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">ResolveIt</h1>
                <p className="text-xs text-gray-500">Create New Case</p>
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

          {/* Progress Steps */}
          <div className="flex-1 p-6">
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center space-x-4">
                  <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep >= step.number 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    <step.icon className="w-5 h-5" />
                    {currentStep > step.number && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-6 border-t border-gray-100">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 text-sm">Form Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Step</span>
                  <span className="font-semibold text-gray-900">{currentStep} of 4</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Files Uploaded</span>
                  <span className="font-semibold text-blue-600">{files.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Witnesses Added</span>
                  <span className="font-semibold text-green-600">{witnesses.length}</span>
                </div>
              </div>
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
                Create New Case
              </h1>
              <p className="text-sm text-gray-600">
                Step {currentStep} of 4: {steps[currentStep - 1].title}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <CustomButton variant="ghost" size="sm">
                <AlertCircle className="w-5 h-5" />
              </CustomButton>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Case Details */}
            {currentStep === 1 && (
              <CustomCard className="group hover:shadow-lg transition-all duration-300">
                <CustomCardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CustomCardTitle className="text-2xl font-bold text-gray-900">Case Details</CustomCardTitle>
                      <CustomCardDescription className="text-gray-600">
                        Provide basic information about your dispute
                      </CustomCardDescription>
                    </div>
                  </div>
                </CustomCardHeader>
                <CustomCardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="caseType" className="text-sm font-medium text-black">
                        Case Type *
                      </Label>
                      <Select value={formData.caseType} onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, caseType: value }))
                      }>
                        <SelectTrigger className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black">
                          <SelectValue placeholder="Select case type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300 text-black">
                          {caseTypes.map(type => (
                            <SelectItem key={type} value={type} className="text-gray-700">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium text-black">
                        Case Title *
                      </Label>
                      <Input
                        id="title"
                        placeholder="Brief title for your case"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                        className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-black">
                      Case Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed description of your dispute..."
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                      className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 resize-none text-black"
                    />
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <Checkbox
                      id="pending-court"
                      checked={formData.isPendingInCourt}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, isPendingInCourt: checked as boolean }))
                      }
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label htmlFor="pending-court" className="text-sm font-medium text-black">
                      This case is pending in court or with police
                    </Label>
                  </div>

                  {formData.isPendingInCourt && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="firNumber" className="text-sm font-medium text-black">
                          FIR Number (if applicable)
                        </Label>
                        <Input
                          id="firNumber"
                          placeholder="FIR-YYYY-XXXXXX"
                          value={formData.firNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, firNumber: e.target.value }))}
                          className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="courtName" className="text-sm font-medium text-black">
                          Court Name (if applicable)
                        </Label>
                        <Input
                          id="courtName"
                          placeholder="Name of the court"
                          value={formData.courtName}
                          onChange={(e) => setFormData(prev => ({ ...prev, courtName: e.target.value }))}
                          className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                        />
                      </div>
                    </div>
                  )}
                </CustomCardContent>
              </CustomCard>
            )}

            {/* Step 2: Opposite Party */}
            {currentStep === 2 && (
              <CustomCard className="group hover:shadow-lg transition-all duration-300">
                <CustomCardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CustomCardTitle className="text-2xl font-bold text-gray-900">Opposite Party Information</CustomCardTitle>
                      <CustomCardDescription className="text-gray-600">
                        Details about the other party in this dispute
                      </CustomCardDescription>
                    </div>
                  </div>
                </CustomCardHeader>
                <CustomCardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="oppositePartyName" className="text-sm font-medium text-black">
                        Name *
                      </Label>
                      <Input
                        id="oppositePartyName"
                        placeholder="Full name of the opposite party"
                        value={formData.oppositePartyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, oppositePartyName: e.target.value }))}
                        required
                        className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="oppositePartyEmail" className="text-sm font-medium text-black">
                        Email Address *
                      </Label>
                      <Input
                        id="oppositePartyEmail"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.oppositePartyEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, oppositePartyEmail: e.target.value }))}
                        required
                        className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="oppositePartyPhone" className="text-sm font-medium text-black">
                      Phone Number
                    </Label>
                    <Input
                      id="oppositePartyPhone"
                      placeholder="+1-555-0123"
                      value={formData.oppositePartyPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, oppositePartyPhone: e.target.value }))}
                      className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>
                </CustomCardContent>
              </CustomCard>
            )}

            {/* Step 3: Evidence & Witnesses */}
            {currentStep === 3 && (
              <CustomCard className="group hover:shadow-lg transition-all duration-300">
                <CustomCardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CustomCardTitle className="text-2xl font-bold text-gray-900">Evidence & Witnesses</CustomCardTitle>
                      <CustomCardDescription className="text-gray-600">
                        Upload supporting documents and add witness information
                      </CustomCardDescription>
                    </div>
                  </div>
                </CustomCardHeader>
                <CustomCardContent className="space-y-8">
                  {/* File Upload */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-black">
                      Supporting Documents
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Upload your evidence
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Upload images, audio, video, or documents to support your case
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <CustomButton 
                        type="button" 
                        variant="outline" 
                        className="bg-white border-gray-300 hover:border-blue-500"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </CustomButton>
                    </div>

                    {files.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">Uploaded Files ({files.length})</h4>
                        {files.map(file => (
                          <div key={file.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                {getFileIcon(file.type)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <CustomButton
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </CustomButton>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Witnesses */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-black">
                      Witnesses (Optional)
                    </Label>
                    
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="witnessName" className="text-sm font-medium text-black">Name</Label>
                                                      <Input
                              id="witnessName"
                              placeholder="Witness name"
                              value={newWitness.name}
                              onChange={(e) => setNewWitness(prev => ({ ...prev, name: e.target.value }))}
                              className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="witnessEmail" className="text-sm font-medium text-black">Email</Label>
                                                      <Input
                              id="witnessEmail"
                              type="email"
                              placeholder="witness@example.com"
                              value={newWitness.email}
                              onChange={(e) => setNewWitness(prev => ({ ...prev, email: e.target.value }))}
                              className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="witnessPhone" className="text-sm font-medium text-black">Phone</Label>
                                                      <Input
                              id="witnessPhone"
                              placeholder="+1-555-0123"
                              value={newWitness.phone}
                              onChange={(e) => setNewWitness(prev => ({ ...prev, phone: e.target.value }))}
                              className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="witnessRelationship" className="text-sm font-medium text-black">Relationship</Label>
                                                      <Input
                              id="witnessRelationship"
                              placeholder="e.g., Colleague, Neighbor"
                              value={newWitness.relationship}
                              onChange={(e) => setNewWitness(prev => ({ ...prev, relationship: e.target.value }))}
                              className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>
                      </div>
                      <div className="mt-4">
                        <CustomButton type="button" onClick={addWitness} variant="outline" className="w-full bg-white border-gray-300 hover:border-blue-500">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Witness
                        </CustomButton>
                      </div>
                    </div>

                    {witnesses.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">Added Witnesses ({witnesses.length})</h4>
                        {witnesses.map(witness => (
                          <div key={witness.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{witness.name}</p>
                              <p className="text-xs text-gray-500">
                                {witness.email} • {witness.relationship}
                              </p>
                            </div>
                            <CustomButton
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWitness(witness.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </CustomButton>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CustomCardContent>
              </CustomCard>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <CustomCard className="group hover:shadow-lg transition-all duration-300">
                <CustomCardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CustomCardTitle className="text-2xl font-bold text-gray-900">Review Your Case</CustomCardTitle>
                      <CustomCardDescription className="text-gray-600">
                        Please review all information before submitting
                      </CustomCardDescription>
                    </div>
                  </div>
                </CustomCardHeader>
                <CustomCardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">Case Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Type:</span>
                          <CustomBadge variant="outline" className="bg-white border-blue-300 text-blue-700">
                            {formData.caseType}
                          </CustomBadge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Title:</span>
                          <span className="text-right text-gray-900 font-medium">{formData.title}</span>
                        </div>
                        {formData.isPendingInCourt && (
                          <div className="flex justify-between">
                            <span className="text-blue-700">Status:</span>
                            <CustomBadge variant="secondary" className="bg-amber-100 text-amber-700">
                              Pending in Court
                            </CustomBadge>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-3">Opposite Party</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-700">Name:</span>
                          <span className="text-gray-900 font-medium">{formData.oppositePartyName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Email:</span>
                          <span className="text-gray-900">{formData.oppositePartyEmail}</span>
                        </div>
                        {formData.oppositePartyPhone && (
                          <div className="flex justify-between">
                            <span className="text-purple-700">Phone:</span>
                            <span className="text-gray-900">{formData.oppositePartyPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Description</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {formData.description}
                    </p>
                  </div>

                  {files.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-3">Uploaded Files ({files.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {files.map(file => (
                          <div key={file.id} className="p-2 bg-white rounded text-xs text-center border border-green-200">
                            {file.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {witnesses.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-3">Witnesses ({witnesses.length})</h4>
                      <div className="space-y-2">
                        {witnesses.map(witness => (
                          <div key={witness.id} className="text-sm p-2 bg-white rounded border border-orange-200">
                            {witness.name} - {witness.relationship}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Next Steps</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          After submission, your case will be reviewed and verified. 
                          You'll receive updates via email and can track progress in your dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <CustomButton
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="border-gray-300 bg-white text-gray-700 hover:border-blue-500"
              >
                Previous
              </CustomButton>

              <div className="flex space-x-4">
                {currentStep < 4 ? (
                  <CustomButton
                    type="button"
                    onClick={handleNext}
                    disabled={
                      (currentStep === 1 && (!formData.caseType || !formData.title || !formData.description)) ||
                      (currentStep === 2 && (!formData.oppositePartyName || !formData.oppositePartyEmail))
                    }
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Next
                  </CustomButton>
                ) : (
                  <CustomButton 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Case
                      </>
                    )}
                  </CustomButton>
                )}
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}