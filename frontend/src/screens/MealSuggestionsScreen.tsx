import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useMealStore } from '../store/mealStore';
import BottomNav from '../components/BottomNav';
import { ProteinOption, Recipe } from '../data/recipes';
import {
    getProteinOptions,
    generateDailyPlan,
    getYouTubeSearchUrl,
    scaleGrams,
    scaleCalories,
    MealPlan,
} from '../services/mealSuggestionService';

const MealSuggestionsScreen: React.FC = () => {
    const navigate = useNavigate();
    const metabolicProfile = useUserStore((s) => s.metabolicProfile);
    const { getTodayTotals, addMeal } = useMealStore();
    const todayTotals = getTodayTotals();

    const [selectedProtein, setSelectedProtein] = useState<ProteinOption | null>(null);
    const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
    const [addedMeals, setAddedMeals] = useState<Set<string>>(new Set());

    const targetCalories = metabolicProfile?.targetCalories || 2000;
    const proteinOptions = useMemo(() => getProteinOptions(), []);

    const handleSelectProtein = (option: ProteinOption) => {
        setSelectedProtein(option);
        setAddedMeals(new Set());
        const plan = generateDailyPlan(option.id, targetCalories, todayTotals.calories);
        setMealPlan(plan);
    };

    const handleRegenerate = () => {
        if (!selectedProtein) return;
        setAddedMeals(new Set());
        const plan = generateDailyPlan(selectedProtein.id, targetCalories, todayTotals.calories);
        setMealPlan(plan);
    };

    const handleBackToProteins = () => {
        setSelectedProtein(null);
        setMealPlan(null);
        setAddedMeals(new Set());
    };

    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

    const handleAddMeal = (recipe: Recipe, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', scaleFactor: number) => {
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        recipe.ingredients.forEach((ing) => {
            addMeal({
                id: generateId(),
                foodId: ing.foodId,
                foodName: ing.name,
                emoji: ing.emoji,
                grams: scaleGrams(ing.grams, scaleFactor),
                calories: scaleCalories(ing.calories, scaleFactor),
                protein: Math.round(ing.protein * scaleFactor),
                carbs: Math.round(ing.carbs * scaleFactor),
                fat: Math.round(ing.fat * scaleFactor),
                mealType,
                timestamp: now.toISOString(),
                date: today,
            });
        });
        setAddedMeals((prev) => new Set([...prev, recipe.id]));
    };

    const remainingCalories = Math.max(targetCalories - todayTotals.calories, 0);

    const mealTypeInfo: Record<string, { label: string; time: string }> = {
        breakfast: { label: 'Desayuno', time: '7:00 – 9:00' },
        lunch: { label: 'Almuerzo', time: '12:00 – 14:00' },
        dinner: { label: 'Cena', time: '19:00 – 21:00' },
        snack: { label: 'Snack', time: 'Entre comidas' },
    };

    // ─── STEP 1: Protein Selection ───
    if (!selectedProtein || !mealPlan) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 90 }}>
                {/* Header */}
                <div style={{
                    background: 'var(--color-surface-dark)',
                    padding: '24px 20px 36px',
                    borderRadius: '0 0 28px 28px',
                }}>
                    <div style={{ maxWidth: 420, margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <button
                                onClick={() => navigate('/dashboard')}
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: 'none',
                                    borderRadius: 12,
                                    width: 38,
                                    height: 38,
                                    color: 'white',
                                    fontSize: 16,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                ←
                            </button>
                            <div>
                                <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>
                                    Plan del día
                                </h1>
                                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: 0 }}>
                                    Elige tu proteína y te armamos las comidas
                                </p>
                            </div>
                        </div>

                        {/* Calorie context */}
                        <div style={{
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: 14,
                            padding: '14px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Restantes hoy
                                </div>
                                <div style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    fontFamily: "'Poppins', sans-serif",
                                    color: 'white',
                                    letterSpacing: '-0.02em',
                                }}>
                                    {remainingCalories} <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.5 }}>cal</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Meta diaria
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                                    {targetCalories} cal
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Protein Options */}
                <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 16px' }}>
                    <h2 style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        margin: '20px 0 12px',
                        letterSpacing: '-0.02em',
                    }}>
                        ¿Qué proteína prefieres?
                    </h2>

                    <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {proteinOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleSelectProtein(option)}
                                className="card"
                                style={{
                                    border: '1px solid var(--color-border-light)',
                                    cursor: 'pointer',
                                    padding: '20px 14px',
                                    textAlign: 'center',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
                                onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                            >
                                <div style={{ fontSize: 36, marginBottom: 8 }}>{option.emoji}</div>
                                <div style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: 'var(--color-text-primary)',
                                    marginBottom: 2,
                                }}>
                                    {option.name}
                                </div>
                                <div style={{
                                    fontSize: 11,
                                    color: 'var(--color-text-tertiary)',
                                }}>
                                    {option.description}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <BottomNav />
            </div>
        );
    }

    // ─── STEP 2: Meal Plan ───
    const mealOrder: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = ['breakfast', 'lunch', 'dinner', 'snack'];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 90 }}>
            {/* Header */}
            <div style={{
                background: 'var(--color-surface-dark)',
                padding: '24px 20px 36px',
                borderRadius: '0 0 28px 28px',
            }}>
                <div style={{ maxWidth: 420, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <button
                            onClick={handleBackToProteins}
                            style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: 'none',
                                borderRadius: 12,
                                width: 38,
                                height: 38,
                                color: 'white',
                                fontSize: 16,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            ←
                        </button>
                        <div>
                            <h1 style={{
                                color: 'white',
                                fontSize: 20,
                                fontWeight: 700,
                                margin: 0,
                                letterSpacing: '-0.03em',
                            }}>
                                {selectedProtein.emoji} Recetas con {selectedProtein.name}
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: 0 }}>
                                Ajustado a {mealPlan.totalCalories} cal
                            </p>
                        </div>
                    </div>

                    {/* Macro summary */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 14,
                        padding: '12px 8px',
                    }}>
                        {[
                            { label: 'Cal', value: mealPlan.totalCalories, unit: '', color: '#f59e0b' },
                            { label: 'Prot', value: mealPlan.totalProtein, unit: 'g', color: '#ef4444' },
                            { label: 'Carbs', value: mealPlan.totalCarbs, unit: 'g', color: '#3b82f6' },
                            { label: 'Grasa', value: mealPlan.totalFat, unit: 'g', color: '#f97316' },
                        ].map((m) => (
                            <div key={m.label} style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    fontFamily: "'Poppins', sans-serif",
                                    color: m.color,
                                    letterSpacing: '-0.02em',
                                }}>
                                    {m.value}<span style={{ fontSize: 11, fontWeight: 400, opacity: 0.7 }}>{m.unit}</span>
                                </div>
                                <div style={{
                                    fontSize: 10,
                                    color: 'rgba(255,255,255,0.4)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}>
                                    {m.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Meal Cards */}
            <div className="stagger-children" style={{ maxWidth: 420, margin: '0 auto', padding: '20px 16px 0' }}>
                {mealOrder.map((type) => {
                    const recipe = mealPlan[type];
                    const info = mealTypeInfo[type];
                    const isAdded = addedMeals.has(recipe.id);
                    const scaledCalories = scaleCalories(recipe.totalCalories, mealPlan.scaleFactor);

                    return (
                        <div key={type} className="card" style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
                            {/* Meal header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '14px 18px 0',
                            }}>
                                <div>
                                    <span style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: 'var(--color-text-primary)',
                                    }}>
                                        {info.label}
                                    </span>
                                    <span style={{
                                        fontSize: 11,
                                        color: 'var(--color-text-tertiary)',
                                        marginLeft: 8,
                                    }}>
                                        {info.time}
                                    </span>
                                </div>
                                <span style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: 'var(--color-brand)',
                                    fontFamily: "'Poppins', sans-serif",
                                }}>
                                    {scaledCalories} cal
                                </span>
                            </div>

                            {/* Recipe name */}
                            <div style={{ padding: '10px 18px 0' }}>
                                <h3 style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: 'var(--color-text-primary)',
                                    margin: 0,
                                    letterSpacing: '-0.02em',
                                }}>
                                    {recipe.emoji} {recipe.name}
                                </h3>
                            </div>

                            {/* Ingredients */}
                            <div style={{ padding: '10px 18px' }}>
                                {recipe.ingredients.map((ing, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '6px 0',
                                        borderBottom: i < recipe.ingredients.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                                    }}>
                                        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                                            {ing.name}
                                        </span>
                                        <span style={{
                                            fontSize: 12,
                                            color: 'var(--color-text-tertiary)',
                                            fontWeight: 500,
                                            fontFamily: "'Poppins', sans-serif",
                                        }}>
                                            {scaleGrams(ing.grams, mealPlan.scaleFactor)}g
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Tip */}
                            <div style={{
                                margin: '0 18px 12px',
                                padding: '8px 12px',
                                background: 'var(--color-surface-accent)',
                                borderRadius: 10,
                                fontSize: 12,
                                color: 'var(--color-text-secondary)',
                                lineHeight: 1.4,
                            }}>
                                {recipe.preparationTip}
                            </div>

                            {/* Actions */}
                            <div style={{
                                display: 'flex',
                                borderTop: '1px solid var(--color-border-light)',
                            }}>
                                <a
                                    href={getYouTubeSearchUrl(recipe)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        padding: '12px',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: '#dc2626',
                                        textDecoration: 'none',
                                        borderRight: '1px solid var(--color-border-light)',
                                    }}
                                >
                                    ▶ Ver receta
                                </a>
                                <button
                                    onClick={() => handleAddMeal(recipe, type, mealPlan.scaleFactor)}
                                    disabled={isAdded}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        padding: '12px',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: isAdded ? 'var(--color-text-tertiary)' : 'var(--color-brand)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: isAdded ? 'default' : 'pointer',
                                    }}
                                >
                                    {isAdded ? '✓ Agregado' : '+ Agregar al día'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Regenerate */}
            <div style={{ maxWidth: 420, margin: '0 auto', padding: '8px 16px 24px', textAlign: 'center' }}>
                <button
                    onClick={handleRegenerate}
                    style={{
                        background: 'transparent',
                        border: '1.5px solid var(--color-border)',
                        borderRadius: 14,
                        padding: '12px 28px',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
                    onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                >
                    Generar otras recetas
                </button>
            </div>

            <BottomNav />
        </div>
    );
};

export default MealSuggestionsScreen;
