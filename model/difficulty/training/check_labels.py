import pandas as pd

files = [
    "train_model_ready.csv",
    "validation_model_ready.csv",
    "test_model_ready.csv"
]

for file in files:
    df = pd.read_csv("data/" + file)

    print("\n" + "=" * 40)
    print(file)
    print("=" * 40)

    print(df["target_action"].value_counts())
    print("\nPercentages:")
    print((df["target_action"].value_counts(normalize=True) * 100).round(2))