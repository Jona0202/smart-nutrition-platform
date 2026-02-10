import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import { useAuthStore } from './store/authStore';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import FoodLoggingScreen from './screens/FoodLoggingScreen';
import HistoryScreen from './screens/HistoryScreen';
import AIFoodAnalysisScreen from './screens/AIFoodAnalysisScreen';
import MealSuggestionsScreen from './screens/MealSuggestionsScreen';
import './index.css';

// Debug utilities (only in development)
if (import.meta.env.DEV) {
    import('./utils/debug');
}

function App() {
    const isOnboarded = useUserStore((state) => state.isOnboarded);
    const { isReturningUser, checkAuth } = useAuthStore();

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                <Routes>
                    {/* Root - redirect based on state */}
                    <Route
                        path="/"
                        element={
                            isOnboarded ? (
                                <Navigate to="/dashboard" replace />
                            ) : isReturningUser ? (
                                <Navigate to="/login" replace />
                            ) : (
                                <Navigate to="/welcome" replace />
                            )
                        }
                    />

                    {/* Auth screens - accessible without onboarding */}
                    <Route path="/welcome" element={<WelcomeScreen />} />
                    <Route path="/login" element={<LoginScreen />} />
                    <Route path="/register" element={<RegisterScreen />} />

                    {/* Onboarding - always accessible */}
                    <Route path="/onboarding" element={<OnboardingScreen />} />

                    {/* Protected routes - require onboarding */}
                    <Route
                        path="/dashboard"
                        element={
                            isOnboarded ? (
                                <DashboardScreen />
                            ) : (
                                <Navigate to="/onboarding" replace />
                            )
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            isOnboarded ? (
                                <ProfileScreen />
                            ) : (
                                <Navigate to="/onboarding" replace />
                            )
                        }
                    />
                    <Route
                        path="/food-logging"
                        element={
                            isOnboarded ? (
                                <FoodLoggingScreen />
                            ) : (
                                <Navigate to="/onboarding" replace />
                            )
                        }
                    />
                    <Route
                        path="/history"
                        element={
                            isOnboarded ? (
                                <HistoryScreen />
                            ) : (
                                <Navigate to="/onboarding" replace />
                            )
                        }
                    />
                    <Route
                        path="/ai-food-analysis"
                        element={
                            isOnboarded ? (
                                <AIFoodAnalysisScreen />
                            ) : (
                                <Navigate to="/onboarding" replace />
                            )
                        }
                    />
                    <Route
                        path="/meal-suggestions"
                        element={
                            isOnboarded ? (
                                <MealSuggestionsScreen />
                            ) : (
                                <Navigate to="/onboarding" replace />
                            )
                        }
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
