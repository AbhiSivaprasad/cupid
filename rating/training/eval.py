import torch
from embedding.deepface import get_image_annotations
from training.trainer import Classifier
from torch.utils.data import TensorDataset, DataLoader


def eval(image_path: str):
    # TODO: move model loading out
    model = Classifier()
    model.load_state_dict(torch.load('/Users/abhisivaprasad/Documents/projects/cupid/rating/training/models/prod.pth'))
    model.eval()

    # embed image
    image_annotations = get_image_annotations(image_path)
    embedding = image_annotations.embeddings
    embedding_tensor = torch.tensor(embedding).unsqueeze(0)
    output = model(embedding_tensor)

    return output
