import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Toast } from '@capacitor/toast';

// Pestañas principales que NO son el Dashboard central
const OTHER_MAIN_TABS = [
    '/food-logging', 
    '/history', 
    '/progress', 
    '/meal-suggestions', 
    '/weekly-plan', 
    '/profile'
];

let lastBackPress = 0;
const TIME_PERIOD_TO_EXIT = 2000; // 2 segundos

export function useBackButton() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handler = App.addListener('backButton', async ({ canGoBack }) => {
            const currentPath = location.pathname;

            // 1. Si estamos en el Inicio (Dashboard) o pantallas de sesión, hacer doble tap para salir
            if (['/dashboard', '/welcome', '/login', '/register'].includes(currentPath)) {
                const now = new Date().getTime();
                if (now - lastBackPress < TIME_PERIOD_TO_EXIT) {
                    App.exitApp();
                } else {
                    lastBackPress = now;
                    await Toast.show({
                        text: 'Presiona atrás otra vez para salir',
                        duration: 'short',
                        position: 'bottom'
                    });
                }
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
