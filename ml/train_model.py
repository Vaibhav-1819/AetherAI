import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

def train_aqi_model():
    print("Loading synthetic data...")
    data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "synthetic_pollution_data.csv")
    if not os.path.exists(data_path):
        print("Data not found. Run data_generator.py first.")
        return
        
    df = pd.read_csv(data_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    df['day_of_year'] = df['timestamp'].dt.dayofyear
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    
    features = ['pm25', 'pm10', 'no2', 'co', 'temperature', 'humidity', 'wind_speed', 'day_of_year', 'day_of_week']
    X = df[features]
    y = df['aqi']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost Regressor...")
    model = xgb.XGBRegressor(
        objective='reg:squarederror',
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"MSE: {mse:.2f}")
    print(f"R2 Score: {r2:.2f}")
    
    confidence_base = max(0, min(100, r2 * 100))
    print(f"Base Confidence Score: {confidence_base:.2f}%")
    
    models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "xgboost_aqi_model.pkl")
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_aqi_model()
