import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useMealStore } from '../store/mealStore';
import { useWeightStore } from '../store/weightStore';
import BottomNav from '../components/BottomNav';
import WaterTracker from '../components/WaterTracker';

// ─── Weight Progress Mini Card ───
function WeightMiniCard({ navigate }: { navigate: (path: string) => void }) {
    const { getLatestWeight, getTrend, getWeightChange } = useWeightStore();
    const profile = useUserStore((s) => s.profile);
    const latestWeight = getLatestWeight();
    const trend = getTrend();
    const weeklyChange = getWeightChange(7);
    const currentWeight = latestWeight || profile?.currentWeightKg;

    if (!currentWeight) return null;

    const trendInfo = !trend ? { icon: '→', label: 'Sin datos', color: 'var(--color-text-tertiary)' }
        : trend === 'down' ? { icon: '↓', label: 'Bajando', color: '#22c55e' }
            : trend === 'up' ? { icon: '↑', label: 'Subiendo', color: '#ef4444' }
                : { icon: '→', label: 'Estable', color: '#3b82f6' };

    return (
        <div
            className="card animate-fadeInUp"
            onClick={() => navigate('/progress')}
            style={{ marginBottom: 16, cursor: 'pointer', padding: '16px 18px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: 'rgba(139, 92, 246, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18,
                    }}>⚖️</div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {currentWeight} kg
                            <span style={{ fontSize: 18, marginLeft: 6, color: trendInfo.color }}>{trendInfo.icon}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                            {weeklyChange ? `${weeklyChange.change > 0 ? '+' : ''}${weeklyChange.change} kg esta semana` : 'Registra peso para ver tendencia'}
                        </div>
                    </div>
                </div>
                <div style={{ fontSize: 18, color: 'var(--color-text-tertiary)' }}>›</div>
            </div>
        </div>
    );
}

// ─── Daily Streak Card ───
function StreakCard() {
    const { meals } = useMealStore();

    // Calculate streak of consecutive days with logged meals
    const streak = (() => {
        if (meals.length === 0) return 0;
        const uniqueDates = [...new Set(meals.map(m => m.date))].sort().reverse();
        if (uniqueDates.length === 0) return 0;

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // Check if the most recent date is today or yesterday
        if (uniqueDates[0] !== todayStr) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
            if (uniqueDates[0] !== yesterdayStr) return 0;
        }

        let count = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
            const prev = new Date(uniqueDates[i - 1] + 'T12:00:00');
            const curr = new Date(uniqueDates[i] + 'T12:00:00');
            const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                count++;
            } else {
                break;
            }
        }
        return count;
    })();

    if (streak === 0) return null;

    const streakEmoji = streak >= 7 ? '🔥' : streak >= 3 ? '⭐' : '✨';
    const streakMsg = streak >= 7 ? '¡Increíble racha!' : streak >= 3 ? '¡Sigue así!' : '¡Buen inicio!';

    return (
        <div className="card animate-fadeInUp" style={{
            marginBottom: 16,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: streak >= 7
                ? 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(239,68,68,0.08))'
                : 'var(--color-surface)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24 }}>{streakEmoji}</div>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {streak} {streak === 1 ? 'día' : 'días'} consecutivos
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                        {streakMsg}
                    </div>
                </div>
            </div>
            <div style={{
                fontSize: 22,
                fontWeight: 800,
                fontFamily: "'Poppins', sans-serif",
                color: streak >= 7 ? '#f97316' : 'var(--color-brand)',
                letterSpacing: '-0.02em',
            }}>
                {streak}
            </div>
        </div>
    );
}

// ─── Recent Meals with Delete ───
function RecentMealsCard() {
    const { getMealsForToday, removeMeal } = useMealStore();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const todayMeals = getMealsForToday();
    const recentMeals = todayMeals.slice(-4).reverse();

    const handleDelete = (id: string) => {
        setDeletingId(id);
        setTimeout(() => {
            removeMeal(id);
            setDeletingId(null);
        }, 300);
    };

    if (recentMeals.length === 0) return null;

    return (
        <div className="card animate-fadeInUp" style={{ marginBottom: 16 }}>
            <h3 className="section-title" style={{ marginBottom: 12 }}>Últimas comidas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentMeals.map((meal) => (
                    <div
                        key={meal.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            background: 'var(--color-surface-accent)',
                            borderRadius: 12,
                            transition: 'all 0.3s ease',
                            opacity: deletingId === meal.id ? 0 : 1,
                            transform: deletingId === meal.id ? 'translateX(100%)' : 'none',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                            <span style={{ fontSize: 22 }}>{meal.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>{meal.foodName}</div>
                                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                                    {meal.grams}g · {Math.round(meal.calories)} cal · P:{Math.round(meal.protein)}g
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(meal.id)}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: '1px solid rgba(239,68,68,0.15)',
                                background: 'rgba(239,68,68,0.06)',
                                color: '#ef4444',
                                fontSize: 14,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Weekly Summary Card ───
function WeeklySummaryCard() {
    const { meals } = useMealStore();

    // Get meals from last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`;

    const weekMeals = meals.filter(m => m.date >= cutoff);
    const daysWithMeals = new Set(weekMeals.map(m => m.date)).size;

    if (daysWithMeals < 2) return null;

    const totalCals = weekMeals.reduce((s, m) => s + m.calories, 0);
    const totalProt = weekMeals.reduce((s, m) => s + m.protein, 0);
    const avgCals = Math.round(totalCals / daysWithMeals);
    const avgProt = Math.round(totalProt / daysWithMeals);

    return (
        <div className="card animate-fadeInUp" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 className="section-title">Resumen semanal</h3>
                <span className="badge badge-info" style={{ fontSize: 10 }}>📊 {daysWithMeals} días</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
                <div style={{
                    flex: 1,
                    padding: '14px 12px',
                    background: 'var(--color-surface-accent)',
                    borderRadius: 12,
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Poppins', sans-serif", color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                        {avgCals}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
                        cal/día prom.
                    </div>
                </div>
                <div style={{
                    flex: 1,
                    padding: '14px 12px',
                    background: 'var(--color-surface-accent)',
                    borderRadius: 12,
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Poppins', sans-serif", color: '#ef4444', letterSpacing: '-0.02em' }}>
                        {avgProt}g
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
                        prot/día prom.
                    </div>
                </div>
                <div style={{
                    flex: 1,
                    padding: '14px 12px',
                    background: 'var(--color-surface-accent)',
                    borderRadius: 12,
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Poppins', sans-serif", color: '#22c55e', letterSpacing: '-0.02em' }}>
                        {weekMeals.length}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
                        comidas reg.
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Daily Nutrition Tips ───
function DailyTipCard() {
    const tips = [
        { emoji: '💡', title: 'Proteína en cada comida', text: 'Incluir proteína en cada comida ayuda a mantener la masa muscular y da mayor saciedad.' },
        { emoji: '🥤', title: 'Hidratación', text: 'Beber agua antes de cada comida puede ayudarte a comer porciones adecuadas.' },
        { emoji: '🥗', title: 'La regla del plato', text: '1/2 verduras, 1/4 proteína, 1/4 carbohidratos. Así se arma un plato balanceado.' },
        { emoji: '🕐', title: 'Horarios regulares', text: 'Comer a horas fijas ayuda a tu metabolismo a funcionar de manera óptima.' },
        { emoji: '🍌', title: 'Snacks inteligentes', text: 'Prefiere una fruta con proteína (plátano + maní) en vez de snacks procesados.' },
        { emoji: '🌙', title: 'Cena ligera', text: 'Cenar al menos 2 horas antes de dormir mejora la digestión y el descanso.' },
        { emoji: '🥚', title: 'No temas al huevo', text: 'El huevo es una fuente completa de proteína. 2-3 al día es saludable para la mayoría.' },
        { emoji: '🏃', title: 'Post-entreno', text: 'Después de ejercitar, come proteína + carbos en los primeros 30-60 min para mejor recuperación.' },
        { emoji: '🥑', title: 'Grasas saludables', text: 'Palta, aceite de oliva y frutos secos son grasas buenas que tu cuerpo necesita.' },
        { emoji: '📏', title: 'Porciones con la mano', text: 'Tu puño = 1 porción de carbos. Tu palma = 1 porción de proteína. Tu pulgar = 1 porción de grasa.' },
        { emoji: '🫘', title: 'Menestras peruanas', text: 'Lentejas, frejoles y pallares son proteínas vegetales económicas y nutritivas.' },
        { emoji: '🐟', title: 'Pescado 2x/semana', text: 'Comer pescado 2 veces por semana aporta omega-3 esencial para el cerebro y corazón.' },
        { emoji: '🍊', title: 'Vitamina C + Hierro', text: 'Toma jugo de naranja con comidas ricas en hierro (menestras, carne) para mejor absorción.' },
        { emoji: '⏸️', title: 'Come despacio', text: 'Masticar bien y comer en 20+ min le da tiempo a tu cerebro de sentir la saciedad.' },
    ];

    // Select tip based on day of year for consistency
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const tip = tips[dayOfYear % tips.length];

    return (
        <div className="card animate-fadeInUp" style={{
            marginBottom: 16,
            padding: '16px 18px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))',
            border: '1px solid rgba(59,130,246,0.1)',
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'rgba(59,130,246,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                }}>
                    {tip.emoji}
                </div>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                        {tip.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        {tip.text}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardScreen() {
    const navigate = useNavigate();
    const { metabolicProfile, profile } = useUserStore();
    const { getTodayTotals } = useMealStore();

    if (!metabolicProfile || !profile) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 32, height: 32, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    const { targetCalories, targetProteinG, targetCarbsG, targetFatG } = metabolicProfile;
    const todayTotals = getTodayTotals();
    const currentCalories = todayTotals.calories;
    const currentProtein = todayTotals.protein;
    const currentCarbs = todayTotals.carbs;
    const currentFat = todayTotals.fat;

    const calorieProgress = Math.min((currentCalories / targetCalories) * 100, 100);
    const remaining = Math.max(0, targetCalories - currentCalories);

    const macros = [
        { label: 'Proteína', current: Math.round(currentProtein), target: Math.round(targetProteinG), color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' },
        { label: 'Carbos', current: Math.round(currentCarbs), target: Math.round(targetCarbsG), color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' },
        { label: 'Grasa', current: Math.round(currentFat), target: Math.round(targetFatG), color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)' },
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    const getStatusBadge = () => {
        const pct = (currentCalories / targetCalories) * 100;
        if (pct >= 90 && pct <= 110) return { text: 'En objetivo', cls: 'badge-success' };
        if (pct > 110) return { text: 'Excedido', cls: 'badge-danger' };
        if (pct >= 50) return { text: 'Buen progreso', cls: 'badge-warning' };
        return { text: 'En progreso', cls: 'badge-warning' };
    };

    const status = getStatusBadge();
    const circumference = 2 * Math.PI * 80;
    const strokeDashoffset = circumference * (1 - calorieProgress / 100);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 90 }}>
            {/* ─── Header ─── */}
            <div style={{
                background: 'var(--color-surface-dark)',
                padding: '24px 20px 32px',
                borderRadius: '0 0 28px 28px',
            }}>
                <div style={{ maxWidth: 420, margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
                                {getGreeting()}
                            </p>
                            <h1 style={{
                                color: 'white',
                                fontSize: 22,
                                fontWeight: 700,
                                letterSpacing: '-0.03em',
                                margin: 0,
                            }}>
                                {profile.name}
                            </h1>
                        </div>
                        <div
                            onClick={() => navigate('/profile')}
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 14,
                                background: 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: 18,
                            }}
                        >
                            👤
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 16px' }}>
                {/* ─── Calorie Ring Card ─── */}
                <div className="card-elevated animate-fadeInUp" style={{
                    marginTop: -20,
                    padding: '24px 20px',
                    marginBottom: 16,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        {/* SVG Ring */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <svg width="140" height="140" viewBox="0 0 180 180">
                                <circle cx="90" cy="90" r="80" fill="none" stroke="var(--color-border-light)" strokeWidth="10" />
                                <circle
                                    cx="90" cy="90" r="80"
                                    fill="none"
                                    stroke="url(#calGrad)"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    style={{
                                        transform: 'rotate(-90deg)',
                                        transformOrigin: '90px 90px',
                                        transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                />
                                <defs>
                                    <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#3d4f6f" />
                                        <stop offset="100%" stopColor="#5a7aa0" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                            }}>
                                <div style={{
                                    fontSize: 28,
                                    fontWeight: 800,
                                    fontFamily: "'Poppins', sans-serif",
                                    color: 'var(--color-text-primary)',
                                    lineHeight: 1,
                                    letterSpacing: '-0.03em',
                                }}>
                                    {currentCalories}
                                </div>
                                <div style={{
                                    fontSize: 11,
                                    fontWeight: 500,
                                    color: 'var(--color-text-tertiary)',
                                    marginTop: 2,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}>
                                    calorías
                                </div>
                            </div>
                        </div>

                        {/* Right side info */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                <span className={`badge ${status.cls}`}>{status.text}</span>
                            </div>

                            <div style={{ marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Restantes</span>
                                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Meta</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
                                        {remaining}
                                    </span>
                                    <span style={{ fontSize: 14, color: 'var(--color-text-tertiary)', fontWeight: 500, alignSelf: 'flex-end' }}>
                                        / {targetCalories}
                                    </span>
                                </div>
                            </div>

                            <div className="progress-track">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${calorieProgress}%`,
                                        background: 'linear-gradient(90deg, #3d4f6f, #5a7aa0)',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Macros Row ─── */}
                <div className="stagger-children" style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    {macros.map((m) => {
                        const pct = Math.min((m.current / m.target) * 100, 100);
                        return (
                            <div key={m.label} className="card" style={{
                                flex: 1,
                                padding: '14px 12px',
                                textAlign: 'center',
                            }}>
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    background: m.bg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 8px',
                                }}>
                                    <div style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: 3,
                                        background: m.color,
                                    }} />
                                </div>
                                <div style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    fontFamily: "'Poppins', sans-serif",
                                    color: 'var(--color-text-primary)',
                                    letterSpacing: '-0.02em',
                                }}>
                                    {m.current}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-text-tertiary)' }}>g</span>
                                </div>
                                <div style={{
                                    fontSize: 11,
                                    color: 'var(--color-text-tertiary)',
                                    marginBottom: 6,
                                }}>
                                    de {m.target}g
                                </div>
                                <div className="progress-track" style={{ height: 4 }}>
                                    <div className="progress-fill" style={{ width: `${pct}%`, background: m.color }} />
                                </div>
                                <div style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: 'var(--color-text-tertiary)',
                                    marginTop: 6,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                }}>
                                    {m.label}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ─── Quick Actions ─── */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <div
                        className="action-card"
                        onClick={() => navigate('/food-logging')}
                        style={{ flex: 1 }}
                    >
                        <div className="action-card-icon" style={{ background: 'var(--color-brand-light)', color: 'var(--color-brand)', fontWeight: 700 }}>
                            +
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Registrar</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Agregar comida</div>
                        </div>
                    </div>
                    <div
                        className="action-card"
                        onClick={() => navigate('/meal-suggestions')}
                        style={{ flex: 1 }}
                    >
                        <div className="action-card-icon" style={{ background: 'var(--color-brand-light)', color: 'var(--color-brand)' }}>
                            ✦
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Plan del día</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Qué comer hoy</div>
                        </div>
                    </div>
                </div>

                {/* ─── AI Analysis Card ─── */}
                <div
                    className="card animate-fadeInUp"
                    onClick={() => navigate('/ai-food-analysis')}
                    style={{
                        marginBottom: 16,
                        cursor: 'pointer',
                        background: 'var(--color-surface-dark)',
                        border: 'none',
                        color: 'white',
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                    }}
                >
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: 'rgba(255,255,255,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        flexShrink: 0,
                    }}>
                        📸
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Analizar con IA</div>
                        <div style={{ fontSize: 12, opacity: 0.6 }}>Toma una foto y detecta los alimentos</div>
                    </div>
                    <div style={{ fontSize: 18, opacity: 0.4 }}>›</div>
                </div>

                {/* ─── Recent Meals with Delete ─── */}
                <RecentMealsCard />

                {/* ─── Water Tracker ─── */}
                <div style={{ marginBottom: 16 }}>
                    <WaterTracker />
                </div>

                {/* ─── Weight Progress Mini ─── */}
                <WeightMiniCard navigate={navigate} />

                {/* ─── Daily Streak ─── */}
                <StreakCard />

                {/* ─── Daily Tip ─── */}
                <DailyTipCard />

                {/* ─── Weekly Summary ─── */}
                <WeeklySummaryCard />

                {/* ─── Today's Progress Detail ─── */}
                <div className="card animate-fadeInUp" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 className="section-title">Progreso de hoy</h3>
                        <span className={`badge ${status.cls}`} style={{ fontSize: 10 }}>
                            {Math.round((currentCalories / targetCalories) * 100)}%
                        </span>
                    </div>

                    {/* Calorie breakdown bar */}
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Consumido</span>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{currentCalories} cal</span>
                        </div>
                        <div className="progress-track" style={{ height: 8, borderRadius: 4 }}>
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${calorieProgress}%`,
                                    background: calorieProgress > 100 ? '#ef4444' : 'linear-gradient(90deg, #3d4f6f, #5a7aa0)',
                                    borderRadius: 4,
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>0</span>
                            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{targetCalories} cal</span>
                        </div>
                    </div>

                    {/* Macro details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {macros.map((m) => {
                            const pct = Math.min((m.current / m.target) * 100, 100);
                            const diff = m.target - m.current;
                            return (
                                <div key={m.label}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: 2, background: m.color }} />
                                            <span style={{ fontSize: 13, fontWeight: 500 }}>{m.label}</span>
                                        </div>
                                        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                            {m.current} / {m.target}g
                                            <span style={{ marginLeft: 6, fontSize: 11, color: diff > 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                                                {diff > 0 ? `−${diff}g` : `+${Math.abs(diff)}g`}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="progress-track" style={{ height: 4 }}>
                                        <div className="progress-fill" style={{ width: `${pct}%`, background: m.color }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ─── Weight Goal (if applicable) ─── */}
                {profile.targetWeightKg && profile.targetWeightKg !== profile.currentWeightKg && (
                    <div className="card animate-fadeInUp" style={{ marginBottom: 16 }}>
                        <h3 className="section-title" style={{ marginBottom: 14 }}>Meta de peso</h3>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Actual
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
                                    {profile.currentWeightKg}
                                    <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-text-tertiary)' }}> kg</span>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                color: 'var(--color-text-tertiary)',
                            }}>
                                <div style={{ width: 24, height: 1, background: 'var(--color-border)' }} />
                                <span style={{ fontSize: 16 }}>
                                    {(profile.targetWeightKg - profile.currentWeightKg) > 0 ? '↗' : '↘'}
                                </span>
                                <div style={{ width: 24, height: 1, background: 'var(--color-border)' }} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Objetivo
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Poppins', sans-serif", color: 'var(--color-brand)', letterSpacing: '-0.02em' }}>
                                    {profile.targetWeightKg}
                                    <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-text-tertiary)' }}> kg</span>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            marginTop: 12,
                            padding: '8px 12px',
                            background: 'var(--color-surface-accent)',
                            borderRadius: 10,
                            textAlign: 'center',
                            fontSize: 12,
                            color: 'var(--color-text-secondary)',
                        }}>
                            {Math.abs(profile.targetWeightKg - profile.currentWeightKg).toFixed(1)} kg para tu objetivo
                        </div>
                    </div>
                )}

                {/* ─── Plan Details (collapsed) ─── */}
                <div className="card animate-fadeInUp" style={{ marginBottom: 16 }}>
                    <h3 className="section-title" style={{ marginBottom: 14 }}>Tu plan</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                            { label: 'Metabolismo basal', value: `${Math.round(metabolicProfile.bmr)} cal` },
                            { label: 'Gasto total (TDEE)', value: `${Math.round(metabolicProfile.tdee)} cal` },
                            { label: 'Objetivo diario', value: `${targetCalories} cal`, highlight: true },
                        ].map((item) => (
                            <div key={item.label} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 14px',
                                background: item.highlight ? 'var(--color-brand-light)' : 'var(--color-surface-accent)',
                                borderRadius: 10,
                                border: item.highlight ? '1px solid var(--color-brand-medium)' : '1px solid transparent',
                            }}>
                                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{item.label}</span>
                                <span style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: item.highlight ? 'var(--color-brand)' : 'var(--color-text-primary)',
                                }}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── Motivation ─── */}
                {profile.motivation && (
                    <div className="card-accent animate-fadeInUp" style={{
                        marginBottom: 16,
                        textAlign: 'center',
                        padding: '18px 20px',
                    }}>
                        <div style={{ fontSize: 20, marginBottom: 6 }}>💬</div>
                        <p style={{
                            fontSize: 13,
                            color: 'var(--color-text-secondary)',
                            fontStyle: 'italic',
                            lineHeight: 1.5,
                            margin: 0,
                        }}>
                            "{profile.motivation}"
                        </p>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
