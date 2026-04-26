from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime, timezone
from app.database import Base

class PollutionData(Base):
    __tablename__ = "pollution_data"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    city = Column(String(100), index=True, default="Metropolis")
    
    # Air Quality Index and components
    aqi = Column(Float, index=True)
    pm25 = Column(Float)
    pm10 = Column(Float)
    no2 = Column(Float)
    co = Column(Float)
    
    # Weather factors
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    target_time = Column(DateTime, index=True)
    
    predicted_aqi = Column(Float)
    confidence_score = Column(Float)
    model_version = Column(String(50))
    trend_insight = Column(String(255))

class Strategy(Base):
    __tablename__ = "strategies"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    policy_name = Column(String(100))
    traffic_reduction = Column(Float)
    industry_reduction = Column(Float)
    construction_reduction = Column(Float)
    
    base_aqi = Column(Float)
    expected_aqi = Column(Float)
    effectiveness_label = Column(String(50)) # e.g. "HIGH"

class Simulation(Base):
    __tablename__ = "simulations"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    slider_traffic = Column(Float)
    slider_industry = Column(Float)
    slider_construction = Column(Float)
    
    initial_aqi = Column(Float)
    recalculated_aqi = Column(Float)
