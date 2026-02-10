"""Script to convert frontend foods.ts to JSON for backend"""
import json
import re

# Read the foods.ts file
with open('../frontend/src/data/foods.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the foodDatabase array
# This is a simplified parser - in production you'd use a proper TS parser
match = re.search(r'export const foodDatabase: FoodItem\[\] = \[(.*?)\];', content, re.DOTALL)

if not match:
    print("Could not find foodDatabase export")
    exit(1)

# For now, create a simplified version manually with key foods
# In production, you'd parse the full TS file

food_database = [
    # Peruvian dishes
    {"id": "lomo-saltado", "name": "Lomo Saltado", "category": ["peruvian", "protein"], "emoji": "🍖", "calories": 180, "protein": 15, "carbs": 12, "fat": 8},
    {"id": "ceviche", "name": "Ceviche", "category": ["peruvian", "protein"], "emoji": "🐟", "calories": 90, "protein": 18, "carbs": 5, "fat": 1},
    {"id": "aji-de-gallina", "name": "Ají de Gallina", "category": ["peruvian", "protein"], "emoji": "🍗", "calories": 220, "protein": 15, "carbs": 10, "fat": 14},
    {"id": "pollo-brasa", "name": "Pollo a la Brasa", "category": ["peruvian", "protein"], "emoji": "🍗", "calories": 237, "protein": 27, "carbs": 0, "fat": 14},
    {"id": "anticuchos", "name": "Anticuchos", "category": ["peruvian", "protein"], "emoji": "🍢", "calories": 200, "protein": 20, "carbs": 5, "fat": 10},
    {"id": "papa-rellena", "name": "Papa Rellena", "category": ["peruvian", "carbs"], "emoji": "🥔", "calories": 200, "protein": 8, "carbs": 30, "fat": 6},
    {"id": "causa-limena", "name": "Causa Limeña", "category": ["peruvian", "carbs"], "emoji": "🥔", "calories": 150, "protein": 5, "carbs": 20, "fat": 6},
    {"id": "arroz-con-pollo", "name": "Arroz con Pollo", "category": ["peruvian", "protein"], "emoji": "🍛", "calories": 165, "protein": 12, "carbs": 18, "fat": 5},
    {"id": "tacu-tacu", "name": "Tacu Tacu", "category": ["peruvian", "carbs"], "emoji": "🍚", "calories": 180, "protein": 6, "carbs": 28, "fat": 5},
    {"id": "tallarines-verdes", "name": "Tallarines Verdes", "category": ["peruvian", "carbs"], "emoji": "🍝", "calories": 200, "protein": 8, "carbs": 30, "fat": 6},
    
    # Proteins
    {"id": "pechuga-pollo", "name": "Pechuga de Pollo", "category": ["protein"], "emoji": "🍗", "calories": 165, "protein": 31, "carbs": 0, "fat": 3.6},
    {"id": "pierna-pollo", "name": "Pierna de Pollo", "category": ["protein"], "emoji": "🍗", "calories": 209, "protein": 26, "carbs": 0, "fat": 11},
    {"id": "carne-res", "name": "Carne de Res", "category": ["protein"], "emoji": "🥩", "calories": 250, "protein": 26, "carbs": 0, "fat": 15},
    {"id": "salmon", "name": "Salmón", "category": ["protein"], "emoji": "🐟", "calories": 206, "protein": 22, "carbs": 0, "fat": 13},
    {"id": "atun", "name": "Atún en Lata", "category": ["protein"], "emoji": "🐟", "calories": 132, "protein": 28, "carbs": 0, "fat": 1.3},
    {"id": "huevos", "name": "Huevos", "category": ["protein"], "emoji": "🥚", "calories": 155, "protein": 13, "carbs": 1.1, "fat": 11},
    
    # Carbs
    {"id": "arroz-blanco", "name": "Arroz Blanco", "category": ["carbs"], "emoji": "🍚", "calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3},
    {"id": "papa", "name": "Papa", "category": ["carbs"], "emoji": "🥔", "calories": 77, "protein": 2, "carbs": 17, "fat": 0.1},
    {"id": "camote", "name": "Camote", "category": ["carbs"], "emoji": "🍠", "calories": 86, "protein": 1.6, "carbs": 20, "fat": 0.1},
    {"id": "quinua", "name": "Quinua", "category": ["carbs"], "emoji": "🌾", "calories": 120, "protein": 4.4, "carbs": 21, "fat": 1.9},
    {"id": "pan", "name": "Pan", "category": ["carbs"], "emoji": "🍞", "calories": 265, "protein": 9, "carbs": 49, "fat": 3.2},
    {"id": "pasta", "name": "Pasta/Fideos", "category": ["carbs"], "emoji": "🍝", "calories": 131, "protein": 5, "carbs": 25, "fat": 1.1},
    
    # Vegetables
    {"id": "lechuga", "name": "Lechuga", "category": ["vegetables"], "emoji": "🥬", "calories": 15, "protein": 1.4, "carbs": 2.9, "fat": 0.2},
    {"id": "tomate", "name": "Tomate", "category": ["vegetables"], "emoji": "🍅", "calories": 18, "protein": 0.9, "carbs": 3.9, "fat": 0.2},
    {"id": "brocoli", "name": "Brócoli", "category": ["vegetables"], "emoji": "🥦", "calories": 34, "protein": 2.8, "carbs": 7, "fat": 0.4},
    {"id": "zanahoria", "name": "Zanahoria", "category": ["vegetables"], "emoji": "🥕", "calories": 41, "protein": 0.9, "carbs": 10, "fat": 0.2},
    {"id": "espinaca", "name": "Espinaca", "category": ["vegetables"], "emoji": "🥬", "calories": 23, "protein": 2.9, "carbs": 3.6, "fat": 0.4},
    
    # Fruits
    {"id": "manzana", "name": "Manzana", "category": ["fruits"], "emoji": "🍎", "calories": 52, "protein": 0.3, "carbs": 14, "fat": 0.2},
    {"id": "platano", "name": "Plátano", "category": ["fruits"], "emoji": "🍌", "calories": 89, "protein": 1.1, "carbs": 23, "fat": 0.3},
    {"id": "palta", "name": "Palta/Aguacate", "category": ["fats", "fruits"], "emoji": "🥑", "calories": 160, "protein": 2, "carbs": 8.5, "fat": 14.7},
    {"id": "naranja", "name": "Naranja", "category": ["fruits"], "emoji": "🍊", "calories": 47, "protein": 0.9, "carbs": 12, "fat": 0.1},
    {"id": "fresa", "name": "Fresa", "category": ["fruits"], "emoji": "🍓", "calories": 32, "protein": 0.7, "carbs": 7.7, "fat": 0.3},
   
    # Dairy
    {"id": "leche", "name": "Leche", "category": ["dairy"], "emoji": "🥛", "calories": 42, "protein": 3.4, "carbs": 5, "fat": 1},
    {"id": "yogurt", "name": "Yogurt Natural", "category": ["dairy"], "emoji": "🥛", "calories": 61, "protein": 3.5, "carbs": 4.7, "fat": 3.3},
    {"id": "queso", "name": "Queso", "category": ["dairy", "protein"], "emoji": "🧀", "calories": 402, "protein": 25, "carbs": 1.3, "fat": 33},
    
    # Fats
    {"id": "aceite-oliva", "name": "Aceite de Oliva", "category": ["fats"], "emoji": "🫒", "calories": 884, "protein": 0, "carbs": 0, "fat": 100},
    {"id": "mani", "name": "Maní", "category": ["fats", "protein"], "emoji": "🥜", "calories": 567, "protein": 26, "carbs": 16, "fat": 49},
    
    # Snacks
    {"id": "proteina", "name": "Batido de Proteína", "category": ["snacks", "protein"], "emoji": "🥤", "calories": 103, "protein": 20, "carbs": 3.5, "fat": 1.5},
    {"id": "barra-proteina", "name": "Barra de Proteína", "category": ["snacks", "protein"], "emoji": "🍫", "calories": 200, "protein": 20, "carbs": 20, "fat": 6},
    {"id": "granola", "name": "Granola", "category": ["snacks", "carbs"], "emoji": "🥣", "calories": 471, "protein": 13, "carbs": 64, "fat": 17},
]

# Write to JSON
output_path = 'food_database.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(food_database, f, ensure_ascii=False, indent=2)

print(f"✅ Created {output_path} with {len(food_database)} foods")
