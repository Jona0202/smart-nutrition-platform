import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { syncService } from '../services/syncService';

export default function RegisterScreen() {
    const navigate = useNavigate();
    const { register } = useAuthStore();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [uploadingData, setUploadingData] = useState(false);

    const passwordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length < 6) return { strength: 33, label: 'Débil', color: 'bg-red-500' };
        if (password.length < 10) return { strength: 66, label: 'Media', color: 'bg-yellow-500' };
        return { strength: 100, label: 'Fuerte', color: 'bg-green-500' };
    };

    const strength = passwordStrength(formData.password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validations
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            // Register user
            await register(formData.email, formData.username, formData.password);

            // Check if user has local data
            const hasLocalData = localStorage.getItem('nutrition-user-storage');

            if (hasLocalData) {
                // Upload local data to server
                setUploadingData(true);
                await syncService.uploadLocalDataToServer();
            }

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al crear la cuenta');
        } finally {
            setLoading(false);
            setUploadingData(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 flex flex-col p-6">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 left-10 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 opacity-5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 max-w-md w-full mx-auto my-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/welcome')}
                    className="mb-6 text-white flex items-center gap-2 hover:gap-3 transition-all"
                >
                    <span className="text-2xl">←</span>
                    <span className="font-medium">Volver</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl mb-4">
                        <span className="text-5xl">🎉</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 font-poppins">
                        Crea tu cuenta
                    </h1>
                    <p className="text-white text-opacity-80">
                        Sincroniza tus datos en todos tus dispositivos
                    </p>
                </div>

                {/* Register Card */}
                <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white border-opacity-20">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Input */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                👤 Usuario
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="tunombre"
                                required
                                minLength={3}
                                maxLength={50}
                                className="w-full bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-white focus:border-opacity-60 transition-all"
                            />
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                📧 Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="tu@email.com"
                                required
                                className="w-full bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-white focus:border-opacity-60 transition-all"
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                🔒 Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    minLength={6}
                                    className="w-full bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-white focus:border-opacity-60 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-opacity-70 hover:text-opacity-100"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {/* Password Strength */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${strength.color} transition-all duration-300`}
                                                style={{ width: `${strength.strength}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-white text-xs font-medium">{strength.label}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                🔐 Confirmar Contraseña
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="Repite tu contraseña"
                                required
                                className="w-full bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-white focus:border-opacity-60 transition-all"
                            />
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="text-red-300 text-xs mt-1">⚠️ Las contraseñas no coinciden</p>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500 bg-opacity-20 backdrop-blur-sm border border-red-300 border-opacity-50 rounded-xl p-4 text-white text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || uploadingData}
                            className="w-full bg-white text-primary font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {uploadingData ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    Sincronizando datos...
                                </span>
                            ) : loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    Creando cuenta...
                                </span>
                            ) : (
                                '✨ Crear Cuenta Gratis'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-white text-opacity-80 text-sm">
                            ¿Ya tienes cuenta?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="font-bold text-white underline hover:text-yellow-200 transition-colors"
                            >
                                Inicia sesión
                            </button>
                        </p>
                    </div>
                </div>

                {/* Benefits */}
                <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 border border-white border-opacity-20">
                    <p className="text-white text-opacity-90 text-sm font-medium mb-2">✓ Al crear cuenta obtienes:</p>
                    <ul className="space-y-1 text-white text-opacity-80 text-sm">
                        <li>• Sincronización entre dispositivos</li>
                        <li>• Backup automático en la nube</li>
                        <li>• Acceso desde cualquier lugar</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
