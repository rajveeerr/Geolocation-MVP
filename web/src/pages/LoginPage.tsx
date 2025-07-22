import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';

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
import { apiPost } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    const response = await apiPost<{ token: string }, LoginFormValues>('/auth/login', values);

    if (response.success && response.data?.token) {
      toast({
        title: "Login Successful!",
        description: "Welcome back to CitySpark.",
      });
      login(response.data.token); // This will handle token storage and navigation
    } else {
      toast({
        title: "Login Failed",
        description: response.error || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-primary-light via-blue-50 to-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-[4%] top-0 w-0.5 bg-blue-200/40"></div>
        <div className="absolute bottom-0 right-[4%] top-0 w-0.5 bg-blue-200/40"></div>
        <div className="absolute left-0 right-0 top-[10%] h-0.5 bg-blue-200/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-xl border border-neutral-border/20 bg-white/80 p-8 shadow-level-3 backdrop-blur-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-neutral-text-primary">
              Welcome back
            </h1>
            <p className="text-neutral-text-secondary">
              Sign in to discover amazing deals near you
            </p>
          </div>
          <Button variant="google" size="lg" className="mb-6 w-full">
            Continue with Google
          </Button>
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-border-light"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-neutral-text-secondary">
                or continue with email
              </span>
            </div>
          </div>
          
          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block text-sm font-medium text-neutral-text-primary">Email address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                      </div>
                      <Input 
                        type="email" 
                        placeholder="Enter your email" 
                        {...field} 
                        className="w-full rounded-lg border border-neutral-border bg-white/50 py-3 pl-10 pr-4 backdrop-blur-sm transition-colors focus:border-brand-primary-main focus:ring-2 focus:ring-brand-primary-main/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {/* Password Field */}
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block text-sm font-medium text-neutral-text-primary">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-blue-500" />
                      </div>
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Enter your password" 
                        {...field} 
                        className="w-full rounded-lg border border-neutral-border bg-white/50 py-3 pl-10 pr-12 backdrop-blur-sm transition-colors focus:border-brand-primary-main focus:ring-2 focus:ring-brand-primary-main/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-blue-400 hover:text-blue-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-blue-400 hover:text-blue-600" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-border text-brand-primary-main focus:ring-brand-primary-main/50"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-neutral-text-secondary"
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

              {/* Submit Button */}
              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>
          </Form>

          {/* Sign up link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-text-secondary">
              Don't have an account?{' '}
              <Link
                to={PATHS.SIGNUP}
                className="font-medium text-brand-primary-main hover:text-brand-primary-dark"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};