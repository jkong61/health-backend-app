from typing import List, Optional
from datetime import date, datetime

from pydantic import BaseModel, EmailStr


class BaseAPIModel(BaseModel):
	class Config:
		orm_mode = True

# HealthRecord
class HealthRecordBase(BaseAPIModel):
	waist_circumference: float = None
	weight: float = None
	blood_pressure_medication: bool = None
	physical_exercise_hours: int = None
	physical_exercise_minutes: int = None
	smoking: bool = None
	vegetable_fruit_berries_consumption: bool = None
	systolic_pressure: float = None
	fasting_blood_glucose: float = None
	hdl_cholesterol: float = None
	triglycerides: float = None

class HealthRecordCreate(HealthRecordBase):
	pass

class HealthRecordUpdate(HealthRecordBase):
	pass

class HealthRecordMetadata(HealthRecordBase):
	date_created: datetime
	date_modified: datetime = None
	date_deleted: datetime = None

class HealthRecord(HealthRecordMetadata):
	health_record_id: int
	user_id: int

class Food(BaseAPIModel):
	food_id: str
	food_name: str
	# food_type: int
	# enabled: bool

# Measurement
class MeasurementBase(BaseAPIModel):
	measurement_description: str
	measurement_conversion_to_g: float
	suffix: str

# FoodItem
class FoodItemBase(BaseAPIModel):
	volume_consumed: float = None
	per_unit_measurement: float = None
	# bounding_box_start_x: float
	# bounding_box_start_y: float
	# bounding_box_end_x: float
	# bounding_box_end_y: float

class FoodItemCreateUpdate(FoodItemBase):
	food_id: str = None
	new_food_type: str = None
	measurement_suffix: str = None

class FoodItem(FoodItemBase):
	food_item_id: int = None
	meal_id: int = None
	new_food_type: str = None
	food: Food = None
	measurement: MeasurementBase = None

class FoodItemWithMetadata(FoodItem):
	date_created: datetime
	date_modified: datetime = None
	date_deleted: datetime = None

class FoodItemSlim(BaseAPIModel):
	food_item_id: int = None
	new_food_type: str = None
	food: Food = None


# Meal
class MealBase(BaseAPIModel):
	image: str

class MealFoodItems(BaseAPIModel):
	food_items: List[FoodItem] = []

class MealCreate(BaseAPIModel):
	image: str

# class MealCreate(MealBase):
# 	food_items: List[FoodItemCreate] = []

class MealUpdate(MealBase):
	food_items: List[FoodItem] = []

class MealUpdateBloodGlucose(BaseAPIModel):
	blood_glucose: float

class MealMetadata(MealBase):
	date_created: datetime
	date_modified: datetime = None
	date_deleted: datetime = None

class Meal(MealMetadata):
	meal_id: int
	user_id: int
	blood_glucose: float = None
	
class MealWithPredictions(Meal):
	food_predictions: str = None

class MealWithSlimFoodItems(Meal):
	food_items: List[FoodItemSlim] = []

# RiskScoreValue
class RiskScoreValueBase(BaseAPIModel):
	risk_score_value: int
	diabetes_risk_value: float
	diabetes_risk_info: str

class RiskScoreValueCreate(RiskScoreValueBase):
	pass

class RiskScoreValue(RiskScoreValueBase):
	risk_score_value_id: int
	risk_score_id: int



# FoodNutrition
class FoodNutritionBase(BaseAPIModel):
	nutrition_code: str = None
	nutrition_name: str = None
	nutrition_measurement_suffix: str = None

class FoodNutritionCreate(FoodNutritionBase):
	pass

class FoodNutrition(FoodNutritionBase):
	food_nutrition_id: int = None

class FoodNutritionAssociationBase(BaseAPIModel):
	nutrition: FoodNutritionBase = None
	nutrition_value: float = None

# Profile
class ProfileBase(BaseAPIModel):
	date_of_birth: date
	gender: str
	height: float
	ethnicity: int
	family_history_diabetes_non_immediate: bool
	family_history_diabetes_parents: bool
	family_history_diabetes_siblings: bool
	family_history_diabetes_children: bool
	high_blood_glucose_history: bool
	high_blood_pressure_medication_history: bool

class ProfileMetadata(ProfileBase):
	date_created: datetime = None
	date_modified: datetime = None

class Profile(ProfileMetadata):
	profile_id: int
	user_id: int


# RiskScore
class RiskScoreBase(BaseAPIModel):
	risk_score_name: str
	risk_score_details: str
	risk_score_duration: str

class RiskScoreRelations(BaseAPIModel):
	risk_score_values: List[RiskScoreValue] = []

class RiskScoreCreate(RiskScoreBase):
	pass

class RiskScore(RiskScoreBase):
	risk_score_id: int

class RiskScoreWithRelations(RiskScore):
	risk_score_values: List[RiskScoreValue] = []



# Food
class FoodWithNutrition(Food):
	food_nutritions: List[FoodNutritionAssociationBase] = []

class FoodWithRelations(Food):
	food_nutritions: List[FoodNutritionAssociationBase] = []
	food_items: List[FoodItem] = []

class FoodItemWithNutrition(FoodItem):
	food: FoodWithNutrition = None

# Food Model IDs
class FoodModelIDs(BaseAPIModel):
	food_model_ids: List[str] = []

class MealWithFoodItems(Meal):
	food_items: List[FoodItemWithNutrition] = []

# User
class UserBase(BaseAPIModel):
	email: str

class UserCreate(BaseAPIModel):
	email: EmailStr
	password: str

class UserCreateByUsername(UserBase):
	password: str

class PushToken(BaseAPIModel):
	token: Optional[str] = None

class User(UserBase):
	user_id: int
	account_type: int
	name: str = None
	contact_information: str = None
	date_created: datetime

class Clinician(BaseAPIModel):
	user_id: int
	email: str
	name: str = None
	contact_information: str = None

class UserWithRelations(User):
	meals: List[Meal] = []
	health_records: List[HealthRecord] = []
	profile: List[Profile] = []

class UserInfo(BaseAPIModel):
	name: str = None
	contact_information: str = None

class PasswordChange(BaseAPIModel):
	current_password: str
	new_password: str


# Clinician Assignment
class ClinicianAssignmentBase(BaseAPIModel):
	clinician_id: int

class ClinicianAssignmentCreate(ClinicianAssignmentBase):
	pass

class ClinicianAssignment(ClinicianAssignmentBase):
	clinician_assignment_id: int
	user_id: int
	assignment_accepted: bool = None

class ClinicianAssignmentWithRelations(ClinicianAssignment):
	clinician: Clinician



### Trend Analyzer
class GenerateReportConfig(BaseAPIModel):
	selected_features: List[str] = None
	ranking_type_top_n: bool = None
	ranking_ascending: bool = None
	threshold: float = None

class TrendAnalyzerReport(BaseAPIModel):
	normal_users: List[int]
	abnormal_users: List[int]



### Others
# Food detection
class FoodImage(BaseAPIModel):
	data: str



### Response Model
class DefaultResponse(BaseAPIModel):
	detail: str


### Test Objects
class TestRecordingBase(BaseAPIModel):
	data: str

class TestRecordingCreate(TestRecordingBase):
	user_id: int
	date_created: datetime

class TestRecording(TestRecordingBase):
	test_recording_id: int
	user_id: int
	date_created: datetime


class TestSurveyBase(BaseAPIModel):
	data: str

class TestSurveyCreate(TestSurveyBase):
	user_id: int
	date_created: datetime

class TestSurvey(TestSurveyBase):
	test_survey_id: int
	user_id: int
	date_created: datetime
