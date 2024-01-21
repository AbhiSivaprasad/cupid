from flask import Flask, request, jsonify
import numpy as np
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)

def decode_image(base64_image):
    # Decode the base64 image
    image_data = base64.b64decode(base64_image)
    image = Image.open(BytesIO(image_data))
    return image

def get_image_embedding(image):
    return np.random.rand(4096).tolist()

def get_rating_prediction(images):
    return np.random.randint(1, 6)

@app.route('/imageEmbedding', methods=['GET'])
def image_embedding():
    data = request.args.get('image')
    image = decode_image(data)
    embedding = get_image_embedding(image)
    return jsonify(embedding)

@app.route('/ratingPrediction', methods=['GET'])
def rating_prediction():
    data = request.args.getlist('image')
    images = [decode_image(img) for img in data]
    rating = get_rating_prediction(images)
    return jsonify(rating)


if __name__ == '__main__':
    app.run(debug=True)
