import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WelcomeScreen() {
    const navigate = useNavigate();
    const [isAnimating, setIsAnimating] = useState(false);

    const handleStart = () => {
        setIsAnimating(true);
        setTimeout(() => navigate('/onboarding'), 300);
    };

    const handleLogin = () => {
        setIsAnimating(true);
        setTimeout(() => navigate('/login'), 300);
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 flex flex-col items-center justify-center p-6 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            {/* Animated Background Circles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300 opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 max-w-md w-full">
                {/* Logo/Icon */}
                <div className="text-center mb-8 animate-bounce">
                    <div className="inline-block p-6 bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl shadow-2xl">
                        <div className="text-7xl">🥗</div>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-3 font-poppins tracking-tight">
                        Smart Nutrition
                    </h1>
                    <p className="text-xl text-white text-opacity-90 font-light">
                        Tu asistente personal de nutrición
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white border-opacity-20">
                    {/* Features */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <span className="text-xl">📊</span>
                            </div>
                            <span className="font-medium">Tracking de macros en tiempo real</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <span className="text-xl">🎯</span>
                            </div>
                            <span className="font-medium">Plan personalizado para ti</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <span className="text-xl">🇵🇪</span>
                            </div>
                            <span className="font-medium">Base de comida peruana</span>
                        </div>
                    </div>

                    {/* Primary CTA */}
                    <button
                        onClick={handleStart}
                        className="w-full bg-white text-primary font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-4"
                    >
                        ✨ Empezar sin cuenta
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-white bg-opacity-30"></div>
                        <span className="text-white text-opacity-70 text-sm font-medium">o</span>
                        <div className="flex-1 h-px bg-white bg-opacity-30"></div>
                    </div>

                    {/* Secondary CTA */}
                    <button
                        onClick={handleLogin}
                        className="w-full bg-white bg-opacity-20 backdrop-blur-sm text-white font-semibold py-4 px-6 rounded-xl border-2 border-white border-opacity-40 hover:bg-opacity-30 transition-all duration-200"
                    >
                        🔐 Ya tengo cuenta
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-white text-opacity-70 text-sm">
                    <p>Sin publicidad • 100% gratis • Privado y seguro</p>
                </div>
            </div>
        </div>
    );
}
