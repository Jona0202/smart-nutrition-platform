import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';

// Main tab routes where back button should minimize instead of navigate
const MAIN_TABS = ['/dashboard', '/food-logging', '/progress', '/meal-suggestions', '/profile'];

export function useBackButton() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handler = App.addListener('backButton', ({ canGoBack }) => {
            const currentPath = location.pathname;

            // On main tabs → minimize the app
            if (MAIN_TABS.includes(currentPath)) {
                App.minimizeApp();
                return;
            }

            // On welcome/login/register → minimize
            if (['/welcome', '/login', '/register'].includes(currentPath)) {
                App.minimizeApp();
                return;
            }

            // On onboarding → go to welcome
            if (currentPath === '/onboarding') {
                navigate('/welcome', { replace: true });
                return;
            }

            // On AI food analysis → go to dashboard
            if (currentPath === '/ai-food-analysis') {
                navigate('/dashboard', { replace: true });
                return;
            }

            // On history → go to dashboard
            if (currentPath === '/history') {
                navigate('/dashboard', { replace: true });
                return;
            }

            // Default: try browser history or go to dashboard
            if (canGoBack) {
                window.history.back();
            } else {
                navigate('/dashboard', { replace: true });
            }
        });

        return () => {
            handler.then(h => h.remove());
        };
    }, [navigate, location.pathname]);
}
