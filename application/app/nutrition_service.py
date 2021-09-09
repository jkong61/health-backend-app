from typing import Dict, Optional
from decimal import Decimal
from app import crud, models
import httpx
from httpx import HTTPStatusError
from dotenv import load_dotenv
import os
load_dotenv()

from sqlalchemy.orm.session import Session

class NutritionService:
    def __init__(self, db: Session):
        self.__db = db

        # base URL for the API
        self.__api_URL = os.getenv('EXTERNAL_API_URL')

        # API ID and Keys
        self.__food_app_id = os.getenv('FOOD_APP_ID')
        self.__food_app_key = os.getenv('FOOD_APP_KEY')
        self.__nutrition_app_id = os.getenv('NUTRITION_APP_ID')
        self.__nutrition_app_key = os.getenv('NUTRITION_APP_KEY')

    async def get_from_database(self, food_id, parsed_text = None):
        ''' 
        Method needs to be wrapped in a try except block just in case 

        Returns: 
            Food with Nutrition Model
        Throwable:
            NutritionDataRequiredError, FoodItemDoesNotExistError, ServiceUnavailableError
        '''
        if not bool(food_id):
            raise NutritionDataRequiredError("Food ID not provided.")

        db = self.__db

        # Check if this food item is available in the database
        food = self._check_database_for_food(food_id)
        if bool(food):
            # print("Food ID available in database, returning DB data") # debug only
            return food

        # Call the food parse API for API's food ID, must always have parsed text for querying
        if parsed_text is None:
            raise NutritionDataRequiredError("Parsed Text not provided.")

        try:
            food_info = await self._retrieve_food_id(parsed_text = parsed_text)
        except HTTPStatusError:
            raise ServiceUnavailableError

        # Check if an identifier exist
        try:
            # Likely to throw a key error or index error if does not exist
            food_info = food_info['parsed'][0]['food']
            api_id = food_info['foodId']
            food_label = food_info['label']
        except Exception:
            raise FoodItemDoesNotExistError

        # Quickly check if the API ID is available in the database before adding as a new food item with nutrition
        food = self._check_database_for_food(api_id)
        if bool(food):
            # print("API ID available in database, returning DB data") # debug only
            return food

        # Try to get the nutritional data from API
        try:
            nutrition_info = await self._retrieve_nutrition_data(api_id)
        except HTTPStatusError:
            raise ServiceUnavailableError

        try:
            nutrition_info = nutrition_info['totalNutrients']
        except Exception:
            raise FoodItemDoesNotExistError

        # create parent, append a child via association
        food = models.Food()
        food.food_id = api_id
        food.food_name = food_label
        food.food_type = 0
        food.enabled = True
        for key_code in nutrition_info.keys():
            # Round value to closest 5 decimal points
            nutrition_value = Decimal(str(nutrition_info[key_code]['quantity']))
            association = models.FoodNutritionAssociation(nutrition_value = round(nutrition_value, 5))
            association.nutrition = crud.get_food_nutrition_by_code(db, key_code)
            if(association.nutrition is not None):
                # A chance that nutrition could be None
                food.food_nutritions.append(association)

        db.add(food)
        db.commit()
        db.refresh(food)
        return food


    async def _retrieve_nutrition_data(self, food_id = None) -> Dict:
        # Check if food_id is Falsey
        if not bool(food_id):
            raise NutritionDataRequiredError("Food ID not provided.")

        # Retrieve nutrition if received food ID
        nutrition_url = f"{self.__api_URL}/nutrients?app_id={self.__nutrition_app_id}&app_key={self.__nutrition_app_key}"

        # Standardized into one gram
        nutrition_data_request = {
            "ingredients": [
                {
                "quantity": 1,
                "measureURI": os.getenv('EXTERNAL_MEASUREMENT_URI'),
                "foodId": f"{food_id}"
                }
            ]
        }
        headers = {"Accept": "application/json", 'user-agent': 'PostmanRuntime/7.26.10'}

        # Used for live requests
        async with httpx.AsyncClient() as client:
            response = await client.post(nutrition_url, json = nutrition_data_request, headers=headers)
            response.raise_for_status()
        return response.json()

        # # Used for debugging purposes
        # current_working_dir = os.getcwd()
        # with open(os.path.join(current_working_dir,'app/nutrition.json')) as f:
        #     data = json.load(f)
        # return data

    async def _retrieve_food_id(self, parsed_text = None) -> Dict:
        if not bool(parsed_text):
            raise NutritionDataRequiredError("Parsed Text not provided.")
        parameters = { "app_id" : f"{self.__food_app_id}", "app_key" : f"{self.__food_app_key}", "ingr" : f"{parsed_text}", "category" : "generic-foods"}
        food_url = f"{self.__api_URL}/parser"
        headers = {"Accept": "application/json", 'user-agent': 'PostmanRuntime/7.26.10'}

        # Used for live requests
        async with httpx.AsyncClient() as client:
            response = await client.get(food_url, params=parameters, headers=headers)
            response.raise_for_status()
        return response.json()

        # # Used for debugging purposes
        # current_working_dir = os.getcwd()
        # with open(os.path.join(current_working_dir,'app/food.json')) as f:
        #     data = json.load(f)
        # return data

    def _check_database_for_food(self, food_id: str) -> Optional[models.Food]:
        return crud.get_food(self.__db, food_id)

# Raise error for empty string
class NutritionDataRequiredError(Exception):
    pass

class FoodItemDoesNotExistError(Exception):
    pass

class ServiceUnavailableError(Exception):
    pass