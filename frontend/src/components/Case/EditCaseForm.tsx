import { useState, useEffect } from 'react';
import { casesApi, Case, Witness } from '@/services/api';
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
  Menu,
  Save,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditCaseFormProps {
  caseId: string;
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
    default: "bg-blue-600 hover:bg-blue-700 text-white",
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

export function EditCaseForm({ caseId, onBack, onSubmit }: EditCaseFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [caseData, setCaseData] = useState<Case | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    caseType: '',
    title: '',
    description: '',
    oppositePartyName: '',
    oppositePartyEmail: '',
    oppositePartyPhone: '',
    oppositePartyAddress: {
      street: '',
      city: '',
      zipCode: '',
      state: ''
    },
    isPendingInCourt: false,
    firNumber: '',
    courtName: '',
    policeStation: ''
  });

  const [witnesses, setWitnesses] = useState<FormWitness[]>([]);
  const [newFiles, setNewFiles] = useState<FileUpload[]>([]);

  // Load case data
  useEffect(() => {
    loadCaseData();
  }, [caseId]);

  const loadCaseData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await casesApi.getCase(caseId);
      
      if (response.success && response.data?.case) {
        const case_ = response.data.case;
        setCaseData(case_);
        
        // Populate form data
        setFormData({
          caseType: case_.caseType,
          title: case_.title,
          description: case_.description,
          oppositePartyName: case_.oppositePartyName,
          oppositePartyEmail: case_.oppositePartyEmail,
          oppositePartyPhone: case_.oppositePartyPhone,
          oppositePartyAddress: case_.oppositePartyAddress || {
            street: '',
            city: '',
            zipCode: '',
            state: ''
          },
          isPendingInCourt: case_.isPendingInCourt,
          firNumber: case_.firNumber || '',
          courtName: case_.courtName || '',
          policeStation: case_.policeStation || ''
        });

        // Convert witnesses to form format
        const formWitnesses = case_.witnesses.map((witness, index) => ({
          id: witness._id || `witness-${index}`,
          name: witness.name,
          email: witness.email,
          phone: witness.phone,
          relationship: witness.relationship
        }));
        setWitnesses(formWitnesses);
      } else {
        setError('Failed to load case data');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load case data');
      toast({
        title: "Error",
        description: "Failed to load case data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <FileImage className="w-4 h-4" />;
    if (type.includes('video')) return <FileVideo className="w-4 h-4" />;
    if (type.includes('audio')) return <FileAudio className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFileUploads = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      file
    }));
    setNewFiles(prev => [...prev, ...newFileUploads]);
  };

  const removeFile = (id: string) => {
    setNewFiles(prev => prev.filter(file => file.id !== id));
  };

  const addWitness = () => {
    const newWitness: FormWitness = {
      id: `new-witness-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      email: '',
      phone: '',
      relationship: ''
    };
    setWitnesses(prev => [...prev, newWitness]);
  };

  const removeWitness = (id: string) => {
    setWitnesses(prev => prev.filter(witness => witness.id !== id));
  };

  const updateWitness = (id: string, field: keyof FormWitness, value: string) => {
    setWitnesses(prev => prev.map(witness => 
      witness.id === id ? { ...witness, [field]: value } : witness
    ));
  };

  const handleNext = () => {
    if (currentStep < 3) {
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
    
    try {
      setIsSaving(true);
      
      // Prepare update data
      const updateData = {
        ...formData,
        caseType: formData.caseType as 'Family' | 'Business' | 'Criminal' | 'Property' | 'Employment' | 'Other',
        witnesses: witnesses.map(witness => {
          // Only include _id if it's a valid MongoDB ObjectId (24 character hex string)
          const witnessData: any = {
            name: witness.name,
            email: witness.email,
            phone: witness.phone,
            relationship: witness.relationship
          };
          
          // Only add _id if it's a valid ObjectId (24 character hex string)
          if (witness.id && witness.id.length === 24 && /^[0-9a-fA-F]{24}$/.test(witness.id)) {
            witnessData._id = witness.id;
          }
          
          return witnessData;
        })
      };

      // Update case
      const response = await casesApi.updateCase(caseId, updateData);
      
      if (response.success) {
        // Upload new files if any
        if (newFiles.length > 0) {
          const files = newFiles.map(f => f.file);
          await casesApi.uploadFiles(caseId, files);
        }

        toast({
          title: "Success",
          description: "Case updated successfully",
        });
        
        onSubmit();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update case",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update case",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const canEditCase = () => {
    if (!caseData) return false;
    return ['Pending Verification', 'Verified', 'Awaiting Response'].includes(caseData.status);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading case data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 text-gray-900">Error loading case</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <CustomButton variant="outline" onClick={onBack}>
            Go Back
          </CustomButton>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 text-gray-900">Case not found</h3>
          <CustomButton variant="outline" onClick={onBack}>
            Go Back
          </CustomButton>
        </div>
      </div>
    );
  }

  if (!canEditCase()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 text-gray-900">Cannot Edit Case</h3>
          <p className="text-gray-500 mb-4">
            This case cannot be edited because it has progressed beyond the editable stage.
          </p>
          <CustomButton variant="outline" onClick={onBack}>
            Go Back
          </CustomButton>
        </div>
      </div>
    );
  }

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
                <p className="text-xs text-gray-500">Edit Case</p>
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
              {[
                { number: 1, title: 'Basic Information', description: 'Update case details', icon: FileText },
                { number: 2, title: 'Witnesses', description: 'Manage witnesses', icon: Users },
                { number: 3, title: 'Files', description: 'Upload additional files', icon: Shield }
              ].map((step, index) => (
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
              <h4 className="font-medium text-gray-900 mb-3 text-sm">Edit Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Step</span>
                  <span className="font-semibold text-gray-900">{currentStep} of 3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Witnesses</span>
                  <span className="font-semibold text-green-600">{witnesses.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">New Files</span>
                  <span className="font-semibold text-blue-600">{newFiles.length}</span>
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
                Edit Case
              </h1>
              <p className="text-sm text-gray-600">
                Step {currentStep} of 3: {currentStep === 1 ? 'Basic Information' : currentStep === 2 ? 'Witnesses' : 'Files'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <CustomBadge className="bg-blue-100 text-blue-700 border-blue-200">
                {caseData.status}
              </CustomBadge>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
                      {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <CustomCard className="group hover:shadow-lg transition-all duration-300">
                <CustomCardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CustomCardTitle className="text-2xl font-bold text-gray-900">Basic Information</CustomCardTitle>
                      <CustomCardDescription className="text-gray-600">
                        Update case details and opposite party information
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
                          <SelectItem value="Family" className="text-gray-700">Family</SelectItem>
                          <SelectItem value="Business" className="text-gray-700">Business</SelectItem>
                          <SelectItem value="Criminal" className="text-gray-700">Criminal</SelectItem>
                          <SelectItem value="Property" className="text-gray-700">Property</SelectItem>
                          <SelectItem value="Employment" className="text-gray-700">Employment</SelectItem>
                          <SelectItem value="Other" className="text-gray-700">Other</SelectItem>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="oppositePartyName" className="text-sm font-medium text-black">
                        Opposite Party Name *
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
                      {currentStep < 3 ? (
                        <CustomButton
                          type="button"
                          onClick={handleNext}
                          disabled={
                            (currentStep === 1 && (!formData.caseType || !formData.title || !formData.description || !formData.oppositePartyName || !formData.oppositePartyEmail))
                          }
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          Next
                        </CustomButton>
                      ) : (
                        <CustomButton 
                          type="submit" 
                          disabled={isSaving}
                          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </CustomButton>
                      )}
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>
            )}

                      {/* Step 2: Witnesses */}
            {currentStep === 2 && (
              <CustomCard className="group hover:shadow-lg transition-all duration-300">
                <CustomCardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CustomCardTitle className="text-2xl font-bold text-gray-900">Witnesses</CustomCardTitle>
                      <CustomCardDescription className="text-gray-600">
                        Add or update witnesses for your case
                      </CustomCardDescription>
                    </div>
                  </div>
                </CustomCardHeader>
                <CustomCardContent className="space-y-8">
                  {/* Existing Witnesses */}
                  {witnesses.map((witness, index) => (
                    <div key={witness.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Witness {index + 1}</h4>
                        <CustomButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWitness(witness.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </CustomButton>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-black">Name</Label>
                          <Input
                            value={witness.name}
                            onChange={(e) => updateWitness(witness.id, 'name', e.target.value)}
                            className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="Enter witness name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-black">Email</Label>
                          <Input
                            type="email"
                            value={witness.email}
                            onChange={(e) => updateWitness(witness.id, 'email', e.target.value)}
                            className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="Enter email"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-black">Phone</Label>
                          <Input
                            value={witness.phone}
                            onChange={(e) => updateWitness(witness.id, 'phone', e.target.value)}
                            className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="Enter phone"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-black">Relationship</Label>
                          <Input
                            value={witness.relationship}
                            onChange={(e) => updateWitness(witness.id, 'relationship', e.target.value)}
                            className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                            placeholder="Enter relationship"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add New Witness */}
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4">Add New Witness</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-black">Name</Label>
                        <Input
                          className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                          placeholder="Witness name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-black">Email</Label>
                        <Input
                          type="email"
                          className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                          placeholder="witness@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-black">Phone</Label>
                        <Input
                          className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                          placeholder="+1-555-0123"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-black">Relationship</Label>
                        <Input
                          className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
                          placeholder="e.g., Colleague, Neighbor"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <CustomButton
                        type="button"
                        variant="outline"
                        onClick={addWitness}
                        className="w-full bg-white border-gray-300 hover:border-blue-500"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Witness
                      </CustomButton>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8">
                    <CustomButton
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      className="border-gray-300 bg-white text-gray-700 hover:border-blue-500"
                    >
                      Previous
                    </CustomButton>

                    <CustomButton
                      type="button"
                      onClick={handleNext}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Next
                    </CustomButton>
                  </div>
                </CustomCardContent>
              </CustomCard>
            )}

                      {/* Step 3: Files */}
            {currentStep === 3 && (
              <CustomCard className="group hover:shadow-lg transition-all duration-300">
                <CustomCardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CustomCardTitle className="text-2xl font-bold text-gray-900">Additional Files</CustomCardTitle>
                      <CustomCardDescription className="text-gray-600">
                        Upload additional supporting documents
                      </CustomCardDescription>
                    </div>
                  </div>
                </CustomCardHeader>
                <CustomCardContent className="space-y-8">
                  {/* Existing Files */}
                  {caseData.proofFiles && caseData.proofFiles.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-black">
                        Existing Files ({caseData.proofFiles.length})
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {caseData.proofFiles.map((file) => (
                          <div key={file._id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-black">
                      Upload New Files
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

                    {newFiles.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">New Files to Upload ({newFiles.length})</h4>
                        {newFiles.map(file => (
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

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8">
                    <CustomButton
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      className="border-gray-300 bg-white text-gray-700 hover:border-blue-500"
                    >
                      Previous
                    </CustomButton>

                    <CustomButton 
                      type="submit" 
                      disabled={isSaving}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </CustomButton>
                  </div>
                </CustomCardContent>
              </CustomCard>
            )}
        </form>
        </main>
      </div>
    </div>
  );
} 