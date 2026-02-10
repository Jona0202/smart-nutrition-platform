import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { apiService } from '../services/api';
import { UserProfile, Gender, ActivityLevel, Goal, DietType, ExperienceLevel } from '../types';

const TOTAL_STEPS = 11;

export default function OnboardingScreen() {
    const navigate = useNavigate();
    const { setProfile, setMetabolicProfile, completeOnboarding, setOnboardingStep, onboardingStep: savedStep } = useUserStore();

    const [step, setStep] = useState(savedStep || 0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        gender: 'male' as Gender,
        dateOfBirth: '',
        heightCm: '',
        currentWeightKg: '',
        targetWeightKg: '',
        bodyFatPercentage: '',
        goal: 'cutting' as Goal,
        targetDate: '',
        activityLevel: 'moderate' as ActivityLevel,
        dietType: 'omnivore' as DietType,
        restrictions: [] as string[],
        mealsPerDay: 4,
        experienceLevel: 'intermediate' as ExperienceLevel,
        cookingTime: 30,
        budgetLevel: 'medium' as 'low' | 'medium' | 'high',
        motivation: '',
    });

    const handleNext = () => {
        const newStep = step + 1;
        setStep(newStep);
        setOnboardingStep(newStep);
    };

    const handleBack = () => {
        const newStep = step - 1;
        setStep(newStep);
        setOnboardingStep(newStep);
    };

    const toggleRestriction = (restriction: string) => {
        if (formData.restrictions.includes(restriction)) {
            setFormData({
                ...formData,
                restrictions: formData.restrictions.filter(r => r !== restriction)
            });
        } else {
            setFormData({
                ...formData,
                restrictions: [...formData.restrictions, restriction]
            });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const profile: UserProfile = {
                name: formData.name,
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth,
                heightCm: parseFloat(formData.heightCm),
                currentWeightKg: parseFloat(formData.currentWeightKg),
                targetWeightKg: formData.targetWeightKg ? parseFloat(formData.targetWeightKg) : undefined,
                bodyFatPercentage: formData.bodyFatPercentage ? parseFloat(formData.bodyFatPercentage) : undefined,
                goal: formData.goal,
                targetDate: formData.targetDate || undefined,
                activityLevel: formData.activityLevel,
                dietType: formData.dietType,
                restrictions: formData.restrictions,
                mealsPerDay: formData.mealsPerDay,
                experienceLevel: formData.experienceLevel,
                cookingTime: formData.cookingTime,
                budgetLevel: formData.budgetLevel,
                motivation: formData.motivation || undefined,
            };

            const response = await apiService.calculateProfile({
                gender: profile.gender,
                dateOfBirth: profile.dateOfBirth,
                heightCm: profile.heightCm,
                currentWeightKg: profile.currentWeightKg,
                bodyFatPercentage: profile.bodyFatPercentage,
                activityLevel: profile.activityLevel,
                goal: profile.goal,
            } as UserProfile);

            setProfile(profile);
            setMetabolicProfile({
                bmr: response.bmr,
                tdee: response.tdee,
                targetCalories: response.target_calories,
                targetProteinG: response.target_protein_g,
                targetCarbsG: response.target_carbs_g,
                targetFatG: response.target_fat_g,
                macroPercentages: response.macro_percentages,
                calculationMethod: response.calculation_method,
            });

            completeOnboarding();
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Onboarding Error:', error);
            let errorMessage = 'Error al calcular tu plan. Verifica que el servidor esté corriendo.';

            if (error.response) {
                // Server responded with error code
                console.error('Error response:', error.response.data);
                if (error.response.data?.detail) {
                    if (Array.isArray(error.response.data.detail)) {
                        // Pydantic validation error
                        errorMessage = `Error de validación: ${error.response.data.detail[0].msg} en ${error.response.data.detail[0].loc.join('.')}`;
                    } else {
                        errorMessage = `Error del servidor: ${error.response.data.detail}`;
                    }
                } else {
                    errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
                }
            } else if (error.request) {
                // Request made but no response
                errorMessage = 'No hubo respuesta del servidor. Verifica tu conexión a internet y que la IP sea correcta.';
            }

            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Progress bar
    const progress = ((step + 1) / TOTAL_STEPS) * 100;

    // Step 0: Welcome
    if (step === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-700 to-slate-500 flex flex-col items-center justify-center p-6 text-white">
                <div className="text-center space-y-6 max-w-md">
                    <div className="text-7xl mb-4 animate-bounce">🎯</div>
                    <h1 className="text-4xl font-bold font-poppins">Bienvenido a Smart Nutrition</h1>
                    <p className="text-xl opacity-90">Tu asistente personal de nutrición inteligente</p>
                    <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-sm">
                            En los próximos pasos, crearemos un plan nutricional 100% personalizado para ti.
                        </p>
                    </div>
                    <button onClick={handleNext} className="mt-8 bg-white text-primary font-semibold py-4 px-8 rounded-xl shadow-lg active:scale-95 transition-transform">
                        Comenzar mi viaje →
                    </button>
                </div>
            </div>
        );
    }

    // Progress bar component for all steps
    const ProgressBar = () => (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
                Paso {step} de {TOTAL_STEPS - 1}
            </p>
        </div>
    );

    // Step 1: Name
    if (step === 1) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-md mx-auto">
                    <ProgressBar />
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">¿Cómo te llamas?</h2>
                        <p className="text-gray-600">Personalicemos tu experiencia</p>
                    </div>

                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field text-lg"
                        placeholder="Tu nombre"
                        autoFocus
                    />

                    <div className="flex gap-3 mt-8">
                        <button onClick={handleBack} className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 font-semibold">
                            ← Atrás
                        </button>
                        <button
                            onClick={() => formData.name.trim() ? handleNext() : alert('Por favor ingresa tu nombre')}
                            className="flex-1 btn-primary"
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Gender & Age
    if (step === 2) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-md mx-auto">
                    <ProgressBar />
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Hola {formData.name}! 👋</h2>
                        <p className="text-gray-600">Cuéntame sobre ti</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-3">Género</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setFormData({ ...formData, gender: 'male' })}
                                    className={`p-4 rounded-xl border-2 transition-all ${formData.gender === 'male'
                                        ? 'border-primary bg-primary bg-opacity-10 font-semibold'
                                        : 'border-gray-300 bg-white'
                                        }`}
                                >
                                    👨 Hombre
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, gender: 'female' })}
                                    className={`p-4 rounded-xl border-2 transition-all ${formData.gender === 'female'
                                        ? 'border-primary bg-primary bg-opacity-10 font-semibold'
                                        : 'border-gray-300 bg-white'
                                        }`}
                                >
                                    👩 Mujer
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                className="input-field"
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button onClick={handleBack} className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 font-semibold">
                            ← Atrás
                        </button>
                        <button
                            onClick={() => formData.dateOfBirth ? handleNext() : alert('Selecciona tu fecha de nacimiento')}
                            className="flex-1 btn-primary"
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 3: Physical measurements
    if (step === 3) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-md mx-auto">
                    <ProgressBar />
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Medidas Actuales 📏</h2>
                        <p className="text-gray-600">Necesitamos conocer tu punto de partida</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Peso Actual (kg)</label>
                            <input
                                type="number"
                                value={formData.currentWeightKg}
                                onChange={(e) => setFormData({ ...formData, currentWeightKg: e.target.value })}
                                className="input-field"
                                placeholder="80"
                                step="0.1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Altura (cm)</label>
                            <input
                                type="number"
                                value={formData.heightCm}
                                onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                                className="input-field"
                                placeholder="180"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                % Grasa Corporal <span className="text-gray-400 font-normal">(opcional)</span>
                            </label>
                            <input
                                type="number"
                                value={formData.bodyFatPercentage}
                                onChange={(e) => setFormData({ ...formData, bodyFatPercentage: e.target.value })}
                                className="input-field"
                                placeholder="15"
                                step="0.1"
                            />
                            <p className="text-xs text-gray-500 mt-1">Si no lo sabes, déjalo vacío</p>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button onClick={handleBack} className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 font-semibold">
                            ← Atrás
                        </button>
                        <button
                            onClick={() => {
                                if (formData.currentWeightKg && formData.heightCm) {
                                    handleNext();
                                } else {
                                    alert('Por favor completa peso y altura');
                                }
                            }}
                            className="flex-1 btn-primary"
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 4: Goal
    if (step === 4) {
        const goals = [
            {
                key: 'cutting' as Goal,
                emoji: '🔥',
                label: 'Definición',
                desc: 'Perder grasa y revelar músculo',
                detail: 'Déficit calórico de -20%'
            },
            {
                key: 'maintenance' as Goal,
                emoji: '⚖️',
                label: 'Mantenimiento',
                desc: 'Mantener peso y composición actual',
                detail: 'Calorías de mantenimiento'
            },
            {
                key: 'bulking' as Goal,
                emoji: '💪',
                label: 'Volumen',
                desc: 'Ganar músculo y masa',
                detail: 'Superávit calórico de +10%'
            },
        ];

        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-md mx-auto">
                    <ProgressBar />
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Tu Objetivo Principal 🎯</h2>
                        <p className="text-gray-600">¿Qué quieres lograr?</p>
                    </div>

                    <div className="space-y-3">
                        {goals.map((goal) => (
                            <button
                                key={goal.key}
                                onClick={() => setFormData({ ...formData, goal: goal.key })}
                                className={`w-full p-5 rounded-xl border-2 text-left transition-all ${formData.goal === goal.key
                                    ? 'border-primary bg-primary bg-opacity-10 shadow-lg'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <span className="text-4xl">{goal.emoji}</span>
                                    <div className="flex-1">
                                        <div className="font-bold text-lg">{goal.label}</div>
                                        <div className="text-sm text-gray-600 mt-1">{goal.desc}</div>
                                        <div className="text-xs text-primary mt-2">{goal.detail}</div>
                                    </div>
                                    {formData.goal === goal.key && (
                                        <div className="text-primary text-2xl">✓</div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button onClick={handleBack} className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 font-semibold">
                            ← Atrás
                        </button>
                        <button onClick={handleNext} className="flex-1 btn-primary">
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 5: Target weight & timeline
    if (step === 5) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-md mx-auto">
                    <ProgressBar />
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Tu Meta Específica 🎯</h2>
                        <p className="text-gray-600">
                            {formData.goal === 'cutting' && 'CONTINÚA creando una aplicación móvil al nivel de Fitia'}
                            {formData.goal === 'maintenance' && 'Define tu peso ideal'}
                            {formData.goal === 'bulking' && '¿Cuánto quieres ganar?'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Peso Objetivo (kg) <span className="text-gray-400 font-normal">(opcional)</span>
                            </label>
                            <input
                                type="number"
                                value={formData.targetWeightKg}
                                onChange={(e) => setFormData({ ...formData, targetWeightKg: e.target.value })}
                                className="input-field"
                                placeholder={formData.goal === 'cutting' ? '75' : '85'}
                                step="0.1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                ¿Para cuándo? <span className="text-gray-400 font-normal">(opcional)</span>
                            </label>
                            <input
                                type="date"
                                value={formData.targetDate}
                                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                className="input-field"
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Establecer una fecha te ayuda a mantener el enfoque
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button onClick={handleBack} className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 font-semibold">
                            ← Atrás
                        </button>
                        <button onClick={handleNext} className="flex-1 btn-primary">
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 6: Activity Level
    if (step === 6) {
        const activities = [
            { key: 'sedentary' as ActivityLevel, emoji: '🪑', label: 'Sedentario', desc: 'Trabajo de oficina, poco movimiento', multiplier: '1.2x' },
            { key: 'light' as ActivityLevel, emoji: '🚶', label: 'Ligero', desc: 'Ejercicio 1-3 días/semana', multiplier: '1.375x' },
            { key: 'moderate' as ActivityLevel, emoji: '🏃', label: 'Moderado', desc: 'Ejercicio 3-5 días/semana', multiplier: '1.55x' },
            { key: 'active' as ActivityLevel, emoji: '💪', label: 'Activo', desc: 'Ejercicio intenso 6-7 días/semana', multiplier: '1.725x' },
            { key: 'very_active' as ActivityLevel, emoji: '🔥', label: 'Muy Activo', desc: 'Atleta profesional, 2 sesiones/día', multiplier: '1.9x' },
        ];

        return (
            <div className="min-h-screen bg-gray-50 p-6 pb-24">
                <div className="max-w-md mx-auto">
                    <ProgressBar />
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Nivel de Actividad 🏃</h2>
                        <p className="text-gray-600">¿Qué tan activo eres normalmente?</p>
                    </div>

                    <div className="space-y-3">
                        {activities.map((activity) => (
                            <button
                                key={activity.key}
                                onClick={() => setFormData({ ...formData, activityLevel: activity.key })}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${formData.activityLevel === activity.key
                                    ? 'border-primary bg-primary bg-opacity-10'
                                    : 'border-gray-200 bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{activity.emoji}</span>
                                    <div className="flex-1">
                                        <div className="font-semibold flex items-center gap-2">
                                            {activity.label}
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{activity.multiplier}</span>
                                        </div>
                                        <div className="text-sm text-gray-600">{activity.desc}</div>
                                    </div>
                                    {formData.activityLevel === activity.key && (
                                        <div className="text-primary text-xl">✓</div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button onClick={handleBack} className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 font-semibold">
                            ← Atrás
                        </button>
                        <button onClick={handleNext} className="flex-1 btn-primary">
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 7: Diet Type
    if (step === 7) {
        const diets = [
            { key: 'omnivore' as DietType, emoji: '🍖', label: 'Omnívoro', desc: 'Como de todo' },
            { key: 'vegetarian' as DietType, emoji: '🥗', label: 'Vegetariano', desc: 'Sin carne ni pescado' },
            { key: 'vegan' as DietType, emoji: '🌱', label: 'Vegano', desc: 'Solo alimentos vegetales' },
            { key: 'pescatarian' as DietType, emoji: '🐟', label: 'Pescetariano', desc: 'Vegetariano + pescado' },
            { key: 'keto' as DietType, emoji: '🥑', label: 'Keto', desc: 'Bajo en carbohidratos' },
        ];

        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-md mx-auto">
                    <ProgressBar />
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Preferencias Alimentarias 🍽️</h2>
                        <p className="text-gray-600">¿Qué tipo de dieta sigues?</p>
                    </div>

                    <div className="space-y-3">
                        {diets.map((diet) => (
                            <button
                                key={diet.key}
                                onClick={() => setFormData({ ...formData, dietType: diet.key })}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${formData.dietType === diet.key
                                    ? 'border-primary bg-primary bg-opacity-10'
                                    : 'border-gray-200 bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{diet.emoji}</span>
                                    <div className="flex-1">
                                        <div className="font-semibold">{diet.label}</div>
                                        <div className="text-sm text-gray-600">{diet.desc}</div>
                                    </div>
                                    {formData.dietType === diet.key && (
                                        <div className="text-primary text-xl">✓</div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button onClick={handleBack} className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 font-semibold">
                            ← Atrás
                        </button>
                        <button onClick={handleNext} className="flex-1 btn-primary">
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 8: Restrictions & Allergies
    if (step === 8) {
        const restrictions = [
            { key: 'gluten', label: 'Gluten', emoji: '🌾' },
            { key: 'lactose', label: 'Lactosa', emoji: '🥛' },
            { key: 'nuts', label: 'Frutos secos', emoji: '🥜' },
            { key: 'soy', label: 'Soya', emoji: '🫘' },
            { key: 'eggs', label: 'Huevos', emoji: '🥚' },
            { key: 'fish', label: 'Pescado', emoji: '🐟' },
        ];

        return (
            <div className="min-h-screen bg-gray-50 p-6 pb-24">
                <div className="max-w-md mx-auto">
                    <ProgressBar />
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Restricciones 🚫</h2>
                        <p className="text-gray-600">¿Tienes alergias o intolerancias?</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {restrictions.map((restriction) => (
                            <button
                                key={restriction.key}
                                onClick={() => toggleRestriction(restriction.key)}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${formData.restrictions.includes(restriction.key)
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 bg-white'
                                    }`}
                            >
                                <div className="text-3xl mb-2">{restriction.emoji}</div>
                                <div className="text-sm font-medium">{restriction.label}</div>
                                {formData.restrictions.includes(restriction.key) && (
                                    <div className="text-red-500 text-xl mt-1">✓</div>
                                )}
                            </button>
                        ))}
                    </div>

                    {formData.restrictions.length === 0 && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                            <p className="text-green-700 text-sm">
                                ✓ ¡Genial! Sin restricciones alimentarias
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3 mt-8">
                        <button onClick={handleBack} className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 font-semibold">
                            ← Atrás
                        </button>
                        <button onClick={handleNext} className="flex-1 btn-primary">
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 9: Lifestyle (meals, cooking time, experience)
    if (step === 9) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 pb-24">
                <div className="max-w-md mx-auto">
                    <ProgressBar />
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Tu Estilo de Vida 🏠</h2>
                        <p className="text-gray-600">Personalicemos tu plan según tu rutina</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-3">
                                ¿Cuántas comidas al día prefieres?
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {[3, 4, 5, 6].map((meals) => (
                                    <button
                                        key={meals}
                                        onClick={() => setFormData({ ...formData, mealsPerDay: meals })}
                                        className={`p-3 rounded-xl border-2 transition-all ${formData.mealsPerDay === meals
                                            ? 'border-primary bg-primary bg-opacity-10 font-bold'
                                            : 'border-gray-200 bg-white'
                                            }`}
                                    >
                                        {meals}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3">
                                Tiempo disponible para cocinar (min/día)
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="120"
                                step="10"
                                value={formData.cookingTime}
                                onChange={(e) => setFormData({ ...formData, cookingTime: parseInt(e.target.value) })}
                                className="w-full"
                            />
                            <div className="text-center text-2xl font-bold text-primary mt-2">
                                {formData.cookingTime} min
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3">
                                Experiencia con dietas
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { key: 'beginner' as ExperienceLevel, label: '🌱 Nuevo' },
                                    { key: 'intermediate' as ExperienceLevel, label: '📈 Intermedio' },
                                    { key: 'advanced' as ExperienceLevel, label: '🏆 Avanzado' },
                                ].map((exp) => (
                                    <button
                                        key={exp.key}
                                        onClick={() => setFormData({ ...formData, experienceLevel: exp.key })}
                                        className={`p-3 rounded-xl border-2 transition-all text-sm ${formData.experienceLevel === exp.key
                                            ? 'border-primary bg-primary bg-opacity-10 font-semibold'
                                            : 'border-gray-200 bg-white'
                                            }`}
                                    >
                                        {exp.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button onClick={handleBack} className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 font-semibold">
                            ← Atrás
                        </button>
                        <button onClick={handleNext} className="flex-1 btn-primary">
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 10: Motivation (final step before calculation)
    if (step === 10) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-md mx-auto">
                    <ProgressBar />
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Última Pregunta 💭</h2>
                        <p className="text-gray-600">¿Qué te motiva a comenzar este cambio?</p>
                    </div>

                    <textarea
                        value={formData.motivation}
                        onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                        className="input-field min-h-[150px] resize-none"
                        placeholder="Quiero sentirme más saludable, tener más energía, verme mejor..."
                    />

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mt-6">
                        <p className="text-sm text-blue-800">
                            💡 <strong>Tip:</strong> Recordar tu "por qué" te ayudará a mantenerte motivado en los días difíciles
                        </p>
                    </div>

                    <div className="bg-primary rounded-xl p-6 mt-8 text-white">
                        <h3 className="font-bold text-lg mb-2">¡Ya casi terminamos! 🎉</h3>
                        <p className="text-sm opacity-90">
                            En unos segundos tendrás tu plan nutricional 100% personalizado
                        </p>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button onClick={handleBack} className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 font-semibold">
                            ← Atrás
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '⏳ Calculando...' : 'Crear Mi Plan 🚀'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
