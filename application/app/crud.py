from sqlalchemy.orm import Session
from datetime import datetime
from app import models, schemas, security

# Function to process a food item and update its nutritional value with accordance to total weight
def processFoodItem(food_item : schemas.FoodItemWithNutrition):
		if food_item.food is not None and len(food_item.food.food_nutritions) > 0:
				# find the total weight in grams of a particular food item
				total_weight = food_item.per_unit_measurement * food_item.measurement.measurement_conversion_to_g
				# Value needs to be converted to Decimal Type to use round() function
				raw_nutrition_values = [n.nutrition_value * total_weight for n in food_item.food.food_nutritions]
				for i in range(len(raw_nutrition_values)):
					# Round off to 5 decimal points
					food_item.food.food_nutritions[i].nutrition_value = round(raw_nutrition_values[i], 5)
		return food_item

### User
def get_user_by_id(db: Session, user_id: int): 
	return db.query(models.User).filter(models.User.user_id == user_id).first()

def get_user_by_email(db: Session, email: str):
	return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, email: str, password: str, account_type: int):
	db_user = models.User(
		email = email,
		password = security.get_password_hash(password),
		account_type = account_type,
		date_created = datetime.now()
	)

	db.add(db_user)
	db.commit()
	db.refresh(db_user)
	
	return db_user

def verify_user_password(db: Session, user_id: int, password: str):
	db_user = db.query(models.User).filter(models.User.user_id == user_id).first()

	if(db_user is not None):
		return security.verify_password(password, db_user.password)

	return False

def update_user_password(db: Session, user_id: int, new_password: str):
	db.query(models.User).filter(models.User.user_id == user_id).update({
		models.User.password: security.get_password_hash(new_password),
		models.User.password_updated_date: datetime.now(),
	})

	db.commit()

def update_user_info(db: Session, user_id: int, user_info: schemas.UserInfo):
	db_user = get_user_by_id(db, user_id)

	db_user.name = user_info.name
	db_user.contact_information = user_info.contact_information

	db.commit()
	db.refresh(db_user)

	return db_user

def update_user_push_token(db: Session, user_id: int, user_push_token: str = None):
	db_user = get_user_by_id(db, user_id)
	if(db_user is not None and db_user.push_token != user_push_token):
		db_user.push_token = user_push_token if bool(user_push_token) else None
		db.commit()
		# push token is updated
		return True
	
	# push token not updated
	return False

def disable_user_push_token(db: Session, user_push_token: str):
	db_user = db.query(models.User).filter(models.User.push_token == user_push_token).first()
	if(db_user is not None):
		db_user.push_token = None
		db.commit()

### Clinician Assignment
def get_clinician_assignment_by_id(db: Session, clinician_assignment_id: int):
	return db.query(models.ClinicianAssignment).filter(models.ClinicianAssignment.clinician_assignment_id == clinician_assignment_id).first()

def get_clinician_assignment(db: Session, clinician_id: int, user_id: int):
	return db.query(models.ClinicianAssignment).filter(models.ClinicianAssignment.clinician_id == clinician_id).filter(models.ClinicianAssignment.user_id == user_id).first()

def get_clinician_list(db: Session):
	return db.query(models.User).filter(models.User.account_type == 1).all()

def user_view_assignments(db: Session, user_id: int):
	return db.query(models.ClinicianAssignment).filter(models.ClinicianAssignment.user_id == user_id).all()

def clinician_view_assignments(db: Session, clinician_id: int):
	return db.query(models.ClinicianAssignment).filter(models.ClinicianAssignment.clinician_id == clinician_id).all()

def create_clinician_assignment(db: Session, clinician_id: int, user_id: int):
	db_clinician = get_user_by_id(db, clinician_id)
	db_clinician_assignment = db.query(models.ClinicianAssignment).filter(models.ClinicianAssignment.clinician_id == clinician_id).filter(models.ClinicianAssignment.user_id == user_id).all()
	# check if assignment exists and the clinician's account type
	if(len(db_clinician_assignment) != 0 or db_clinician is None or db_clinician.account_type != 1):
		return None
	else:
		db_clinician_assignment = models.ClinicianAssignment(
			clinician_id = clinician_id,
			user_id = user_id,
		)

		db.add(db_clinician_assignment)
		db.commit()
		db.refresh(db_clinician_assignment)

		return db_clinician_assignment

def update_clinician_assignment_status(db: Session, clinician_assignment_id: int, status: bool):
	db_clinician_assignment = db.query(models.ClinicianAssignment).filter(models.ClinicianAssignment.clinician_assignment_id == clinician_assignment_id).first()

	db_clinician_assignment.assignment_accepted = status
	db.commit()

	db.refresh(db_clinician_assignment)
	return db_clinician_assignment

def delete_clinician_assignment(db: Session, clinician_assignment_id: int):
	db_clinician_assignment = db.query(models.ClinicianAssignment).filter(models.ClinicianAssignment.clinician_assignment_id == clinician_assignment_id).first()

	if(db_clinician_assignment is not None):
		db.delete(db_clinician_assignment)
		db.commit()

		return True
	else:
		return False

# todo: generate report
def clinician_generate_report(db: Session, parameters: str):
	pass

# debug
def get_users(db: Session, skip: int, limit: int):
	return db.query(models.User).offset(skip).limit(limit).all()


### Food
def create_food(db: Session, food = schemas.Food):
	db_food = models.Food(
		**food.dict()
	)

	db.add(db_food)
	db.commit()
	db.refresh(db_food)

	return db_food

def get_food_list(db: Session, skip: int):
	return db.query(models.Food).filter(models.Food.enabled == True, models.Food.food_index > skip).order_by(models.Food.food_index.asc()).all()

def get_food(db: Session, food_id: int):
	return db.query(models.Food).filter(models.Food.food_id == food_id).first()


def get_food_by_type(db: Session):
	pass



### FoodNutrition
def get_food_nutrition(db: Session, food_nutrition_id: int):
	return db.query(models.FoodNutrition).filter(models.FoodNutrition.food_nutrition_id == food_nutrition_id).first()

def get_food_nutrition_by_code(db: Session, food_nutrition_code: str):
	return db.query(models.FoodNutrition).filter(models.FoodNutrition.nutrition_code == food_nutrition_code).first()


def get_food_nutrition_list(db: Session, food_id: int):
	return db.query(models.Food).filter(models.Food.food_id == food_id).first()


### RiskScore
def get_risk_score(db: Session, risk_score_id: int):
	return db.query(models.RiskScore).filter(models.RiskScore.risk_score_id == risk_score_id).first()


def get_risk_score_list(db: Session):
	return db.query(models.RiskScore).all()



### RiskScoreValue
def get_risk_score_value(db: Session, risk_score_value_id: int):
	return db.query(models.RiskScoreValue).filter(models.RiskScoreValue.risk_score_value_id == risk_score_value_id).first()



### Meal
def get_meal(db: Session, meal_id: int):
	return db.query(models.Meal).filter(models.Meal.meal_id == meal_id).first()


def get_user_meal_list(db: Session, user_id: int, query: str, skip: int, limit: int):
	meal_list = db.query(models.Meal).filter(models.Meal.user_id == user_id, models.Meal.date_deleted == None).order_by(models.Meal.meal_id.desc()).offset(skip).limit(limit).all()
	for count, meal in enumerate(meal_list):
		meal_list[count].food_items = [food_item for food_item in meal.food_items if food_item.date_deleted is None]
	return meal_list

def create_meal(db: Session, user_id: int, image: str):
	db_meal = models.Meal(
		user_id = user_id,
		image = image,
		date_created = datetime.now(),
	)

	db.add(db_meal)
	# db.flush()

	# for food_item in meal.food_items:
	# 	db_food_item = models.FoodItem(
	# 		meal_id = db_meal.meal_id,
	# 		**food_item.dict(),
	# 		date_created = datetime.now(),
	# 	)
	# 	db.add(db_food_item)

	db.commit()
	db.refresh(db_meal)

	return db_meal


def update_meal_blood_glucose(db: Session, meal_id: int, blood_glucose = schemas.MealUpdateBloodGlucose):
	db.query(models.Meal).filter(models.Meal.meal_id == meal_id).update({
		models.Meal.blood_glucose: blood_glucose.blood_glucose,
		models.Meal.date_modified: datetime.now(),
	})
	db.commit()

	return db.query(models.Meal).filter(models.Meal.meal_id == meal_id).first().blood_glucose

def delete_meal(db: Session, meal_id: int):
	db.query(models.Meal).filter(models.Meal.meal_id == meal_id).update({models.Meal.date_deleted: datetime.now()})
	db.commit()



### FoodItem
def get_food_item(db: Session, food_item_id: int):
	return db.query(models.FoodItem).filter(models.FoodItem.food_item_id == food_item_id, models.FoodItem.date_deleted == None).first()


def get_food_items_list_by_meal_id(db: Session, meal_id: int):
	return db.query(models.FoodItem).filter(models.FoodItem.meal_id == meal_id, models.FoodItem.date_deleted == None).all()


def create_food_item(db: Session, meal_id: int, food_item: schemas.FoodItemCreateUpdate):
	db_food_item = models.FoodItem(
		food_id = food_item.food_id,
		volume_consumed = food_item.volume_consumed,
		per_unit_measurement = food_item.per_unit_measurement,
		new_food_type = food_item.new_food_type,
		meal_id = meal_id,
		date_created = datetime.now(),
	)

	db_food_item.measurement = get_measurement_by_suffix(db, food_item.measurement_suffix)
	db.add(db_food_item)
	db.commit()
	db.refresh(db_food_item)

	return db_food_item


def update_food_item(db: Session, food_item_id: int, food_item: schemas.FoodItemCreateUpdate):
	db_food_item = db.query(models.FoodItem).filter(models.FoodItem.food_item_id == food_item_id).first()
	if not bool(db_food_item):
		raise Exception("Food Item does not exist.")
	db_food_item.food_id = food_item.food_id
	db_food_item.new_food_type = food_item.new_food_type
	db_food_item.volume_consumed = food_item.volume_consumed
	db_food_item.per_unit_measurement = food_item.per_unit_measurement
	db_food_item.measurement = get_measurement_by_suffix(db, food_item.measurement_suffix)
	db_food_item.date_modified = datetime.now()
	db.commit()


def delete_food_item(db: Session, food_item_id: int):
	db.query(models.FoodItem).filter(models.FoodItem.food_item_id == food_item_id).update({models.FoodItem.date_deleted: datetime.now()})
	db.commit()

### Measurements
def get_measurement_by_suffix(db: Session, measurement_suffix: str):
	measurement = db.query(models.Measurement).filter(models.Measurement.suffix == measurement_suffix).first()
	if bool(measurement):
		return measurement 
	available_measurements = " ,".join([i[0] for i in db.query(models.Measurement.suffix).all()])
	raise Exception(f"Provided Measurement type does not exist. Available measurements are: {available_measurements}")


### Profile
def get_profile(db: Session, user_id: int):
	return db.query(models.Profile).filter(models.Profile.user_id == user_id).first()


def create_profile(db: Session, user_id: int, profile: schemas.ProfileBase):
	db_profile = models.Profile(
		**profile.dict(),
		date_created = datetime.now(),
		user_id = user_id,
	)

	db.add(db_profile)
	db.commit()
	db.refresh(db_profile)

	return db_profile


def update_profile(db: Session, user_id: int, profile: schemas.ProfileBase):
	db.query(models.Profile).filter(models.Profile.user_id == user_id).update({
		models.Profile.date_of_birth: profile.date_of_birth,
		models.Profile.height: profile.height,
		models.Profile.gender: profile.gender,
		models.Profile.ethnicity: profile.ethnicity,
		models.Profile.family_history_diabetes_non_immediate: profile.family_history_diabetes_non_immediate,
		models.Profile.family_history_diabetes_parents: profile.family_history_diabetes_parents,
		models.Profile.family_history_diabetes_siblings: profile.family_history_diabetes_siblings,
		models.Profile.family_history_diabetes_children: profile.family_history_diabetes_children,
		models.Profile.high_blood_glucose_history: profile.high_blood_glucose_history,
		models.Profile.high_blood_pressure_medication_history: profile.high_blood_pressure_medication_history,
		models.Profile.date_modified: datetime.now(),
	})
	db.commit()
	return db.query(models.Profile).filter(models.Profile.user_id == user_id).first()



### HealthRecord
def get_health_record(db: Session, health_record_id: int):
	return db.query(models.HealthRecord).filter(models.HealthRecord.health_record_id == health_record_id).first()


def get_latest_health_record(db: Session, user_id: int):
	return db.query(models.HealthRecord).filter(models.HealthRecord.user_id == user_id).filter(models.HealthRecord.date_deleted == None).order_by(models.HealthRecord.date_created.desc()).first()


def get_user_health_record_list(db: Session, user_id: int, query: str, skip: int, limit: int):
	return db.query(models.HealthRecord).filter(models.HealthRecord.user_id == user_id).filter(models.HealthRecord.date_deleted == None).order_by(models.HealthRecord.health_record_id.desc()).offset(skip).limit(limit).all()


def create_health_record(db: Session, user_id: int, health_record = schemas.HealthRecordCreate):
	db_health_record = models.HealthRecord(
		**health_record.dict(),
		date_created = datetime.now(),
		user_id = user_id,
	)

	db.add(db_health_record)
	db.commit()
	db.refresh(db_health_record)
	
	return db_health_record


def update_health_record(db: Session, user_id: int, health_record_id: int, health_record = schemas.HealthRecordUpdate):
	db.query(models.HealthRecord).filter(models.HealthRecord.health_record_id == health_record_id).update({
		models.HealthRecord.waist_circumference: health_record.waist_circumference,
		models.HealthRecord.weight: health_record.weight,
		models.HealthRecord.blood_pressure_medication: health_record.blood_pressure_medication,
		models.HealthRecord.physical_exercise_hours: health_record.physical_exercise_hours,
		models.HealthRecord.physical_exercise_minutes: health_record.physical_exercise_minutes,
		models.HealthRecord.smoking: health_record.smoking,
		models.HealthRecord.vegetable_fruit_berries_consumption: health_record.vegetable_fruit_berries_consumption,
		models.HealthRecord.systolic_pressure: health_record.systolic_pressure,
		models.HealthRecord.fasting_blood_glucose: health_record.fasting_blood_glucose,
		models.HealthRecord.hdl_cholesterol: health_record.hdl_cholesterol,
		models.HealthRecord.triglycerides: health_record.triglycerides,
		models.HealthRecord.date_modified: datetime.now(),
	})
	db.commit()

	return db.query(models.HealthRecord).filter(models.HealthRecord.health_record_id == health_record_id).first()


def delete_health_record(db: Session, health_record_id: int):
	db.query(models.HealthRecord).filter(models.HealthRecord.health_record_id == health_record_id).update({models.HealthRecord.date_deleted: datetime.now()})
	db.commit()


def create_test_recording(db: Session, user_id: int, test_recording = schemas.TestRecordingBase):
	db_test_recording = models.TestRecording(
		**test_recording.dict(),
		user_id = user_id,
		date_created = datetime.now(),
	)

	db.add(db_test_recording)
	db.commit()
	db.refresh(db_test_recording)

def create_test_survey(db: Session, user_id: int, test_survey = schemas.TestSurveyBase):
	db_test_survey = models.TestSurvey(
		**test_survey.dict(),
		user_id = user_id,
		date_created = datetime.now(),
	)

	db.add(db_test_survey)
	db.commit()
	db.refresh(db_test_survey)

