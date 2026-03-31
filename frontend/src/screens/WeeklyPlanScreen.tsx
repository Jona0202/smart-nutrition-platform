import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlanStore, MealSlot, DayPlan } from '../store/mealPlanStore';
import { useUserStore } from '../store/userStore';
import BottomNav from '../components/BottomNav';

const MEAL_SLOTS: { slot: MealSlot; label: string; emoji: string; timeHint: string }[] = [
    { slot: 'breakfast', label: 'Desayuno', emoji: '🌅', timeHint: '7–9am' },
    { slot: 'lunch', label: 'Almuerzo', emoji: '☀️', timeHint: '12–2pm' },
    { slot: 'dinner', label: 'Cena', emoji: '🌙', timeHint: '7–9pm' },
    { slot: 'snack', label: 'Snack', emoji: '🍎', timeHint: 'Entre comidas' },
];

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAY_NAMES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function getDayName(dateStr: string, full = false): string {
    const d = new Date(dateStr + 'T12:00:00');
    return full ? DAY_NAMES_FULL[d.getDay()] : DAY_NAMES[d.getDay()];
}

function getDayNumber(dateStr: string): string {
    return new Date(dateStr + 'T12:00:00').getDate().toString();
}

function isToday(dateStr: string): boolean {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateStr === todayStr;
}

function getDayCompletionPct(day: DayPlan): number {
    const meals = [day.breakfast, day.lunch, day.dinner, day.snack].filter(Boolean);
    if (meals.length === 0) return 0;
    return Math.round((meals.filter(m => m!.done).length / meals.length) * 100);
}

function getDayCalories(day: DayPlan): number {
    return [day.breakfast, day.lunch, day.dinner, day.snack]
        .filter(Boolean)
        .reduce((sum, m) => sum + m!.calories, 0);
}

// ─── Day Card ───
function DayCard({
    day,
    isExpanded,
    onToggle,
    onToggleMeal,
    onRegenerate,
}: {
    day: DayPlan;
    isExpanded: boolean;
    onToggle: () => void;
    onToggleMeal: (slot: MealSlot) => void;
    onRegenerate: () => void;
}) {
    const completionPct = getDayCompletionPct(day);
    const dayCalories = getDayCalories(day);
    const today = isToday(day.date);

    return (
        <div
            style={{
                background: 'var(--color-surface)',
                borderRadius: 16,
                marginBottom: 12,
                border: today
                    ? '2px solid var(--color-brand)'
                    : '1px solid var(--color-border)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                boxShadow: today ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
            }}
        >
            {/* Header */}
            <div
                onClick={onToggle}
                style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    background: today ? 'var(--color-brand-light)' : 'transparent',
                }}
            >
                {/* Day circle */}
                <div
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: today ? 'var(--color-brand)' : 'var(--color-surface-accent)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <div style={{ fontSize: 10, fontWeight: 600, color: today ? 'rgba(255,255,255,0.7)' : 'var(--color-text-tertiary)', lineHeight: 1 }}>
                        {getDayName(day.date)}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: today ? 'white' : 'var(--color-text-primary)', lineHeight: 1.2, fontFamily: "'Poppins', sans-serif" }}>
                        {getDayNumber(day.date)}
                    </div>
                </div>

                {/* Center info */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {getDayName(day.date, true)}
                        </span>
                        {today && (
                            <span style={{
                                fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6,
                                background: 'var(--color-brand)', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>HOY</span>
                        )}
                        {completionPct === 100 && (
                            <span style={{ fontSize: 14 }}>✅</span>
                        )}
                    </div>
                    {/* Mini progress bar */}
                    <div style={{ height: 4, background: 'var(--color-border-light)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${completionPct}%`,
                            background: completionPct === 100 ? '#22c55e' : 'var(--color-brand)',
                            borderRadius: 2,
                            transition: 'width 0.4s ease',
                        }} />
                    </div>
                </div>

                {/* Right: calories + expand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: "'Poppins', sans-serif" }}>
                            {dayCalories}
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>kcal</div>
                    </div>
                    <div style={{
                        fontSize: 18,
                        color: 'var(--color-text-tertiary)',
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.3s ease',
                    }}>›</div>
                </div>
            </div>

            {/* Meals (expanded) */}
            {isExpanded && (
                <div style={{ padding: '0 16px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                        {MEAL_SLOTS.map(({ slot, label, emoji, timeHint }) => {
                            const meal = day[slot];
                            if (!meal) return null;

                            return (
                                <div
                                    key={slot}
                                    onClick={() => onToggleMeal(slot)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '10px 12px',
                                        borderRadius: 12,
                                        background: meal.done
                                            ? 'rgba(34,197,94,0.06)'
                                            : 'var(--color-surface-accent)',
                                        border: meal.done ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: meal.done ? 0.75 : 1,
                                    }}
                                >
                                    {/* Meal type icon */}
                                    <div style={{ fontSize: 18, width: 24, textAlign: 'center', flexShrink: 0 }}>{emoji}</div>

                                    {/* Food emoji + name */}
                                    <div style={{ fontSize: 20, flexShrink: 0 }}>{meal.emoji}</div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: 'var(--color-text-primary)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            textDecoration: meal.done ? 'line-through' : 'none',
                                        }}>
                                            {meal.foodName}
                                        </div>
                                        <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>
                                            {label} · {timeHint} · {meal.grams}g
                                        </div>
                                    </div>

                                    {/* Nutrition */}
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: meal.done ? '#22c55e' : 'var(--color-brand)', fontFamily: "'Poppins', sans-serif" }}>
                                            {meal.calories} cal
                                        </div>
                                        <div style={{ fontSize: 9, color: 'var(--color-text-tertiary)' }}>
                                            P:{meal.protein}g C:{meal.carbs}g G:{meal.fat}g
                                        </div>
                                    </div>

                                    {/* Checkmark */}
                                    <div style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 6,
                                        border: meal.done ? 'none' : '2px solid var(--color-border)',
                                        background: meal.done ? '#22c55e' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        color: 'white',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        transition: 'all 0.2s ease',
                                    }}>
                                        {meal.done ? '✓' : ''}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Regenerate button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: 10,
                            border: '1.5px solid var(--color-border)',
                            background: 'transparent',
                            color: 'var(--color-text-secondary)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                        }}
                    >
                        🔄 Regenerar día
                    </button>
                </div>
            )}
        </div>
    );
}

export default function WeeklyPlanScreen() {
    const navigate = useNavigate();
    const { plan, generateWeekPlan, regenerateDayPlan, toggleMealDone } = useMealPlanStore();
    const { metabolicProfile } = useUserStore();
    const [expandedDay, setExpandedDay] = useState<number | null>(null);

    const targetCalories = metabolicProfile?.targetCalories ?? 2000;

    // Find today's index in the plan
    const todayStr = (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    const todayIndex = plan?.days.findIndex(d => d.date === todayStr) ?? -1;

    // Total plan completion
    const planCompletionPct = plan
        ? Math.round(
            (plan.days.flatMap(d => [d.breakfast, d.lunch, d.dinner, d.snack]).filter(m => m?.done).length /
                plan.days.flatMap(d => [d.breakfast, d.lunch, d.dinner, d.snack]).filter(Boolean).length) * 100
        )
        : 0;

    if (!plan) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 90 }}>
                {/* Header */}
                <div style={{
                    background: 'var(--color-surface-dark)',
                    padding: '24px 20px 36px',
                    borderRadius: '0 0 28px 28px',
                }}>
                    <div style={{ maxWidth: 420, margin: '0 auto' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 12 }}>
                            ← Volver
                        </button>
                        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>
                            📅 Plan Semanal
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '6px 0 0' }}>
                            Tu alimentación para los próximos 7 días
                        </p>
                    </div>
                </div>

                {/* Empty state */}
                <div style={{ maxWidth: 420, margin: '0 auto', padding: '32px 20px' }}>
                    <div style={{
                        background: 'var(--color-surface)',
                        borderRadius: 20,
                        padding: '40px 24px',
                        textAlign: 'center',
                        border: '1px solid var(--color-border)',
                    }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>📅</div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
                            Genera tu plan semanal
                        </h2>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 24px' }}>
                            Crea un plan de alimentación personalizado para los próximos 7 días
                            basado en tus calorías diarias objetivo de {targetCalories} kcal.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: 8,
                            justifyContent: 'center',
                            marginBottom: 24,
                            flexWrap: 'wrap',
                        }}>
                            {[
                                { pct: '25%', label: 'Desayuno', color: '#f59e0b' },
                                { pct: '35%', label: 'Almuerzo', color: '#3b82f6' },
                                { pct: '30%', label: 'Cena', color: '#8b5cf6' },
                                { pct: '10%', label: 'Snack', color: '#22c55e' },
                            ].map(item => (
                                <div key={item.label} style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    background: `${item.color}15`,
                                    border: `1px solid ${item.color}30`,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: item.color,
                                }}>
                                    {item.label}: {item.pct}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                generateWeekPlan(targetCalories);
                                setExpandedDay(todayIndex >= 0 ? todayIndex : 0);
                            }}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: 14,
                                border: 'none',
                                background: 'var(--color-brand)',
                                color: 'white',
                                fontSize: 16,
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                            }}
                        >
                            ✨ Generar Plan de 7 Días
                        </button>
                    </div>
                </div>

                <BottomNav />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 90 }}>
            {/* Header */}
            <div style={{
                background: 'var(--color-surface-dark)',
                padding: '24px 20px 36px',
                borderRadius: '0 0 28px 28px',
            }}>
                <div style={{ maxWidth: 420, margin: '0 auto' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 12 }}>
                        ← Volver
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>
                                📅 Plan Semanal
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '4px 0 0' }}>
                                {plan.targetCalories} kcal/día · {planCompletionPct}% completado
                            </p>
                        </div>
                        <button
                            onClick={() => generateWeekPlan(targetCalories)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: 10,
                                border: '1px solid rgba(255,255,255,0.15)',
                                background: 'rgba(255,255,255,0.08)',
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            🔄 Nuevo plan
                        </button>
                    </div>

                    {/* Weekly progress bar */}
                    <div style={{ marginTop: 16 }}>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${planCompletionPct}%`,
                                background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                                borderRadius: 3,
                                transition: 'width 0.5s ease',
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Days list */}
            <div style={{ maxWidth: 420, margin: '0 auto', padding: '16px 16px' }}>
                {plan.days.map((day, idx) => (
                    <DayCard
                        key={day.date}
                        day={day}
                        isExpanded={expandedDay === idx}
                        onToggle={() => setExpandedDay(expandedDay === idx ? null : idx)}
                        onToggleMeal={(slot) => toggleMealDone(idx, slot)}
                        onRegenerate={() => {
                            regenerateDayPlan(idx, targetCalories);
                        }}
                    />
                ))}

                {/* Legend */}
                <div style={{
                    marginTop: 8,
                    padding: '12px 14px',
                    background: 'var(--color-surface)',
                    borderRadius: 12,
                    border: '1px solid var(--color-border)',
                }}>
                    <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.6 }}>
                        💡 <strong>Toca una comida</strong> para marcarla como completada.
                        Toca "Regenerar día" para obtener nuevas opciones de un día específico.
                    </p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
