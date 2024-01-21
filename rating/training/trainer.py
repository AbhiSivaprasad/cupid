import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split

# Assuming 'embeddings' is your np.array of shape (4096, samples)
# and 'labels' is your array of 0s and 1s

# Convert numpy arrays to PyTorch tensors
X = torch.tensor(embeddings.T, dtype=torch.float32)  # Transpose to make it (samples, 4096)
y = torch.tensor(labels, dtype=torch.float32)

# Split the data into training and validation sets
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2)

# Define the model
class SimpleClassifier(nn.Module):
    def __init__(self, input_size):
        super(SimpleClassifier, self).__init__()
        self.fc = nn.Linear(input_size, 1)
    
    def forward(self, x):
        return torch.sigmoid(self.fc(x))

model = SimpleClassifier(input_size=4096)

# Loss and optimizer
criterion = nn.BCELoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Training loop
for epoch in range(num_epochs):
    # Forward pass
    outputs = model(X_train)
    loss = criterion(outputs, y_train)

    # Backward and optimize
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    # Validation and other code for monitoring performance...

# Evaluate the model
# ...
