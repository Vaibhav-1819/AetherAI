import pandas as pd
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models.pollution import PollutionData
import os

# Create tables
Base.metadata.create_all(bind=engine)

def populate():
    print("Reading synthetic data...")
    data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "synthetic_pollution_data.csv")
    if not os.path.exists(data_path):
        print("Data not found. Please run ml/data_generator.py first.")
        return
        
    df = pd.read_csv(data_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    db: Session = SessionLocal()
    
    # Check if data already exists
    if db.query(PollutionData).first():
        print("Database already populated.")
        db.close()
        return
        
    print("Populating database with historical data...")
    records = []
    for _, row in df.iterrows():
        record = PollutionData(
            timestamp=row['timestamp'],
            city=row['city'],
            aqi=row['aqi'],
            pm25=row['pm25'],
            pm10=row['pm10'],
            no2=row['no2'],
            co=row['co'],
            temperature=row['temperature'],
            humidity=row['humidity'],
            wind_speed=row['wind_speed']
        )
        records.append(record)
        
    db.bulk_save_objects(records)
    db.commit()
    db.close()
    print(f"Successfully inserted {len(records)} records into the database.")

if __name__ == "__main__":
    populate()
