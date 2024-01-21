import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import numpy as np
from torch.utils.tensorboard import SummaryWriter
import matplotlib.pyplot as plt

import sys
sys.path.append("/Users/abhisivaprasad/Documents/projects/cupid/rating/")
from data.process_data import load_processed_data


class Classifier(nn.Module):
    def __init__(self):
        super(Classifier, self).__init__()
        self.fc1 = nn.Linear(4096, 512)  # First fully connected layer
        self.relu = nn.ReLU()            # ReLU activation
        self.fc2 = nn.Linear(512, 1)     # Second fully connected layer

    def forward(self, x):
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        return torch.sigmoid(x)

def load_and_setup_dataset():
    X, y = load_processed_data()

    # Convert numpy arrays to PyTorch tensors
    tensor_embeddings = torch.Tensor(X)
    tensor_responses = torch.Tensor(y).squeeze()

    # Create TensorDataset and DataLoader
    dataset = TensorDataset(tensor_embeddings, tensor_responses)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

    return dataloader

def train(model, dataloader, epochs=10):
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    writer = SummaryWriter()  # TensorBoard writer

    for epoch in range(epochs):
        for i, (inputs, labels) in enumerate(dataloader):
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            if i % 10 == 0:
                print(f"Epoch {epoch+1}/{epochs}, Step {i+1}/{len(dataloader)}, Loss: {loss.item()}")
                writer.add_scalar('training loss', loss.item(), epoch * len(dataloader) + i)
    
    writer.close()

def evaluate(model, dataloader):
    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for inputs, labels in dataloader:
            outputs = model(inputs)
            predicted = (outputs > 0.5).float()
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    accuracy = 100 * correct / total
    print(f'Accuracy: {accuracy}%')
    return accuracy


if __name__ == '__main__':
    model = Classifier()
    dataloader = load_and_setup_dataset()
    train(model, dataloader, epochs=10)
    evaluate(model, dataloader)
