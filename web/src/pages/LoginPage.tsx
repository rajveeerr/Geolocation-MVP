import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useAuth } from '@/context/useAuth';
import { loginSchema, type LoginFormValues } from '@/lib/validationSchemas';

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await login(values);
  };

  return (
    <div className="from-brand-primary-light via-brand-primary-50 flex min-h-screen items-center justify-center bg-gradient-to-b to-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-brand-primary-200/40 absolute bottom-0 left-[4%] top-0 w-0.5"></div>
        <div className="bg-brand-primary-200/40 absolute bottom-0 right-[4%] top-0 w-0.5"></div>
        <div className="bg-brand-primary-200/40 absolute left-0 right-0 top-[10%] h-0.5"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="border-neutral-border/20 shadow-level-3 rounded-xl border bg-white/80 p-8 backdrop-blur-md">
          <div className="mb-8 text-center">
            <h1 className="text-neutral-text-primary mb-2 text-2xl font-bold">
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
              <div className="border-neutral-border-light w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="text-neutral-text-secondary bg-white px-3">
                or continue with email
              </span>
            </div>
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
                          <Mail className="text-brand-primary-500 h-5 w-5" />
                        </div>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          className="border-neutral-border focus:border-brand-primary-main focus:ring-brand-primary-main/50 w-full rounded-lg border bg-white/50 py-3 pl-10 pr-4 backdrop-blur-sm transition-colors focus:ring-2"
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
                          <Lock className="text-brand-primary-500 h-5 w-5" />
                        </div>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          {...field}
                          className="border-neutral-border focus:border-brand-primary-main focus:ring-brand-primary-main/50 w-full rounded-lg border bg-white/50 py-3 pl-10 pr-12 backdrop-blur-sm transition-colors focus:ring-2"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showPassword ? (
                            <EyeOff className="text-brand-primary-400 hover:text-brand-primary-600 h-5 w-5" />
                          ) : (
                            <Eye className="text-brand-primary-400 hover:text-brand-primary-600 h-5 w-5" />
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
                    className="border-neutral-border text-brand-primary-main focus:ring-brand-primary-main/50 h-4 w-4 rounded"
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
                  className="text-brand-primary-main hover:text-brand-primary-dark text-sm font-medium"
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
                Sign in
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-neutral-text-secondary text-sm">
              Don't have an account?{' '}
              <Link
                to={PATHS.SIGNUP}
                className="text-brand-primary-main hover:text-brand-primary-dark font-medium"
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
