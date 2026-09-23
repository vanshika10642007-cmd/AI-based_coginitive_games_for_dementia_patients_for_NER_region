import pandas as pd
import joblib


# Load trained model
model = joblib.load("../trained_model.pkl")


def predict_next_level(patient_data):
    """
    Predict the difficulty adjustment for the patient's next game.

    Returns:
        action: EASIER / SAME / HARDER
        current_level: current game level
        next_level: recommended next level
    """

    # Convert patient data into DataFrame
    data = pd.DataFrame([patient_data])

    # Predict action
    prediction = model.predict(data)[0]

    # Convert prediction ID to action
    actions = {
        0: "EASIER",
        1: "SAME",
        2: "HARDER"
    }

    action = actions[prediction]

    # Current level
    current_level = patient_data["current_level"]

    # Calculate next level
    if action == "EASIER":
        next_level = max(1, current_level - 1)

    elif action == "HARDER":
        next_level = min(5, current_level + 1)

    else:
        next_level = current_level

    return {
        "action": action,
        "current_level": current_level,
        "next_level": next_level
    }