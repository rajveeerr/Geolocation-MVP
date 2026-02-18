import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Shield, ArrowRight, ArrowLeft } from 'lucide-react';
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
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-neutral-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-10 shadow-xl text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-black text-neutral-900 mb-2">Access Denied</h1>
            <p className="text-neutral-500 mb-6 text-sm">
              You don't have admin privileges. Please contact your administrator.
            </p>
            <div className="space-y-3">
              <Link to={PATHS.HOME}>
                <Button variant="primary" className="w-full h-11 rounded-xl bg-[#1a1a2e] hover:bg-[#16162a] text-white">
                  Go to Home
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="w-full h-11 rounded-xl"
                onClick={() => {
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
      const response = await apiPost<{ token: string }, AdminLoginFormValues>('/auth/login', values);

      if (response.success && response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        toast({
          title: 'Login Successful!',
          description: 'Welcome to the admin portal.',
        });
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

      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12 sm:py-16">
        <div className="w-full max-w-[1040px] grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-xl bg-white">

          {/* ── LEFT PANEL ── */}
          <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-b from-[#1a1a2e] via-[#16162a] to-[#0f0f1e] p-10 text-white overflow-hidden min-h-[600px]">
            <div className="relative z-10">
              <h2 className="text-lg font-bold tracking-tight mb-6">Yohop</h2>
              <span className="inline-block px-3 py-1 rounded-full bg-brand-primary-main text-[11px] font-bold uppercase tracking-widest mb-5">
                Admin Portal
              </span>
              <h1 className="text-[2.4rem] leading-[1.1] font-black uppercase tracking-tight">
                Platform<br />
                <span className="italic font-serif font-normal normal-case text-[2.2rem]">management.</span><br />
                Control Center.
              </h1>
              <p className="mt-5 text-white/60 text-[15px] leading-relaxed max-w-xs">
                Secure access to manage merchants, deals, users, and platform analytics.
              </p>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <Shield className="h-5 w-5 text-brand-primary-main" />
                <span className="text-xs text-white/50">
                  Authorized personnel only. All access is logged.
                </span>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0a0a15]/60 to-transparent pointer-events-none" />
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-14">
            <div className="max-w-sm mx-auto w-full">
              <Link
                to={PATHS.HOME}
                className="inline-flex items-center text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-8"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to main site
              </Link>

              <h1 className="text-3xl sm:text-[2rem] font-black text-neutral-900 tracking-tight">
                Welcome Back
              </h1>
              <p className="mt-2 text-neutral-500 text-[15px]">
                Sign in to the <span className="text-brand-primary-main font-semibold">admin dashboard</span>.
              </p>

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-8">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="admin@yohop.com"
                            {...field}
                            className="h-12 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-1 focus:ring-neutral-300 transition-all"
                          />
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
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            Password
                          </FormLabel>
                          <Link
                            to={PATHS.FORGOT_PASSWORD || '#'}
                            className="text-xs font-semibold text-brand-primary-main hover:text-brand-primary-dark transition-colors"
                          >
                            Forgot?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              {...field}
                              className="h-12 rounded-xl border-neutral-200 bg-neutral-50 px-4 pr-12 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-1 focus:ring-neutral-300 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400 hover:text-neutral-600 transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full h-12 rounded-xl text-sm font-bold bg-[#1a1a2e] hover:bg-[#16162a] text-white mt-2"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Access Admin Portal
                    {!isLoggingIn && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </Form>

              <p className="mt-8 text-center text-xs text-neutral-400">
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
