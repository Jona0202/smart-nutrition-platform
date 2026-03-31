import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';

// Pestañas principales que NO son el Dashboard central
const OTHER_MAIN_TABS = [
    '/food-logging', 
    '/history', 
    '/progress', 
    '/meal-suggestions', 
    '/weekly-plan', 
    '/profile'
];

export function useBackButton() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handler = App.addListener('backButton', ({ canGoBack }) => {
            const currentPath = location.pathname;

            // 1. Si estamos en el Inicio (Dashboard) o pantallas de sesión, salir (minimizar) la app
            if (['/dashboard', '/welcome', '/login', '/register'].includes(currentPath)) {
                App.minimizeApp();
                return;
            }

            // 2. Si estamos en Onboarding, tratar de ir al inicio de sesión
            if (currentPath === '/onboarding') {
                navigate('/welcome', { replace: true });
                return;
            }

            // 3. Si estábamos en otra pestaña principal (Diario, Progreso, Plan, Perfil), 
            // no queremos cerrar la app, queremos volver a "Inicio" (Dashboard)
            if (OTHER_MAIN_TABS.includes(currentPath)) {
                navigate('/dashboard', { replace: true });
                return;
            }

            // 4. Cualquier otra sub-pantalla (como IA, detalles, etc.), ir atrás normalmente
            if (canGoBack) {
                // navigate(-1) regresa a la pantalla anterior real conservando el estado
                navigate(-1);
            } else {
                // Fallback por si acaso
                navigate('/dashboard', { replace: true });
            }
        });

        return () => {
            // Manejador seguro para evitar fugas de memoria
            handler.then(h => h.remove());
        };
    }, [navigate, location.pathname]);
}
