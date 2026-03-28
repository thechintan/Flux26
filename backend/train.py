import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error
import joblib, json

df = pd.read_excel("crop_price_training_dataset.xlsx")

le_cat = LabelEncoder()
le_sub = LabelEncoder()

df["Main_Category_enc"] = le_cat.fit_transform(df["Main_Category"])
df["Sub_Category_enc"]  = le_sub.fit_transform(df["Sub_Category"])

import numpy as np
df["Quantity_log"] = np.log1p(df["Quantity_KG"])

X = df[["Main_Category_enc", "Sub_Category_enc", "Quantity_log"]]
y = df["Price_Per_KG"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = XGBRegressor(n_estimators=200, max_depth=5, learning_rate=0.1, random_state=42)
model.fit(X_train, y_train)

preds = model.predict(X_test)
print(f"MAE: ₹{mean_absolute_error(y_test, preds):.2f} per KG")

# Save model + encoders
joblib.dump(model,  "model.pkl")
joblib.dump(le_cat, "le_cat.pkl")
joblib.dump(le_sub, "le_sub.pkl")

# Save label mappings so frontend knows valid values
json.dump(list(le_cat.classes_), open("categories.json", "w"))
json.dump(list(le_sub.classes_), open("subcategories.json", "w"))

print("Saved: model.pkl, le_cat.pkl, le_sub.pkl")