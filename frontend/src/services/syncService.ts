import api from '../api/client';
import { useUserStore } from '../store/userStore';
import { useMealStore } from '../store/mealStore';

export const syncService = {
    /**
     * Sync local profile to cloud
     */
    async syncProfileToCloud() {
        const { profile, metabolicProfile } = useUserStore.getState();

        if (!profile || !metabolicProfile) {
            throw new Error('No profile data to sync');
        }

        try {
            await api.post('/api/sync/profile', {
                profile,
                metabolicProfile,
            });

            // Update last sync timestamp
            useUserStore.setState({ lastSyncAt: new Date().toISOString(), syncStatus: 'synced' });
        } catch (error: any) {
            useUserStore.setState({ syncStatus: 'error' });
            throw new Error(error.response?.data?.detail || 'Failed to sync profile');
        }
    },

    /**
     * Load profile from cloud
     */
    async loadProfileFromCloud() {
        try {
            useUserStore.setState({ syncStatus: 'syncing' });

            const response = await api.get('/api/sync/profile');
            const { profile, metabolicProfile } = response.data;

            if (profile && metabolicProfile) {
                useUserStore.getState().setProfile(profile);
                useUserStore.getState().setMetabolicProfile(metabolicProfile);
                useUserStore.setState({
                    lastSyncAt: new Date().toISOString(),
                    syncStatus: 'synced',
                    isOnboarded: true
                });
            }
        } catch (error: any) {
            useUserStore.setState({ syncStatus: 'error' });
            throw new Error(error.response?.data?.detail || 'Failed to load profile');
        }
    },

    /**
     * Sync local meals to cloud
     */
    async syncMealsToCloud() {
        const { meals } = useMealStore.getState();

        if (meals.length === 0) {
            return;
        }

        try {
            await api.post('/api/sync/meals', { meals });
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Failed to sync meals');
        }
    },

    /**
     * Load meals from cloud
     */
    async loadMealsFromCloud(days: number = 7) {
        try {
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - days);

            const response = await api.get('/api/sync/meals', {
                params: {
                    from_date: fromDate.toISOString(),
                    to_date: toDate.toISOString(),
                },
            });

            const { meals } = response.data;

            // Replace local meals with server meals
            useMealStore.setState({ meals });
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Failed to load meals');
        }
    },

    /**
     * Sync local hydration to cloud (today's entry)
     */
    async syncHydrationToCloud() {
        const { getTodayMl } = await import('../store/waterStore').then(m => m.useWaterStore.getState());
        
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        const todayMl = getTodayMl();
        if (todayMl === 0) return; // Nothing to sync for today yet

        try {
            await api.post('/api/sync/hydration', {
                date: today,
                glasses: Math.floor(todayMl / 250),
                ml_total: todayMl
            });
        } catch (error: any) {
            console.error('Failed to sync hydration:', error);
        }
    },

    /**
     * Load hydration from cloud
     */
    async loadHydrationFromCloud() {
        try {
            const response = await api.get('/api/sync/hydration');
            if (response.data?.logs) {
                const { entries } = await import('../store/waterStore').then(m => m.useWaterStore.getState());
                
                // Extremely simple merge: override matching local dates with server data
                let mergedEntries = [...entries];
                for (let serverLog of response.data.logs) {
                    const idx = mergedEntries.findIndex(e => e.date === serverLog.date);
                    if (idx >= 0) {
                        mergedEntries[idx].ml = serverLog.ml_total;
                    } else {
                        mergedEntries.push({ date:serverLog.date, ml: serverLog.ml_total });
                    }
                }
                
                const { useWaterStore } = await import('../store/waterStore');
                useWaterStore.setState({ entries: mergedEntries });
                localStorage.setItem('nutrition-water-storage', JSON.stringify(mergedEntries));
            }
        } catch (error: any) {
             console.error('Failed to load hydration history:', error);
        }
    },
    
    /**
     * Sync recorded weight entry (useful if weight was changed today)
     */
    async syncWeightToCloud(weightKg: number, bodyFatPercentage?: number) {
        try {
            await api.post('/api/sync/weight', {
                weight_kg: weightKg,
                body_fat_percentage: bodyFatPercentage,
                notes: 'Updated from frontend sync',
                recorded_at: new Date().toISOString()
            });
        } catch (error) {
             console.error('Failed to sync weight to cloud:', error);
        }
    },

    /**
     * Full sync - profile, meals, hydration
     */
    async fullSync() {
        try {
            useUserStore.setState({ syncStatus: 'syncing' });

            // Sync profile both ways (server wins)
            await this.loadProfileFromCloud();

            // Sync meals (merge with local)
            await this.loadMealsFromCloud(7);
            await this.syncMealsToCloud();
            
            // Sync hydration
            await this.loadHydrationFromCloud();
            await this.syncHydrationToCloud();

            useUserStore.setState({
                lastSyncAt: new Date().toISOString(),
                syncStatus: 'synced'
            });
        } catch (error: any) {
            useUserStore.setState({ syncStatus: 'error' });
            throw error;
        }
    },

    /**
     * Initial sync after first login
     */
    async initialSyncAfterLogin() {
        try {
            // First, try to load data from server
            await this.loadProfileFromCloud();
            await this.loadMealsFromCloud(30);
            await this.loadHydrationFromCloud();

            useUserStore.setState({
                lastSyncAt: new Date().toISOString(),
                syncStatus: 'synced'
            });
        } catch (error) {
            // If no data on server, that's okay - user will use local data
            console.log('No data on server, using local data');
            useUserStore.setState({ syncStatus: 'none' });
        }
    },

    /**
     * Upload local data to server (after registration from existing local use)
     */
    async uploadLocalDataToServer() {
        try {
            useUserStore.setState({ syncStatus: 'syncing' });

            // Upload profile
            await this.syncProfileToCloud();

            // Upload meals
            await this.syncMealsToCloud();
            
            // Upload hydration
            await this.syncHydrationToCloud();

            useUserStore.setState({
                lastSyncAt: new Date().toISOString(),
                syncStatus: 'synced'
            });
        } catch (error: any) {
            useUserStore.setState({ syncStatus: 'error' });
            throw error;
        }
    },
};
