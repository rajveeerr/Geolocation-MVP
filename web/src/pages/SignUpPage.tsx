import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { PATHS } from '@/routing/paths';

export const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
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
    // Handle signup logic here
    console.log('Signup attempt:', formData);
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
              Create your account
            </h1>
            <p className="text-neutral-text-secondary">
              Join us to discover amazing deals near you
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

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-neutral-text-primary mb-2">
                  First name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-neutral-text-secondary" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary-main/50 focus:border-brand-primary-main transition-colors bg-white/50 backdrop-blur-sm"
                    placeholder="First name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-neutral-text-primary mb-2">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary-main/50 focus:border-brand-primary-main transition-colors bg-white/50 backdrop-blur-sm"
                  placeholder="Last name"
                />
              </div>
            </div>

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

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-text-primary mb-2">
                Phone number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-neutral-text-secondary" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary-main/50 focus:border-brand-primary-main transition-colors bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your phone number"
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
                  placeholder="Create a password"
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-text-primary mb-2">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-text-secondary" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-neutral-border rounded-lg focus:ring-2 focus:ring-brand-primary-main/50 focus:border-brand-primary-main transition-colors bg-white/50 backdrop-blur-sm"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-text-secondary hover:text-neutral-text-primary" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-text-secondary hover:text-neutral-text-primary" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-brand-primary-main focus:ring-brand-primary-main/50 border-neutral-border rounded mt-1"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-neutral-text-secondary">
                I agree to the{' '}
                <Link
                  to={PATHS.TERMS}
                  className="text-brand-primary-main hover:text-brand-primary-dark font-medium"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to={PATHS.PRIVACY}
                  className="text-brand-primary-main hover:text-brand-primary-dark font-medium"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Create account
            </Button>
          </form>

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
