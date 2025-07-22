import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
} from '@/components/ui/form';
import { PATHS } from '@/routing/paths';
import { apiPost } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Validation schema using Zod
const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof formSchema>;

export const SignUpPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);
    const { firstName, lastName, email, password } = values;
    const payload = {
      name: `${firstName} ${lastName}`,
      email,
      password,
    };

    const response = await apiPost('/auth/register', payload);

    if (response.success) {
      toast({
        title: "Account Created!",
        description: "You've successfully signed up. Please log in.",
        variant: "default",
      });
      navigate(PATHS.LOGIN);
    } else {
      toast({
        title: "Uh oh! Something went wrong.",
        description: response.error || "There was a problem with your request.",
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
              <div className="w-full border-t border-neutral-border-light"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-neutral-text-secondary">
                or continue with email
              </span>
            </div>
          </div>

          {/* Signup Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-sm font-medium text-neutral-text-primary">First name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <User className="h-5 w-5 text-blue-500" />
                        </div>
                        <Input 
                          placeholder="First name" 
                          {...field} 
                          className="w-full rounded-lg border border-neutral-border bg-white/50 py-3 pl-10 pr-4 backdrop-blur-sm transition-colors focus:border-brand-primary-main focus:ring-2 focus:ring-brand-primary-main/50"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2 block text-sm font-medium text-neutral-text-primary">Last name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <User className="h-5 w-5 text-blue-500" />
                        </div>
                        <Input 
                          placeholder="Last name" 
                          {...field} 
                          className="w-full rounded-lg border border-neutral-border bg-white/50 py-3 pl-10 pr-4 backdrop-blur-sm transition-colors focus:border-brand-primary-main focus:ring-2 focus:ring-brand-primary-main/50"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              
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
              {/* Phone Field */}
                            <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block text-sm font-medium text-neutral-text-primary">Phone number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Phone className="h-5 w-5 text-blue-500" />
                      </div>
                      <Input 
                        type="tel" 
                        placeholder="Enter your phone number" 
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
                        placeholder="Create a password" 
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
              
              {/* Confirm Password Field */}
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block text-sm font-medium text-neutral-text-primary">Confirm password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-blue-500" />
                      </div>
                      <Input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        placeholder="Confirm your password" 
                        {...field} 
                        className="w-full rounded-lg border border-neutral-border bg-white/50 py-3 pl-10 pr-12 backdrop-blur-sm transition-colors focus:border-brand-primary-main focus:ring-2 focus:ring-brand-primary-main/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showConfirmPassword ? (
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

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-neutral-border text-brand-primary-main focus:ring-brand-primary-main/50"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-neutral-text-secondary">
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

              {/* Submit Button */}
              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create account
              </Button>
            </form>
          </Form>

          {/* Login link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-text-secondary">
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