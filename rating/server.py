import uuid
from pathlib import Path
import torch
from PIL import Image
from flask import Flask, request, jsonify
import numpy as np
import base64
from io import BytesIO
from PIL import Image
from deepface import DeepFace
from collections import Counter
import random
from training.trainer import Classifier
from training.eval import eval

app = Flask(__name__)

def decode_image_and_convert_to_jpeg(base64_image, jpg_path):
    # Decode the base64 image
    image_data = base64.b64decode(base64_image)
    
    # Open the image
    image = Image.open(BytesIO(image_data))

    # Convert the image to RGB mode if it's not (to avoid issues with RGBA in JPEG)
    if image.mode != 'RGB':
        image = image.convert('RGB')

    # Save the image as a JPEG
    image.save(jpg_path, 'JPEG')

def decode_image(base64_image):
    # Decode the base64 image
    image_data = base64.b64decode(base64_image)
    image = Image.open(BytesIO(image_data))
    return image

def get_image_embedding(image):
    return DeepFace.represent(image)

def get_rating_prediction(images):
    return np.random.randint(1, 6)

def crop_array(arr, bbox):
    arr[bbox['y']:bbox['y'] + bbox['h']][bbox['x']: bbox['x'] + bbox['w']]

@app.route('/imageEmbedding', methods=['POST'])
def image_embedding():
    data = request.json()
    print(data)
    image = decode_image(data)
    embedding = get_image_embedding(image)
    return jsonify(embedding)


@app.route('/facialRating', methods=['POST'])
def facial_rating():
    data = request.json
    id = uuid.uuid4()
    
    # write image to dir
    image_path = Path(f"./data/images/{id}")
    decode_image_and_convert_to_jpeg(data['image'], image_path)

    # get rating for an image
    output = eval(image_path)
    return output

@app.route('/ratingPrediction', methods=['POST'])
def rating_prediction():
    data = request.json

    facesPerImage = []
    imageArrays = []
    for image in data["images"]:
        decoded_image = np.array(decode_image(image))
        imageArrays.append(decoded_image)
        faces = DeepFace.extract_faces(decoded_image)
        facesPerImage.append([face['facial_area'] for face in faces])
    flattenedFaces = [[index, face, 0] for image_faces in facesPerImage for (index, face) in enumerate(image_faces)]
    print(flattenedFaces)
    faces_so_far = 0
    for index, (image_index_1, face_bbox_1, face_index) in enumerate(flattenedFaces):
        for info in faces[index + 1:]:
            image_index_2, face_bbox_2, _ = info
            if image_index_1 == image_index_2:
                continue
            image_1 = crop_array(image_index_1, face_bbox_1)
            image_2 = crop_array(image_index_2, face_bbox_2)
            if DeepFace.verify(image_1, image_2):
                info[2] = face_index
            else:
                info[2] = faces_so_far + 1
                faces_so_far += 1
    
    print("FLATTENED", flattenedFaces)
    face_counts = Counter([info[2] for info in flattenedFaces])
    max_appearing_face = face_counts.most_common(1)[0][0]
    ratings = []
    print("MAX APPERAING", max_appearing_face)
    for image_index, face_bbox, face_number in flattenedFaces:
        if face_number == max_appearing_face:
            prediction = facial_rating(crop_array(imageArrays[image_index], face_bbox))
            ratings.append(prediction)
    print("RATINGS ARE", ratings)
    return {'rating': (min(ratings) + sum(ratings) / len(ratings)) / 2}
    # images = [decode_image(img) for img in data]
    # rating = get_rating_prediction(images)
    # return jsonify(rating)


if __name__ == '__main__':
    app.run(debug=True)
