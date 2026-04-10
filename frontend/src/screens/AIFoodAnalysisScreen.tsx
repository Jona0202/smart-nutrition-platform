import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealStore } from '../store/mealStore';
import { analyzeFood, DetectedFoodItem } from '../services/aiAnalysis';
import BottomNav from '../components/BottomNav';

type AnalysisStep = 'capture' | 'analyzing' | 'results' | 'error';
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function AIFoodAnalysisScreen() {
    const [step, setStep] = useState<AnalysisStep>('capture');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [detectedFoods, setDetectedFoods] = useState<DetectedFoodItem[]>([]);
    const [mealDescription, setMealDescription] = useState('');
    const [totalCalories, setTotalCalories] = useState(0);
    const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
    const [error, setError] = useState('');
    // Scale mode
    const [useScale, setUseScale] = useState(false);
    const [scaleWeightInput, setScaleWeightInput] = useState('');
    
    // Additional context for hidden ingredients
    const [additionalContext, setAdditionalContext] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { addMeal } = useMealStore();

    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleImageSelect = (file: File) => {
        console.log('📸 Image selected:', file.name, file.size, 'bytes');
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            console.log('✅ Image preview loaded');
            setImagePreview(reader.result as string);
        };
        reader.onerror = (err) => {
            console.error('❌ FileReader error:', err);
        };
        reader.readAsDataURL(file);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('📁 File upload event triggered');
        const file = e.target.files?.[0];
        if (file) {
            console.log('✅ File found:', file.name);
            handleImageSelect(file);
        } else {
            console.log('❌ No file selected');
        }
    };

    const handleAnalyze = async () => {
        if (!selectedImage) return;

        // Validate scale weight if mode is active
        const scaledWeightG = useScale && scaleWeightInput ? parseInt(scaleWeightInput, 10) : undefined;
        if (useScale && (!scaledWeightG || isNaN(scaledWeightG) || scaledWeightG <= 0)) {
            setError('Ingresa el peso de la balanza en gramos para continuar.');
            setStep('error');
            return;
        }

        setStep('analyzing');
        setError('');

        try {
            console.log('🔍 Starting analysis...' + (scaledWeightG ? ` (scale: ${scaledWeightG}g)` : ''));
            const result = await analyzeFood(selectedImage, scaledWeightG, additionalContext);
            console.log('📥 Full result object:', JSON.stringify(result, null, 2));
            console.log('📥 result.success:', result.success);
            console.log('📥 result.matched_foods:', result.matched_foods);
            console.log('📥 matched_foods.length:', result.matched_foods?.length);

            if (result.success && result.matched_foods.length > 0) {
                console.log('✅ Entering success branch - setting states...');
                setDetectedFoods(result.matched_foods);
                setMealDescription(result.meal_description);
                setTotalCalories(result.total_calories);
                console.log('✅ About to set step to RESULTS');
                setStep('results');
                console.log('✅ Step set to RESULTS complete');
            } else {
                console.log('⚠️ No foods detected branch');
                setError('No pudimos detectar comida en esta imagen. Intenta con otra foto.');
                setStep('error');
            }
        } catch (err: any) {
            console.error('❌ Analysis error:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError(err.response?.data?.detail || 'Error al analizar la imagen. Intenta de nuevo.');
            setStep('error');
        }
    };

    const handleRemoveFood = (index: number) => {
        const newFoods = [...detectedFoods];
        newFoods.splice(index, 1);
        setDetectedFoods(newFoods);

        // Recalculate totals
        const newTotal = newFoods.reduce((sum, food) => sum + food.calories, 0);
        setTotalCalories(newTotal);
    };

    // Safe UUID generation that works on HTTP
    const generateId = () => {
        try {
            return crypto.randomUUID();
        } catch {
            // Fallback for HTTP contexts (non-HTTPS)
            return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
    };

    const handleSaveMeals = () => {
        try {
            console.log('💾 Saving meals...');
            const now = new Date();
            const currentDate = formatDate(now);

            detectedFoods.forEach((food, index) => {
                console.log(`Saving food ${index + 1}:`, food.matched_food_name);
                addMeal({
                    id: generateId(),
                    foodId: food.matched_food_id || 'ai-detected',
                    foodName: food.matched_food_name || food.detected_name,
                    emoji: food.emoji,
                    grams: food.estimated_grams,
                    calories: food.calories,
                    protein: food.protein,
                    carbs: food.carbs,
                    fat: food.fat,
                    mealType: selectedMealType,
                    timestamp: now.toISOString(),
                    date: currentDate,
                });
            });

            console.log('✅ All meals saved, navigating to dashboard');
            // Navigate to dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error('❌ Error saving meals:', err);
            setError('Error al guardar comidas. Intenta de nuevo.');
            setStep('error');
        }
    };

    const handleRetry = () => {
        setStep('capture');
        setSelectedImage(null);
        setImagePreview(null);
        setDetectedFoods([]);
        setError('');
        setScaleWeightInput('');
        setAdditionalContext('');
    };

    // Render different steps
    if (step === 'capture') {
        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="bg-primary text-white p-6 shadow-lg">
                    <button onClick={() => navigate(-1)} className="mb-2 text-white">
                        ← Volver
                    </button>
                    <h1 className="text-2xl font-bold">📸 Analizar Comida con IA</h1>
                    <p className="text-purple-100 text-sm mt-1">
                        Toma una foto y déjanos calcular las calorías
                    </p>
                </div>

                <div className="p-6">
                    {/* Image Preview */}
                    {imagePreview ? (
                        <div className="mb-6">
                            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-purple-200">
                                <img src={imagePreview} alt="Preview" className="w-full h-80 object-cover" />
                            </div>
                            {/* Scale mode badge */}
                            {useScale && scaleWeightInput && (
                                <div style={{
                                    marginTop: 10,
                                    padding: '8px 14px',
                                    borderRadius: 10,
                                    background: 'rgba(99,102,241,0.08)',
                                    border: '1px solid rgba(99,102,241,0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}>
                                    <span style={{ fontSize: 16 }}>⚖️</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-brand)' }}>
                                        Modo balanza: {scaleWeightInput}g · Nutrición calculada por peso exacto
                                    </span>
                                </div>
                            )}
                            {/* Hidden Ingredients Input */}
                            <div style={{ marginTop: 12 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: 6 }}>
                                    🕵️ Ingredientes ocultos (Opcional)
                                </label>
                                <textarea
                                    placeholder="Ej: 2 cdtas de azúcar, frito en aceite, 1 scoop de proteína..."
                                    value={additionalContext}
                                    onChange={e => setAdditionalContext(e.target.value)}
                                    rows={2}
                                    style={{
                                        width: '100%', padding: '12px 14px',
                                        borderRadius: 14,
                                        border: '1.5px solid var(--color-border)',
                                        background: 'var(--color-surface)',
                                        color: 'var(--color-text-primary)',
                                        fontSize: 14,
                                        fontFamily: "'Poppins', sans-serif",
                                        boxSizing: 'border-box', outline: 'none',
                                        resize: 'none'
                                    }}
                                />
                                <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                                    La IA sumará estas calorías aunque no las vea en la foto
                                </p>
                            </div>
                            <button
                                onClick={handleAnalyze}
                                className="w-full mt-4 bg-primary text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                            >
                                🧠 Analizar con IA
                            </button>
                            <button
                                onClick={handleRetry}
                                className="w-full mt-2 bg-white text-gray-700 font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-gray-200"
                            >
                                🔄 Cambiar Foto
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                                <div className="text-8xl mb-4">📷</div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">
                                    Captura tu Comida
                                </h2>
                                <p className="text-gray-600 text-sm mb-6">
                                    Toma una foto o sube una imagen desde tu galería
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => cameraInputRef.current?.click()}
                                        className="w-full bg-primary text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                                    >
                                        📸 Tomar Foto
                                    </button>

                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                                    >
                                        📁 Subir desde Galería
                                    </button>
                                </div>

                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            {/* Scale mode toggle */}
                                <div style={{
                                    background: useScale ? 'rgba(99,102,241,0.06)' : 'var(--color-surface)',
                                    border: useScale ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)',
                                    borderRadius: 14,
                                    padding: '14px 16px',
                                    marginTop: 8,
                                    transition: 'all 0.2s ease',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: useScale ? 12 : 0 }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                ⚖️ Tengo balanza tara
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                                                Mayor precisión usando el peso real
                                            </div>
                                        </div>
                                        {/* Toggle switch */}
                                        <div
                                            onClick={() => { setUseScale(!useScale); setScaleWeightInput(''); }}
                                            style={{
                                                width: 46, height: 26, borderRadius: 13,
                                                background: useScale ? 'var(--color-brand)' : 'var(--color-border)',
                                                position: 'relative', cursor: 'pointer',
                                                transition: 'background 0.25s ease', flexShrink: 0,
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute', top: 3,
                                                left: useScale ? 23 : 3,
                                                width: 20, height: 20, borderRadius: '50%',
                                                background: 'white',
                                                transition: 'left 0.25s ease',
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                                            }} />
                                        </div>
                                    </div>
                                    {useScale && (
                                        <div>
                                            <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                                                Peso total en la balanza (gramos):
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="5000"
                                                placeholder="ej: 350"
                                                value={scaleWeightInput}
                                                onChange={e => setScaleWeightInput(e.target.value)}
                                                style={{
                                                    width: '100%', padding: '10px 14px',
                                                    borderRadius: 10,
                                                    border: '1.5px solid var(--color-brand)',
                                                    background: 'var(--color-surface)',
                                                    color: 'var(--color-text-primary)',
                                                    fontSize: 18, fontWeight: 700,
                                                    fontFamily: "'Poppins', sans-serif",
                                                    boxSizing: 'border-box', outline: 'none',
                                                }}
                                            />
                                            <p style={{ fontSize: 10, color: 'var(--color-brand)', margin: '6px 0 0', fontWeight: 500 }}>
                                                ✓ La IA usará este peso exacto para calcular los nutrientes
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </div>

                            {/* Tips */}
                            <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    💡 Consejos para mejores resultados
                                </h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>✓ Buena iluminación</li>
                                    <li>✓ Foto desde arriba (vista cenital)</li>
                                    <li>✓ Toda la comida visible</li>
                                    <li>✓ Evita sombras fuertes</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <BottomNav />
            </div>
        );
    }

    if (step === 'analyzing') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 flex items-center justify-center p-6">
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-md">
                    <div className="relative mb-6">
                        <div className="w-24 h-24 mx-auto bg-white bg-opacity-20 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-6xl">
                            🧠
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Analizando tu comida...
                    </h2>
                    <p className="text-purple-100">
                        Identificando alimentos y calculando nutrición
                    </p>
                    <div className="mt-6 flex justify-center gap-2">
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'error') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-8 text-center max-w-md shadow-2xl">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Ups! Algo salió mal
                    </h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="w-full bg-primary text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    >
                        🔄 Intentar de Nuevo
                    </button>
                    <button
                        onClick={() => navigate('/food-logging')}
                        className="w-full mt-3 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 transition-all"
                    >
                        Agregar Manualmente
                    </button>
                </div>
            </div>
        );
    }

    // Results step
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-primary text-white p-6 shadow-lg">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    ✅ Comida Detectada
                </h1>
                <p className="text-green-100 text-sm mt-1">{mealDescription}</p>
            </div>

            <div className="p-6">
                {/* Total Summary */}
                <div className="bg-white rounded-2xl shadow-xl p-5 mb-4 border-2 border-green-200">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Estimado</h3>
                    <div className="text-4xl font-bold text-green-600 mb-3">
                        {Math.round(totalCalories)} kcal
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                            <div className="font-semibold text-blue-600">
                                {Math.round(detectedFoods.reduce((sum, f) => sum + f.protein, 0))}g
                            </div>
                            <div className="text-gray-500">Proteína</div>
                        </div>
                        <div>
                            <div className="font-semibold text-yellow-600">
                                {Math.round(detectedFoods.reduce((sum, f) => sum + f.carbs, 0))}g
                            </div>
                            <div className="text-gray-500">Carbos</div>
                        </div>
                        <div>
                            <div className="font-semibold text-green-600">
                                {Math.round(detectedFoods.reduce((sum, f) => sum + f.fat, 0))}g
                            </div>
                            <div className="text-gray-500">Grasas</div>
                        </div>
                    </div>
                </div>

                {/* Detected Foods */}
                <h3 className="font-bold text-gray-800 mb-3">Alimentos Detectados</h3>
                <div className="space-y-3 mb-6">
                    {detectedFoods.map((food, index) => (
                        <div key={index} className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-100">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="text-3xl">{food.emoji}</div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-800">
                                            {food.matched_food_name || food.detected_name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {food.estimated_grams}g • {food.preparation}
                                            {food.match_confidence && food.match_confidence < 0.7 && (
                                                <span className="ml-2 text-yellow-600">⚠️ Baja confianza</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-primary">
                                        {Math.round(food.calories)} kcal
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFood(index)}
                                        className="text-red-500 text-xs mt-1 hover:text-red-700"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-xs mt-2">
                                <div className="bg-blue-50 rounded px-2 py-1 text-center">
                                    <span className="text-blue-600 font-semibold">{Math.round(food.protein)}g</span> P
                                </div>
                                <div className="bg-yellow-50 rounded px-2 py-1 text-center">
                                    <span className="text-yellow-600 font-semibold">{Math.round(food.carbs)}g</span> C
                                </div>
                                <div className="bg-green-50 rounded px-2 py-1 text-center">
                                    <span className="text-green-600 font-semibold">{Math.round(food.fat)}g</span> G
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Meal Type Selection */}
                <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
                    <h3 className="font-bold text-gray-800 mb-3">Tipo de Comida</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedMealType(type)}
                                className={`py-3 rounded-xl font-semibold text-sm transition-all ${selectedMealType === type
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {type === 'breakfast' && '🌅'}
                                {type === 'lunch' && '☀️'}
                                {type === 'dinner' && '🌙'}
                                {type === 'snack' && '🍪'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleSaveMeals}
                        className="w-full bg-primary text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    >
                        💾 Guardar Comida
                    </button>
                    <button
                        onClick={handleRetry}
                        className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 transition-all"
                    >
                        🔄 Analizar Otra Foto
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
