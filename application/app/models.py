from datetime import datetime
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, DateTime, Float, Sequence
from sqlalchemy.orm import relationship
from sqlalchemy.schema import UniqueConstraint
from sqlalchemy.sql.functions import next_value

from app.database import Base

class User(Base):
	__tablename__ = 'User'

	# Columns
	user_id = Column(Integer, primary_key=True, index=True)
	email = Column(String, unique=True, index=True)
	password = Column(String)
	password_updated_date = Column(DateTime)
	disabled = Column(Boolean, default=False)
	account_type = Column(Integer)
	name = Column(String)
	contact_information = Column(String)
	date_created = Column(DateTime)
	push_token = Column(String)

	# Relations
	meals = relationship('Meal', back_populates='user')
	health_records = relationship('HealthRecord', back_populates='user')
	profile = relationship('Profile', back_populates='user')
	assigned_clinician = relationship('ClinicianAssignment', foreign_keys='ClinicianAssignment.clinician_id', back_populates='clinician')
	assigned_user = relationship('ClinicianAssignment', foreign_keys='ClinicianAssignment.user_id', back_populates='user')


class ClinicianAssignment(Base):
	__tablename__ = 'ClinicianAssignment'

	# Columns
	clinician_assignment_id = Column(Integer, primary_key=True, index=True)
	clinician_id = Column(Integer, ForeignKey('User.user_id'), nullable=False)
	user_id = Column(Integer, ForeignKey('User.user_id'), nullable=False)
	assignment_accepted = Column(Boolean)

	# Relations
	clinician = relationship('User', foreign_keys=[clinician_id], back_populates='assigned_clinician')
	user = relationship('User', foreign_keys=[user_id], back_populates='assigned_user')


class Food(Base):
	__tablename__ = 'Food'
	sequence = Sequence('food_food_index_seq')
	# Columns
	food_id = Column(String, primary_key=True)
	food_name = Column(String)
	food_type = Column(Integer)
	enabled = Column(Boolean)
	food_index = Column(Integer, sequence, default=next_value(sequence), autoincrement=True, index=True)
	# date_created = Column(DateTime, default=datetime.now(),nullable=False )

	# Relations
	food_nutritions = relationship('FoodNutritionAssociation', back_populates='food')
	food_items = relationship('FoodItem', back_populates='food')

class FoodNutritionAssociation(Base):
	__tablename__ = 'FoodNutritionAssociation'

	food_id = Column(String, ForeignKey('Food.food_id'), primary_key=True)
	food_nutrition_id = Column(Integer, ForeignKey('FoodNutrition.food_nutrition_id'), primary_key=True)
	nutrition_value = Column(Float)

	food = relationship("Food", back_populates="food_nutritions")
	nutrition = relationship("FoodNutrition", back_populates="foods")

class FoodNutrition(Base):
	__tablename__ = 'FoodNutrition'

	# Columns
	food_nutrition_id = Column(Integer, primary_key=True, index=True)
	nutrition_code = Column(String(10))
	nutrition_name = Column(String)
	nutrition_measurement_suffix = Column(String)
	enabled = Column(Boolean)

	# Relations
	foods = relationship('FoodNutritionAssociation', back_populates='nutrition')

class RiskScore(Base):
	__tablename__ = 'RiskScore'

	# Columns
	risk_score_id = Column(Integer, primary_key=True, index=True)
	risk_score_name = Column(String, unique=True)
	risk_score_details = Column(String)
	risk_score_duration = Column(String)

	# Relations
	risk_score_values = relationship('RiskScoreValue', back_populates='risk_score')


class Profile(Base):
	__tablename__ = 'Profile'

	# Columns
	profile_id = Column(Integer, primary_key=True, index=True)
	user_id = Column(Integer, ForeignKey('User.user_id'), index=True, unique=True, nullable=False)
	date_of_birth = Column(Date)
	gender = Column(String)
	height = Column(Float)
	ethnicity = Column(Integer)
	family_history_diabetes_non_immediate = Column(Boolean)
	family_history_diabetes_parents = Column(Boolean)
	family_history_diabetes_siblings = Column(Boolean)
	family_history_diabetes_children = Column(Boolean)
	high_blood_glucose_history = Column(Boolean)
	high_blood_pressure_medication_history = Column(Boolean)

	date_created = Column(DateTime)
	date_modified = Column(DateTime)

	# Relations
	user = relationship('User', back_populates='profile')


class Meal(Base):
	__tablename__ = 'Meal'

	# Columns
	meal_id = Column(Integer, primary_key=True, index=True)
	user_id = Column(Integer, ForeignKey('User.user_id'), nullable=False)
	image = Column(String)
	blood_glucose = Column(Float)
	food_predictions = Column(String)
	date_created = Column(DateTime)
	date_modified = Column(DateTime)
	date_deleted = Column(DateTime)

	# Relations
	user = relationship('User', back_populates='meals')
	food_items = relationship('FoodItem', back_populates='meal')
	# blood_glucose = relationship('MealBloodGlucose', back_populates='meal')


class RiskScoreValue(Base):
	__tablename__ = 'RiskScoreValue'
	__table_args__ = (UniqueConstraint('risk_score_value', 'risk_score_id', name='risk_score_value_risk_score_id_unique'),)

	# Columns
	risk_score_value_id = Column(Integer, primary_key=True, index=True)
	risk_score_value = Column(Integer)
	risk_score_id = Column(Integer, ForeignKey('RiskScore.risk_score_id'), nullable=False)
	diabetes_risk_value = Column(Float)
	diabetes_risk_info = Column(String)

	# Relations
	risk_score = relationship('RiskScore', back_populates='risk_score_values')
	# health_records = relationship('HealthRecord', back_populates='risk_score_value')

class Measurement(Base):
	__tablename__ = 'Measurement'

	measurement_id = Column(Integer, primary_key=True)
	measurement_description = Column(String)
	measurement_conversion_to_g = Column(Float)
	suffix = Column(String)
	enabled = Column(Boolean)

	food_item = relationship('FoodItem', back_populates='measurement')

class FoodItem(Base):
	__tablename__ = 'FoodItem'

	# Columns
	food_item_id = Column(Integer, primary_key=True)
	meal_id = Column(Integer, ForeignKey('Meal.meal_id', ondelete='CASCADE'), index=True, nullable=False)
	food_id = Column(String, ForeignKey('Food.food_id'), index=True, nullable=True)
	measurement_id = Column(Integer, ForeignKey('Measurement.measurement_id'), index=True, nullable=False, default=2)
	food_item_count = Column(Integer)
	volume_consumed = Column(Float)
	per_unit_measurement = Column(Float, default=0)
	bounding_box_start_x = Column(Float)
	bounding_box_start_y = Column(Float)
	bounding_box_end_x = Column(Float)
	bounding_box_end_y = Column(Float)
	new_food_type = Column(String)
	date_created = Column(DateTime)
	date_modified = Column(DateTime)
	date_deleted = Column(DateTime)

	# Relations
	food = relationship('Food', back_populates='food_items')
	meal = relationship('Meal', back_populates='food_items')
	measurement = relationship('Measurement', back_populates='food_item')

class HealthRecord(Base):
	__tablename__ = 'HealthRecord'

	# Columns
	health_record_id = Column(Integer, primary_key=True, index=True)
	user_id = Column(Integer, ForeignKey('User.user_id'), nullable=False)
	# risk_score_value_id = Column(String, ForeignKey('RiskScoreValue.risk_score_value_id'), nullable=False)
	waist_circumference = Column(Float)
	weight = Column(Float)
	blood_pressure_medication = Column(Boolean)
	physical_exercise_hours = Column(Integer)
	physical_exercise_minutes = Column(Integer)
	smoking = Column(Boolean)
	vegetable_fruit_berries_consumption = Column(Boolean)
	systolic_pressure = Column(Float)
	fasting_blood_glucose = Column(Float)
	hdl_cholesterol = Column(Float)
	triglycerides = Column(Float)
	date_created = Column(DateTime)
	date_modified = Column(DateTime)
	date_deleted = Column(DateTime)

	# Relations
	user = relationship('User', back_populates='health_records')
	# risk_score_value = relationship('RiskScoreValue', back_populates='health_records')

class TestRecording(Base):
	__tablename__ = 'TestRecording'

	# Columns
	test_recording_id = Column(Integer, primary_key=True, index=True)
	user_id = Column(Integer, nullable=False)
	data = Column(String)
	date_created = Column(DateTime)

class TestSurvey(Base):
	__tablename__ = 'TestSurvey'

	# Columns
	test_survey_id = Column(Integer, primary_key=True, index=True)
	user_id = Column(Integer, nullable=False)
	data = Column(String)
	date_created = Column(DateTime)
