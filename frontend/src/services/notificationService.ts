import { LocalNotifications } from '@capacitor/local-notifications';

export const notificationService = {
    /**
     * Pide permisos al usuario y programa recordatorios diarios si los concede
     */
    async initialize() {
        try {
            const { display } = await LocalNotifications.requestPermissions();
            if (display === 'granted') {
                await this.setupDailyReminders();
                return true;
            }
            return false;
        } catch (e) {
            console.error('No se pudieron configurar notificaciones', e);
            return false;
        }
    },

    /**
     * Configura recordatorios fijos de agua y sugerencia para cena
     */
    async setupDailyReminders() {
        try {
            // Cancelar anteriores primero para evitar duplicados múltiples
            const pending = await LocalNotifications.getPending();
            if (pending.notifications.length > 0) {
                await LocalNotifications.cancel({ notifications: pending.notifications });
            }

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: "💧 ¡Hora de hidratarte!",
                        body: "Recuerda tomar un vaso de agua para mantener tu metabolismo activo.",
                        id: 1,
                        schedule: { on: { hour: 10, minute: 0 } },
                        actionTypeId: "",
                        extra: null
                    },
                    {
                        title: "💧 ¡Mantén tu hidratación!",
                        body: "Toma agua para no perder el ritmo en la tarde.",
                        id: 2,
                        schedule: { on: { hour: 15, minute: 0 } },
                        actionTypeId: "",
                        extra: null
                    },
                    {
                        title: "🍽️ ¿Qué falta para hoy?",
                        body: "Registra tu cena para asegurarte que cumples tu meta de calorías o si te falta algo de proteína.",
                        id: 3,
                        schedule: { on: { hour: 20, minute: 0 } },
                        actionTypeId: "",
                        extra: null
                    }
                ]
            });
        } catch (e) {
            console.error('Error scheduling daily reminders:', e);
        }
    },

    /**
     * Enviar notificación de un solo uso (instantánea)
     */
    async sendGoalReachedNotification() {
        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: "🎉 ¡Meta de hoy alcanzada!",
                        body: "¡Felicitaciones! Has completado exitosamente tu objetivo de calorías de hoy.",
                        id: 100,
                    }
                ]
            });
        } catch (e) {
            console.log('Push notification ignorada o error:', e);
        }
    }
};
