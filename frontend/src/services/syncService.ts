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
     * Full sync - profile and meals
     */
    async fullSync() {
        try {
            useUserStore.setState({ syncStatus: 'syncing' });

            // Sync profile both ways (server wins)
            await this.loadProfileFromCloud();

            // Sync meals (merge with local)
            await this.loadMealsFromCloud(7);
            await this.syncMealsToCloud();

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
