import uuid
import os
import json
import base64
from pathlib import Path
from PIL import Image
import io

BASE_DATASET_PATH = Path(os.path.join(os.path.dirname(os.path.realpath(__file__)), "dataset"))


def save_images_based_on_preference(file_path):
    # Read the JSON file
    with open(file_path, 'r') as file:
        profiles = json.load(file)

    # Process each profile
    for profile in profiles:
        # Check if 'images' field is present and not empty
        if 'images' in profile and profile['images']:
            for i, image in enumerate(profile['images']):
                # Decode the first image
                image_data = base64.b64decode(profile['images'][i])
                image = Image.open(io.BytesIO(image_data))

                # Convert PNG to JPEG
                rgb_im = image.convert('RGB')

                # Determine the directory based on the 'liked' field
                directory = BASE_DATASET_PATH / "raw/yes" if profile.get('liked') == True else BASE_DATASET_PATH / "raw/no"
                
                # Create a file name (assuming 'name' field is unique and present)
                file_name = f"{profile['name']}-{i}.jpeg" if 'name' in profile else f"{uuid.uuid4()}.jpg"
                file_path = directory / file_name
                
                # Write the image to the respective directory
                rgb_im.save(file_path, format='JPEG')


if __name__ == '__main__':
    # Usage
    file_path = "/Users/abhisivaprasad/Documents/projects/cupid/rating/data/dataset/raw/profiles.json"
    save_images_based_on_preference(file_path)