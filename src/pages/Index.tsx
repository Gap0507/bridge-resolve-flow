import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/Auth/LoginForm';
import { UserDashboard } from '@/components/Dashboard/UserDashboard';
import { AdminDashboard } from '@/components/Admin/AdminDashboard';
import { CreateCaseForm } from '@/components/Case/CreateCaseForm';
import { CaseDetails } from '@/components/Case/CaseDetails';

type AppView = 'login' | 'dashboard' | 'create-case' | 'case-details';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onSuccess={() => setCurrentView('dashboard')} />;
  }

  const handleCreateCase = () => {
    setCurrentView('create-case');
  };

  const handleViewCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentView('case-details');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedCaseId(null);
  };

  const handleCaseSubmitted = () => {
    setCurrentView('dashboard');
  };

  switch (currentView) {
    case 'create-case':
      return (
        <CreateCaseForm 
          onBack={handleBackToDashboard}
          onSubmit={handleCaseSubmitted}
        />
      );
    
    case 'case-details':
      return selectedCaseId ? (
        <CaseDetails 
          caseId={selectedCaseId}
          onBack={handleBackToDashboard}
        />
      ) : null;
    
    case 'dashboard':
    default:
      return user.role === 'admin' ? (
        <AdminDashboard onViewCase={handleViewCase} />
      ) : (
        <UserDashboard 
          onCreateCase={handleCreateCase}
          onViewCase={handleViewCase}
        />
      );
  }
}

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;