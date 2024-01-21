import json
import base64
from pathlib import Path
from PIL import Image
import io

def save_images_based_on_preference(file_path):
    # Ensure the output directories exist
    Path("rating/yes").mkdir(parents=True, exist_ok=True)
    Path("rating/no").mkdir(parents=True, exist_ok=True)

    # Read the JSON file
    with open(file_path, 'r') as file:
        profiles = json.load(file)

    # Process each profile
    for profile in profiles:
        # Check if 'images' field is present and not empty
        if 'images' in profile and profile['images']:
            # Decode the first image
            image_data = base64.b64decode(profile['images'][0])
            image = Image.open(io.BytesIO(image_data))

            # Convert PNG to JPEG
            rgb_im = image.convert('RGB')

            # Determine the directory based on the 'liked' field
            directory = "rating/yes" if profile.get('liked') == True else "rating/no"
            
            # Create a file name (assuming 'name' field is unique and present)
            file_name = f"{profile['name']}.jpeg" if 'name' in profile else "unnamed.jpeg"
            file_path = Path(directory) / file_name
            
            # Write the image to the respective directory
            rgb_im.save(file_path, format='JPEG')

# Usage
save_images_based_on_preference('/Users/shayaz/Downloads/profiles.json')
