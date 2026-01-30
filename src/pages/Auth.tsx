import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wrench, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');
  
  const [isLogin, setIsLogin] = useState(roleFromUrl ? false : true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'client' | 'technician'>(
    roleFromUrl === 'technician' ? 'technician' : 'client'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect based on intended role from URL or default to dashboard
      if (roleFromUrl === 'client') {
        navigate('/book');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate, roleFromUrl]);
  
  // Update userType when URL param changes
  useEffect(() => {
    if (roleFromUrl === 'technician') {
      setUserType('technician');
      setIsLogin(false);
    } else if (roleFromUrl === 'client') {
      setUserType('client');
      setIsLogin(false);
    }
  }, [roleFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
          // Navigate based on role from URL or default to dashboard
          navigate(roleFromUrl === 'client' ? '/book' : '/dashboard');
        }
      } else {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, fullName, userType);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('This email is already registered. Please sign in instead.');
          } else {
            setError(error.message);
          }
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to FixIt Pro.",
          });
          // Navigate based on user type
          navigate(userType === 'client' ? '/book' : '/dashboard');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col safe-top">
      {/* Header */}
      <header className="p-3 sm:p-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-foreground">FixIt<span className="text-primary">Pro</span></span>
        </button>
      </header>

      {/* Auth Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-xl border border-border p-5 sm:p-6 md:p-8 animate-scale-in">
            <div className="text-center mb-5 sm:mb-6 md:mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1.5 sm:mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {isLogin
                  ? 'Sign in to continue to FixIt Pro'
                  : 'Join FixIt Pro today'}
              </p>
            </div>

            {error && (
              <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="fullName" className="text-xs sm:text-sm">Full Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">I am a</Label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-1">
                      <button
                        type="button"
                        onClick={() => setUserType('client')}
                        className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 text-center transition-all touch-target ${
                          userType === 'client'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="block text-xl sm:text-2xl mb-0.5 sm:mb-1">🏠</span>
                        <span className="text-xs sm:text-sm font-medium">Client</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('technician')}
                        className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 text-center transition-all touch-target ${
                          userType === 'technician'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="block text-xl sm:text-2xl mb-0.5 sm:mb-1">🔧</span>
                        <span className="text-xs sm:text-sm font-medium">Technician</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground shadow-glow mt-4 sm:mt-6 h-10 sm:h-11 text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="ml-1 text-primary font-medium hover:underline"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
