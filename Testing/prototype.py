class DisasterModel:
    def predict(self, country, state):
        return {
            "disaster_safety": "Moderate",
            "recent_risk": "Possible wildfire activity",
            "score": 62
        }
class EconomyModel:

    def predict(self, country, state):
        return {
            "stock_economy": "Stable",
            "market_signal": "Gold volatility slightly rising",
            "score": 55
        }
class WeatherModel:
    def predict(self, country, state):
        return {
            "weather_forecast": "Partly cloudy with possible rain",
            "temperature": "28°C",
            "score": 48
        }
class GeoPulseAI:
    def __init__(self, disaster_model, economy_model, weather_model):
        self.disaster_model = disaster_model
        self.economy_model = economy_model
        self.weather_model = weather_model
    def analyze_region(self, country, state):
        disaster_result = self.disaster_model.predict(country, state)
        economy_result = self.economy_model.predict(country, state)
        weather_result = self.weather_model.predict(country, state)
        report = {
            "location": {
                "country": country,
                "state": state
            },
            "disaster_analysis": disaster_result,
            "economic_analysis": economy_result,
            "weather_analysis": weather_result
        }

        return report
def main():
    country = input("Enter country: ")
    state = input("Enter state/region: ")
    disaster_model = DisasterModel()
    economy_model = EconomyModel()
    weather_model = WeatherModel()
    system = GeoPulseAI(disaster_model, economy_model, weather_model)
    result = system.analyze_region(country, state)
    print("\n--- GeoPulse Sentinel Report ---\n")
    print("Location:", result["location"])
    print("\nDisaster Safety:")
    print(result["disaster_analysis"])
    print("\nStock Economy:")
    print(result["economic_analysis"])
    print("\nWeather Forecast:")
    print(result["weather_analysis"])
if __name__ == "__main__":
    main()