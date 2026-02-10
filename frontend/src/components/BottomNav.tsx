import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
    { path: '/dashboard', label: 'Inicio', icon: '⌂' },
    { path: '/food-logging', label: 'Diario', icon: '◉' },
    { path: '/history', label: 'Historial', icon: '▤' },
    { path: '/meal-suggestions', label: 'Plan', icon: '✦' },
    { path: '/profile', label: 'Perfil', icon: '○' },
];

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="bottom-nav safe-area-bottom">
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                height: 60,
                maxWidth: 420,
                margin: '0 auto',
                padding: '0 4px',
            }}>
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: 1,
                                height: '100%',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                padding: 0,
                                position: 'relative',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {/* Active indicator dot */}
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 20,
                                    height: 2.5,
                                    borderRadius: 2,
                                    background: 'var(--color-brand)',
                                }} />
                            )}

                            <span style={{
                                fontSize: 20,
                                lineHeight: 1,
                                marginBottom: 3,
                                color: isActive ? 'var(--color-brand)' : 'var(--color-text-tertiary)',
                                fontWeight: isActive ? 700 : 400,
                                transition: 'color 0.2s ease',
                            }}>
                                {tab.icon}
                            </span>
                            <span style={{
                                fontSize: 10,
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? 'var(--color-brand)' : 'var(--color-text-tertiary)',
                                letterSpacing: '-0.01em',
                                transition: 'color 0.2s ease',
                            }}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
