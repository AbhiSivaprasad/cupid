import os
import torch
from embedding.deepface import get_image_annotations
from training.trainer import Classifier
from torch.utils.data import TensorDataset, DataLoader


def load_model():
    """
    load a trained model in eval mode
    """
    model = Classifier()
    model_path = os.path.dirname(os.path.abspath(__file__))
    model.load_state_dict(torch.load(model_path))
    model.eval()
    return model


def eval(model, embedding):
    """
    load an image and eval a model
    """
    # embed image
    # image_annotations = get_image_annotations(image_path)
    # embedding = image_annotations.embeddings
    embedding_tensor = torch.tensor(embedding).unsqueeze(0)
    output = model(embedding_tensor)
    return output
