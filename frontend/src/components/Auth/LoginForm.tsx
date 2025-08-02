import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Scale, UserPlus, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLoginMode) {
        // Login mode
        const success = await login(email, password);
        if (success) {
          onSuccess();
        } else {
          setError('Invalid email or password. Please try again.');
        }
      } else {
        // Register mode
        const response = await authApi.register({
          name,
          email,
          password
        });
        
        if (response.success && response.data?.token) {
          // Auto-login after successful registration
          const loginSuccess = await login(email, password);
          if (loginSuccess) {
            toast({
              title: "Registration successful",
              description: "Welcome to ResolveIt! Your account has been created and you are now logged in.",
            });
            onSuccess();
          } else {
            toast({
              title: "Registration successful",
              description: "Account created successfully. Please log in with your credentials.",
            });
            // Switch back to login mode
            setIsLoginMode(true);
            setError('');
          }
        } else {
          setError(response.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    }
    
    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary-glow/5 p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLoginMode 
              ? 'Sign in to your account to access the dispute resolution platform'
              : 'Create a new account to start resolving disputes'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLoginMode}
                  className="h-11"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-11 w-11 px-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>



            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              variant="professional"
              className="w-full h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                'Processing...'
              ) : isLoginMode ? (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 border-t pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                {isLoginMode ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button 
                variant="outline" 
                onClick={toggleMode}
                className="w-full"
              >
                {isLoginMode ? 'Create New Account' : 'Sign In Instead'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}