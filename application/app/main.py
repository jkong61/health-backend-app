# main.py - HealthApp Backend API Server

# Load Environment Variables
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import traceback
from keras.models import load_model
from app.database import SessionLocal
from app.nutrition_service import NutritionService
from app import crud, models, schemas, security, smart_diet_watcher, trend_analyzer, push_service
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jwt import PyJWTError
import jwt
from sqlalchemy.orm import Session
from typing import List
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_404_NOT_FOUND, HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR, HTTP_503_SERVICE_UNAVAILABLE
from starlette.staticfiles import StaticFiles
from starlette.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import FastAPI, Depends, HTTPException, Response, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import json
load_dotenv()

# Imports
# Imports - FastAPI

# Imports - Starlette

# Imports - Others

# Imports - App
# add app to path

# Imports - Model

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# For offline development
# from fastapi.openapi.docs import (
# 	get_redoc_html,
# 	get_swagger_ui_html,
# 	get_swagger_ui_oauth2_redirect_html,
# )
# app = FastAPI(docs_url=None, redoc_url=None)

# @app.get("/docs", include_in_schema=False)
# async def custom_swagger_ui_html():
# 	return get_swagger_ui_html(
# 		openapi_url=app.openapi_url,
# 		title=app.title + " - Swagger UI",
# 		oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
# 		swagger_js_url="/app/swagger/swagger-ui-bundle.js",
# 		swagger_css_url="/app/swagger/swagger-ui.css",
# 	)

# @app.get(app.swagger_ui_oauth2_redirect_url, include_in_schema=False)
# async def swagger_ui_redirect():
# 	return get_swagger_ui_oauth2_redirect_html()


# Dependencies
def get_db():
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


class ListDependencies:
    def __init__(self, query: str = None, skip: int = 0, limit: int = 20):
        self.query = query
        self.skip = skip
        self.limit = limit


# Mount Static Files
app.mount('/image', StaticFiles(directory=os.getenv('IMAGE_DIRECTORY')), name='static')
app.mount('/thumbnail', StaticFiles(directory=os.getenv('THUMBNAIL_DIRECTORY')), name='static')


# Frontend Fallback
# Serve static files
if(os.getenv('STATIC_DIRECTORY') != '' and os.path.isdir(os.getenv('STATIC_DIRECTORY'))):
    app.mount('/app', StaticFiles(directory=os.getenv('STATIC_DIRECTORY'),
                                  html=True), name='static')


@app.get('/')
async def root():
    if(os.path.isdir(os.getenv('STATIC_DIRECTORY'))):
        return RedirectResponse(url='/app')
    else:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND)


# App Initialization
@app.on_event('startup')
def startup():
    # Food classification model
    print('[INFO] Loading food classification model')
    global food_classification_model, prediction_classes
    if(os.getenv('FOOD_CLASSIFICATION_MODEL') != ''):
        food_classification_model = load_model(
            os.getenv('FOOD_CLASSIFICATION_MODEL'), compile=False)
    else:
        food_classification_model = None

    prediction_classes = []
    with open(os.getenv('MODEL_CLASSES')) as f:
        for prediction_class in f:
            prediction_class = prediction_class.strip()
            if(prediction_class != ''):
                prediction_classes.append(prediction_class)

    print('[INFO] Loading food detection model')
    global food_detection_model
    if(os.getenv('FOOD_DETECTION_MODEL') != ''):
        food_detection_model = load_model(
            os.getenv('FOOD_DETECTION_MODEL'), compile=False)
    else:
        food_detection_model = None
    print('[INFO] Startup complete')


# Authentication
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_DURATION = int(os.getenv('ACCESS_TOKEN_EXPIRE_DURATION'))
ACCESS_TOKEN_EXPIRE = int(os.getenv('ACCESS_TOKEN_EXPIRE'))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/token')

# Assorted Functions
def authenticate_user(db: Session, username: str, password: str):
    user = crud.get_user_by_email(db, username)

    if not user:
        return False
    if not security.verify_password(password, user.password):
        return False

    return user


def create_access_token(*, data: dict):
    to_encode = data.copy()

    if ACCESS_TOKEN_EXPIRE:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DURATION)
        to_encode.update({'exp': expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def check_password_length(password: str):
    if(len(password) in range(8, 129)):
        return True
    else:
        return False

# better suited for a background task if possible
def push_notification(db: Session, userid: int, title: str, message: str, extra=None):
    from exponent_server_sdk import (DeviceNotRegisteredError, PushServerError)
    from app.push_service import TokenEmptyError
    retries = 0
    user = crud.get_user_by_id(db, userid)
    if(user is not None):
        try:
            # Will attempt to push the message 3 times, on success push service returns False, breaking while loop
            while(retries < 3 and push_service.send_push_message(user.push_token, title, message, extra)):
                # Will retry on ConnectionError or HTTPError or PushTicketError
                retries += 1
        except (TokenEmptyError, PushServerError) as exc:
            # Token is empty or Push message malformed, just handle handle it as failed push
            print(f"{exc}")
            pass
        except DeviceNotRegisteredError:
            # Disable user's token if suspected device not registered
            crud.disable_user_push_token(db, user.push_token)


@app.post('/token')
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(
        db, form_data.username.lower(), form_data.password)

    # check if user is found
    if(not user):
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if(user.password_updated_date is None):
        password_updated_date = 0
    else:
        password_updated_date = user.password_updated_date.timestamp()

    access_token = create_access_token(data={
        'user_id': user.user_id,
        'password_updated_date': password_updated_date
    })

    return {'access_token': access_token, 'token_type': 'bearer'}


async def get_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=HTTP_401_UNAUTHORIZED,
        detail="Token authentication failed",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # decode token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
        user_id: str = payload.get('user_id')
        password_updated_date: datetime = payload.get('password_updated_date')
        if user_id is None:
            raise credentials_exception
    except PyJWTError:
        raise credentials_exception

    user = crud.get_user_by_id(db, user_id)
    if(user.password_updated_date is None):
        user_password_updated_date = 0
    else:
        user_password_updated_date = user.password_updated_date.timestamp()

    if user is None:
        raise credentials_exception
    if user_password_updated_date != password_updated_date:
        raise credentials_exception
    return user


async def get_clinician(user: schemas.User = Depends(get_user), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=HTTP_401_UNAUTHORIZED,
        detail='Unauthorized',
    )

    if user.account_type != 1:
        raise credentials_exception
    return user


async def check_clinician_assignment(db: Session, clinician_uid: int, user_id: int):
    db_clinician_assignment = crud.get_clinician_assignment(
        db, clinician_uid, user_id)

    if(db_clinician_assignment is not None):
        return db_clinician_assignment.assignment_accepted
    else:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED, detail='Unauthorized')


@app.post('/update-push-token/', status_code=200)
async def save_push_token(push_token: schemas.PushToken, response: Response, current_user: schemas.User = Depends(get_user), db: Session = Depends(get_db)):
    print("push token", push_token)
    print("user", current_user.__dict__)
    if(crud.update_user_push_token(db, current_user.user_id, push_token.token)):
        return {'details': 'Push Token Updated'}
    else:
        # No token is not updated
        #response.status_code = status.HTTP_204_NO_CONTENT
        return {'details': 'Push Token Same'}


# User
@app.post('/users/', response_model=schemas.User)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):

    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(
            status_code=400, detail='Email already registered.')

    if not check_password_length(user.password):
        raise HTTPException(
            status_code=400, detail='Please enter a password between 8 and 128 characters long.')

    # return user
    return crud.create_user(db, user.email, user.password, 0)


@app.post('/users/register-username/', response_model=schemas.User)
async def create_user_by_username(user: schemas.UserCreateByUsername, db: Session = Depends(get_db)):
    # strip whitespace and convert to lowercase
    email = user.email.strip().lower()

    db_user = crud.get_user_by_email(db, email)
    if db_user:
        raise HTTPException(
            status_code=400, detail='Username/email already taken.')
    if(len(email) in range(4, 51)):
        raise HTTPException(
            status_code=400, detail='Please enter a username between 4-50 characters.')
    if not check_password_length(user.password):
        raise HTTPException(
            status_code=400, detail='Please enter a password between 8 and 128 characters long.')
    return crud.create_user(db, email, user.password, 0)


@app.get('/users/me', response_model=schemas.User)
async def get_current_user(current_user: schemas.User = Depends(get_user)):
    return current_user


@app.put('/users/me', response_model=schemas.User)
async def update_user_info(user_info: schemas.UserInfo, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    return crud.update_user_info(db, current_user.user_id, user_info)


@app.post('/users/me/change-password')
async def change_password(password: schemas.PasswordChange, db: Session = Depends(get_db), current_user=Depends(get_user)):
    if(crud.verify_user_password(db, current_user.user_id, password.current_password)):
        # check password length
        if not check_password_length(password.new_password):
            raise HTTPException(
                status_code=400, detail='Please enter a password between 8 and 128 characters long.')

        crud.update_user_password(
            db, current_user.user_id, password.new_password)
        db_user = crud.get_user_by_id(db, current_user.user_id)
        access_token = create_access_token(data={
            'user_id': db_user.user_id,
            'password_updated_date': db_user.password_updated_date.timestamp(),
        })

        return {'access_token': access_token}
    else:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED,
                            detail='Incorrect password.')


@app.get('/users/', response_model=List[schemas.User])
async def get_users(list_query: ListDependencies = Depends(ListDependencies), db: Session = Depends(get_db), current_user: schemas.User = Depends(get_clinician)):
    return crud.get_users(db, list_query.skip, list_query.limit)


@app.get('/users/{user_id}', response_model=schemas.User)
async def get_user_by_id(user_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    if(current_user.account_type not in [1]):
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED, detail='Unauthorized')
    return crud.get_user_by_id(db, user_id)


# User - Clinician Assignment
@app.get('/users/clinicians/', response_model=List[schemas.Clinician])
async def get_clinician_list(db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    return crud.get_clinician_list(db)


@app.get('/users/clinicians/assigned/', response_model=List[schemas.ClinicianAssignmentWithRelations])
async def get_assigned_clinicians(db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    return crud.user_view_assignments(db, current_user.user_id)


@app.post('/users/clinicians/', response_model=schemas.ClinicianAssignmentWithRelations)
async def assign_clinician(clinician: schemas.ClinicianAssignmentCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    db_existing_assignment = crud.get_clinician_assignment(
        db, clinician.clinician_id, current_user.user_id)
    if(db_existing_assignment is not None):
        if(db_existing_assignment.assignment_accepted == False):
            # Send to background a push notification
            background_tasks.add_task(push_notification, db, db_existing_assignment.clinician_id,
                                      title="New Request from Patient", message="A new request from user", extra=json.dumps({"navigator": "ClinicianTab", "screen": "Assignments"}))
            return crud.update_clinician_assignment_status(db, db_existing_assignment.clinician_assignment_id, None)
        else:
            raise HTTPException(
                status_code=403, detail='Clinician assignment already exists.')

    # Send to background a push notification
    background_tasks.add_task(push_notification, db, clinician.clinician_id,
                              title="New Request from Patient1", message="A new request from user", extra=json.dumps({"navigator": "ClinicianTab", "screen": "Assignments"}))
    db_clinician_assignment = crud.create_clinician_assignment(
        db, clinician.clinician_id, current_user.user_id)

    if(db_clinician_assignment is None):
        raise HTTPException(
            status_code=403, detail='The selected user is not a clinician.')

    return db_clinician_assignment


@app.delete('/users/clinicians/{clinician_assignment_id}')
async def delete_clinician_assignment(clinician_assignment_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    db_clinician_assignment = crud.get_clinician_assignment_by_id(
        db, clinician_assignment_id)
    if(db_clinician_assignment is None):
        raise HTTPException(status_code=HTTP_404_NOT_FOUND,
                            detail='Clinician assignment does not exist.')

    if(db_clinician_assignment.user_id == current_user.user_id):
        return crud.delete_clinician_assignment(db, clinician_assignment_id)
    else:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED, detail='Unauthorized')


# Clinician
@app.get('/clinician/assignments/', response_model=List[schemas.ClinicianAssignment])
async def get_clinician_assigned_users(db: Session = Depends(get_db), current_user: schemas.User = Depends(get_clinician)):
    return crud.clinician_view_assignments(db, current_user.user_id)


@app.get('/clinician/assignments/{clinician_assignment_id}/accept', response_model=schemas.ClinicianAssignment)
async def clinician_accept_assignment(clinician_assignment_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_clinician)):
    db_clinician_assignment = crud.get_clinician_assignment_by_id(
        db, clinician_assignment_id)
    if(db_clinician_assignment is None):
        raise HTTPException(status_code=HTTP_404_NOT_FOUND,
                            detail='Clinician assignment does not exist.')

    # Send to background a push notification
    background_tasks.add_task(push_notification, db, db_clinician_assignment.user_id,
                              title="Notification Title", message="Message here (Accepted)", extra=json.dumps({"navigator": "ClinicianNavigator", "screen": "Assignment"}))
    return crud.update_clinician_assignment_status(db, clinician_assignment_id, True)


@app.get('/clinician/assignments/{clinician_assignment_id}/decline')
async def clinician_decline_assignment(clinician_assignment_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_clinician)):
    db_clinician_assignment = crud.get_clinician_assignment_by_id(
        db, clinician_assignment_id)
    if(db_clinician_assignment is None):
        raise HTTPException(status_code=HTTP_404_NOT_FOUND,
                            detail='Clinician assignment not found.')

    # Send to background a push notification
    background_tasks.add_task(push_notification, db, db_clinician_assignment.user_id,
                              title="Notification Title", message="Message here (Declined)", extra=json.dumps({"navigator": "ClinicianNavigator", "screen": "Assignment"}))
    return crud.update_clinician_assignment_status(db, clinician_assignment_id, False)


@app.get('/clinician/assigned-users/{user_id}/health-profile/', response_model=schemas.Profile)
async def clinician_view_user_health_profile(user_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_clinician)):
    await check_clinician_assignment(db, current_user.user_id, user_id)

    return crud.get_profile(db, user_id)


@app.get('/clinician/assigned-users/{user_id}/health-records/', response_model=List[schemas.HealthRecord])
async def clinician_view_user_health_records_list(user_id: int, list_query: ListDependencies = Depends(ListDependencies), db: Session = Depends(get_db), current_user: schemas.User = Depends(get_clinician)):
    await check_clinician_assignment(db, current_user.user_id, user_id)

    return crud.get_user_health_record_list(db, user_id, list_query.query, list_query.skip, list_query.limit)


@app.get('/clinician/view-health-record/{health_record_id}')
async def clinician_view_user_health_record(health_record_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_clinician)):
    db_health_record = crud.get_health_record(db, health_record_id)
    if(db_health_record is not None):
        await check_clinician_assignment(db, current_user.user_id, db_health_record.user_id)

    return db_health_record


@app.get('/clinician/assigned-users/{user_id}/meals/', response_model=List[schemas.MealWithFoodItems])
async def clinician_view_user_meal_list(user_id: int, list_query: ListDependencies = Depends(ListDependencies), db: Session = Depends(get_db), current_user: schemas.User = Depends(get_clinician)):
    await check_clinician_assignment(db, current_user.user_id, user_id)

    return crud.get_user_meal_list(db, user_id, list_query.query, list_query.skip, list_query.limit)


@app.get('/clinician/view-meal/{meal_id}')
async def clinician_view_user_meal(meal_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_clinician)):
    db_meal = crud.get_meal(db, meal_id)
    if(db_meal is not None):
        await check_clinician_assignment(db, current_user.user_id, db_meal.user_id)

    return db_meal


# Trend Analyzer
@app.get('/trend-analyzer/features/', response_model=List[str])
async def get_available_features():
    return trend_analyzer.get_graph_features()


@app.post('/trend-analyzer/generate-report/', response_model=schemas.TrendAnalyzerReport)
async def generate_report(report_settings: schemas.GenerateReportConfig, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_clinician)):
    # set default values
    selected_features = report_settings.selected_features if report_settings.selected_features is not None else None
    ranking_type_top_n = report_settings.ranking_type_top_n if report_settings.ranking_type_top_n is not None else True
    ranking_ascending = report_settings.ranking_ascending if report_settings.ranking_ascending is not None else True
    threshold = report_settings.threshold if report_settings.threshold is not None and report_settings.threshold != 0 else 10

    return trend_analyzer.generate_report(db, current_user.user_id,
                                          features=selected_features,
                                          ranking_type_top_n=ranking_type_top_n,
                                          ranking_ascending=ranking_ascending,
                                          threshold=threshold,
                                          )


# Health Monitor
# Health Profile
@app.get('/profile/', response_model=schemas.Profile)
async def get_health_profile(db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    return crud.get_profile(db, current_user.user_id)


@app.post('/profile/', response_model=schemas.Profile)
async def create_health_profile(profile: schemas.ProfileBase, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    # update if profile exists
    if(crud.get_profile(db, current_user.user_id) is not None):
        return crud.update_profile(db, current_user.user_id, profile)

    return crud.create_profile(db, current_user.user_id, profile)


@app.put('/profile/', response_model=schemas.Profile)
async def update_health_profile(profile: schemas.ProfileBase, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    return crud.update_profile(db, current_user.user_id, profile)


# Health Records
@app.get('/health-records/', response_model=List[schemas.HealthRecord])
async def get_health_records_list(list_query: ListDependencies = Depends(ListDependencies), db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    return crud.get_user_health_record_list(db, current_user.user_id, list_query.query, list_query.skip, list_query.limit)


@app.get('/health-records/latest', response_model=schemas.HealthRecord)
async def get_latest_health_record(db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    return crud.get_latest_health_record(db, current_user.user_id)


@app.get('/health-records/{health_record_id}', response_model=schemas.HealthRecord)
async def get_health_record(health_record_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    health_record = crud.get_health_record(db, health_record_id)
    if(current_user.user_id != health_record.user_id):
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED,
                            detail='Invalid health record ID')
    return crud.get_health_record(db, health_record_id)


@app.post('/health-records/', response_model=schemas.HealthRecord)
async def create_health_record(health_record: schemas.HealthRecordCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    return crud.create_health_record(db, current_user.user_id, health_record)


@app.put('/health-records/{health_record_id}', response_model=schemas.HealthRecord)
async def update_health_record(health_record_id: int, health_record: schemas.HealthRecordUpdate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    # todo: check matching user
    return crud.update_health_record(db, current_user.user_id, health_record_id, health_record)


@app.delete('/health-records/{health_record_id}', response_model=schemas.DefaultResponse)
async def delete_health_record(health_record_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    health_record = crud.get_health_record(
        db, health_record_id)  # todo: standardize delete
    if not health_record:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND,
                            detail='Record not found')

    if(health_record.user_id == current_user.user_id):
        crud.delete_health_record(db, health_record.health_record_id)
    else:
        raise HTTPException(status_code=403, detail='Not allowed')

    return {'detail': 'Record deleted'}


# Risk Score
# @app.get('/risk-scores/', response_model = List[schemas.RiskScore])
# async def risk_score_list(db: Session = Depends(get_db)):
# 	return crud.get_risk_score_list(db)


# @app.get('/risk-scores/{risk_score_id}', response_model = schemas.RiskScoreWithRelations)
# async def get_risk_score(risk_score_id: int, db: Session = Depends(get_db)):
# 	return crud.get_risk_score(db, risk_score_id)


# Smart Diet Watcher
# Food
@app.get('/food/', response_model=List[schemas.Food])
async def list_food(db: Session = Depends(get_db), skip: int = 0):
    return crud.get_food_list(db, skip)

@app.get('/food-id-strings/', response_model=List[str])
async def get_food_id_strings(db: Session = Depends(get_db)):
    global prediction_classes
    return prediction_classes


@app.get('/food/{food_id}', response_model=schemas.Food)
async def get_food(food_id: str, db: Session = Depends(get_db)):
    return crud.get_food(db, food_id)


# @app.post('/food/identify/{meal_id}')
# async def identify_food(meal_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
# 	# todo: implement
# 	return

# 	global food_classification_model
# 	return smart_diet_watcher.predict_classes(food_classification_model, os.path.join(os.getenv('IMAGE_DIRECTORY'), str(current_user.user_id), image))

@app.post('/food/detect/')
async def detect_food(food_image: schemas.FoodImage, db: Session = Depends(get_db)):
    global food_detection_model

    if(food_detection_model != None):
        return smart_diet_watcher.detect_food(food_detection_model, food_image.data)
    else:
        return False


# Food Nutrition
@app.get('/food/{food_id}/food-nutrition/', response_model=schemas.FoodWithNutrition)
async def get_food_nutrition_list(food_id: str, db: Session = Depends(get_db)):
    return crud.get_food_nutrition_list(db, food_id)


# Meal
@app.get('/meals/', response_model=List[schemas.MealWithFoodItems])
async def get_user_meal_list(list_query: ListDependencies = Depends(ListDependencies), db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    return crud.get_user_meal_list(db, current_user.user_id, list_query.query, list_query.skip, list_query.limit)


@app.get('/meals/{meal_id}', response_model=schemas.MealWithPredictions)
async def get_user_meal(meal_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    meal = crud.get_meal(db, meal_id)

    if not bool(meal):
        raise HTTPException(status_code=HTTP_404_NOT_FOUND,
                            detail='Meal not found')

    if(meal.user_id != current_user.user_id):
        raise HTTPException(status_code=403, detail='Access forbidden')

    # predict food types
    global food_classification_model
    meal.food_predictions = smart_diet_watcher.predict_classes(food_classification_model, os.path.join(
        os.getenv('IMAGE_DIRECTORY'), str(current_user.user_id), meal.image))

    return meal


@app.post('/meals/', response_model=schemas.MealWithPredictions)
async def create_meal(meal_data: schemas.MealCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    # save image to database
    image = smart_diet_watcher.save_image(
        current_user.user_id, meal_data.image)

    if(image is None):
        raise HTTPException(status_code=415, detail='Format not supported')

    # predict food types
    global food_classification_model
    predictions = smart_diet_watcher.predict_classes(food_classification_model, os.path.join(
        os.getenv('IMAGE_DIRECTORY'), str(current_user.user_id), image))

    meal = crud.create_meal(db, current_user.user_id, image)

    meal.food_predictions = predictions

    return meal


@app.delete('/meals/{meal_id}', response_model=schemas.DefaultResponse)
async def delete_meal(meal_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    meal = crud.get_meal(db, meal_id)  # todo: standardize delete
    if not meal:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND,
                            detail='Meal not found')

    if(meal.user_id == current_user.user_id):
        crud.delete_meal(db, meal.meal_id)
    else:
        raise HTTPException(status_code=403, detail='Not allowed')

    return {'detail': 'Record deleted'}


# Meal Blood Glucose
@app.put('/meals/{meal_id}/blood-glucose/', response_model=schemas.DefaultResponse)
async def update_meal_blood_glucose_reading(meal_id: int, blood_glucose: schemas.MealUpdateBloodGlucose, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    # todo: check user_id
    meal = crud.get_meal(db, meal_id)
    if(meal.user_id != current_user.user_id):
        raise HTTPException(status_code=403, detail='Access forbidden')
    if not meal:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND,
                            detail='Meal not found')

    db_blood_glucose = crud.update_meal_blood_glucose(
        db, meal_id, blood_glucose)
    return {'detail': str(db_blood_glucose)}


# Food Item
@app.get('/meals/{meal_id}/food-items/{food_item_id}')
async def get_food_item(meal_id: int, food_item_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    meal = crud.get_meal(db, meal_id)
    if not bool(meal):
        raise HTTPException(status_code=HTTP_404_NOT_FOUND,
                            detail='Meal not found')

    if(meal.user_id != current_user.user_id):
        raise HTTPException(status_code=403, detail='Access forbidden')

    # todo: check user_id
    return crud.get_food_item(db, food_item_id)


@app.get('/meals/{meal_id}/food-items/', response_model=List[schemas.FoodItemWithNutrition])
async def get_food_items(meal_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    meal = crud.get_meal(db, meal_id)
    if not bool(meal):
        raise HTTPException(status_code=HTTP_404_NOT_FOUND,
                            detail='Meal not found')

    if(meal.user_id != current_user.user_id):
        raise HTTPException(status_code=403, detail='Access forbidden')

    return [food for food in crud.get_food_items_list_by_meal_id(db, meal_id)]


@app.post('/meals/{meal_id}/food-items/', response_model=schemas.FoodItemWithNutrition)
async def create_food_item(meal_id: int, food_item: schemas.FoodItemCreateUpdate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    """
    Creates a food item for the meal.
    Either a food_id or new_food_type has to be provided for creation of the food item.
    If both are provided, the food_id will take precedence.
    """
    meal = crud.get_meal(db, meal_id)
    if(not meal.user_id == current_user.user_id):
        raise HTTPException(status_code=401, detail='Not allowed')

    # disallow food type to be unset
    if(food_item.food_id is None and food_item.new_food_type is None):
        raise HTTPException(status_code=403, detail='Invalid Format')

    # Get the list of food_id's in the meal, None type is for new food items
    food_ids = [food_item.food_id for food_item in meal.food_items if food_item.date_deleted is None and food_item.food_id is not None]

    from app.nutrition_service import FoodItemDoesNotExistError, NutritionDataRequiredError, ServiceUnavailableError
    service = NutritionService(db)
    try:
        food_model = await service.get_from_database(food_id=food_item.food_id, parsed_text=food_item.new_food_type)
        food_item.new_food_type = None
    except ServiceUnavailableError:
        raise HTTPException(status_code=HTTP_503_SERVICE_UNAVAILABLE, detail='Nutrition Service is unavailable')
    except FoodItemDoesNotExistError:
        food_model = models.Food()
        food_item.new_food_type = food_item.new_food_type
        # raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail='Food Not Found. Is the spelling correct?')
    except NutritionDataRequiredError:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail='Bad Request, Parsed Text Required')
    except Exception as exc:
        # For general exceptions
        traceback.print_exc()
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail='Server Error. Please contact service administrator')

    try:
        # Replace the food id received from the request with returned id from nutrition service
        if food_model.food_id in food_ids:
            raise ValueError("Cannot have duplicate food item in meal.")
        food_item.food_id = food_model.food_id
        return crud.create_food_item(db, meal_id, food_item)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@app.put('/food-items/{food_item_id}', response_model=schemas.FoodItemWithNutrition)
async def update_food_item(food_item_id: int, food_item: schemas.FoodItemCreateUpdate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    db_food_item = crud.get_food_item(db, food_item_id)
    if db_food_item is None:
        raise HTTPException(status_code=404, detail='Food Item does not exist.')

    meal = crud.get_meal(db, db_food_item.meal_id)

    if(not meal.user_id == current_user.user_id):
        raise HTTPException(status_code=403, detail='Not allowed')

    # Get the list of food_id's in the meal, None type is for new food items
    food_ids = [food_item.food_id for food_item in meal.food_items if food_item.date_deleted is None and food_item.food_id is not None]

    from app.nutrition_service import FoodItemDoesNotExistError, NutritionDataRequiredError, ServiceUnavailableError
    service = NutritionService(db)
    try:
        food_model = await service.get_from_database(food_id=food_item.food_id, parsed_text=food_item.new_food_type)
        food_item.new_food_type = None
    except ServiceUnavailableError:
        raise HTTPException(status_code=HTTP_503_SERVICE_UNAVAILABLE, detail='Nutrition Service is unavailable')
    except FoodItemDoesNotExistError:
        food_model = models.Food()
        food_item.new_food_type = food_item.new_food_type
        # raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail='Food Not Found. Is the spelling correct?')
    except NutritionDataRequiredError:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail='Bad Request, Parsed Text Required')
    except Exception as exc:
        # For general exceptions, and logging
        traceback.print_exc()
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail='Server Error. Please contact service administrator')


    try:
        if food_ids.count(food_model.food_id) >= 1 and db_food_item.food_id != food_model.food_id:
            raise ValueError("Cannot have duplicate food item in meal.")
        food_item.food_id = food_model.food_id
        crud.update_food_item(db, food_item_id, food_item)
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=422, detail=str(exc))

    return crud.get_food_item(db, food_item_id)


@app.delete('/meals/{meal_id}/food-items/{food_item_id}', response_model=schemas.DefaultResponse)
async def delete_food_item(meal_id: int, food_item_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    # todo: check user
    food_item = crud.get_food_item(
        db, food_item_id)  # todo: standardize delete
    if not food_item:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND,
                            detail='Food item not found')

    if(food_item.meal_id == meal_id):
        crud.delete_food_item(db, food_item_id)
    else:
        raise HTTPException(status_code=403, detail='Not allowed')

    return {'detail': str(food_item_id)}


# Test
@app.post('/test/recording/')
async def create_test_recording(recording: schemas.TestRecordingBase, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    crud.create_test_recording(db, current_user.user_id, recording)

    return


@app.post('/test/survey/')
async def create_test_survey(survey: schemas.TestSurveyBase, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_user)):
    crud.create_test_survey(db, current_user.user_id, survey)

