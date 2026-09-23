import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report


# 1. Load data
train = pd.read_csv("../data/train_model_ready.csv")
validation = pd.read_csv("../data/validation_model_ready.csv")
test = pd.read_csv("../data/test_model_ready.csv")

# 2. Features
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

X_train = train[features]
y_train = train["target_action_id"]

X_validation = validation[features]
y_validation = validation["target_action_id"]

X_test = test[features]
y_test = test["target_action_id"]

# 3. Tell Python which feature is text
categorical_features = ["game"]

numeric_features = [
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


# 4. Convert game names into numbers
preprocessor = ColumnTransformer(
    transformers=[
        (
            "game",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        )
    ],
    remainder="passthrough"
)


# 5. Create Random Forest
model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    n_jobs=-1,
    class_weight="balanced"
)


# 6. Combine preprocessing + model
pipeline = Pipeline([
    ("preprocessing", preprocessor),
    ("model", model)
])


# 7. Train
print("Training model...")

pipeline.fit(X_train, y_train)

print("Training complete!")


# 8. Test on validation data
predictions = pipeline.predict(X_validation)

print("\nValidation Results:")
print(classification_report(
    y_validation,
    predictions,
    target_names=["EASIER", "SAME", "HARDER"]
))

test_predictions = pipeline.predict(X_test)

print("\nTest Results:")
print(classification_report(
    y_test,
    test_predictions,
    target_names=["EASIER", "SAME", "HARDER"]
))

import joblib

joblib.dump(pipeline, "../trained_model.pkl")

print("\nModel saved successfully!")