import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { syncService } from '../services/syncService';

export default function LoginScreen() {
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Login
            await login(email, password);

            // Load data from server
            await syncService.initialSyncAfterLogin();

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 flex flex-col p-6">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-300 opacity-5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
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
                        <span className="text-5xl">👋</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 font-poppins">
                        ¡Bienvenido de vuelta!
                    </h1>
                    <p className="text-white text-opacity-80">
                        Continúa tu progreso nutricional
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white border-opacity-20">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                📧 Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
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
                            disabled={loading}
                            className="w-full bg-white text-primary font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    Iniciando sesión...
                                </span>
                            ) : (
                                '✓ Iniciar Sesión'
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-white text-opacity-80 text-sm">
                            ¿No tienes cuenta?{' '}
                            <button
                                onClick={() => navigate('/register')}
                                className="font-bold text-white underline hover:text-yellow-200 transition-colors"
                            >
                                Regístrate gratis
                            </button>
                        </p>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-full border border-white border-opacity-20">
                        <span className="text-green-300">🔒</span>
                        <span className="text-white text-opacity-80 text-sm">Conexión segura encriptada</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
