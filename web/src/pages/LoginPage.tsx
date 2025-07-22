import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { PATHS } from '@/routing/paths';

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-primary-light via-blue-50 to-white flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[4%] top-0 bottom-0 w-0.5 bg-blue-200/40"></div>
        <div className="absolute right-[4%] top-0 bottom-0 w-0.5 bg-blue-200/40"></div>
        <div className="absolute left-0 right-0 top-[10%] h-0.5 bg-blue-200/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-level-3 border border-neutral-border/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-text-primary mb-2">
              Welcome back
            </h1>
            <p className="text-neutral-text-secondary">
              Sign in to discover amazing deals near you
            </p>
          </div>

          <Button variant="google" size="lg" className="w-full mb-6">
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-border-light"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-neutral-text-secondary">or continue with email</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-text-primary mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-text-secondary" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary-main/50 focus:border-brand-primary-main transition-colors bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-text-secondary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary-main/50 focus:border-brand-primary-main transition-colors bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-text-secondary hover:text-neutral-text-primary" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-text-secondary hover:text-neutral-text-primary" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-brand-primary-main focus:ring-brand-primary-main/50 border-neutral-border rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-text-secondary">
                  Remember me
                </label>
              </div>
              <Link
                to={PATHS.FORGOT_PASSWORD}
                className="text-sm text-brand-primary-main hover:text-brand-primary-dark font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Sign in
            </Button>
          </form>

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
