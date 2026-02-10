# Database initialization and schema
import sqlite3
from pathlib import Path

def init_database(db_path: str = "nutrition.db"):
    """Initialize SQLite database with all required tables."""
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # User profiles table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        name TEXT,
        gender TEXT,
        birth_date TEXT,
        current_weight_kg REAL,
        height_cm REAL,
        body_fat_percentage REAL,
        goal TEXT,
        activity_level TEXT,
        diet_type TEXT,
        restrictions TEXT,
        target_weight_kg REAL,
        target_date TEXT,
        meals_per_day INTEGER,
        cooking_time INTEGER,
        experience_level TEXT,
        motivation TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Metabolic profiles table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS metabolic_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        bmr REAL,
        tdee REAL,
        target_calories INTEGER,
        target_protein_g REAL,
        target_carbs_g REAL,
        target_fat_g REAL,
        calculation_method TEXT,
        macro_percentages TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Logged meals table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS logged_meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        food_id TEXT,
        food_name TEXT,
        emoji TEXT,
        grams REAL,
        calories REAL,
        protein REAL,
        carbs REAL,
        fat REAL,
        meal_type TEXT,
        logged_at TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Create indexes
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_meals_user_date 
    ON logged_meals(user_id, logged_at)
    """)
    
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_users_email 
    ON users(email)
    """)
    
    conn.commit()
    conn.close()
    
    print(f"✓ Database initialized at {db_path}")

if __name__ == "__main__":
    init_database()
