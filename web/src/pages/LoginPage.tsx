import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-gradient-to-b from-brand-primary-light via-blue-50 to-white flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-level-3 border border-neutral-border/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-text-primary mb-2">Welcome back</h1>
            <p className="text-neutral-text-secondary">Sign in to discover amazing deals near you</p>
          </div>
          <Button variant="outline" size="lg" className="w-full mb-6 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-border-light"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-3 bg-white text-neutral-text-secondary">or continue with email</span></div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl><Input type="email" placeholder="Enter your email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="Enter your password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-text-secondary">
              Don't have an account?{' '}
              <Link to={PATHS.SIGNUP} className="font-medium text-brand-primary-main hover:text-brand-primary-dark">Sign up for free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};