from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import os
import shutil  # Import the shutil module

app = Flask(__name__)
CORS(app)  # Enable CORS for your app

image_folder = 'images'  # Replace with the path to your desired folder

# Folder for cheating images
cheating_folder = '../client/src/cheating'

# Ensure the folders exist

if not os.path.isdir(image_folder):
    os.makedirs(image_folder)
if not os.path.isdir(cheating_folder):
    os.makedirs(cheating_folder)

# Load the reference image
reference_image = cv2.imread("aj.png")

#  pre-trained Haar Cascade classifier for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Initialize a counter for cheating images
cheating_image_counter = 1

def facial_features(image):
    # Use the Haar Cascade classifier to detect faces
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    if len(faces) == 0:
        return None

    # Extract the first detected face
    x, y, w, h = faces[0]
    face_roi = gray[y:y + h, x:x + w]

    # Resize the detected face to a fixed size for comparison
    face_roi = cv2.resize(face_roi, (150, 150))

    return face_roi

@app.route('/video/proctor/', methods=['POST'])
def proctor_video():
    global cheating_image_counter  # Declare cheating_image_counter as global here
    try:
        frame_data = request.get_data()

        # Generate a unique filename for the image
        unique_filename = 'unique_image_filename.jpg'
        image_path = os.path.join(image_folder, unique_filename)

        # Save the incoming image to the specified folder, overwriting if it already exists
        with open(image_path, 'wb') as image_file:
            image_file.write(frame_data)

        # Read the saved image
        frame = cv2.imread(image_path)

        # Initialize the alert message with a default value
        alert_message = "No face detected or could not be compared."

        # Extract facial features from the reference and the saved image
        reference_features = facial_features(reference_image)
        frame_features = facial_features(frame)

        if reference_features is not None and frame_features is not None:
            # Compare the facial features to determine if it's the same person
            similarity_score = cv2.matchTemplate(reference_features, frame_features, cv2.TM_CCOEFF_NORMED)

            if similarity_score > 0.4:  # Adjust the threshold as needed
                alert_message = "Face detected: Same as reference"
            else:
                alert_message = "Face detected: Different from reference"

                # Save the image in the cheating folder with a numerical filename
                cheating_image_filename = f"{cheating_image_counter}.jpg"
                cheating_image_path = os.path.join(cheating_folder, cheating_image_filename)
                
                # Use shutil.move to overwrite the file if it exists
                shutil.move(image_path, cheating_image_path)

                cheating_image_counter += 1
        else:
            # Save the image in the cheating folder even if no face is detected
            cheating_image_filename = f"{cheating_image_counter}.jpg"
            cheating_image_path = os.path.join(cheating_folder, cheating_image_filename)
            
            # Use shutil.move to overwrite the file if it exists
            shutil.move(image_path, cheating_image_path)

            cheating_image_counter += 1

        return jsonify({'message': 'Image saved successfully.', 'alert': alert_message})
        
    except Exception as e:
        print("Error processing video frames:", e)
        return jsonify({'message': 'Error processing video frames.'})
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
