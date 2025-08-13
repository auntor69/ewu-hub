import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { mockApi } from '../../lib/mockApi';
import { setCurrentUser } from '../../mocks/users';
import { useToast } from '../../hooks/useToast';
import { Role } from '../../lib/types';

export function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Sign In Form
  const [signInData, setSignInData] = useState({
    email: searchParams.get('role') === 'student' ? 'ahmed.rahman@student.ewu.edu' : '',
    password: 'demo123',
  });

  // Sign Up Form
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: (searchParams.get('role') as Role) || 'student',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateSignUp = () => {
    const newErrors: Record<string, string> = {};
    
    if (!signUpData.name.trim()) newErrors.name = 'Full name is required';
    if (!signUpData.email.trim()) newErrors.email = 'Email is required';
    if (signUpData.email && !signUpData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (!signUpData.password) newErrors.password = 'Password is required';
    if (signUpData.password && signUpData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (signUpData.password !== signUpData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = await mockApi.signIn(signInData.email, signInData.password);
      setCurrentUser(user);
      toast({
        title: 'Welcome back!',
        description: `Signed in as ${user.name}`,
        variant: 'success',
      });
      navigate(`/${user.role}`);
    } catch (error) {
      toast({
        title: 'Sign in failed',
        description: 'Invalid credentials. Try demo accounts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUp()) return;
    
    setLoading(true);
    
    try {
      const user = await mockApi.signUp({
        name: signUpData.name,
        email: signUpData.email,
        role: signUpData.role,
      });
      setCurrentUser(user);
      toast({
        title: 'Account created!',
        description: `Welcome to EWU Hub, ${user.name}`,
        variant: 'success',
      });
      navigate(`/${user.role}`);
    } catch (error) {
      toast({
        title: 'Sign up failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">EWU Hub</span>
          </Link>
          <p className="text-slate-600">Access your campus resources</p>
        </div>

        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      placeholder="your.email@ewu.edu"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({
                          ...prev,
                          password: e.target.value
                        }))}
                        placeholder="Password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                <div className="text-center text-sm text-slate-500 space-y-2">
                  <p>Demo accounts:</p>
                  <div className="text-xs space-y-1">
                    <p>Student: ahmed.rahman@student.ewu.edu</p>
                    <p>Faculty: mohammad.ali@ewu.edu</p>
                    <p>Staff: sarah.ahmed@ewu.edu</p>
                    <p>Admin: admin@ewu.edu</p>
                    <p className="font-medium">Password: demo123</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      placeholder="Your full name"
                      required
                    />
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      placeholder="your.email@ewu.edu"
                      required
                    />
                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({
                        ...prev,
                        password: e.target.value
                      }))}
                      placeholder="Password (min 6 characters)"
                      required
                    />
                    {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      placeholder="Confirm password"
                      required
                    />
                    {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <div>
                    <Label htmlFor="signup-role">Role</Label>
                    <select
                      id="signup-role"
                      value={signUpData.role}
                      onChange={(e) => setSignUpData(prev => ({
                        ...prev,
                        role: e.target.value as Role
                      }))}
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      In production, roles are assigned by Admin
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          Demo environment • No real data yet
        </p>
      </div>
    </div>
  );
}