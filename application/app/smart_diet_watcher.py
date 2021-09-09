# smart_diet_watcher.py

# load environment variables
from dotenv import load_dotenv
load_dotenv()

### Imports
import os
import hashlib
import datetime
import base64
import pathlib
import numpy as np
import cv2
from keras.applications.vgg16 import preprocess_input as vgg_preprocess_input
from keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess_input
from keras.preprocessing.image import load_img
from keras.preprocessing.image import img_to_array

root_image_directory = os.getenv('IMAGE_DIRECTORY')
root_thumbnail_directory = os.getenv('THUMBNAIL_DIRECTORY')


def save_image(user_id: int, image_data: str):
	'''
	Save image to disk

	Parameters:
		user_id (int): User ID used for creating directory
		image_data (str): Base64 string containing image data
	Return:
		String containing the path to the saved image
	'''

	# Extract metadata from image
	metadata, image_base64 = image_data.split(',')

	# Get extension from image metadata
	if('image' in metadata):
		ext = metadata.split('/')[1].split(';')[0]
	else:
		return None

	# Use .jpg instead of .jpeg
	if(ext == 'jpeg'):
		ext = 'jpg'

	# Generate filename
	file_name = str(base64.urlsafe_b64encode(str.encode(str(datetime.datetime.utcnow()))))[2:-1]
	file_name = file_name + '.' + ext

	# Create directories for the user if they do not exist
	image_directory = os.path.join(root_image_directory, str(user_id))
	if(not os.path.exists(image_directory)):
		os.makedirs(image_directory)

	thumbnail_directory = os.path.join(root_thumbnail_directory, str(user_id))
	if(not os.path.exists(thumbnail_directory)):
		os.makedirs(thumbnail_directory)

	# Create image path from imge directory
	full_image_path = os.path.join(image_directory, file_name)
	full_thumbnail_path = os.path.join(thumbnail_directory, file_name)

	# Parse image data
	image = base64.b64decode(image_base64)

	# Resize image and create thumbnail
	thumbnail = np.fromstring(image, np.uint8)
	thumbnail = cv2.imdecode(thumbnail, cv2.IMREAD_COLOR)
	h, w = thumbnail.shape[:2]

	# Crop image into a square if a rectangle
	if(w == h):
		pass
	elif(w > h):
		half_height = h / 2
		thumbnail = thumbnail[0:h, int(w / 2 - half_height):int(w / 2 + half_height)]
	else:
		half_width = w / 2
		thumbnail = thumbnail[int(h / 2 - half_width):int(h / 2 + half_width), 0:w]

	thumbnail = cv2.resize(thumbnail, (50,50), interpolation=cv2.INTER_AREA)

	# Write image to disk
	with open(full_image_path, 'wb') as f:
		f.write(image)

	cv2.imwrite(full_thumbnail_path, thumbnail)

	return file_name


def predict_classes(model, image_path: str):
	'''
	Predict food classes

	Parameters:
		model: Keras model
		image_path (str): Path to image to be classified
	Return:
		String containing prediction classes sorted from highest to lowest, delimited by commas
	'''

	# get model shape
	width, height = model.layers[0].input_shape[1:3]

	# load image
	image = load_img(image_path, target_size=(width,height))

	# preprocess image
	image = img_to_array(image)
	image.reshape((1, image.shape[0], image.shape[1], image.shape[2]))
	image = vgg_preprocess_input(np.array([image]))

	# predict food classes
	predictions = model.predict(image)[0]

	predictions_sorted = list(np.flip(np.argsort(predictions)))
	predictions_sorted_str = ','.join(str(prediction) for prediction in predictions_sorted)

	return predictions_sorted_str


def detect_food(model, image_data: str):
	'''
	Detect if food is present in an image

	Parameters:
		model: Keras model
		image_data (str): Image data in Base64
	Return:
		True if food is detected, False if food is not detected
	'''

	# get model shape
	width, height = model.layers[0].input_shape[1:3]

	# Decode image data
	image = base64.b64decode(image_data.split(',')[1])
	image = np.fromstring(image, np.uint8)
	image = cv2.imdecode(image, cv2.IMREAD_COLOR)
	image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

	# preprocess image
	image = cv2.resize(image, (224,224), interpolation=cv2.INTER_AREA)
	image = img_to_array(image)
	image.reshape((1, image.shape[0], image.shape[1], image.shape[2]))
	image = mobilenet_preprocess_input(np.array([image]))

	# predict food classes
	prediction = model.predict(image)[0]

	if(prediction[0] > prediction[1]):
		return True
	else:
		return False
