
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';

export const AuthCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { handleSocialToken } = useAuth();
    const { toast } = useToast();
    const processedRef = useRef(false);

    useEffect(() => {
        if (processedRef.current) return;
        processedRef.current = true;

        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            toast({
                title: 'Login Failed',
                description: mapAuthError(error),
                variant: 'destructive',
            });
            navigate(PATHS.LOGIN, { replace: true });
            return;
        }

        if (token) {
            handleSocialToken(token)
                .then(() => {
                    toast({
                        title: 'Login Successful',
                        description: 'Welcome back!',
                    });
                    // Redirect is handled inside handleSocialToken or we can do it here if it returns promise
                    // But usually handleSocialToken should do the navigation or we do it here.
                    // Let's assume handleSocialToken updates state and we redirect. 
                    // Ideally handleSocialToken should trigger the navigation to avoid race conditions or use RedirectContext
                })
                .catch((err: any) => {
                    toast({
                        title: 'Login Error',
                        description: 'Failed to process login token.',
                        variant: 'destructive',
                    });
                    console.error("Token processing error:", err);
                    navigate(PATHS.LOGIN, { replace: true });
                });
        } else {
            toast({
                title: 'Invalid Request',
                description: 'No token provided.',
                variant: 'destructive',
            });
            navigate(PATHS.LOGIN, { replace: true });
        }
    }, [searchParams, navigate, handleSocialToken, toast]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-primary-main" />
                <p className="mt-2 text-neutral-text-secondary">Completing login...</p>
            </div>
        </div>
    );
};

function mapAuthError(code: string): string {
    switch (code) {
        case 'access_denied':
            return 'You denied the login request.';
        case 'state_mismatch':
            return 'Security check failed. Please try again.';
        case 'invalid_request':
            return 'Invalid login request.';
        default:
            return 'An unknown error occurred during login.';
    }
}
