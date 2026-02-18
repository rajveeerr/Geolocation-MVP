import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

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

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    const redirectUri = window.location.origin + '/auth/callback';
    const apiUrl = import.meta.env.VITE_API_URL || 'https://api.yohop.com';
    window.location.href = `${apiUrl}/api/auth/${provider}/start?redirectUri=${encodeURIComponent(redirectUri)}`;
  };

  return (
    <>
      <title>Sign Up | Yohop</title>
      <meta name="description" content="Create an account on Yohop to find local deals and earn rewards by checking in to merchants." />

      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-neutral-50 px-4 py-12 sm:py-16">
        <div className="w-full max-w-[1040px] grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-xl bg-white">

          {/* ── LEFT PANEL: Hero illustration ── */}
          <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-b from-[#c4a882] via-[#b8997a] to-[#a08568] p-10 text-white overflow-hidden min-h-[700px]">
            <div className="relative z-10">
              <h2 className="text-lg font-bold tracking-tight mb-6">Yohop</h2>
              <span className="inline-block px-3 py-1 rounded-full bg-brand-primary-main text-[11px] font-bold uppercase tracking-widest mb-5">
                Start Hunting
              </span>
              <h1 className="text-[2.6rem] leading-[1.1] font-black uppercase tracking-tight">
                Find a Deal.<br />
                <span className="italic font-serif font-normal normal-case text-[2.4rem]">bring friends.</span><br />
                Get Paid Cash.
              </h1>
              <p className="mt-5 text-white/80 text-[15px] leading-relaxed max-w-xs">
                Join thousands of deal hunters. Save money, earn rewards, and discover the best local spots.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 mt-auto">
              <div className="flex -space-x-2">
                <div className="w-9 h-9 rounded-full bg-white/30 border-2 border-white/50" />
                <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/50" />
                <div className="w-9 h-9 rounded-full bg-white/25 border-2 border-white/50" />
              </div>
              <span className="text-sm text-white/80 font-medium">
                Join 2,400+ hunters in your city
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#8a7055]/60 to-transparent pointer-events-none" />
          </div>

          {/* ── RIGHT PANEL: Signup form ── */}
          <div className="flex flex-col justify-center px-8 py-10 sm:px-12 lg:px-14 overflow-y-auto max-h-[90vh]">
            <div className="max-w-sm mx-auto w-full">
              <h1 className="text-3xl sm:text-[2rem] font-black text-neutral-900 tracking-tight">
                Create Account
              </h1>
              <p className="mt-2 text-neutral-500 text-[15px]">
                Start your journey to <span className="text-brand-primary-main font-semibold">find deals</span> and earn rewards.
              </p>

              {/* Social login */}
              <div className="grid grid-cols-2 gap-3 mt-7">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('apple')}
                  className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Apple
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs font-medium text-neutral-400 uppercase tracking-widest">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="First name"
                              {...field}
                              className="h-11 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-1 focus:ring-neutral-300 transition-all"
                            />
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
                          <FormLabel className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Last name"
                              {...field}
                              className="h-11 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-1 focus:ring-neutral-300 transition-all"
                            />
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
                        <FormLabel className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@email.com"
                            {...field}
                            className="h-11 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-1 focus:ring-neutral-300 transition-all"
                          />
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
                        <FormLabel className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            {...field}
                            className="h-11 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-1 focus:ring-neutral-300 transition-all"
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
                        <FormLabel className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create a password"
                              {...field}
                              className="h-11 rounded-xl border-neutral-200 bg-neutral-50 px-4 pr-12 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-1 focus:ring-neutral-300 transition-all"
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
                        <FormDescription className="text-[11px] text-neutral-400">
                          8+ characters with uppercase, lowercase, number & special char.
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
                        <FormLabel className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm your password"
                              {...field}
                              className="h-11 rounded-xl border-neutral-200 bg-neutral-50 px-4 pr-12 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-1 focus:ring-neutral-300 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400 hover:text-neutral-600 transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referralCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Referral Code <span className="text-neutral-400 normal-case font-normal">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter referral code"
                            {...field}
                            className="h-11 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-1 focus:ring-neutral-300 transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#1a1a2e] focus:ring-neutral-400"
                    />
                    <label htmlFor="terms" className="text-xs text-neutral-500 leading-relaxed">
                      I agree to the{' '}
                      <Link to={PATHS.TERMS} className="font-semibold text-brand-primary-main hover:text-brand-primary-dark">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to={PATHS.PRIVACY} className="font-semibold text-brand-primary-main hover:text-brand-primary-dark">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full h-12 rounded-xl text-sm font-bold bg-[#1a1a2e] hover:bg-[#16162a] text-white mt-1"
                    disabled={isSigningUp}
                  >
                    {isSigningUp ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Create Account
                    {!isSigningUp && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </Form>

              <p className="mt-6 text-center text-sm text-neutral-500">
                Already have an account?{' '}
                <Link
                  to={PATHS.LOGIN}
                  className="font-semibold text-brand-primary-main hover:text-brand-primary-dark transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
