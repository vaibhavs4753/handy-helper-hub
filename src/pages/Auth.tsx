import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wrench, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2, MailCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { signInSchema, signUpSchema } from '@/lib/validations';
import { supabase } from '@/integrations/supabase/client';
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showVerification, setShowVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect based on intended role from URL
      if (roleFromUrl === 'client') {
        navigate('/client');
      } else if (roleFromUrl === 'technician') {
        navigate('/technician');
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

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || !email) return;
    
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        toast({
          title: "Failed to resend",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setResendCooldown(60); // 60 second cooldown
        toast({
          title: "Email sent!",
          description: "Check your inbox for the verification link.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to resend verification email.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const validateForm = () => {
    setFieldErrors({});
    
    try {
      if (isLogin) {
        signInSchema.parse({ email, password });
      } else {
        signUpSchema.parse({ email, password, fullName, userType });
      }
      return true;
    } catch (err: any) {
      if (err.errors) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e: any) => {
          const field = e.path[0];
          if (!errors[field]) {
            errors[field] = e.message;
          }
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setError('Please verify your email before signing in. Check your inbox for the verification link.');
          } else if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message);
          }
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
          if (roleFromUrl === 'client') {
            navigate('/client');
          } else if (roleFromUrl === 'technician') {
            navigate('/technician');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
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
          // Show verification message
          setShowVerification(true);
          toast({
            title: "Check your email!",
            description: "We've sent you a verification link.",
          });
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Email verification success screen
  if (showVerification) {
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

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-xl sm:rounded-2xl shadow-xl border border-border p-5 sm:p-6 md:p-8 animate-scale-in text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <MailCheck className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                Check Your Email
              </h1>
              
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                We've sent a verification link to
              </p>
              
              <p className="text-primary font-medium mb-6 break-all">
                {email}
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-foreground mb-2 text-sm">Next steps:</h3>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Open your email inbox</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Click the verification link</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Return here to sign in</span>
                  </li>
                </ol>
              </div>
              
              <Button
                variant="outline"
                className="w-full mb-3"
                onClick={handleResendVerification}
                disabled={resendLoading || resendCooldown > 0}
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowVerification(false);
                  setIsLogin(true);
                  setPassword('');
                }}
              >
                Back to Sign In
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4">
                Didn't receive the email? Check your spam folder or click resend above.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                        className={`pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base ${fieldErrors.fullName ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors.fullName}</p>
                    )}
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
                    className={`pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base ${fieldErrors.email ? 'border-destructive' : ''}`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>
                )}
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
                    className={`pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base ${fieldErrors.password ? 'border-destructive' : ''}`}
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>
                )}
                {!isLogin && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 6 characters
                  </p>
                )}
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
                    setFieldErrors({});
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
