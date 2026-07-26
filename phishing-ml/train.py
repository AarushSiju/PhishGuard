import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

data = pd.read_csv("dataset.csv")

# Focused subset: features realistically computable live from a raw URL in JS
selected_features = [
    "having_IPhaving_IP_Address",
    "URLURL_Length",
    "having_At_Symbol",
    "having_Sub_Domain",
    "SSLfinal_State",
    "Prefix_Suffix",
    "double_slash_redirecting",
    "HTTPS_token",
]

X = data[selected_features]
y = data["Result"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

predictions = model.predict(X_test)
acc = accuracy_score(y_test, predictions)
print("Accuracy with focused 8-feature subset:", acc)
print(classification_report(y_test, predictions))

joblib.dump(model, "phishing_model.pkl")
joblib.dump(selected_features, "feature_columns.pkl")
