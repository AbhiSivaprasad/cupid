from deepface import DeepFace
from dataclasses import dataclass
from typing import List
import numpy as np 


@dataclass
class FaceLocation:
    x: int
    y: int
    width: int
    height: int


class ModelResult:
    embedding: np.array
    face_confidence: float
    face_location: FaceLocation

def _process_model_output(model_output) -> ModelResult:
    """
    Process the result of a model API call from a single image
    """
    pass

def get_embeddings(image_paths = List[str], model_name='VGG-Face'):
    # throws error if no face found
    # TODO: batch represent call
    processed_model_results = []
    for image_path in image_paths:
        model_output = DeepFace.represent(img_path=image_path, model_name=model_name)
        processed_model_output = _process_model_output(model_output)
        processed_model_results.append(processed_model_output)
    return processed_model_results