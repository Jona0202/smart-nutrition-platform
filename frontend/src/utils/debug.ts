// Debug utility to check localStorage persistence
// You can call these functions from browser console

export const debugStorage = () => {
    console.log('=== NUTRITION APP STORAGE DEBUG ===');

    // Check user data
    const userData = localStorage.getItem('nutrition-user-storage');
    console.log('\n📦 User Storage:');
    if (userData) {
        const parsed = JSON.parse(userData);
        console.log('✅ Found user data:');
        console.log('  - Profile:', parsed.profile ? '✓' : '✗');
        console.log('  - Metabolic Profile:', parsed.metabolicProfile ? '✓' : '✗');
        console.log('  - Is Onboarded:', parsed.isOnboarded);
        console.log('  - Onboarding Step:', parsed.onboardingStep);
        console.log('\nFull data:', parsed);
    } else {
        console.log('❌ No user data found');
    }

    // Check meals data
    const mealsData = localStorage.getItem('nutrition-meals-storage');
    console.log('\n🍽️ Meals Storage:');
    if (mealsData) {
        const parsed = JSON.parse(mealsData);
        console.log('✅ Found meals data:');
        console.log('  - Total meals:', parsed.length);
        console.log('  - Meals:', parsed);
    } else {
        console.log('❌ No meals data found');
    }

    // Storage stats
    console.log('\n📊 Storage Stats:');
    const userSize = userData ? new Blob([userData]).size : 0;
    const mealsSize = mealsData ? new Blob([mealsData]).size : 0;
    console.log(`  - User data: ${userSize} bytes`);
    console.log(`  - Meals data: ${mealsSize} bytes`);
    console.log(`  - Total: ${userSize + mealsSize} bytes`);

    console.log('\n=================================');
};

export const clearAllStorage = () => {
    if (confirm('⚠️ This will delete ALL your data. Are you sure?')) {
        localStorage.removeItem('nutrition-user-storage');
        localStorage.removeItem('nutrition-meals-storage');
        console.log('✅ All storage cleared. Reload the page.');
        window.location.reload();
    }
};

export const exportData = () => {
    const data = {
        user: localStorage.getItem('nutrition-user-storage'),
        meals: localStorage.getItem('nutrition-meals-storage'),
        exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('✅ Data exported successfully');
};

// Make available globally in dev mode
if (typeof window !== 'undefined') {
    (window as any).nutritionDebug = {
        debug: debugStorage,
        clear: clearAllStorage,
        export: exportData,
    };
    console.log('🔧 Debug tools available: window.nutritionDebug');
}
