import pandas as pd

train = pd.read_csv("data/train_model_ready.csv")
validation = pd.read_csv("data/validation_model_ready.csv")
test = pd.read_csv("data/test_model_ready.csv")

print("TRAIN:")
print(train.shape)

print("\nVALIDATION:")
print(validation.shape)

print("\nTEST:")
print(test.shape)

print("\nTRAIN COLUMNS:")
print(train.columns.tolist())