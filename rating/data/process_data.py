import os
import numpy as np
from pathlib import Path
from glob import glob
import sys
sys.path.append("/Users/abhisivaprasad/Documents/projects/cupid/rating/")
from embedding.deepface import get_image_annotations


BASE_DATASET_PATH = os.path.join(os.path.dirname(os.path.realpath(__file__)), "dataset")

def extract_face(base_dataset_path: str = BASE_DATASET_PATH):
    base_dataset_path = Path(base_dataset_path)
    pass

# generate embedding matricies
def construct_training_data(base_dataset_path: str = BASE_DATASET_PATH):
    base_dataset_path = Path(base_dataset_path)
    negative_examples_paths = glob(str(base_dataset_path / "raw" / "no" / "*.jpeg"))
    positive_examples_paths = glob(str(base_dataset_path / "raw" / "yes" / "*.jpeg"))
    
    # embed all images
    negative_image_annotations = get_image_annotations(negative_examples_paths)
    positive_image_annotations = get_image_annotations(positive_examples_paths)
    negative_embeddings = negative_image_annotations.embeddings
    positive_embeddings = positive_image_annotations.embeddings

    # combine and make reponder
    embeddings = np.vstack([negative_embeddings, positive_embeddings])
    import pdb
    pdb.set_trace()
    zeros = np.zeros(negative_embeddings.shape[0])
    ones = np.ones(positive_embeddings.shape[0])
    responder = np.concatenate([zeros, ones])

    # write data
    np.save(base_dataset_path / "processed" / "X.npy", embeddings)
    np.save(base_dataset_path / "processed" / "y.npy", responder)

def load_processed_data(base_dataset_path: str = BASE_DATASET_PATH):
    base_dataset_path = Path(base_dataset_path)
    X = np.load(base_dataset_path / "processed" / "X.npy")
    y = np.load(base_dataset_path / "processed" / "y.npy")
    return X, y


if __name__ == "__main__":
    X, y = construct_training_data()