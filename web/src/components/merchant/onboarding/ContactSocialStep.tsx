import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingLayout } from './OnboardingLayout';
import { Input } from '@/components/ui/input';
import { getChapterProgress } from '@/context/MerchantOnboardingContext';
import { Phone, Globe, Instagram, Facebook, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';

const fields = [
  {
    id: 'phone',
    label: 'Phone number',
    value: 'phoneNumber',
    action: 'SET_PHONE_NUMBER' as const,
    placeholder: '+1 234 567 8900',
    type: 'tel' as const,
    icon: Phone,
    iconColor: 'text-neutral-500',
  },
  {
    id: 'website',
    label: 'Website',
    value: 'websiteUrl',
    action: 'SET_WEBSITE_URL' as const,
    placeholder: 'https://yoursite.com',
    type: 'url' as const,
    icon: Globe,
    iconColor: 'text-neutral-500',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    value: 'instagramUrl',
    action: 'SET_INSTAGRAM_URL' as const,
    placeholder: 'https://instagram.com/yourhandle',
    type: 'url' as const,
    icon: Instagram,
    iconColor: 'text-pink-500',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    value: 'facebookUrl',
    action: 'SET_FACEBOOK_URL' as const,
    placeholder: 'https://facebook.com/yourpage',
    type: 'url' as const,
    icon: Facebook,
    iconColor: 'text-blue-600',
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    value: 'twitterUrl',
    action: 'SET_TWITTER_URL' as const,
    placeholder: 'https://x.com/yourhandle',
    type: 'url' as const,
    icon: Twitter,
    iconColor: 'text-neutral-700',
  },
];

export const ContactSocialStep = () => {
  const { state, dispatch } = useOnboarding();
  const step = 11;

  return (
    <OnboardingLayout
      chapterProgress={getChapterProgress(step)}
      onBack={() => dispatch({ type: 'SET_STEP', payload: step - 1 })}
      onNext={() => dispatch({ type: 'SET_STEP', payload: step + 1 })}
      nextLabel="Next"
      nextDisabled={false}
    >
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-heading text-2xl font-bold text-neutral-900 md:text-3xl">
          Contact & social
        </h1>
        <p className="mt-2 text-neutral-600">
          So customers can call, visit your site, or follow you when they save your deals. All optional.
        </p>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Contact
            </h3>
            {fields.slice(0, 2).map((field) => {
              const Icon = field.icon;
              const value = state[field.value as keyof typeof state] as string;
              return (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="mb-1.5 flex items-center gap-2 text-sm font-medium text-neutral-700"
                  >
                    <Icon className={cn('h-4 w-4', field.iconColor)} aria-hidden />
                    {field.label}
                  </label>
                  <Input
                    id={field.id}
                    type={field.type}
                    value={value || ''}
                    onChange={(e) =>
                      dispatch({ type: field.action, payload: e.target.value })
                    }
                    placeholder={field.placeholder}
                    className="h-12 rounded-xl border-neutral-300 transition-colors focus:border-brand-primary-500 focus:ring-brand-primary-500"
                  />
                </div>
              );
            })}
          </div>
          <div className="space-y-4 border-t border-neutral-200 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Social
            </h3>
            {fields.slice(2).map((field) => {
              const Icon = field.icon;
              const value = state[field.value as keyof typeof state] as string;
              return (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="mb-1.5 flex items-center gap-2 text-sm font-medium text-neutral-700"
                  >
                    <Icon className={cn('h-4 w-4', field.iconColor)} aria-hidden />
                    {field.label}
                  </label>
                  <Input
                    id={field.id}
                    type={field.type}
                    value={value || ''}
                    onChange={(e) =>
                      dispatch({ type: field.action, payload: e.target.value })
                    }
                    placeholder={field.placeholder}
                    className="h-12 rounded-xl border-neutral-300 transition-colors focus:border-brand-primary-500 focus:ring-brand-primary-500"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};
