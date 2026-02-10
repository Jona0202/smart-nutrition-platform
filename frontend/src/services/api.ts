import axios from 'axios';
import { UserProfile, CalculateProfileResponse } from '../types';

// API base URL - Hardcoded for mobile testing
const API_BASE_URL = 'http://192.168.18.6:8000';

class ApiService {
    /**
     * Calculate metabolic profile from user data
     */
    async calculateProfile(profile: UserProfile): Promise<CalculateProfileResponse> {
        const response = await axios.post<CalculateProfileResponse>(
            `${API_BASE_URL}/demo/calculate-profile`,
            {
                gender: profile.gender,
                date_of_birth: profile.dateOfBirth,
                height_cm: profile.heightCm,
                current_weight_kg: profile.currentWeightKg,
                body_fat_percentage: profile.bodyFatPercentage,
                activity_level: profile.activityLevel,
                goal: profile.goal,
            }
        );
        return response.data;
    }

    /**
     * Health check endpoint
     */
    async healthCheck(): Promise<{ status: string }> {
        const response = await axios.get(`${API_BASE_URL}/health`);
        return response.data;
    }
}

export const apiService = new ApiService();
