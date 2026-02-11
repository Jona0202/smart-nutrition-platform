import { useWaterStore } from '../store/waterStore';
import { useUserStore } from '../store/userStore';

export default function WaterTracker() {
    const { addWater, getTodayMl, getTarget } = useWaterStore();
    const profile = useUserStore((s) => s.profile);
    const weight = profile?.currentWeightKg || 70;
    const target = getTarget(weight);
    const current = getTodayMl();
    const progress = Math.min(current / target, 1);
    const glasses = Math.floor(current / 250);

    return (
        <div className="card" style={{ padding: '18px 16px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                    <h3 style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        margin: 0,
                        letterSpacing: '-0.02em',
                    }}>
                        💧 Agua
                    </h3>
                    <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>
                        {glasses} vasos · {current}ml de {target}ml
                    </p>
                </div>
                <div style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: progress >= 1 ? '#22c55e' : '#3b82f6',
                    fontFamily: "'Poppins', sans-serif",
                }}>
                    {Math.round(progress * 100)}%
                </div>
            </div>

            {/* Progress bar */}
            <div style={{
                height: 10,
                borderRadius: 5,
                background: 'var(--color-surface-accent)',
                overflow: 'hidden',
                marginBottom: 14,
            }}>
                <div style={{
                    height: '100%',
                    borderRadius: 5,
                    width: `${progress * 100}%`,
                    background: progress >= 1
                        ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                        : 'linear-gradient(90deg, #60a5fa, #3b82f6)',
                    transition: 'width 0.5s ease',
                }} />
            </div>

            {/* Quick add buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
                {[
                    { ml: 250, label: '🥛 250ml' },
                    { ml: 500, label: '🍶 500ml' },
                    { ml: 350, label: '☕ 350ml' },
                ].map(({ ml, label }) => (
                    <button
                        key={ml}
                        onClick={() => addWater(ml)}
                        style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: 10,
                            border: '1.5px solid var(--color-border-light)',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text-secondary)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'; }}
                        onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {progress >= 1 && (
                <div style={{
                    marginTop: 10,
                    textAlign: 'center',
                    fontSize: 12,
                    color: '#22c55e',
                    fontWeight: 600,
                }}>
                    🎉 ¡Meta de agua cumplida!
                </div>
            )}
        </div>
    );
}
