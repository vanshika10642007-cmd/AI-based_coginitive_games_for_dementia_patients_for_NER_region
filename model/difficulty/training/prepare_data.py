import pandas as pd

# Load datasets
train = pd.read_csv("data/train_model_ready.csv")
validation = pd.read_csv("data/validation_model_ready.csv")
test = pd.read_csv("data/test_model_ready.csv")

# Features the model will use
features = [
    "game",
    "current_level",
    "accuracy",
    "response_time_sec",
    "mistakes",
    "timeouts",
    "previous_accuracy",
    "previous_response_time_sec",
    "accuracy_change",
    "consecutive_failures",
    "sessions_last_7_days"
]

# Input (X)
X_train = train[features]
X_validation = validation[features]
X_test = test[features]

# Target (y)
y_train = train["target_action_id"]
y_validation = validation["target_action_id"]
y_test = test["target_action_id"]

print("X_train shape:", X_train.shape)
print("y_train shape:", y_train.shape)

print("X_validation shape:", X_validation.shape)
print("y_validation shape:", y_validation.shape)

print("X_test shape:", X_test.shape)
print("y_test shape:", y_test.shape)

print("\nFeatures:")
print(features)

print("\nTarget classes:")
print(y_train.value_counts().sort_index())