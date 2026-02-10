/**
 * AI Food Analysis Service
 * 
 * Calls backend endpoint to analyze food images with Gemini Vision
 */
import api from '../api/client';

export interface DetectedFoodItem {
    detected_name: string;
    matched_food_id: string | null;
    matched_food_name: string | null;
    estimated_grams: number;
    preparation: string;
    confidence: number;
    match_confidence: number | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    emoji: string;
}

export interface FoodAnalysisResponse {
    success: boolean;
    matched_foods: DetectedFoodItem[];
    meal_description: string;
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    image_base64?: string;
}

/**
 * Analyze food image using AI
 * @param imageFile Image file to analyze
 * @returns Analysis results with detected foods and nutrition
 */
export const analyzeFood = async (imageFile: File): Promise<FoodAnalysisResponse> => {
    console.log('🚀 analyzeFood called with file:', imageFile.name, imageFile.size, 'bytes');

    const formData = new FormData();
    formData.append('image', imageFile);

    console.log('📤 Sending POST request to /api/analyze-food');
    console.log('🌐 Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000');

    try {
        const response = await api.post<FoodAnalysisResponse>('/api/analyze-food', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 120000, // 120 second timeout (Gemini can be slow)
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded));
                console.log(`📊 Upload progress: ${percentCompleted}%`);
            },
        });

        console.log('✅ Response received:', response.status, response.statusText);
        console.log('📦 Response data:', response.data);

        return response.data;
    } catch (error: any) {
        console.error('💥 Error in analyzeFood:', error);
        console.error('💥 Error message:', error.message);
        console.error('💥 Error code:', error.code);
        console.error('💥 Error response:', error.response);
        throw error;
    }
};
