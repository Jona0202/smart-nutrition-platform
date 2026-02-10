import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import { syncService } from '../services/syncService';
import BottomNav from '../components/BottomNav';

// Cloud Sync Section Component
function CloudSyncSection() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const { syncStatus, lastSyncAt } = useUserStore();
    const navigate = useNavigate();
    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await syncService.fullSync();
        } catch (error: any) {
            alert('Error al sincronizar: ' + error.message);
        } finally {
            setSyncing(false);
        }
    };

    const handleLogout = () => {
        if (confirm('¿Cerrar sesión? Tus datos locales se mantendrán.')) {
            logout();
        }
    };

    const getLastSyncText = () => {
        if (!lastSyncAt) return 'Nunca';
        const date = new Date(lastSyncAt);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Justo ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Hace ${diffHours}h`;
        return date.toLocaleDateString();
    };

    return (
        <div className="card mb-6 bg-gray-50 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                ☁️ Sincronización en la Nube
            </h3>

            {isAuthenticated ? (
                // Logged in state
                <div>
                    <div className="bg-white rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl">
                                ✓
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-800">Conectado</div>
                                <div className="text-sm text-gray-600">{user?.email}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm mb-3">
                            <span className="text-gray-600">Estado:</span>
                            <span className={`font-medium ${syncStatus === 'synced' ? 'text-green-600' :
                                syncStatus === 'syncing' ? 'text-blue-600' :
                                    syncStatus === 'error' ? 'text-red-600' :
                                        'text-gray-600'
                                }`}>
                                {syncStatus === 'synced' && '✓ Sincronizado'}
                                {syncStatus === 'syncing' && '⟳ Sincronizando...'}
                                {syncStatus === 'error' && '⚠️ Error'}
                                {syncStatus === 'none' && '⏸ En pausa'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Última sincronización:</span>
                            <span className="font-medium text-gray-800">{getLastSyncText()}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={handleSync}
                            disabled={syncing || syncStatus === 'syncing'}
                            className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {syncing ? '⟳ Sincronizando...' : '🔄 Sincronizar Ahora'}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full bg-white text-gray-700 font-medium py-3 px-4 rounded-xl border-2 border-gray-300 hover:bg-gray-50 active:scale-95 transition-all"
                        >
                            🚪 Cerrar Sesión
                        </button>
                    </div>
                </div>
            ) : (
                // Not logged in state
                <div>
                    <div className="bg-white rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-3xl">
                                💾
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-800">Sin cuenta</div>
                                <div className="text-sm text-gray-600">Solo dispositivo local</div>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 leading-relaxed">
                            Tus datos están guardados en este dispositivo.
                            Crea una cuenta para sincronizar entre dispositivos.
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={() => navigate('/register')}
                            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
                        >
                            ✨ Crear Cuenta Gratis
                        </button>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-white text-primary font-semibold py-3 px-4 rounded-xl border-2 border-primary hover:bg-blue-50 active:scale-95 transition-all"
                        >
                            🔐 Ya Tengo Cuenta
                        </button>
                    </div>

                    <div className="mt-4 bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-blue-800 font-medium mb-1">✓ Beneficios:</div>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Sincroniza entre dispositivos</li>
                            <li>• Backup automático</li>
                            <li>• Acceso desde cualquier lugar</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ProfileScreen() {
    const navigate = useNavigate();
    const { profile, metabolicProfile, setMetabolicProfile, resetUser } = useUserStore();
    const [loading, setLoading] = useState(false);

    if (!profile || !metabolicProfile) {
        return null;
    }

    const calculateAge = () => {
        const birthDate = new Date(profile.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const calculateBMI = () => {
        const heightM = profile.heightCm / 100;
        const bmi = profile.currentWeightKg / (heightM * heightM);
        return bmi.toFixed(1);
    };

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return 'Bajo peso';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Sobrepeso';
        return 'Obesidad';
    };

    const handleRecalculate = async () => {
        setLoading(true);
        try {
            const response = await apiService.calculateProfile(profile);
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
            alert('Plan recalculado exitosamente!');
        } catch (error) {
            alert('Error al recalcular. Verifica que el servidor esté corriendo.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (confirm('¿Estás seguro? Esto borrará todos tus datos.')) {
            resetUser();
            navigate('/onboarding');
        }
    };

    const bmi = parseFloat(calculateBMI());

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-primary text-white p-6 pb-8">
                <div className="max-w-md mx-auto">
                    <button onClick={() => navigate('/dashboard')} className="mb-4 opacity-90">
                        ← Volver
                    </button>
                    <h1 className="text-2xl font-bold">Mi Perfil</h1>
                </div>
            </div>

            <div className="max-w-md mx-auto px-6 -mt-4">
                {/* Avatar */}
                <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto bg-primary rounded-full flex items-center justify-center text-white text-4xl mb-3">
                        {profile.gender === 'male' ? '👨' : '👩'}
                    </div>
                    <h2 className="text-xl font-semibold">Usuario</h2>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-primary">{profile.currentWeightKg} kg</div>
                        <div className="text-sm text-gray-600 mt-1">Peso</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-primary">{profile.heightCm} cm</div>
                        <div className="text-sm text-gray-600 mt-1">Altura</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-primary">{calculateAge()} años</div>
                        <div className="text-sm text-gray-600 mt-1">Edad</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-primary">{bmi}</div>
                        <div className="text-sm text-gray-600 mt-1">BMI</div>
                        <div className="text-xs text-gray-500 mt-0.5">{getBMICategory(bmi)}</div>
                    </div>
                </div>

                {/* Current Goal */}
                <div className="card mb-6">
                    <h3 className="text-lg font-semibold mb-3">Objetivo Actual</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">
                            {profile.goal === 'cutting' && '🔥'}
                            {profile.goal === 'maintenance' && '⚖️'}
                            {profile.goal === 'bulking' && '💪'}
                        </span>
                        <div>
                            <div className="font-semibold">
                                {profile.goal === 'cutting' && 'Definición'}
                                {profile.goal === 'maintenance' && 'Mantenimiento'}
                                {profile.goal === 'bulking' && 'Volumen'}
                            </div>
                            <div className="text-sm text-gray-600">
                                {profile.goal === 'cutting' && '-20% calorías'}
                                {profile.goal === 'maintenance' && 'Sin ajuste'}
                                {profile.goal === 'bulking' && '+10% calorías'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Level */}
                <div className="card mb-6">
                    <h3 className="text-lg font-semibold mb-3">Nivel de Actividad</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">
                            {profile.activityLevel === 'sedentary' && '🪑'}
                            {profile.activityLevel === 'light' && '🚶'}
                            {profile.activityLevel === 'moderate' && '🏃'}
                            {profile.activityLevel === 'active' && '💪'}
                            {profile.activityLevel === 'very_active' && '🔥'}
                        </span>
                        <div>
                            <div className="font-semibold capitalize">
                                {profile.activityLevel === 'sedentary' && 'Sedentario'}
                                {profile.activityLevel === 'light' && 'Ligero'}
                                {profile.activityLevel === 'moderate' && 'Moderado'}
                                {profile.activityLevel === 'active' && 'Activo'}
                                {profile.activityLevel === 'very_active' && 'Muy Activo'}
                            </div>
                            <div className="text-sm text-gray-600">
                                {profile.activityLevel === 'sedentary' && 'Poco ejercicio'}
                                {profile.activityLevel === 'light' && '1-3 días/semana'}
                                {profile.activityLevel === 'moderate' && '3-5 días/semana'}
                                {profile.activityLevel === 'active' && '6-7 días/semana'}
                                {profile.activityLevel === 'very_active' && 'Atleta profesional'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body Fat */}
                {profile.bodyFatPercentage && (
                    <div className="card mb-6">
                        <h3 className="text-lg font-semibold mb-3">Composición Corporal</h3>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary">{profile.bodyFatPercentage}%</div>
                            <div className="text-sm text-gray-600 mt-1">Grasa Corporal</div>
                        </div>
                    </div>
                )}

                {/* Cloud Sync Section */}
                <CloudSyncSection />

                {/* Actions */}
                <div className="space-y-3 mb-6">
                    <button
                        onClick={handleRecalculate}
                        disabled={loading}
                        className="btn-primary w-full disabled:opacity-50"
                    >
                        {loading ? 'Recalculando...' : '🔄 Recalcular Plan'}
                    </button>

                    <button
                        onClick={handleReset}
                        className="w-full py-3 px-6 rounded-xl border-2 border-red-500 text-red-500 font-semibold active:scale-95 transition-transform"
                    >
                        🗑️ Resetear Datos
                    </button>
                </div>

                {/* Info */}
                <div className="text-center text-sm text-gray-500 mb-4">
                    <p>Los datos se guardan localmente en tu dispositivo</p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
