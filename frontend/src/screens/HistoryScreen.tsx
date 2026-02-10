import { useState } from 'react';
import { useMealStore } from '../store/mealStore';
import { useUserStore } from '../store/userStore';
import BottomNav from '../components/BottomNav';

// Helper functions
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (formatDate(date) === formatDate(today)) return 'Hoy';
    if (formatDate(date) === formatDate(yesterday)) return 'Ayer';

    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
};

const getDayDifference = (dateStr: string): number => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export default function HistoryScreen() {
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
    const { meals } = useMealStore();
    const { metabolicProfile } = useUserStore();

    const selectedDateMeals = meals.filter(meal => meal.date === selectedDate);

    const dailyTotals = {
        calories: selectedDateMeals.reduce((sum, meal) => sum + meal.calories, 0),
        protein: selectedDateMeals.reduce((sum, meal) => sum + meal.protein, 0),
        carbs: selectedDateMeals.reduce((sum, meal) => sum + meal.carbs, 0),
        fat: selectedDateMeals.reduce((sum, meal) => sum + meal.fat, 0),
    };

    const targetCalories = metabolicProfile?.tdee || 2000;
    const calorieProgress = Math.min((dailyTotals.calories / targetCalories) * 100, 100);

    // Navigation handlers
    const goToPreviousDay = () => {
        const date = new Date(selectedDate + 'T00:00:00');
        date.setDate(date.getDate() - 1);
        setSelectedDate(formatDate(date));
    };

    const goToNextDay = () => {
        const date = new Date(selectedDate + 'T00:00:00');
        const today = new Date();

        // Don't allow future dates
        if (formatDate(date) < formatDate(today)) {
            date.setDate(date.getDate() + 1);
            setSelectedDate(formatDate(date));
        }
    };

    const goToToday = () => {
        setSelectedDate(formatDate(new Date()));
    };

    const isToday = selectedDate === formatDate(new Date());
    const canGoNext = selectedDate < formatDate(new Date());
    const dayDiff = getDayDifference(selectedDate);

    // Get last 7 days stats for mini chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = formatDate(date);
        const dayMeals = meals.filter(m => m.date === dateStr);
        const dayCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
        return {
            date: dateStr,
            calories: dayCalories,
            isSelected: dateStr === selectedDate,
        };
    });

    const maxCalories = Math.max(...last7Days.map(d => d.calories), targetCalories);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-primary text-white p-6 shadow-lg">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    📅 Historial de Comidas
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                    Revisa tu progreso día a día
                </p>
            </div>

            {/* Date Navigation */}
            <div className="p-4">
                <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={goToPreviousDay}
                            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                        >
                            ←
                        </button>

                        <div className="flex-1 mx-4 text-center">
                            <div className="text-lg font-bold text-gray-800">
                                {formatDisplayDate(selectedDate)}
                            </div>
                            <div className="text-xs text-gray-500">
                                {dayDiff === 0 && '¡Día actual!'}
                                {dayDiff === 1 && 'Hace 1 día'}
                                {dayDiff > 1 && `Hace ${dayDiff} días`}
                            </div>
                        </div>

                        <button
                            onClick={goToNextDay}
                            disabled={!canGoNext}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${canGoNext
                                ? 'bg-primary text-white hover:shadow-lg transform hover:scale-105'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            →
                        </button>
                    </div>

                    {!isToday && (
                        <button
                            onClick={goToToday}
                            className="w-full py-2 bg-primary text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all text-sm"
                        >
                            🏠 Volver a Hoy
                        </button>
                    )}
                </div>

                {/* Weekly Mini Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        📊 Últimos 7 días
                    </h3>
                    <div className="flex items-end justify-between gap-1 h-20">
                        {last7Days.map((day, idx) => {
                            const heightPercent = (day.calories / maxCalories) * 100;
                            const date = new Date(day.date + 'T00:00:00');
                            const dayName = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][date.getDay()];

                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center">
                                    <div
                                        className={`w-full rounded-t transition-all cursor-pointer ${day.isSelected
                                            ? 'bg-primary shadow-md'
                                            : day.calories > 0
                                                ? 'bg-primary-light hover:bg-primary'
                                                : 'bg-gray-200'
                                            }`}
                                        style={{ height: `${Math.max(heightPercent, 5)}%` }}
                                        onClick={() => setSelectedDate(day.date)}
                                    />
                                    <div className={`text-xs mt-1 font-semibold ${day.isSelected ? 'text-purple-600' : 'text-gray-500'}`}>
                                        {dayName}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-center text-xs text-gray-400 mt-2">
                        Click en una barra para ver ese día
                    </div>
                </div>

                {/* Daily Summary */}
                <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        📈 Resumen del Día
                    </h3>

                    {/* Calories */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold text-gray-700">Calorías</span>
                            <span className="text-primary font-bold">
                                {Math.round(dailyTotals.calories)} / {targetCalories} kcal
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-primary h-full rounded-full transition-all duration-500"
                                style={{ width: `${calorieProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-blue-100">
                            <div className="text-2xl mb-1">🍗</div>
                            <div className="text-xs text-gray-600">Proteína</div>
                            <div className="text-lg font-bold text-blue-600">
                                {Math.round(dailyTotals.protein)}g
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-yellow-100">
                            <div className="text-2xl mb-1">🍚</div>
                            <div className="text-xs text-gray-600">Carbos</div>
                            <div className="text-lg font-bold text-yellow-600">
                                {Math.round(dailyTotals.carbs)}g
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-green-100">
                            <div className="text-2xl mb-1">🥑</div>
                            <div className="text-xs text-gray-600">Grasas</div>
                            <div className="text-lg font-bold text-green-600">
                                {Math.round(dailyTotals.fat)}g
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 text-center">
                        <span className="text-xs font-semibold text-gray-600">
                            {selectedDateMeals.length} comida{selectedDateMeals.length !== 1 ? 's' : ''} registrada{selectedDateMeals.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Meals List */}
                <div className="bg-white rounded-2xl shadow-lg p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        🍽️ Comidas del Día
                    </h3>

                    {selectedDateMeals.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-3">🍴</div>
                            <div className="text-gray-500 font-semibold">
                                No hay comidas registradas
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                                {isToday ? 'Empieza agregando tu primera comida' : 'No registraste comidas este día'}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedDateMeals.map((meal) => (
                                <div
                                    key={meal.id}
                                    className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">{meal.emoji || '🍽️'}</div>
                                            <div>
                                                <div className="font-bold text-gray-800">{meal.foodName}</div>
                                                <div className="text-xs text-gray-500">
                                                    {meal.grams}g • {new Date(meal.timestamp).toLocaleTimeString('es-PE', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-primary">
                                                {Math.round(meal.calories)} kcal
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="bg-white bg-opacity-60 rounded px-2 py-1 text-center">
                                            <span className="text-gray-600">P: </span>
                                            <span className="font-semibold text-blue-600">{Math.round(meal.protein)}g</span>
                                        </div>
                                        <div className="bg-white bg-opacity-60 rounded px-2 py-1 text-center">
                                            <span className="text-gray-600">C: </span>
                                            <span className="font-semibold text-yellow-600">{Math.round(meal.carbs)}g</span>
                                        </div>
                                        <div className="bg-white bg-opacity-60 rounded px-2 py-1 text-center">
                                            <span className="text-gray-600">G: </span>
                                            <span className="font-semibold text-green-600">{Math.round(meal.fat)}g</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
