
import { Button } from '@/components/common/Button';
import { Facebook, Instagram } from 'lucide-react';

export const SocialLogin = () => {
    const handleSocialLogin = (provider: 'google' | 'facebook' | 'instagram') => {
        const redirectUri = window.location.origin + '/auth/callback';

        const apiUrl = import.meta.env.VITE_API_URL || 'https://api.yohop.com';

        const targetUrl = `${apiUrl}/api/auth/${provider}/start?redirectUri=${encodeURIComponent(redirectUri)}`;

        window.location.href = targetUrl;
    };

    return (
        <div className="space-y-3 w-full">
            <Button
                variant="google"
                size="lg"
                className="w-full"
                onClick={() => handleSocialLogin('google')}
                type="button"
            >
                Continue with Google
            </Button>

            <div className="grid grid-cols-2 gap-3">
                <Button
                    variant="secondary"
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => handleSocialLogin('facebook')}
                    type="button"
                >
                    <Facebook className="h-5 w-5 text-[#1877F2]" fill="#1877F2" strokeWidth={0} />
                    Facebook
                </Button>

                <Button
                    variant="secondary"
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => handleSocialLogin('instagram')}
                    type="button"
                >
                    <Instagram className="h-5 w-5 text-[#E4405F]" />
                    Instagram
                </Button>
            </div>
        </div>
    );
};
