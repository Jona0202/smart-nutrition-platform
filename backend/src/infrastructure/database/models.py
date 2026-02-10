from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    metabolic_profile = relationship("MetabolicProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    meals = relationship("LoggedMeal", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    name = Column(String)
    gender = Column(String)
    birth_date = Column(String)
    current_weight_kg = Column(Float)
    height_cm = Column(Float)
    body_fat_percentage = Column(Float, nullable=True)
    goal = Column(String)
    activity_level = Column(String)
    diet_type = Column(String)
    restrictions = Column(Text)  # JSON string
    target_weight_kg = Column(Float, nullable=True)
    target_date = Column(String, nullable=True)
    meals_per_day = Column(Integer)
    cooking_time = Column(Integer)
    experience_level = Column(String)
    motivation = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="profile")


class MetabolicProfile(Base):
    __tablename__ = "metabolic_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    bmr = Column(Float)
    tdee = Column(Float)
    target_calories = Column(Integer)
    target_protein_g = Column(Float)
    target_carbs_g = Column(Float)
    target_fat_g = Column(Float)
    calculation_method = Column(String)
    macro_percentages = Column(Text)  # JSON string
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="metabolic_profile")


class LoggedMeal(Base):
    __tablename__ = "logged_meals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    food_id = Column(String)
    food_name = Column(String)
    emoji = Column(String)
    grams = Column(Float)
    calories = Column(Float)
    protein = Column(Float)
    carbs = Column(Float)
    fat = Column(Float)
    meal_type = Column(String)
    logged_at = Column(DateTime, nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="meals")
