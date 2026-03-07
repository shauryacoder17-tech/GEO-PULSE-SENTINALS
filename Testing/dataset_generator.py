import pandas as pd
import numpy as np

rows = 8000

data = {
    "conflict_events_7d": np.random.poisson(2, rows),
    "earthquake_count_30d": np.random.poisson(1, rows),
    "wildfire_hotspots_7d": np.random.poisson(3, rows),
    "avg_weather_severity_7d": np.random.uniform(0,1,rows),
    "gold_volatility_7d": np.random.uniform(0,1,rows),
    "flight_activity_change_7d": np.random.uniform(-0.5,0.5,rows)
}

df = pd.DataFrame(data)

risk = (
    df["conflict_events_7d"] * 6 +
    df["earthquake_count_30d"] * 5 +
    df["wildfire_hotspots_7d"] * 4 +
    df["avg_weather_severity_7d"] * 25 +
    df["gold_volatility_7d"] * 15 +
    (-df["flight_activity_change_7d"] * 10)
)

df["risk_score"] = np.clip(risk,0,100)

df.to_csv("training_data.csv", index=False)

print("Dataset generated: training_data.csv")