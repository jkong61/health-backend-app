import os, sys; sys.path.append(os.path.join(os.path.dirname(__file__), '..')) # add app to path
import csv, argparse
import copy
from app import models, schemas
from app.database import SessionLocal

# Utility
def get_enabled(enabled_str):
	if(enabled_str == 'enabled'):
		return True
	if(enabled_str == 'disabled'):
		return False
	return True # default to enabled


def populate_database_metadata(args):
	# initialize session
	print('[INFO] initialize session')
	db = SessionLocal()

	sync_food_classes(db, args.food, args.food_disable)
	# sync_food_nutrition(db, args.nutrition, args.nutrition_disable)
	sync_food_nutrition_types(db, args.nutrition, args.nutrition_disable)
	sync_measurement(db, args.measurement, args.measurement_disable)

def update_risk_scores(db):
	# delete existing data
	print('[INFO] deleting existing data')
	db.query(models.RiskScoreValue).delete()
	db.query(models.RiskScore).delete()

	print('[INFO] update risk scores')
	# populate RiskScore table
	db.add_all([
		models.RiskScore(
			risk_score_id = 1,
			risk_score_name = 'AUSDRISK',
			risk_score_details = 'Australian Type 2 Diabetes Risk Assessment Tool (AUSDRISK)',
			risk_score_duration = '5 Years'
		)
	])

	# populate RiskScoreValue table
	db.add_all([
		models.RiskScoreValue(
			risk_score_value = 1,
			risk_score_id = 1,
			diabetes_risk_value = 1,
			diabetes_risk_info = '1% (1 in 100 chance)',
		),
		models.RiskScoreValue(
			risk_score_value = 2,
			risk_score_id = 1,
			diabetes_risk_value = 2,
			diabetes_risk_info = '2% (1 in 50 chance)',
		),
		models.RiskScoreValue(
			risk_score_value = 3,
			risk_score_id = 1,
			diabetes_risk_value = 1/30,
			diabetes_risk_info = '3.33% (1 in 30 chance)',
		),
		models.RiskScoreValue(
			risk_score_value = 4,
			risk_score_id = 1,
			diabetes_risk_value = 1/14,
			diabetes_risk_info = '7.14% (1 in 14 chance)',
		),
		models.RiskScoreValue(
			risk_score_value = 5,
			risk_score_id = 1,
			diabetes_risk_value = 1/7,
			diabetes_risk_info = '14.29% (1 in 7 chance)',
		),
		models.RiskScoreValue(
			risk_score_value = 6,
			risk_score_id = 1,
			diabetes_risk_value = 1/3,
			diabetes_risk_info = '33.3% (1 in 3 chance)',
		),
	])


def sync_food_classes(db, data_path, disable):
	if(data_path is None):
		return

	def get_food_type(food_type_str):
		if(food_type_str == 'dish'):
			return 0
		if(food_type_str == 'item'):
			return 1
		return 0 # default to dish

	# read food data
	food_data = []
	with open(data_path) as f:
		for row in f:
			row = row.strip().split(',')
			if(len(''.join(row)) > 0):
				food_data.append(row)
	# print('food_data', food_data) # debug

	# Update food data
	food_ids = [row.food_id for row in db.query(models.Food).all()]
	food_ids_disable = [row.food_id for row in db.query(models.Food).all()]
	for row in food_data:
		if(row[0] in food_ids):
			# print('update {}'.format(row[0])) # debug
			db.query(models.Food).filter(models.Food.food_id == row[0]).update({
				models.Food.food_name: row[1],
				models.Food.food_type: get_food_type(row[2]),
				models.Food.enabled: get_enabled(row[3]),
			})
			food_ids_disable.remove(row[0])
		else:
			# print('create {}'.format(row[0])) # debug
			db.add(models.Food(
				food_id = row[0],
				food_name = row[1],
				food_type = get_food_type(row[2]),
				enabled = get_enabled(row[3]),
			))
	
	# Disable remaining food
	# print('food_disable {}'.format(disable)) # debug
	if(disable):
		for food_id in food_ids_disable:
			# print('disable {}'.format(food_id)) # debug
			db.query(models.Food).filter(models.Food.food_id == food_id).update({
				models.Food.enabled: False,
			})

	# commit changes
	db.commit()
	print('[INFO] food updated')
	# all_items = db.query(models.Food).all()
	# [print(item.__dict__) for item in all_items]

def sync_food_nutrition(db, data_path, disable):
	if(data_path is None):
		return

	# read food nutrition data
	food_nutrition_data = []
	with open(data_path) as f:
		for row in f:
			row = row.strip().split(',')
			if(len(''.join(row)) > 0):
				food_nutrition_data.append(row)
	# print('food_nutrition_data', food_nutrition_data) # debug

	# Convert nutrition data into a dict
	food_nutrition_dict = {}
	for row in food_nutrition_data:
		if(row[0] not in food_nutrition_dict):
			food_nutrition_dict[row[0]] = {}
		food_nutrition_dict[row[0]][row[1]] = {
				'name': row[2],
				'value': row[3],
				'enabled': get_enabled(row[4]),
		}
	# print('food_nutrition_dict', food_nutrition_dict) # debug

	# Get existing nutrition data in database, construct dict
	db_food_nutrition = db.query(models.FoodNutrition).all()
	db_food_nutrition_dict = {}
	db_food_nutrition_disable = []
	for row in db_food_nutrition:
		if(row.food_id not in db_food_nutrition_dict):
			db_food_nutrition_dict[row.food_id] = {}
		db_food_nutrition_dict[row.food_id][row.nutrition_type] = row.food_nutrition_id
		db_food_nutrition_disable.append(row.food_nutrition_id)
	# print('db_food_nutrition_dict', db_food_nutrition_dict) # debug
	# print('db_food_nutrition_disable', db_food_nutrition_disable) # debug

	# Upsert food nutrition data
	for food_id in food_nutrition_dict:
		for nutrition in food_nutrition_dict[food_id]:
			if(food_id in db_food_nutrition_dict and nutrition in db_food_nutrition_dict[food_id]):
				# print('update {} {}'.format(food_id, nutrition)) # debug
				db.query(models.FoodNutrition).filter(models.FoodNutrition.food_nutrition_id == db_food_nutrition_dict[food_id][nutrition]).update({
					models.FoodNutrition.nutrition_name: food_nutrition_dict[food_id][nutrition]['name'],
					models.FoodNutrition.nutrition_value: food_nutrition_dict[food_id][nutrition]['value'],
					models.FoodNutrition.enabled: food_nutrition_dict[food_id][nutrition]['enabled'],
				})
				db_food_nutrition_disable.remove(db_food_nutrition_dict[food_id][nutrition]) # remove id if updated
			else:
				# print('create {} {}'.format(food_id, nutrition)) # debug
				db.add(models.FoodNutrition(
					food_id = food_id,
					nutrition_type = nutrition,
					nutrition_name = food_nutrition_dict[food_id][nutrition]['name'],
					nutrition_value = food_nutrition_dict[food_id][nutrition]['value'],
					enabled = food_nutrition_dict[food_id][nutrition]['enabled'],
				))

	#  Disable remaining nutrition data
	# print('nutrition_disable {}'.format(disable)) # debug
	if(disable):
		for food_nutrition_id in db_food_nutrition_disable:
			db.query(models.FoodNutrition).filter(models.FoodNutrition.food_nutrition_id == food_nutrition_id).update({
				models.FoodNutrition.enabled: False,
			})


	# commit changes
	db.commit()
	print('[INFO] food nutrition updated')
	# all_items = db.query(models.FoodNutrition).all()
	# [print(item.__dict__) for item in all_items]

def sync_food_nutrition_types(db, data_path, disable):
	if(data_path is None):
		return

	# read measurement data
	nutrition_type_data = []
	with open(data_path) as f:
		for row in f:
			row = row.strip().split(',')
			if(len(''.join(row)) > 0):
				nutrition_type_data.append(row)

	# Update measurement data
	nutrition_ids = [row.nutrition_code for row in db.query(models.FoodNutrition).all()]
	nutrition_ids_disable = copy.deepcopy(nutrition_ids)

	for row in nutrition_type_data:
		if row[0] in nutrition_ids:
			db.query(models.FoodNutrition).filter(models.FoodNutrition.nutrition_code == row[0]).update({
				models.FoodNutrition.nutrition_code: row[0],
				models.FoodNutrition.nutrition_name: row[1],
				models.FoodNutrition.nutrition_measurement_suffix: row[2],
				models.FoodNutrition.enabled: get_enabled(row[3]),
			})
			nutrition_ids_disable.remove(row[0])
		else:
			db.add(models.FoodNutrition(
				nutrition_code = row[0],
				nutrition_name = row[1],
				nutrition_measurement_suffix = row[2],
				enabled = get_enabled(row[3]),
			))

	if(disable):
		for code in nutrition_ids_disable:
			db.query(models.FoodNutrition).filter(models.FoodNutrition.nutrition_code == code).update({
				models.FoodNutrition.enabled: False,
			})
	db.commit()
	print('[INFO] food nutrition types updated')

def sync_measurement(db, data_path, disable):
	if(data_path is None):
		return

	# read measurement data
	measurement_data = []
	with open(data_path) as f:
		for row in f:
			row = row.strip().split(',')
			if(len(''.join(row)) > 0):
				measurement_data.append(row)

	# Update measurement data
	measurement_ids = [row.suffix for row in db.query(models.Measurement).all()]
	measurement_ids_disable = copy.deepcopy(measurement_ids)

	for row in measurement_data:
		if row[2] in measurement_ids:
			db.query(models.Measurement).filter(models.Measurement.suffix == row[2]).update({
				models.Measurement.measurement_description: row[0],
				models.Measurement.measurement_conversion_to_g: row[1],
				models.Measurement.enabled: get_enabled(row[3]),
			})
			measurement_ids_disable.remove(row[2])
		else:
			# print('create {}'.format(row[0])) # debug
			db.add(models.Measurement(
				measurement_description = row[0],
				measurement_conversion_to_g = row[1],
				suffix = row[2],
				enabled = get_enabled(row[3]),
			))

	if(disable):
		for suffix in measurement_ids_disable:
			db.query(models.Measurement).filter(models.Measurement.suffix == suffix).update({
				models.Measurement.enabled: False,
			})

	# commit changes
	db.commit()
	print('[INFO] mesurements updated')

def db_test():
	db = SessionLocal()
	
	all_food = db.query(models.Food).all()

	print([food.__dict__ for food in all_food])


if __name__ == "__main__":
	parser = argparse.ArgumentParser(description='Updates database tables')
	parser.add_argument('-f', '--food', required=True, help='Path to .csv file containing food data')
	parser.add_argument('-n', '--nutrition', required=True, help='Path to .csv file containing nutrition data')
	parser.add_argument('-m', '--measurement', required=True, help='Path to .csv file containing measurement data')
	parser.add_argument('-fd', '--food-disable', action='store_const', const=True, default=False, help='Disable food that are not given in the food data file')
	parser.add_argument('-nd', '--nutrition-disable', action='store_const', const=True, default=False, help='Disable nutrition that are not given in the nutrition data file')
	parser.add_argument('-md', '--measurement-disable', action='store_const', const=True, default=False, help='Disable measurement that are not given in the measurement data file')
	args = parser.parse_args()

	populate_database_metadata(args)