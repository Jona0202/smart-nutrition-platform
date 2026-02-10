// Recipe database organized by protein base
// Each recipe includes ingredients, macros, and YouTube search term

export type ProteinBase = 'chicken' | 'turkey' | 'beef' | 'fish' | 'eggs' | 'vegetarian';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface RecipeIngredient {
    foodId: string;
    name: string;
    emoji: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface Recipe {
    id: string;
    name: string;
    emoji: string;
    mealType: MealType;
    proteinBase: ProteinBase;
    ingredients: RecipeIngredient[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    preparationTip: string;
    youtubeSearch: string;
}

export interface ProteinOption {
    id: ProteinBase;
    name: string;
    emoji: string;
    description: string;
    color: string;
}

export const proteinOptions: ProteinOption[] = [
    { id: 'chicken', name: 'Pollo', emoji: '🍗', description: 'Versátil y alto en proteína', color: '#F59E0B' },
    { id: 'turkey', name: 'Pavo', emoji: '🦃', description: 'Magro y saludable', color: '#EF4444' },
    { id: 'beef', name: 'Carne', emoji: '🥩', description: 'Rico en hierro y proteína', color: '#DC2626' },
    { id: 'fish', name: 'Pescado', emoji: '🐟', description: 'Omega-3 y bajo en grasa', color: '#3B82F6' },
    { id: 'eggs', name: 'Huevos', emoji: '🥚', description: 'Económico y nutritivo', color: '#F97316' },
    { id: 'vegetarian', name: 'Vegetariano', emoji: '🌱', description: 'Legumbres y granos', color: '#22C55E' },
];

export const recipes: Recipe[] = [
    // ==================== POLLO ====================
    {
        id: 'pollo-desayuno-omelette', name: 'Omelette de Pollo y Verduras', emoji: '🍳',
        mealType: 'breakfast', proteinBase: 'chicken',
        ingredients: [
            { foodId: 'chicken-breast', name: 'Pechuga de pollo', emoji: '🍗', grams: 80, calories: 132, protein: 25, carbs: 0, fat: 3 },
            { foodId: 'eggs', name: 'Huevos', emoji: '🥚', grams: 100, calories: 155, protein: 13, carbs: 1, fat: 11 },
            { foodId: 'spinach', name: 'Espinaca', emoji: '🥬', grams: 30, calories: 7, protein: 1, carbs: 1, fat: 0 },
        ],
        totalCalories: 294, totalProtein: 39, totalCarbs: 2, totalFat: 14,
        preparationTip: 'Saltea el pollo desmenuzado, agrega huevos batidos y espinaca. Cocina a fuego medio.',
        youtubeSearch: 'receta omelette de pollo con verduras facil',
    },
    {
        id: 'pollo-desayuno-sandwich', name: 'Sándwich de Pollo Integral', emoji: '🥪',
        mealType: 'breakfast', proteinBase: 'chicken',
        ingredients: [
            { foodId: 'chicken-breast', name: 'Pechuga de pollo', emoji: '🍗', grams: 100, calories: 165, protein: 31, carbs: 0, fat: 4 },
            { foodId: 'bread', name: 'Pan integral', emoji: '🍞', grams: 60, calories: 150, protein: 5, carbs: 27, fat: 2 },
            { foodId: 'tomato', name: 'Tomate', emoji: '🍅', grams: 50, calories: 9, protein: 0, carbs: 2, fat: 0 },
        ],
        totalCalories: 324, totalProtein: 36, totalCarbs: 29, totalFat: 6,
        preparationTip: 'Cocina la pechuga a la plancha con sal y pimienta. Arma con pan tostado y tomate.',
        youtubeSearch: 'sandwich de pollo integral receta saludable',
    },
    {
        id: 'pollo-almuerzo-arroz', name: 'Pollo con Arroz y Ensalada', emoji: '🍚',
        mealType: 'lunch', proteinBase: 'chicken',
        ingredients: [
            { foodId: 'chicken-breast', name: 'Pechuga de pollo', emoji: '🍗', grams: 150, calories: 248, protein: 47, carbs: 0, fat: 5 },
            { foodId: 'white-rice', name: 'Arroz blanco', emoji: '🍚', grams: 150, calories: 195, protein: 4, carbs: 43, fat: 0 },
            { foodId: 'lettuce', name: 'Lechuga', emoji: '🥬', grams: 60, calories: 9, protein: 1, carbs: 2, fat: 0 },
        ],
        totalCalories: 452, totalProtein: 52, totalCarbs: 45, totalFat: 5,
        preparationTip: 'Pollo a la plancha con limón y ajo. Arroz graneado. Ensalada fresca con limón.',
        youtubeSearch: 'pollo a la plancha con arroz receta peruana',
    },
    {
        id: 'pollo-almuerzo-quinua', name: 'Pollo al Horno con Quinua', emoji: '🍗',
        mealType: 'lunch', proteinBase: 'chicken',
        ingredients: [
            { foodId: 'chicken-breast', name: 'Pechuga de pollo', emoji: '🍗', grams: 150, calories: 248, protein: 47, carbs: 0, fat: 5 },
            { foodId: 'quinoa', name: 'Quinua', emoji: '🌾', grams: 80, calories: 120, protein: 4, carbs: 21, fat: 2 },
            { foodId: 'carrot', name: 'Zanahoria', emoji: '🥕', grams: 60, calories: 25, protein: 1, carbs: 6, fat: 0 },
        ],
        totalCalories: 393, totalProtein: 52, totalCarbs: 27, totalFat: 7,
        preparationTip: 'Hornea el pollo con hierbas. Sirve sobre quinua cocida con zanahoria rallada.',
        youtubeSearch: 'pollo al horno con quinua receta saludable',
    },
    {
        id: 'pollo-almuerzo-guiso', name: 'Guiso de Pollo con Papa', emoji: '🍲',
        mealType: 'lunch', proteinBase: 'chicken',
        ingredients: [
            { foodId: 'chicken-thigh', name: 'Pierna de pollo', emoji: '🍗', grams: 130, calories: 250, protein: 26, carbs: 0, fat: 16 },
            { foodId: 'potato', name: 'Papa', emoji: '🥔', grams: 150, calories: 116, protein: 3, carbs: 27, fat: 0 },
            { foodId: 'onion', name: 'Cebolla', emoji: '🧅', grams: 40, calories: 16, protein: 0, carbs: 4, fat: 0 },
        ],
        totalCalories: 382, totalProtein: 29, totalCarbs: 31, totalFat: 16,
        preparationTip: 'Sofríe cebolla y ajo, agrega pollo y papa. Cocina con caldo hasta que espese.',
        youtubeSearch: 'guiso de pollo con papa receta casera peruana',
    },
    {
        id: 'pollo-cena-plancha', name: 'Pollo a la Plancha con Brócoli', emoji: '🥦',
        mealType: 'dinner', proteinBase: 'chicken',
        ingredients: [
            { foodId: 'chicken-breast', name: 'Pechuga de pollo', emoji: '🍗', grams: 130, calories: 215, protein: 40, carbs: 0, fat: 5 },
            { foodId: 'broccoli', name: 'Brócoli', emoji: '🥦', grams: 100, calories: 34, protein: 3, carbs: 7, fat: 0 },
            { foodId: 'sweet-potato', name: 'Camote', emoji: '🍠', grams: 100, calories: 86, protein: 2, carbs: 20, fat: 0 },
        ],
        totalCalories: 335, totalProtein: 45, totalCarbs: 27, totalFat: 5,
        preparationTip: 'Pollo a la plancha con sal y pimienta. Brócoli al vapor. Camote sancochado.',
        youtubeSearch: 'pollo a la plancha con brocoli y camote fitness',
    },
    {
        id: 'pollo-cena-sopa', name: 'Sopa de Pollo con Fideos', emoji: '🍜',
        mealType: 'dinner', proteinBase: 'chicken',
        ingredients: [
            { foodId: 'chicken-breast', name: 'Pollo desmenuzado', emoji: '🍗', grams: 100, calories: 165, protein: 31, carbs: 0, fat: 4 },
            { foodId: 'noodles', name: 'Fideos', emoji: '🍝', grams: 60, calories: 210, protein: 7, carbs: 42, fat: 1 },
            { foodId: 'carrot', name: 'Zanahoria', emoji: '🥕', grams: 40, calories: 16, protein: 0, carbs: 4, fat: 0 },
        ],
        totalCalories: 391, totalProtein: 38, totalCarbs: 46, totalFat: 5,
        preparationTip: 'Hierve pollo con verduras, desmenuza. Agrega fideos y cocina 8 min.',
        youtubeSearch: 'sopa de pollo con fideos receta casera',
    },
    {
        id: 'pollo-snack-wrap', name: 'Wrap de Pollo Ligero', emoji: '🌯',
        mealType: 'snack', proteinBase: 'chicken',
        ingredients: [
            { foodId: 'chicken-breast', name: 'Pechuga de pollo', emoji: '🍗', grams: 60, calories: 99, protein: 19, carbs: 0, fat: 2 },
            { foodId: 'tortilla', name: 'Tortilla integral', emoji: '🫓', grams: 40, calories: 100, protein: 3, carbs: 18, fat: 2 },
        ],
        totalCalories: 199, totalProtein: 22, totalCarbs: 18, totalFat: 4,
        preparationTip: 'Pollo desmenuzado en tortilla con un toque de limón.',
        youtubeSearch: 'wrap de pollo saludable receta facil',
    },

    // ==================== PAVO ====================
    {
        id: 'pavo-desayuno-tortilla', name: 'Tortilla de Pavo', emoji: '🍳',
        mealType: 'breakfast', proteinBase: 'turkey',
        ingredients: [
            { foodId: 'turkey', name: 'Pechuga de pavo', emoji: '🦃', grams: 80, calories: 104, protein: 24, carbs: 0, fat: 1 },
            { foodId: 'eggs', name: 'Huevos', emoji: '🥚', grams: 100, calories: 155, protein: 13, carbs: 1, fat: 11 },
            { foodId: 'tomato', name: 'Tomate', emoji: '🍅', grams: 50, calories: 9, protein: 0, carbs: 2, fat: 0 },
        ],
        totalCalories: 268, totalProtein: 37, totalCarbs: 3, totalFat: 12,
        preparationTip: 'Bate huevos con pavo picado y tomate. Cocina como tortilla española.',
        youtubeSearch: 'tortilla de pavo receta saludable proteina',
    },
    {
        id: 'pavo-desayuno-avena', name: 'Bowl de Pavo con Avena Salada', emoji: '🥣',
        mealType: 'breakfast', proteinBase: 'turkey',
        ingredients: [
            { foodId: 'turkey', name: 'Pavo molido', emoji: '🦃', grams: 80, calories: 104, protein: 24, carbs: 0, fat: 1 },
            { foodId: 'oats', name: 'Avena', emoji: '🌾', grams: 50, calories: 190, protein: 7, carbs: 34, fat: 3 },
            { foodId: 'spinach', name: 'Espinaca', emoji: '🥬', grams: 30, calories: 7, protein: 1, carbs: 1, fat: 0 },
        ],
        totalCalories: 301, totalProtein: 32, totalCarbs: 35, totalFat: 4,
        preparationTip: 'Cocina avena salada y agrega pavo sofrito con espinaca.',
        youtubeSearch: 'avena salada con pavo receta fitness',
    },
    {
        id: 'pavo-almuerzo-ensalada', name: 'Ensalada de Pavo con Quinua', emoji: '🥗',
        mealType: 'lunch', proteinBase: 'turkey',
        ingredients: [
            { foodId: 'turkey', name: 'Pechuga de pavo', emoji: '🦃', grams: 150, calories: 195, protein: 45, carbs: 0, fat: 2 },
            { foodId: 'quinoa', name: 'Quinua', emoji: '🌾', grams: 80, calories: 120, protein: 4, carbs: 21, fat: 2 },
            { foodId: 'avocado', name: 'Palta', emoji: '🥑', grams: 50, calories: 80, protein: 1, carbs: 4, fat: 7 },
        ],
        totalCalories: 395, totalProtein: 50, totalCarbs: 25, totalFat: 11,
        preparationTip: 'Pavo a la plancha en cubos sobre quinua fría con palta y limón.',
        youtubeSearch: 'ensalada de pavo con quinua receta saludable',
    },
    {
        id: 'pavo-almuerzo-arroz', name: 'Pavo al Horno con Arroz', emoji: '🦃',
        mealType: 'lunch', proteinBase: 'turkey',
        ingredients: [
            { foodId: 'turkey', name: 'Pechuga de pavo', emoji: '🦃', grams: 150, calories: 195, protein: 45, carbs: 0, fat: 2 },
            { foodId: 'white-rice', name: 'Arroz blanco', emoji: '🍚', grams: 140, calories: 182, protein: 4, carbs: 40, fat: 0 },
            { foodId: 'green-beans', name: 'Vainitas', emoji: '🫘', grams: 60, calories: 19, protein: 1, carbs: 4, fat: 0 },
        ],
        totalCalories: 396, totalProtein: 50, totalCarbs: 44, totalFat: 2,
        preparationTip: 'Hornea el pavo con ajo y romero. Sirve con arroz y vainitas salteadas.',
        youtubeSearch: 'pavo al horno con arroz receta facil',
    },
    {
        id: 'pavo-cena-salteado', name: 'Pavo Salteado con Verduras', emoji: '🥘',
        mealType: 'dinner', proteinBase: 'turkey',
        ingredients: [
            { foodId: 'turkey', name: 'Pavo en tiras', emoji: '🦃', grams: 130, calories: 169, protein: 39, carbs: 0, fat: 1 },
            { foodId: 'bell-pepper', name: 'Pimiento', emoji: '🫑', grams: 80, calories: 16, protein: 1, carbs: 3, fat: 0 },
            { foodId: 'zucchini', name: 'Zapallito', emoji: '🥒', grams: 80, calories: 14, protein: 1, carbs: 3, fat: 0 },
        ],
        totalCalories: 199, totalProtein: 41, totalCarbs: 6, totalFat: 1,
        preparationTip: 'Saltea pavo con verduras en wok con soja y jengibre.',
        youtubeSearch: 'pavo salteado con verduras receta wok',
    },
    {
        id: 'pavo-cena-sopa', name: 'Crema de Pavo y Zapallo', emoji: '🍲',
        mealType: 'dinner', proteinBase: 'turkey',
        ingredients: [
            { foodId: 'turkey', name: 'Pavo desmenuzado', emoji: '🦃', grams: 100, calories: 130, protein: 30, carbs: 0, fat: 1 },
            { foodId: 'pumpkin', name: 'Zapallo', emoji: '🎃', grams: 150, calories: 38, protein: 1, carbs: 8, fat: 0 },
            { foodId: 'potato', name: 'Papa', emoji: '🥔', grams: 80, calories: 62, protein: 2, carbs: 14, fat: 0 },
        ],
        totalCalories: 230, totalProtein: 33, totalCarbs: 22, totalFat: 1,
        preparationTip: 'Hierve zapallo y papa, licúa. Agrega pavo desmenuzado al servir.',
        youtubeSearch: 'crema de zapallo con pavo receta',
    },
    {
        id: 'pavo-snack-roll', name: 'Rollitos de Pavo con Queso', emoji: '🧀',
        mealType: 'snack', proteinBase: 'turkey',
        ingredients: [
            { foodId: 'turkey', name: 'Jamón de pavo', emoji: '🦃', grams: 60, calories: 63, protein: 12, carbs: 2, fat: 1 },
            { foodId: 'cheese', name: 'Queso fresco', emoji: '🧀', grams: 30, calories: 78, protein: 5, carbs: 1, fat: 6 },
        ],
        totalCalories: 141, totalProtein: 17, totalCarbs: 3, totalFat: 7,
        preparationTip: 'Enrolla queso fresco en lonjas de pavo. Ideal para media mañana.',
        youtubeSearch: 'rollitos de pavo con queso snack saludable',
    },

    // ==================== CARNE ====================
    {
        id: 'carne-desayuno-bistec', name: 'Bistec con Pan y Huevo', emoji: '🥩',
        mealType: 'breakfast', proteinBase: 'beef',
        ingredients: [
            { foodId: 'beef', name: 'Bistec de res', emoji: '🥩', grams: 80, calories: 168, protein: 20, carbs: 0, fat: 9 },
            { foodId: 'eggs', name: 'Huevo frito', emoji: '🍳', grams: 50, calories: 90, protein: 6, carbs: 0, fat: 7 },
            { foodId: 'bread', name: 'Pan francés', emoji: '🥖', grams: 50, calories: 140, protein: 4, carbs: 28, fat: 1 },
        ],
        totalCalories: 398, totalProtein: 30, totalCarbs: 28, totalFat: 17,
        preparationTip: 'Bistec a la plancha rápido, huevo frito y pan tostado.',
        youtubeSearch: 'bistec a la plancha con huevo desayuno peruano',
    },
    {
        id: 'carne-almuerzo-lomo', name: 'Lomo Saltado', emoji: '🍖',
        mealType: 'lunch', proteinBase: 'beef',
        ingredients: [
            { foodId: 'beef', name: 'Lomo fino', emoji: '🥩', grams: 150, calories: 315, protein: 38, carbs: 0, fat: 17 },
            { foodId: 'potato', name: 'Papa frita', emoji: '🍟', grams: 100, calories: 77, protein: 2, carbs: 17, fat: 0 },
            { foodId: 'white-rice', name: 'Arroz', emoji: '🍚', grams: 120, calories: 156, protein: 3, carbs: 34, fat: 0 },
        ],
        totalCalories: 548, totalProtein: 43, totalCarbs: 51, totalFat: 17,
        preparationTip: 'Saltea carne con cebolla, tomate y sillao. Sirve con papas y arroz.',
        youtubeSearch: 'lomo saltado receta peruana original',
    },
    {
        id: 'carne-almuerzo-guiso', name: 'Estofado de Res con Papa', emoji: '🍲',
        mealType: 'lunch', proteinBase: 'beef',
        ingredients: [
            { foodId: 'beef', name: 'Carne de res', emoji: '🥩', grams: 140, calories: 294, protein: 35, carbs: 0, fat: 16 },
            { foodId: 'potato', name: 'Papa', emoji: '🥔', grams: 130, calories: 100, protein: 3, carbs: 23, fat: 0 },
            { foodId: 'carrot', name: 'Zanahoria', emoji: '🥕', grams: 50, calories: 20, protein: 0, carbs: 5, fat: 0 },
        ],
        totalCalories: 414, totalProtein: 38, totalCarbs: 28, totalFat: 16,
        preparationTip: 'Sella la carne, agrega verduras y caldo. Cocina a fuego lento 1 hora.',
        youtubeSearch: 'estofado de res con papas receta peruana',
    },
    {
        id: 'carne-almuerzo-taco', name: 'Tacos de Carne Molida', emoji: '🌮',
        mealType: 'lunch', proteinBase: 'beef',
        ingredients: [
            { foodId: 'beef', name: 'Carne molida', emoji: '🥩', grams: 120, calories: 252, protein: 24, carbs: 0, fat: 17 },
            { foodId: 'tortilla', name: 'Tortillas', emoji: '🫓', grams: 60, calories: 150, protein: 4, carbs: 27, fat: 3 },
            { foodId: 'tomato', name: 'Tomate', emoji: '🍅', grams: 50, calories: 9, protein: 0, carbs: 2, fat: 0 },
        ],
        totalCalories: 411, totalProtein: 28, totalCarbs: 29, totalFat: 20,
        preparationTip: 'Sofríe carne con comino y ají. Sirve en tortillas con tomate fresco.',
        youtubeSearch: 'tacos de carne molida receta facil',
    },
    {
        id: 'carne-cena-asado', name: 'Carne Asada con Ensalada', emoji: '🥗',
        mealType: 'dinner', proteinBase: 'beef',
        ingredients: [
            { foodId: 'beef', name: 'Carne asada', emoji: '🥩', grams: 130, calories: 273, protein: 32, carbs: 0, fat: 15 },
            { foodId: 'lettuce', name: 'Lechuga', emoji: '🥬', grams: 80, calories: 12, protein: 1, carbs: 2, fat: 0 },
            { foodId: 'avocado', name: 'Palta', emoji: '🥑', grams: 50, calories: 80, protein: 1, carbs: 4, fat: 7 },
        ],
        totalCalories: 365, totalProtein: 34, totalCarbs: 6, totalFat: 22,
        preparationTip: 'Asa la carne en parrilla o sartén. Ensalada con palta y limón.',
        youtubeSearch: 'carne asada con ensalada receta',
    },
    {
        id: 'carne-cena-sopa', name: 'Sopa de Res con Verduras', emoji: '🍜',
        mealType: 'dinner', proteinBase: 'beef',
        ingredients: [
            { foodId: 'beef', name: 'Carne de res', emoji: '🥩', grams: 100, calories: 210, protein: 25, carbs: 0, fat: 11 },
            { foodId: 'potato', name: 'Papa', emoji: '🥔', grams: 80, calories: 62, protein: 2, carbs: 14, fat: 0 },
            { foodId: 'corn', name: 'Choclo', emoji: '🌽', grams: 60, calories: 54, protein: 2, carbs: 12, fat: 1 },
        ],
        totalCalories: 326, totalProtein: 29, totalCarbs: 26, totalFat: 12,
        preparationTip: 'Hierve la carne con hueso para más sabor. Agrega verduras.',
        youtubeSearch: 'sopa de res con verduras receta casera',
    },
    {
        id: 'carne-snack-jerky', name: 'Charqui con Tostadas', emoji: '🥓',
        mealType: 'snack', proteinBase: 'beef',
        ingredients: [
            { foodId: 'beef', name: 'Charqui', emoji: '🥩', grams: 40, calories: 116, protein: 19, carbs: 3, fat: 3 },
            { foodId: 'crackers', name: 'Tostadas', emoji: '🍞', grams: 30, calories: 120, protein: 3, carbs: 20, fat: 3 },
        ],
        totalCalories: 236, totalProtein: 22, totalCarbs: 23, totalFat: 6,
        preparationTip: 'Acompaña charqui con tostadas integrales.',
        youtubeSearch: 'charqui peruano snack proteico',
    },

    // ==================== PESCADO ====================
    {
        id: 'pescado-desayuno-tostada', name: 'Tostada de Atún', emoji: '🐟',
        mealType: 'breakfast', proteinBase: 'fish',
        ingredients: [
            { foodId: 'tuna', name: 'Atún en agua', emoji: '🐟', grams: 80, calories: 90, protein: 20, carbs: 0, fat: 1 },
            { foodId: 'bread', name: 'Pan integral', emoji: '🍞', grams: 60, calories: 150, protein: 5, carbs: 27, fat: 2 },
            { foodId: 'avocado', name: 'Palta', emoji: '🥑', grams: 40, calories: 64, protein: 1, carbs: 3, fat: 6 },
        ],
        totalCalories: 304, totalProtein: 26, totalCarbs: 30, totalFat: 9,
        preparationTip: 'Mezcla atún con palta machacada. Sirve en pan tostado.',
        youtubeSearch: 'tostada de atun con palta receta saludable',
    },
    {
        id: 'pescado-almuerzo-ceviche', name: 'Ceviche de Pescado', emoji: '🐟',
        mealType: 'lunch', proteinBase: 'fish',
        ingredients: [
            { foodId: 'white-fish', name: 'Pescado blanco', emoji: '🐟', grams: 200, calories: 190, protein: 40, carbs: 0, fat: 2 },
            { foodId: 'sweet-potato', name: 'Camote', emoji: '🍠', grams: 100, calories: 86, protein: 2, carbs: 20, fat: 0 },
            { foodId: 'corn', name: 'Choclo', emoji: '🌽', grams: 80, calories: 72, protein: 3, carbs: 16, fat: 1 },
        ],
        totalCalories: 348, totalProtein: 45, totalCarbs: 36, totalFat: 3,
        preparationTip: 'Corta el pescado en cubos, marina con limón, cebolla y ají.',
        youtubeSearch: 'ceviche de pescado receta peruana original',
    },
    {
        id: 'pescado-almuerzo-arroz', name: 'Pescado al Horno con Arroz', emoji: '🍚',
        mealType: 'lunch', proteinBase: 'fish',
        ingredients: [
            { foodId: 'white-fish', name: 'Filete de pescado', emoji: '🐟', grams: 170, calories: 162, protein: 34, carbs: 0, fat: 2 },
            { foodId: 'white-rice', name: 'Arroz', emoji: '🍚', grams: 140, calories: 182, protein: 4, carbs: 40, fat: 0 },
            { foodId: 'lemon', name: 'Limón', emoji: '🍋', grams: 30, calories: 9, protein: 0, carbs: 3, fat: 0 },
        ],
        totalCalories: 353, totalProtein: 38, totalCarbs: 43, totalFat: 2,
        preparationTip: 'Hornea pescado con limón, ajo y sal a 180°C por 20 min.',
        youtubeSearch: 'pescado al horno con arroz receta facil',
    },
    {
        id: 'pescado-almuerzo-sudado', name: 'Sudado de Pescado', emoji: '🍲',
        mealType: 'lunch', proteinBase: 'fish',
        ingredients: [
            { foodId: 'white-fish', name: 'Pescado', emoji: '🐟', grams: 180, calories: 171, protein: 36, carbs: 0, fat: 2 },
            { foodId: 'potato', name: 'Papa', emoji: '🥔', grams: 100, calories: 77, protein: 2, carbs: 17, fat: 0 },
            { foodId: 'onion', name: 'Cebolla', emoji: '🧅', grams: 50, calories: 20, protein: 1, carbs: 5, fat: 0 },
        ],
        totalCalories: 268, totalProtein: 39, totalCarbs: 22, totalFat: 2,
        preparationTip: 'Cocina pescado en caldo con tomate, cebolla y ají.',
        youtubeSearch: 'sudado de pescado receta peruana',
    },
    {
        id: 'pescado-cena-plancha', name: 'Filete de Pescado a la Plancha', emoji: '🐟',
        mealType: 'dinner', proteinBase: 'fish',
        ingredients: [
            { foodId: 'white-fish', name: 'Filete de pescado', emoji: '🐟', grams: 150, calories: 143, protein: 30, carbs: 0, fat: 2 },
            { foodId: 'broccoli', name: 'Brócoli', emoji: '🥦', grams: 100, calories: 34, protein: 3, carbs: 7, fat: 0 },
            { foodId: 'sweet-potato', name: 'Camote', emoji: '🍠', grams: 80, calories: 69, protein: 1, carbs: 16, fat: 0 },
        ],
        totalCalories: 246, totalProtein: 34, totalCarbs: 23, totalFat: 2,
        preparationTip: 'Filete a la plancha con limón. Brócoli al vapor y camote sancochado.',
        youtubeSearch: 'pescado a la plancha con verduras receta fitness',
    },
    {
        id: 'pescado-snack-cevichito', name: 'Cevichito de Trucha', emoji: '🐟',
        mealType: 'snack', proteinBase: 'fish',
        ingredients: [
            { foodId: 'tuna', name: 'Trucha o atún', emoji: '🐟', grams: 80, calories: 90, protein: 20, carbs: 0, fat: 1 },
            { foodId: 'crackers', name: 'Galletas saladas', emoji: '🍘', grams: 25, calories: 100, protein: 2, carbs: 17, fat: 2 },
        ],
        totalCalories: 190, totalProtein: 22, totalCarbs: 17, totalFat: 3,
        preparationTip: 'Mezcla pescado con limón, sal y ají. Sirve con galletas.',
        youtubeSearch: 'cevichito snack peruano receta rapida',
    },

    // ==================== HUEVOS ====================
    {
        id: 'huevos-desayuno-revueltos', name: 'Huevos Revueltos con Pan', emoji: '🍳',
        mealType: 'breakfast', proteinBase: 'eggs',
        ingredients: [
            { foodId: 'eggs', name: 'Huevos', emoji: '🥚', grams: 150, calories: 233, protein: 20, carbs: 2, fat: 16 },
            { foodId: 'bread', name: 'Pan integral', emoji: '🍞', grams: 50, calories: 125, protein: 4, carbs: 23, fat: 2 },
            { foodId: 'banana', name: 'Plátano', emoji: '🍌', grams: 100, calories: 89, protein: 1, carbs: 23, fat: 0 },
        ],
        totalCalories: 447, totalProtein: 25, totalCarbs: 48, totalFat: 18,
        preparationTip: 'Revuelve huevos a fuego bajo con sal. Tostada y plátano de postre.',
        youtubeSearch: 'huevos revueltos perfectos receta desayuno',
    },
    {
        id: 'huevos-desayuno-avena', name: 'Avena con Huevo Pochado', emoji: '🥣',
        mealType: 'breakfast', proteinBase: 'eggs',
        ingredients: [
            { foodId: 'eggs', name: 'Huevo pochado', emoji: '🥚', grams: 100, calories: 155, protein: 13, carbs: 1, fat: 11 },
            { foodId: 'oats', name: 'Avena', emoji: '🌾', grams: 50, calories: 190, protein: 7, carbs: 34, fat: 3 },
        ],
        totalCalories: 345, totalProtein: 20, totalCarbs: 35, totalFat: 14,
        preparationTip: 'Avena cocida con leche. Agrega huevo pochado encima con sal.',
        youtubeSearch: 'avena salada con huevo pochado receta',
    },
    {
        id: 'huevos-almuerzo-arroz', name: 'Arroz con Huevo Frito', emoji: '🍳',
        mealType: 'lunch', proteinBase: 'eggs',
        ingredients: [
            { foodId: 'eggs', name: 'Huevos fritos', emoji: '🍳', grams: 100, calories: 196, protein: 14, carbs: 1, fat: 15 },
            { foodId: 'white-rice', name: 'Arroz', emoji: '🍚', grams: 160, calories: 208, protein: 4, carbs: 46, fat: 0 },
            { foodId: 'banana', name: 'Plátano frito', emoji: '🍌', grams: 80, calories: 107, protein: 1, carbs: 18, fat: 4 },
        ],
        totalCalories: 511, totalProtein: 19, totalCarbs: 65, totalFat: 19,
        preparationTip: 'Arroz graneado, huevo frito doradito y plátano frito.',
        youtubeSearch: 'arroz con huevo frito receta peruana',
    },
    {
        id: 'huevos-almuerzo-tortilla', name: 'Tortilla Española de Papa', emoji: '🥘',
        mealType: 'lunch', proteinBase: 'eggs',
        ingredients: [
            { foodId: 'eggs', name: 'Huevos', emoji: '🥚', grams: 150, calories: 233, protein: 20, carbs: 2, fat: 16 },
            { foodId: 'potato', name: 'Papa', emoji: '🥔', grams: 150, calories: 116, protein: 3, carbs: 27, fat: 0 },
            { foodId: 'onion', name: 'Cebolla', emoji: '🧅', grams: 40, calories: 16, protein: 0, carbs: 4, fat: 0 },
        ],
        totalCalories: 365, totalProtein: 23, totalCarbs: 33, totalFat: 16,
        preparationTip: 'Fríe papa y cebolla, agrega huevos batidos. Voltea cuando cuaje.',
        youtubeSearch: 'tortilla española de papa receta clasica',
    },
    {
        id: 'huevos-cena-ensalada', name: 'Ensalada Tibia con Huevo', emoji: '🥗',
        mealType: 'dinner', proteinBase: 'eggs',
        ingredients: [
            { foodId: 'eggs', name: 'Huevos duros', emoji: '🥚', grams: 100, calories: 155, protein: 13, carbs: 1, fat: 11 },
            { foodId: 'lettuce', name: 'Mix de lechugas', emoji: '🥬', grams: 80, calories: 12, protein: 1, carbs: 2, fat: 0 },
            { foodId: 'sweet-potato', name: 'Camote', emoji: '🍠', grams: 100, calories: 86, protein: 2, carbs: 20, fat: 0 },
        ],
        totalCalories: 253, totalProtein: 16, totalCarbs: 23, totalFat: 11,
        preparationTip: 'Huevos duros en cuartos sobre ensalada tibia con camote.',
        youtubeSearch: 'ensalada con huevo duro receta saludable',
    },
    {
        id: 'huevos-cena-revuelto-verduras', name: 'Revuelto de Huevos con Verduras', emoji: '🍳',
        mealType: 'dinner', proteinBase: 'eggs',
        ingredients: [
            { foodId: 'eggs', name: 'Huevos', emoji: '🥚', grams: 100, calories: 155, protein: 13, carbs: 1, fat: 11 },
            { foodId: 'bell-pepper', name: 'Pimiento', emoji: '🫑', grams: 60, calories: 12, protein: 1, carbs: 2, fat: 0 },
            { foodId: 'zucchini', name: 'Zapallito', emoji: '🥒', grams: 80, calories: 14, protein: 1, carbs: 3, fat: 0 },
        ],
        totalCalories: 181, totalProtein: 15, totalCarbs: 6, totalFat: 11,
        preparationTip: 'Saltea verduras picadas. Agrega huevos batidos y revuelve.',
        youtubeSearch: 'huevos revueltos con verduras receta rapida',
    },
    {
        id: 'huevos-snack-duro', name: 'Huevo Duro con Fruta', emoji: '🥚',
        mealType: 'snack', proteinBase: 'eggs',
        ingredients: [
            { foodId: 'eggs', name: 'Huevo duro', emoji: '🥚', grams: 50, calories: 78, protein: 6, carbs: 1, fat: 5 },
            { foodId: 'apple', name: 'Manzana', emoji: '🍎', grams: 120, calories: 62, protein: 0, carbs: 17, fat: 0 },
        ],
        totalCalories: 140, totalProtein: 6, totalCarbs: 18, totalFat: 5,
        preparationTip: 'Huevo duro con sal + manzana. Snack rápido y balanceado.',
        youtubeSearch: 'snack saludable huevo duro facil',
    },

    // ==================== VEGETARIANO ====================
    {
        id: 'veggie-desayuno-avena', name: 'Avena con Frutas y Miel', emoji: '🥣',
        mealType: 'breakfast', proteinBase: 'vegetarian',
        ingredients: [
            { foodId: 'oats', name: 'Avena', emoji: '🌾', grams: 60, calories: 228, protein: 8, carbs: 41, fat: 4 },
            { foodId: 'banana', name: 'Plátano', emoji: '🍌', grams: 80, calories: 71, protein: 1, carbs: 18, fat: 0 },
            { foodId: 'honey', name: 'Miel', emoji: '🍯', grams: 15, calories: 46, protein: 0, carbs: 12, fat: 0 },
        ],
        totalCalories: 345, totalProtein: 9, totalCarbs: 71, totalFat: 4,
        preparationTip: 'Cocina avena con leche, agrega plátano en rodajas y miel.',
        youtubeSearch: 'avena con frutas y miel desayuno saludable',
    },
    {
        id: 'veggie-desayuno-pancakes', name: 'Pancakes de Avena y Plátano', emoji: '🥞',
        mealType: 'breakfast', proteinBase: 'vegetarian',
        ingredients: [
            { foodId: 'oats', name: 'Avena', emoji: '🌾', grams: 50, calories: 190, protein: 7, carbs: 34, fat: 3 },
            { foodId: 'banana', name: 'Plátano', emoji: '🍌', grams: 100, calories: 89, protein: 1, carbs: 23, fat: 0 },
            { foodId: 'honey', name: 'Miel', emoji: '🍯', grams: 10, calories: 30, protein: 0, carbs: 8, fat: 0 },
        ],
        totalCalories: 309, totalProtein: 8, totalCarbs: 65, totalFat: 3,
        preparationTip: 'Licúa avena con plátano. Cocina como pancakes en sartén antiadherente.',
        youtubeSearch: 'pancakes de avena y platano receta facil',
    },
    {
        id: 'veggie-almuerzo-lentejas', name: 'Guiso de Lentejas', emoji: '🫘',
        mealType: 'lunch', proteinBase: 'vegetarian',
        ingredients: [
            { foodId: 'lentils', name: 'Lentejas', emoji: '🫘', grams: 100, calories: 116, protein: 9, carbs: 20, fat: 0 },
            { foodId: 'white-rice', name: 'Arroz', emoji: '🍚', grams: 130, calories: 169, protein: 3, carbs: 37, fat: 0 },
            { foodId: 'carrot', name: 'Zanahoria', emoji: '🥕', grams: 50, calories: 20, protein: 0, carbs: 5, fat: 0 },
        ],
        totalCalories: 305, totalProtein: 12, totalCarbs: 62, totalFat: 0,
        preparationTip: 'Cocina lentejas con zanahoria, cebolla y ajo. Sirve con arroz.',
        youtubeSearch: 'guiso de lentejas receta peruana casera',
    },
    {
        id: 'veggie-almuerzo-quinua', name: 'Bowl de Quinua con Verduras', emoji: '🥗',
        mealType: 'lunch', proteinBase: 'vegetarian',
        ingredients: [
            { foodId: 'quinoa', name: 'Quinua', emoji: '🌾', grams: 100, calories: 150, protein: 5, carbs: 26, fat: 3 },
            { foodId: 'avocado', name: 'Palta', emoji: '🥑', grams: 60, calories: 96, protein: 1, carbs: 5, fat: 9 },
            { foodId: 'bell-pepper', name: 'Pimiento', emoji: '🫑', grams: 60, calories: 12, protein: 1, carbs: 2, fat: 0 },
        ],
        totalCalories: 258, totalProtein: 7, totalCarbs: 33, totalFat: 12,
        preparationTip: 'Quinua cocida fría con palta, pimiento y limón.',
        youtubeSearch: 'bowl de quinua con verduras receta vegana',
    },
    {
        id: 'veggie-almuerzo-garbanzos', name: 'Curry de Garbanzos', emoji: '🍛',
        mealType: 'lunch', proteinBase: 'vegetarian',
        ingredients: [
            { foodId: 'chickpeas', name: 'Garbanzos', emoji: '🫘', grams: 120, calories: 197, protein: 11, carbs: 33, fat: 3 },
            { foodId: 'white-rice', name: 'Arroz', emoji: '🍚', grams: 120, calories: 156, protein: 3, carbs: 34, fat: 0 },
            { foodId: 'tomato', name: 'Tomate', emoji: '🍅', grams: 80, calories: 14, protein: 1, carbs: 3, fat: 0 },
        ],
        totalCalories: 367, totalProtein: 15, totalCarbs: 70, totalFat: 3,
        preparationTip: 'Sofríe cebolla y tomate con curry. Agrega garbanzos y sal.',
        youtubeSearch: 'curry de garbanzos receta facil vegetariana',
    },
    {
        id: 'veggie-cena-crema', name: 'Crema de Zapallo', emoji: '🎃',
        mealType: 'dinner', proteinBase: 'vegetarian',
        ingredients: [
            { foodId: 'pumpkin', name: 'Zapallo', emoji: '🎃', grams: 200, calories: 50, protein: 2, carbs: 10, fat: 0 },
            { foodId: 'potato', name: 'Papa', emoji: '🥔', grams: 100, calories: 77, protein: 2, carbs: 17, fat: 0 },
            { foodId: 'bread', name: 'Pan tostado', emoji: '🍞', grams: 30, calories: 75, protein: 2, carbs: 14, fat: 1 },
        ],
        totalCalories: 202, totalProtein: 6, totalCarbs: 41, totalFat: 1,
        preparationTip: 'Hierve zapallo y papa. Licúa hasta cremoso. Sirve con tostadas.',
        youtubeSearch: 'crema de zapallo receta peruana',
    },
    {
        id: 'veggie-cena-ensalada', name: 'Ensalada César Vegetariana', emoji: '🥗',
        mealType: 'dinner', proteinBase: 'vegetarian',
        ingredients: [
            { foodId: 'lettuce', name: 'Lechuga romana', emoji: '🥬', grams: 100, calories: 15, protein: 1, carbs: 3, fat: 0 },
            { foodId: 'cheese', name: 'Queso parmesano', emoji: '🧀', grams: 20, calories: 80, protein: 7, carbs: 1, fat: 5 },
            { foodId: 'bread', name: 'Crutones', emoji: '🍞', grams: 30, calories: 120, protein: 3, carbs: 20, fat: 3 },
        ],
        totalCalories: 215, totalProtein: 11, totalCarbs: 24, totalFat: 8,
        preparationTip: 'Lechuga con queso rallado, crutones y aderezo de limón.',
        youtubeSearch: 'ensalada cesar vegetariana receta facil',
    },
    {
        id: 'veggie-snack-frutas', name: 'Mix de Frutas con Granola', emoji: '🍎',
        mealType: 'snack', proteinBase: 'vegetarian',
        ingredients: [
            { foodId: 'apple', name: 'Manzana', emoji: '🍎', grams: 100, calories: 52, protein: 0, carbs: 14, fat: 0 },
            { foodId: 'oats', name: 'Granola', emoji: '🌾', grams: 30, calories: 132, protein: 3, carbs: 22, fat: 4 },
        ],
        totalCalories: 184, totalProtein: 3, totalCarbs: 36, totalFat: 4,
        preparationTip: 'Corta manzana en cubos, agrega granola y un toque de miel.',
        youtubeSearch: 'mix de frutas con granola snack saludable',
    },
];
