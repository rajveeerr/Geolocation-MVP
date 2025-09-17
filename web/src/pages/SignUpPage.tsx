import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { PATHS } from '@/routing/paths';
import { signUpSchema, type SignUpFormValues } from '@/lib/validationSchemas';
import { useAuth } from '@/context/useAuth';

export const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, isSigningUp } = useAuth();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      referralCode: '',
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    await signup(values);
  };

  // Check for referral code in URL on page load and set in form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      form.setValue('referralCode', refCode);
    }
  }, [form]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-primary-light via-brand-primary-50 to-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-[4%] top-0 w-0.5 bg-brand-primary-200/40"></div>
        <div className="absolute bottom-0 right-[4%] top-0 w-0.5 bg-brand-primary-200/40"></div>
        <div className="absolute left-0 right-0 top-[10%] h-0.5 bg-brand-primary-200/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="border-neutral-border/20 shadow-level-3 rounded-xl border bg-white/80 p-8 backdrop-blur-md">
          <div className="mb-8 text-center">
            <h1 className="text-neutral-text-primary mb-2 text-2xl font-bold">
              Create your account
            </h1>
            <p className="text-neutral-text-secondary">
              Join us to discover amazing deals near you
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-text-primary mb-2 block text-sm font-medium">
                        First name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <User className="h-5 w-5 text-brand-primary-500" />
                          </div>
                          <Input
                            placeholder="First name"
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
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-text-primary mb-2 block text-sm font-medium">
                        Last name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <User className="h-5 w-5 text-brand-primary-500" />
                          </div>
                          <Input
                            placeholder="Last name"
                            {...field}
                            className="border-neutral-border w-full rounded-lg border bg-white/50 py-3 pl-10 pr-4 backdrop-blur-sm transition-colors focus:border-brand-primary-main focus:ring-2 focus:ring-brand-primary-main/50"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                          placeholder="Enter your email"
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-text-primary mb-2 block text-sm font-medium">
                      Phone number
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Phone className="h-5 w-5 text-brand-primary-500" />
                        </div>
                        <Input
                          type="tel"
                          placeholder="Enter your phone number"
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
                          placeholder="Create a password"
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
                    <FormDescription>
                      Must be 8+ characters with uppercase, lowercase, number,
                      and special characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-text-primary mb-2 block text-sm font-medium">
                      Confirm password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Lock className="h-5 w-5 text-brand-primary-500" />
                        </div>
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          {...field}
                          className="border-neutral-border w-full rounded-lg border bg-white/50 py-3 pl-10 pr-12 backdrop-blur-sm transition-colors focus:border-brand-primary-main focus:ring-2 focus:ring-brand-primary-main/50"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showConfirmPassword ? (
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

              {/* Referral Code Field */}
              <FormField
                control={form.control}
                name="referralCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-text-primary mb-2 block text-sm font-medium">
                      Referral Code (Optional)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <svg
                            className="h-5 w-5 text-brand-primary-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 2L15 8H9L12 2Z" fill="currentColor" />
                          </svg>
                        </div>
                        <Input
                          placeholder="Enter referral code"
                          {...field}
                          className="border-neutral-border w-full rounded-lg border bg-white/50 py-3 pl-10 pr-4 backdrop-blur-sm transition-colors focus:border-brand-primary-main focus:ring-2 focus:ring-brand-primary-main/50"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="border-neutral-border mt-1 h-4 w-4 rounded text-brand-primary-main focus:ring-brand-primary-main/50"
                />
                <label
                  htmlFor="terms"
                  className="text-neutral-text-secondary ml-2 block text-sm"
                >
                  I agree to the{' '}
                  <Link
                    to={PATHS.TERMS}
                    className="font-medium text-brand-primary-main hover:text-brand-primary-dark"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to={PATHS.PRIVACY}
                    className="font-medium text-brand-primary-main hover:text-brand-primary-dark"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isSigningUp}
              >
                {isSigningUp && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create account
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-neutral-text-secondary text-sm">
              Already have an account?{' '}
              <Link
                to={PATHS.LOGIN}
                className="font-medium text-brand-primary-main hover:text-brand-primary-dark"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
