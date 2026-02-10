import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { foodDatabase, categories, FoodItem } from '../data/foods';
import { useMealStore, LoggedMeal } from '../store/mealStore';
import BottomNav from '../components/BottomNav';

export default function FoodLoggingScreen() {
    const navigate = useNavigate();
    const { addMeal, removeMeal, getMealsForToday, getTodayTotals } = useMealStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [selectedServing, setSelectedServing] = useState(0);
    const [customGrams, setCustomGrams] = useState('');
    const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

    const todayMeals = getMealsForToday();
    const todayTotals = getTodayTotals();

    // Filter foods
    const filteredFoods = foodDatabase.filter(food => {
        const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
        const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (food.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleSelectFood = (food: FoodItem) => {
        setSelectedFood(food);
        setSelectedServing(0);
        setCustomGrams('');
    };

    const handleAddMeal = () => {
        if (!selectedFood) return;

        const selectedPortion = customGrams
            ? parseFloat(customGrams)
            : selectedFood.servingSizes[selectedServing].grams;

        if (!selectedPortion || selectedPortion <= 0) {
            alert('Por favor ingresa una cantidad válida');
            return;
        }

        const multiplier = selectedPortion / 100;
        const now = new Date();
        // Use local date to avoid timezone issues
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const currentDate = `${year}-${month}-${day}`;

        // Safe ID generation (works on HTTP)
        const generateId = () => {
            try {
                return crypto.randomUUID();
            } catch {
                return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
        };

        const meal: LoggedMeal = {
            id: generateId(),
            foodId: selectedFood.id,
            foodName: selectedFood.name,
            emoji: selectedFood.emoji,
            grams: selectedPortion,
            calories: parseFloat((selectedFood.caloriesPer100g * multiplier).toFixed(1)),
            protein: parseFloat((selectedFood.proteinPer100g * multiplier).toFixed(1)),
            carbs: parseFloat((selectedFood.carbsPer100g * multiplier).toFixed(1)),
            fat: parseFloat((selectedFood.fatPer100g * multiplier).toFixed(1)),
            mealType: selectedMealType,
            timestamp: now.toISOString(),
            date: currentDate,
        };

        addMeal(meal);
        setSelectedFood(null);
        setSearchQuery('');
    };

    const getMealTypeLabel = (type: string) => {
        switch (type) {
            case 'breakfast': return 'Desayuno';
            case 'lunch': return 'Almuerzo';
            case 'dinner': return 'Cena';
            case 'snack': return 'Snack';
            default: return type;
        }
    };

    const getMealTypeEmoji = (type: string) => {
        switch (type) {
            case 'breakfast': return '🌅';
            case 'lunch': return '☀️';
            case 'dinner': return '🌙';
            case 'snack': return '🍪';
            default: return '🍽️';
        }
    };

    // Group meals by type
    const mealsByType = {
        breakfast: todayMeals.filter(m => m.mealType === 'breakfast'),
        lunch: todayMeals.filter(m => m.mealType === 'lunch'),
        dinner: todayMeals.filter(m => m.mealType === 'dinner'),
        snack: todayMeals.filter(m => m.mealType === 'snack'),
    };

    if (selectedFood) {
        // Food detail view
        const grams = customGrams
            ? parseFloat(customGrams)
            : selectedFood.servingSizes[selectedServing]?.grams || 0;
        const multiplier = grams / 100;

        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="bg-primary text-white p-6">
                    <button onClick={() => setSelectedFood(null)} className="mb-4">
                        ← Volver
                    </button>
                    <h1 className="text-2xl font-bold">Agregar Comida</h1>
                </div>

                <div className="max-w-md mx-auto px-6 py-6">
                    {/* Food Info */}
                    <div className="card mb-6 text-center">
                        <div className="text-6xl mb-3">{selectedFood.emoji}</div>
                        <h2 className="text-2xl font-bold">{selectedFood.name}</h2>
                        {selectedFood.nameEn && (
                            <p className="text-gray-500 text-sm">{selectedFood.nameEn}</p>
                        )}
                    </div>

                    {/* Meal Type */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-3">¿Qué comida es?</label>
                        <div className="grid grid-cols-4 gap-2">
                            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedMealType(type)}
                                    className={`p-3 rounded-xl border-2 transition-all ${selectedMealType === type
                                        ? 'border-primary bg-primary bg-opacity-10'
                                        : 'border-gray-200 bg-white'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">{getMealTypeEmoji(type)}</div>
                                    <div className="text-xs font-medium">{getMealTypeLabel(type)}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Serving Size */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-3">Porción</label>
                        <div className="space-y-2">
                            {selectedFood.servingSizes.map((serving, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedServing(index);
                                        setCustomGrams('');
                                    }}
                                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${selectedServing === index && !customGrams
                                        ? 'border-primary bg-primary bg-opacity-10'
                                        : 'border-gray-200 bg-white'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{serving.name}</span>
                                        <span className="text-gray-600 text-sm">{serving.grams}g</span>
                                    </div>
                                </button>
                            ))}

                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={customGrams}
                                    onChange={(e) => setCustomGrams(e.target.value)}
                                    className="input-field flex-1"
                                    placeholder="Cantidad personalizada"
                                />
                                <span className="text-gray-600">g</span>
                            </div>
                        </div>
                    </div>

                    {/* Nutrition Preview */}
                    {grams > 0 && (
                        <div className="card bg-gray-50 border border-gray-200 mb-6">
                            <h3 className="font-semibold mb-3">Info Nutricional ({grams}g)</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {Math.round(selectedFood.caloriesPer100g * multiplier)}
                                    </div>
                                    <div className="text-xs text-gray-600">Calorías</div>
                                </div>
                                <div className="bg-white rounded-lg p-3 text-center">
                                    <div className="text-xl font-bold text-protein">
                                        {(selectedFood.proteinPer100g * multiplier).toFixed(1)}g
                                    </div>
                                    <div className="text-xs text-gray-600">Proteína</div>
                                </div>
                                <div className="bg-white rounded-lg p-3 text-center">
                                    <div className="text-xl font-bold text-carbs">
                                        {(selectedFood.carbsPer100g * multiplier).toFixed(1)}g
                                    </div>
                                    <div className="text-xs text-gray-600">Carbohidratos</div>
                                </div>
                                <div className="bg-white rounded-lg p-3 text-center">
                                    <div className="text-xl font-bold text-fat">
                                        {(selectedFood.fatPer100g * multiplier).toFixed(1)}g
                                    </div>
                                    <div className="text-xs text-gray-600">Grasa</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleAddMeal}
                        disabled={!grams}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ✓ Agregar a {getMealTypeLabel(selectedMealType)}
                    </button>
                </div>
            </div>
        );
    }

    // Main view - Food list and logged meals
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
                <h1 className="text-2xl font-bold mb-4">Registro de Comidas</h1>

                {/* Today's totals */}
                <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                            <div className="text-2xl font-bold">{todayTotals.calories}</div>
                            <div className="text-xs opacity-90">Calorías</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold">{todayTotals.protein.toFixed(0)}g</div>
                            <div className="text-xs opacity-90">Prot</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold">{todayTotals.carbs.toFixed(0)}g</div>
                            <div className="text-xs opacity-90">Carbs</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold">{todayTotals.fat.toFixed(0)}g</div>
                            <div className="text-xs opacity-90">Grasa</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-6 -mt-2">
                {/* AI Analysis Button - NUEVO! */}
                <div className="mb-4 -mt-2">
                    <button
                        onClick={() => navigate('/ai-food-analysis')}
                        className="w-full bg-primary text-white font-bold py-5 px-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all relative overflow-hidden"
                    >
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                            NUEVO ✨
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-3xl">📸</span>
                            <div className="text-left">
                                <div className="text-lg font-bold">Analizar con IA</div>
                                <div className="text-sm text-purple-100">Toma foto y detecta calorías automáticamente</div>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Search */}
                <div className="mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field"
                        placeholder="🔍 Buscar comida..."
                        autoFocus
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-4 -mx-6 px-6 mb-4">
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setSelectedCategory(cat.key)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedCategory === cat.key
                                ? 'bg-primary text-white font-semibold'
                                : 'bg-white border-2 border-gray-200'
                                }`}
                        >
                            {cat.emoji} {cat.label}
                        </button>
                    ))}
                </div>

                {/* Today's Meals */}
                {todayMeals.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg mb-3">Hoy</h3>
                        <div className="space-y-4">
                            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => {
                                const meals = mealsByType[type];
                                if (meals.length === 0) return null;

                                return (
                                    <div key={type} className="card">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xl">{getMealTypeEmoji(type)}</span>
                                            <span className="font-semibold">{getMealTypeLabel(type)}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {meals.map((meal) => (
                                                <div key={meal.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <span className="text-2xl">{meal.emoji}</span>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-sm">{meal.foodName}</div>
                                                            <div className="text-xs text-gray-600">
                                                                {meal.grams}g • {meal.calories} cal
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeMeal(meal.id)}
                                                        className="text-red-500 px-2"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Food List */}
                <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-3">
                        {searchQuery ? `Resultados (${filteredFoods.length})` : 'Comidas Disponibles'}
                    </h3>
                    {filteredFoods.length === 0 ? (
                        <div className="card text-center text-gray-500">
                            <p>No se encontraron comidas</p>
                            <p className="text-sm mt-2">Intenta con otra búsqueda</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {filteredFoods.map((food) => (
                                <button
                                    key={food.id}
                                    onClick={() => handleSelectFood(food)}
                                    className="card p-4 text-left hover:shadow-lg transition-shadow active:scale-98"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{food.emoji}</span>
                                        <div className="flex-1">
                                            <div className="font-semibold">{food.name}</div>
                                            <div className="text-xs text-gray-600">
                                                {food.caloriesPer100g} cal/100g •{' '}
                                                P: {food.proteinPer100g}g C: {food.carbsPer100g}g F: {food.fatPer100g}g
                                            </div>
                                        </div>
                                        <div className="text-gray-400">→</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
