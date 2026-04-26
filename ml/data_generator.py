import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def generate_synthetic_data(days=365):
    """Generate realistic synthetic pollution data for training."""
    np.random.seed(42)
    
    dates = [datetime.now() - timedelta(days=x) for x in range(days)]
    dates.reverse() # Start from oldest
    
    pm25_base, pm10_base, no2_base = 50.0, 80.0, 30.0
    
    data = []
    for d in dates:
        season_factor = np.sin(d.timetuple().tm_yday / 365.0 * 2 * np.pi) * 20
        weekend_factor = -15 if d.weekday() >= 5 else 10
        
        pm25 = max(5, pm25_base + season_factor + weekend_factor + np.random.normal(0, 15))
        pm10 = max(10, pm10_base + season_factor * 1.5 + weekend_factor + np.random.normal(0, 20))
        no2 = max(5, no2_base + season_factor * 0.5 + weekend_factor * 0.5 + np.random.normal(0, 10))
        co = max(0.1, 1.0 + np.random.normal(0, 0.5))
        
        aqi = max(pm25 * 2.5, pm10 * 1.5, no2 * 1.2) + np.random.normal(0, 10)
        aqi = max(15, min(500, aqi))
        
        data.append({
            "timestamp": d,
            "city": "Metropolis",
            "aqi": aqi,
            "pm25": pm25,
            "pm10": pm10,
            "no2": no2,
            "co": co,
            "temperature": 25.0 + season_factor * 0.5 + np.random.normal(0, 3),
            "humidity": 60.0 + np.random.normal(0, 10),
            "wind_speed": max(0, 10.0 + np.random.normal(0, 5))
        })
        
    df = pd.DataFrame(data)
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "synthetic_pollution_data.csv")
    df.to_csv(csv_path, index=False)
    print(f"Synthetic data generated: {csv_path}")
    return df

if __name__ == "__main__":
    generate_synthetic_data()
