import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix


# 1. Load dataset
data = pd.read_csv("../data/training_data.csv")

print("Dataset loaded:", data.shape)


# 2. Features
features = [
    "memory_score",
    "attention_score",
    "recognition_score",
    "working_memory_score",
    "sequencing_score",

    "games_played_7_days",
    "task_completion_rate",

    "days_since_memory_game",
    "days_since_attention_game",
    "days_since_recognition_game",
    "days_since_working_memory_game",
    "days_since_sequence_game",

    # Recent performance for each game
    "last_pattern_score",
    "last_face_recognition_score",
    "last_memory_association_score",
    "last_nback_score",
    "last_sequence_score"
]

X = data[features]
y = data["recommended_game"]


# 3. Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# 4. Create Random Forest
model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    n_jobs=-1,
    class_weight="balanced"
)


# 5. Train
print("Training daily game recommendation model...")

model.fit(X_train, y_train)

print("Training complete!")


# 6. Evaluate
predictions = model.predict(X_test)

print("\nTest Results:")
print(
    classification_report(
        y_test,
        predictions
    )
)


# 7. Confusion matrix
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))


# 8. Save model
joblib.dump(model, "../trained_model.pkl")

print("\nModel saved to:")
print("../trained_model.pkl")