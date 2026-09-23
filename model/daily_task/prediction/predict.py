import pandas as pd
import joblib

# Load trained model
model = joblib.load("../trained_model.pkl")


# Duration assigned according to recommendation rank
DURATIONS = [10, 10, 8, 8, 5]


def recommend_games(patient_data):
    """
    Recommend a complete daily cognitive-game plan.

    Returns all games ranked by the model, with a suggested
    duration for each game.
    """

    data = pd.DataFrame([patient_data])

    # Get probability for every game
    probabilities = model.predict_proba(data)[0]

    # Get corresponding game names
    games = model.classes_

    # Pair game names with model scores
    recommendations = list(zip(games, probabilities))

    # Highest recommendation first
    recommendations.sort(
        key=lambda x: x[1],
        reverse=True
    )

    # Build daily plan
    daily_plan = []

    for i, (game, score) in enumerate(recommendations):

        daily_plan.append({
            "order": i + 1,
            "game": game,
            "duration_minutes": DURATIONS[i],
            "score": round(float(score), 3)
        })

    return daily_plan

