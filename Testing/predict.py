import joblib
import sys
import json

FEATURE_ORDER = [
    "conflict_events_7d",
    "earthquake_count_30d",
    "wildfire_hotspots_7d",
    "avg_weather_severity_7d",
    "gold_volatility_7d",
    "flight_activity_change_7d"
]

model = joblib.load("risk_model.pkl")

data = json.loads(sys.argv[1])

features = [[data[f] for f in FEATURE_ORDER]]

score = model.predict(features)[0]

if score < 35:
    level = "LOW"
elif score < 65:
    level = "MEDIUM"
else:
    level = "HIGH"

result = {
    "risk_score": float(score),
    "risk_level": level
}

print(json.dumps(result))