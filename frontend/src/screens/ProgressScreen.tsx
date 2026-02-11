import { useState, useMemo } from 'react';
import { useWeightStore, WeightEntry } from '../store/weightStore';
import { useUserStore } from '../store/userStore';
import BottomNav from '../components/BottomNav';

// Simple SVG chart component
function WeightChart({ entries, targetWeight }: { entries: WeightEntry[]; targetWeight?: number }) {
    if (entries.length < 2) {
        return (
            <div style={{
                height: 180,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-tertiary)',
                fontSize: 13,
            }}>
                Registra al menos 2 pesos para ver la gráfica
            </div>
        );
    }

    const weights = entries.map(e => e.weightKg);
    const minW = Math.min(...weights, targetWeight || Infinity) - 1;
    const maxW = Math.max(...weights, targetWeight || -Infinity) + 1;
    const range = maxW - minW || 1;

    const W = 340;
    const H = 160;
    const padX = 40;
    const padY = 20;
    const chartW = W - padX * 2;
    const chartH = H - padY * 2;

    const points = entries.map((e, i) => ({
        x: padX + (i / (entries.length - 1)) * chartW,
        y: padY + (1 - (e.weightKg - minW) / range) * chartH,
        weight: e.weightKg,
        date: e.date,
    }));

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = linePath + ` L ${points[points.length - 1].x} ${H - padY} L ${points[0].x} ${H - padY} Z`;

    const targetY = targetWeight ? padY + (1 - (targetWeight - minW) / range) * chartH : null;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 180 }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(f => {
                const y = padY + f * chartH;
                const val = (maxW - f * range).toFixed(1);
                return (
                    <g key={f}>
                        <line x1={padX} x2={W - padX} y1={y} y2={y} stroke="rgba(150,150,150,0.15)" strokeDasharray="3,3" />
                        <text x={padX - 6} y={y + 3} textAnchor="end" fill="rgba(150,150,150,0.5)" fontSize="9">{val}</text>
                    </g>
                );
            })}

            {/* Target weight line */}
            {targetY !== null && (
                <g>
                    <line x1={padX} x2={W - padX} y1={targetY} y2={targetY} stroke="#22c55e" strokeDasharray="6,3" strokeWidth="1.5" opacity="0.6" />
                    <text x={W - padX + 4} y={targetY + 3} fill="#22c55e" fontSize="9" fontWeight="600">Meta</text>
                </g>
            )}

            {/* Area fill */}
            <path d={areaPath} fill="url(#weightGrad)" opacity="0.3" />

            {/* Line */}
            <path d={linePath} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data points */}
            {points.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r="4" fill="#8b5cf6" stroke="white" strokeWidth="2" />
                    {(i === 0 || i === points.length - 1) && (
                        <text x={p.x} y={p.y - 10} textAnchor="middle" fill="var(--color-text-primary)" fontSize="10" fontWeight="600">
                            {p.weight}
                        </text>
                    )}
                </g>
            ))}

            {/* Gradient definition */}
            <defs>
                <linearGradient id="weightGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export default function ProgressScreen() {
    const { entries, addEntry, removeEntry, getLatestWeight, getWeightChange, getTrend } = useWeightStore();
    const profile = useUserStore((s) => s.profile);
    const [inputWeight, setInputWeight] = useState('');
    const [inputNote, setInputNote] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);

    const latestWeight = getLatestWeight();
    const trend = getTrend();
    const weeklyChange = getWeightChange(7);
    const monthlyChange = getWeightChange(30);
    const targetWeight = profile?.targetWeightKg;
    const currentWeight = latestWeight || profile?.currentWeightKg || 0;

    const filteredEntries = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - timeRange);
        const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
        return entries.filter(e => e.date >= cutoffStr);
    }, [entries, timeRange]);

    const handleAddWeight = () => {
        const w = parseFloat(inputWeight);
        if (isNaN(w) || w < 20 || w > 300) return;
        addEntry(w, inputNote || undefined);
        setInputWeight('');
        setInputNote('');
        setShowForm(false);
    };

    const bmi = currentWeight && profile?.heightCm
        ? Math.round((currentWeight / ((profile.heightCm / 100) ** 2)) * 10) / 10
        : null;

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return { label: 'Bajo peso', color: '#f59e0b' };
        if (bmi < 25) return { label: 'Normal', color: '#22c55e' };
        if (bmi < 30) return { label: 'Sobrepeso', color: '#f97316' };
        return { label: 'Obesidad', color: '#ef4444' };
    };

    const getTrendDisplay = () => {
        if (!trend) return { icon: '—', label: 'Sin datos', color: 'var(--color-text-tertiary)' };
        if (trend === 'down') return { icon: '↓', label: 'Bajando', color: '#22c55e' };
        if (trend === 'up') return { icon: '↑', label: 'Subiendo', color: '#ef4444' };
        return { icon: '→', label: 'Estable', color: '#3b82f6' };
    };

    const trendDisplay = getTrendDisplay();
    const distanceToGoal = targetWeight ? Math.round((currentWeight - targetWeight) * 10) / 10 : null;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 90 }}>
            {/* Header */}
            <div style={{
                background: 'var(--color-surface-dark)',
                padding: '24px 20px 36px',
                borderRadius: '0 0 28px 28px',
            }}>
                <div style={{ maxWidth: 420, margin: '0 auto' }}>
                    <h1 style={{
                        color: 'white',
                        fontSize: 22,
                        fontWeight: 700,
                        margin: 0,
                        letterSpacing: '-0.03em',
                        marginBottom: 20,
                    }}>
                        📊 Mi Progreso
                    </h1>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: 14,
                            padding: '14px 12px',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                                Actual
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: "'Poppins', sans-serif" }}>
                                {currentWeight ? `${currentWeight}` : '—'}
                                <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.5 }}> kg</span>
                            </div>
                        </div>

                        <div style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: 14,
                            padding: '14px 12px',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                                Tendencia
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: trendDisplay.color, fontFamily: "'Poppins', sans-serif" }}>
                                {trendDisplay.icon}
                                <span style={{ fontSize: 12, fontWeight: 500 }}> {trendDisplay.label}</span>
                            </div>
                        </div>

                        {targetWeight && (
                            <div style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.06)',
                                borderRadius: 14,
                                padding: '14px 12px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                                    Meta
                                </div>
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e', fontFamily: "'Poppins', sans-serif" }}>
                                    {targetWeight}
                                    <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.5 }}> kg</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 16px' }}>
                {/* Distance to goal */}
                {distanceToGoal !== null && (
                    <div className="card" style={{ marginTop: 16, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                {distanceToGoal > 0 ? '🎯 Te faltan' : '🏆 Superaste tu meta por'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                                {distanceToGoal > 0 ? 'para alcanzar tu peso meta' : '¡Felicidades!'}
                            </div>
                        </div>
                        <div style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: distanceToGoal > 0 ? '#f59e0b' : '#22c55e',
                            fontFamily: "'Poppins', sans-serif",
                        }}>
                            {Math.abs(distanceToGoal)} <span style={{ fontSize: 12, fontWeight: 400 }}>kg</span>
                        </div>
                    </div>
                )}

                {/* Chart */}
                <div className="card" style={{ marginTop: 12, padding: '16px 8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px', marginBottom: 8 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                            Evolución de peso
                        </h3>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {([7, 30, 90] as const).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setTimeRange(d)}
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: 8,
                                        border: 'none',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        background: timeRange === d ? 'var(--color-brand)' : 'var(--color-surface-accent)',
                                        color: timeRange === d ? 'white' : 'var(--color-text-tertiary)',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {d}d
                                </button>
                            ))}
                        </div>
                    </div>
                    <WeightChart entries={filteredEntries} targetWeight={targetWeight} />
                </div>

                {/* Changes cards */}
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <div className="card" style={{ flex: 1, padding: '14px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                            Última semana
                        </div>
                        <div style={{
                            fontSize: 20,
                            fontWeight: 700,
                            fontFamily: "'Poppins', sans-serif",
                            color: weeklyChange ? (weeklyChange.change < 0 ? '#22c55e' : weeklyChange.change > 0 ? '#ef4444' : 'var(--color-text-primary)') : 'var(--color-text-tertiary)',
                        }}>
                            {weeklyChange ? `${weeklyChange.change > 0 ? '+' : ''}${weeklyChange.change} kg` : '—'}
                        </div>
                    </div>
                    <div className="card" style={{ flex: 1, padding: '14px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                            Último mes
                        </div>
                        <div style={{
                            fontSize: 20,
                            fontWeight: 700,
                            fontFamily: "'Poppins', sans-serif",
                            color: monthlyChange ? (monthlyChange.change < 0 ? '#22c55e' : monthlyChange.change > 0 ? '#ef4444' : 'var(--color-text-primary)') : 'var(--color-text-tertiary)',
                        }}>
                            {monthlyChange ? `${monthlyChange.change > 0 ? '+' : ''}${monthlyChange.change} kg` : '—'}
                        </div>
                    </div>
                    {bmi && (
                        <div className="card" style={{ flex: 1, padding: '14px 12px', textAlign: 'center' }}>
                            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                                IMC
                            </div>
                            <div style={{
                                fontSize: 20,
                                fontWeight: 700,
                                fontFamily: "'Poppins', sans-serif",
                                color: getBMICategory(bmi).color,
                            }}>
                                {bmi}
                            </div>
                            <div style={{ fontSize: 10, color: getBMICategory(bmi).color, fontWeight: 500, marginTop: 2 }}>
                                {getBMICategory(bmi).label}
                            </div>
                        </div>
                    )}
                </div>

                {/* Add weight button / form */}
                {!showForm ? (
                    <button
                        onClick={() => setShowForm(true)}
                        style={{
                            width: '100%',
                            marginTop: 16,
                            padding: '14px',
                            borderRadius: 14,
                            border: 'none',
                            background: 'var(--color-brand)',
                            color: 'white',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
                        onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                    >
                        ⚖️ Registrar peso de hoy
                    </button>
                ) : (
                    <div className="card" style={{ marginTop: 16, padding: 18 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 14px' }}>
                            ⚖️ Registrar peso
                        </h3>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4, display: 'block' }}>
                                Peso (kg)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={inputWeight}
                                onChange={(e) => setInputWeight(e.target.value)}
                                placeholder={currentWeight ? `${currentWeight}` : '70.0'}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: 10,
                                    border: '1.5px solid var(--color-border)',
                                    background: 'var(--color-surface)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: 16,
                                    fontWeight: 600,
                                    fontFamily: "'Poppins', sans-serif",
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4, display: 'block' }}>
                                Nota (opcional)
                            </label>
                            <input
                                type="text"
                                value={inputNote}
                                onChange={(e) => setInputNote(e.target.value)}
                                placeholder="ej: después de entrenar"
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: 10,
                                    border: '1.5px solid var(--color-border)',
                                    background: 'var(--color-surface)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: 13,
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={() => setShowForm(false)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: 10,
                                    border: '1.5px solid var(--color-border)',
                                    background: 'transparent',
                                    color: 'var(--color-text-secondary)',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddWeight}
                                disabled={!inputWeight}
                                style={{
                                    flex: 2,
                                    padding: '12px',
                                    borderRadius: 10,
                                    border: 'none',
                                    background: inputWeight ? 'var(--color-brand)' : 'var(--color-surface-accent)',
                                    color: inputWeight ? 'white' : 'var(--color-text-tertiary)',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: inputWeight ? 'pointer' : 'default',
                                }}
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                )}

                {/* Recent entries */}
                {entries.length > 0 && (
                    <div style={{ marginTop: 16, marginBottom: 24 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                            Registros recientes
                        </h3>
                        {entries.slice(-10).reverse().map((entry) => {
                            const d = new Date(entry.date + 'T12:00:00');
                            const dateStr = d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
                            return (
                                <div
                                    key={entry.id}
                                    className="card"
                                    style={{
                                        marginBottom: 6,
                                        padding: '12px 16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                            {entry.weightKg} kg
                                        </span>
                                        {entry.note && (
                                            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginLeft: 8 }}>
                                                {entry.note}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{dateStr}</span>
                                        <button
                                            onClick={() => removeEntry(entry.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--color-text-tertiary)',
                                                fontSize: 14,
                                                cursor: 'pointer',
                                                padding: '2px 4px',
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
