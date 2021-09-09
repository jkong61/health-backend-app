import json, os, sys; sys.path.append(os.path.join(os.path.dirname(__file__), '..')) # add app to path
from app import models, schemas
from app.database import SessionLocal


output_path = os.path.join(os.path.expanduser('~'), 'user_testing_data')


# utility
def create_directories(path):
	if(not os.path.exists(path)):
		os.makedirs(path)

def get_user_path(db, user_id):
	db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
	email_address = ''
	if(db_user is not None):
		email_address = ' ' + db_user.email

	return str(user_id) + email_address


def export_test_recordings():
	# initialize session
	db = SessionLocal()

	print('Export test recordings')
	data = db.query(models.TestRecording.test_recording_id).all()
	for row in data:
		item = db.query(models.TestRecording).filter(models.TestRecording.test_recording_id == row.test_recording_id).first()
		create_directories(os.path.join(output_path, get_user_path(db, item.user_id), 'recordings'))
		with open(os.path.join(output_path, get_user_path(db, item.user_id), 'recordings', ''.join([str(item.test_recording_id), '.json'])), 'w') as f:
			f.write(item.data)


def export_survey_data():
	# initialize session
	db = SessionLocal()

	print('Export survey data')
	data = db.query(models.TestSurvey.test_survey_id).all()
	for row in data:
		item = db.query(models.TestSurvey).filter(models.TestSurvey.test_survey_id == row.test_survey_id).first()
		create_directories(os.path.join(output_path, get_user_path(db, item.user_id), 'surveys'))
		create_directories(os.path.join(output_path, get_user_path(db, item.user_id), 'issue_suggestions'))
		survey_data = json.loads(item.data)

		data_type = None
		if('type' in survey_data):
			data_type = survey_data['type']
		else:
			data_type = 'surveys'

		if(data_type == 'issue_suggestion'):
			data_type = 'issue_suggestions'
		else:
			data_type = 'surveys'

		with open(os.path.join(output_path, get_user_path(db, item.user_id), data_type, ''.join([str(item.test_survey_id), '.txt'])), 'w') as f:
			for question in survey_data:
				if(question != 'type'):
					f.write(''.join([str(question), ': ', str(survey_data[question]), '\n']))


if __name__ == "__main__":
	export_test_recordings()
	export_survey_data()
