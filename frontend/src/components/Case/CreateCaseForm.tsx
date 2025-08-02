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
import { ArrowLeft, Upload, X, Plus, FileText, AlertCircle, Loader2 } from 'lucide-react';
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
    { number: 1, title: 'Case Details', description: 'Basic information about your case' },
    { number: 2, title: 'Opposite Party', description: 'Information about the other party' },
    { number: 3, title: 'Evidence & Witnesses', description: 'Upload proof and add witnesses' },
    { number: 4, title: 'Review & Submit', description: 'Review your case before submission' }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
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
            <h1 className="text-2xl font-bold">Create New Case</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center ${index !== steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.number 
                      ? 'bg-primary text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.number}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index !== steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Case Details */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Case Details</CardTitle>
                <CardDescription>
                  Provide basic information about your dispute
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="caseType">Case Type *</Label>
                  <Select value={formData.caseType} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, caseType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select case type" />
                    </SelectTrigger>
                    <SelectContent>
                      {caseTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Case Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief title for your case"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Case Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of your dispute..."
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pending-court"
                    checked={formData.isPendingInCourt}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isPendingInCourt: checked as boolean }))
                    }
                  />
                  <Label htmlFor="pending-court">
                    This case is pending in court or with police
                  </Label>
                </div>

                {formData.isPendingInCourt && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-warning/5 border border-warning/20 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="firNumber">FIR Number (if applicable)</Label>
                      <Input
                        id="firNumber"
                        placeholder="FIR-YYYY-XXXXXX"
                        value={formData.firNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, firNumber: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courtName">Court Name (if applicable)</Label>
                      <Input
                        id="courtName"
                        placeholder="Name of the court"
                        value={formData.courtName}
                        onChange={(e) => setFormData(prev => ({ ...prev, courtName: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Opposite Party */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Opposite Party Information</CardTitle>
                <CardDescription>
                  Details about the other party in this dispute
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="oppositePartyName">Name *</Label>
                  <Input
                    id="oppositePartyName"
                    placeholder="Full name of the opposite party"
                    value={formData.oppositePartyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, oppositePartyName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oppositePartyEmail">Email Address *</Label>
                  <Input
                    id="oppositePartyEmail"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.oppositePartyEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, oppositePartyEmail: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oppositePartyPhone">Phone Number</Label>
                  <Input
                    id="oppositePartyPhone"
                    placeholder="+1-555-0123"
                    value={formData.oppositePartyPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, oppositePartyPhone: e.target.value }))}
                  />
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-primary">Important Notice</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        The opposite party will be notified about this case via email once it's verified. 
                        Please ensure the contact information is accurate.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Evidence & Witnesses */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Evidence & Witnesses</CardTitle>
                <CardDescription>
                  Upload supporting documents and add witness information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div className="space-y-4">
                  <Label>Supporting Documents</Label>
                  <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload images, audio, video, or documents
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button type="button" variant="outline">Choose Files</Button>
                    </Label>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Witnesses */}
                <div className="space-y-4">
                  <Label>Witnesses (Optional)</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="witnessName">Name</Label>
                      <Input
                        id="witnessName"
                        placeholder="Witness name"
                        value={newWitness.name}
                        onChange={(e) => setNewWitness(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="witnessEmail">Email</Label>
                      <Input
                        id="witnessEmail"
                        type="email"
                        placeholder="witness@example.com"
                        value={newWitness.email}
                        onChange={(e) => setNewWitness(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="witnessPhone">Phone</Label>
                      <Input
                        id="witnessPhone"
                        placeholder="+1-555-0123"
                        value={newWitness.phone}
                        onChange={(e) => setNewWitness(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="witnessRelationship">Relationship</Label>
                      <Input
                        id="witnessRelationship"
                        placeholder="e.g., Colleague, Neighbor"
                        value={newWitness.relationship}
                        onChange={(e) => setNewWitness(prev => ({ ...prev, relationship: e.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="button" onClick={addWitness} variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Witness
                      </Button>
                    </div>
                  </div>

                  {witnesses.length > 0 && (
                    <div className="space-y-2">
                      {witnesses.map(witness => (
                        <div key={witness.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{witness.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {witness.email} • {witness.relationship}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeWitness(witness.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Case</CardTitle>
                <CardDescription>
                  Please review all information before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Case Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">{formData.caseType}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Title:</span>
                        <span className="text-right">{formData.title}</span>
                      </div>
                      {formData.isPendingInCourt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant="secondary">Pending in Court</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Opposite Party</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{formData.oppositePartyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{formData.oppositePartyEmail}</span>
                      </div>
                      {formData.oppositePartyPhone && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{formData.oppositePartyPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {formData.description}
                  </p>
                </div>

                {files.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Uploaded Files ({files.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {files.map(file => (
                        <div key={file.id} className="p-2 bg-muted rounded text-xs text-center">
                          {file.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {witnesses.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Witnesses ({witnesses.length})</h4>
                    <div className="space-y-2">
                      {witnesses.map(witness => (
                        <div key={witness.id} className="text-sm p-2 bg-muted rounded">
                          {witness.name} - {witness.relationship}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-primary">Next Steps</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        After submission, your case will be reviewed and verified. 
                        You'll receive updates via email and can track progress in your dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex space-x-4">
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && (!formData.caseType || !formData.title || !formData.description)) ||
                    (currentStep === 2 && (!formData.oppositePartyName || !formData.oppositePartyEmail))
                  }
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  variant="professional"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Case'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}