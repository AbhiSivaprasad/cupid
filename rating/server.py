from flask import Flask, request, jsonify
import numpy as np
import base64
from io import BytesIO
from PIL import Image
from deepface import DeepFace
from collections import Counter
import random

app = Flask(__name__)

def decode_image(base64_image):
    # Decode the base64 image
    image_data = base64.b64decode(base64_image)
    image = Image.open(BytesIO(image_data))
    return image

def get_image_embedding(image):
    return DeepFace.represent(image)

def get_rating_prediction(images):
    return np.random.randint(1, 6)

@app.route('/imageEmbedding', methods=['POST'])
def image_embedding():
    data = request.json()
    print(data)
    image = decode_image(data)
    embedding = get_image_embedding(image)
    return jsonify(embedding)


@app.route('/facialRating', methods=['POST'])
def facial_rating(picture):
    data = request.json
    return random.randrange(0, 10)
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
            image_1 = imageArrays[image_index_1][face_bbox_1['y']:face_bbox_1['y'] + face_bbox_1['h']][face_bbox_1['x']:face_bbox_1['x']+face_bbox_1['w']]
            image_2 = imageArrays[image_index_2][face_bbox_2['y']:face_bbox_2['y'] + face_bbox_2['h']][face_bbox_2['x']:face_bbox_2['x']+face_bbox_2['w']]
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
            prediction = facial_rating(imageArrays[image_index][face_bbox['y']:face_bbox['y'] + face_bbox['h']][face_bbox['x']:face_bbox['x']+face_bbox['w']])
            ratings.append(prediction)
    print("RATINGS ARE", ratings)
    return {'rating': (min(ratings) + sum(ratings) / len(ratings)) / 2}
    # images = [decode_image(img) for img in data]
    # rating = get_rating_prediction(images)
    # return jsonify(rating)


if __name__ == '__main__':
    app.run(debug=True)
