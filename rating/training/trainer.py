import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
from sklearn.model_selection import train_test_split
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

def load_and_setup_dataset(test_size=0.2, random_state=None):
    X, y = load_processed_data()

    # Reporting metrics about the dataset
    print(f"Total samples in dataset: {X.shape[0]}")
    print(f"Number of features per sample: {X.shape[1]}")
    if y.ndim == 1:
        print(f"Number of classes: {np.unique(y).size}")
        # print(f"Sample distribution per class: {np.bincount(y)}")
    else:
        print("y does not appear to be a 1-dimensional array of labels.")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state)
    # Convert numpy arrays to PyTorch tensors
    tensor_embeddings_train = torch.Tensor(X_train)
    tensor_responses_train = torch.Tensor(y_train).squeeze()
    tensor_embeddings_test = torch.Tensor(X_test)
    tensor_responses_test = torch.Tensor(y_test).squeeze()

    # Create TensorDataset and DataLoader for train and test
    train_dataset = TensorDataset(tensor_embeddings_train, tensor_responses_train)
    test_dataset = TensorDataset(tensor_embeddings_test, tensor_responses_test)

    train_dataloader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    test_dataloader = DataLoader(test_dataset, batch_size=32, shuffle=False)
    return train_dataloader, test_dataloader

def train(model, dataloader, epochs=10):
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    writer = SummaryWriter()  # TensorBoard writer

    for epoch in range(epochs):
        for i, (inputs, labels) in enumerate(dataloader):
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs.squeeze(), labels)
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

            # Assuming outputs and labels are 1D for binary classification
            # Squeeze outputs if necessary, and apply threshold
            predicted = outputs.squeeze().gt(0.5).long()  # Using gt(0.5) which is greater than 0.5

            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    accuracy = 100 * correct / total
    print(f'Accuracy: {accuracy}%')
    return accuracy


if __name__ == '__main__':
    model = Classifier()
    train_dataloader, test_dataloader = load_and_setup_dataset()
    train(model, train_dataloader, epochs=32)
    evaluate(model, train_dataloader)
    evaluate(model, test_dataloader)
    torch.save(model, '/Users/abhisivaprasad/Documents/projects/cupid/rating/training/models/prod.pth')