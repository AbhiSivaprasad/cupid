from deepface import DeepFace
from dataclasses import dataclass
from typing import List, Optional
import numpy as np 


@dataclass
class FaceLocation:
    x: int
    y: int
    width: int
    height: int


@dataclass
class ImageAnnotations:
    embedding: np.array
    face_confidence: float
    face_location: FaceLocation


@dataclass
class ImagesAnnotations:
    embeddings: np.array
    face_confidences: List[float]
    face_locations: List[FaceLocation]


def _process_model_output(model_output) -> Optional[ImageAnnotations]:
    """
    Process the result of a model API call from a single image
    """
    if len(model_output) != 1:
        raise ValueError(f"unexpected model output length: {len(model_output)}")

    model_output = model_output[0]

    try:
        embedding = model_output['embedding']
        assert len(embedding) == 4096
    except:
        print("Error: Deepface API didn't return expected embedding")
        raise

    try:
        face_confidence = model_output['face_confidence']
    except:
        print("Error: Deepface API didn't return expected face confidence")
        raise

    try:
        face_location = FaceLocation(
            x=model_output["facial_area"]["x"],
            y=model_output["facial_area"]["y"],
            width=model_output["facial_area"]["w"],
            height=model_output["facial_area"]["h"],
        )
    except:
        print("Error: Deepface API didn't return expected facial area")
        raise
    
    return ImageAnnotations(
        embedding=embedding,
        face_confidence=face_confidence,
        face_location=face_location
    )


def get_image_annotations(image_paths = List[str], model_name='VGG-Face') -> ImagesAnnotations:
    # TODO: batch represent call
    processed_model_results = []
    for image_path in image_paths:
        try:
            model_output = DeepFace.represent(img_path=image_path, model_name=model_name, enforce_detection=True)
        except:
            # if no face is detected, skip image
            continue
        try:
            processed_model_output = _process_model_output(model_output)
            processed_model_results.append(processed_model_output)
        except Exception as e:
            print(image_path)
            print(e)
            continue
    
    images_annotations = ImagesAnnotations(
        embeddings=np.array([result.embedding for result in processed_model_results]),
        face_confidences=[result.face_confidence for result in processed_model_results],
        face_locations=[result.face_location for result in processed_model_results]
    )

    return images_annotations