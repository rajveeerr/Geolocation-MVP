import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, Loader2, Shield, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PATHS } from '@/routing/paths';
import { useAuth } from '@/context/useAuth';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useToast } from '@/hooks/use-toast';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { apiPost } from '@/services/api';

const adminLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { user } = useAuth();
  const { isAdmin, isLoading: isLoadingAdmin } = useAdminStatus();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Redirect if user is already an admin
  useEffect(() => {
    if (user && isAdmin) {
      navigate(PATHS.ADMIN_DASHBOARD, { replace: true });
    }
  }, [user, isAdmin, navigate]);

  // Show loading while checking admin status
  if (isLoadingAdmin) {
    return <LoadingOverlay message="Checking permissions..." />;
  }

  // If user is logged in but not admin, show error
  if (user && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-primary-light via-brand-primary-50 to-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="relative z-10 w-full max-w-md">
          <div className="border-neutral-border/20 shadow-level-3 rounded-xl border bg-white/80 p-8 backdrop-blur-md text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-neutral-text-primary mb-2 text-2xl font-bold">
              Access Denied
            </h1>
            <p className="text-neutral-text-secondary mb-6">
              You don't have admin privileges. Please contact your administrator.
            </p>
            <div className="space-y-3">
              <Link to={PATHS.HOME}>
                <Button variant="primary" className="w-full">
                  Go to Home
                </Button>
              </Link>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => {
                  // Logout and redirect to admin login
                  localStorage.removeItem('authToken');
                  window.location.reload();
                }}
              >
                Login as Different User
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: AdminLoginFormValues) => {
    setIsLoggingIn(true);
    try {
      // Use direct API call to avoid auth context redirect
      const response = await apiPost<{ token: string }, AdminLoginFormValues>('/auth/login', values);
      
      if (response.success && response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        toast({
          title: 'Login Successful!',
          description: 'Welcome to the admin portal.',
        });
        // Reload to trigger user data fetch and admin status check
        window.location.reload();
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <title>Admin Login | Yohop</title>
      <meta name="description" content="Admin login for Yohop platform management." />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-primary-light via-brand-primary-50 to-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-[4%] top-0 w-0.5 bg-brand-primary-200/40"></div>
          <div className="absolute bottom-0 right-[4%] top-0 w-0.5 bg-brand-primary-200/40"></div>
          <div className="absolute left-0 right-0 top-[10%] h-0.5 bg-brand-primary-200/40"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Back to main site link */}
          <div className="mb-6">
            <Link
              to={PATHS.HOME}
              className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to main site
            </Link>
          </div>

          <div className="border-neutral-border/20 shadow-level-3 rounded-xl border bg-white/80 p-8 backdrop-blur-md">
            <div className="mb-8 text-center">
              <div className="mx-auto w-16 h-16 bg-brand-primary-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-brand-primary-600" />
              </div>
              <h1 className="text-neutral-text-primary mb-2 text-2xl font-bold">
                Admin Portal
              </h1>
              <p className="text-neutral-text-secondary">
                Secure access to platform management
              </p>
            </div>


            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-text-primary mb-2 block text-sm font-medium">
                        Email address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Mail className="h-5 w-5 text-brand-primary-500" />
                          </div>
                          <Input
                            type="email"
                            placeholder="admin@yohop.com"
                            {...field}
                            className="border-neutral-border w-full rounded-lg border bg-white/50 py-3 pl-10 pr-4 backdrop-blur-sm transition-colors focus:border-brand-primary-main focus:ring-2 focus:ring-brand-primary-main/50"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-text-primary mb-2 block text-sm font-medium">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Lock className="h-5 w-5 text-brand-primary-500" />
                          </div>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            {...field}
                            className="border-neutral-border w-full rounded-lg border bg-white/50 py-3 pl-10 pr-12 backdrop-blur-sm transition-colors focus:border-brand-primary-main focus:ring-2 focus:ring-brand-primary-main/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-brand-primary-400 hover:text-brand-primary-600" />
                            ) : (
                              <Eye className="h-5 w-5 text-brand-primary-400 hover:text-brand-primary-600" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="border-neutral-border h-4 w-4 rounded text-brand-primary-main focus:ring-brand-primary-main/50"
                    />
                    <label
                      htmlFor="remember-me"
                      className="text-neutral-text-secondary block text-sm"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    to={PATHS.FORGOT_PASSWORD || '#'}
                    className="text-sm font-medium text-brand-primary-main hover:text-brand-primary-dark"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Access Admin Portal
                </Button>
              </form>
            </Form>

            <div className="mt-8 text-center">
              <p className="text-neutral-text-tertiary text-xs">
                Authorized personnel only. All access is logged and monitored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;
