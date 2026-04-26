import time
import logging
import requests

logger = logging.getLogger(__name__)

# Cache structure: {(lat, lon): {"timestamp": float, "data": dict}}
_weather_cache = {}
_aqi_cache = {}
CACHE_TTL = 600  # 10 minutes (600 seconds)

def get_live_aqi(lat, lon):
    global _aqi_cache
    cache_key = (round(lat, 2), round(lon, 2))
    now = time.time()
    
    if cache_key in _aqi_cache and (now - _aqi_cache[cache_key]["timestamp"] < CACHE_TTL):
        return _aqi_cache[cache_key]["data"]
        
    url_aqi = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=european_aqi,pm10,pm2_5,nitrogen_dioxide,carbon_monoxide&timezone=auto"
    
    try:
        response = requests.get(url_aqi, timeout=15.0)
        response.raise_for_status()
        data = response.json()
        current = data.get("current", {})
        
        aqi_data = {
            "european_aqi": current.get("european_aqi", 150),
            "pm10": current.get("pm10", 80.0),
            "pm2_5": current.get("pm2_5", 55.0),
            "nitrogen_dioxide": current.get("nitrogen_dioxide", 25.0),
            "carbon_monoxide": current.get("carbon_monoxide", 300.0)
        }
        
        _aqi_cache[cache_key] = {"timestamp": now, "data": aqi_data}
        return aqi_data
        
    except Exception as e:
        logger.error(f"Live AQI fetch failed: {str(e)}")
        # Fallback values
        return {
            "european_aqi": 210,
            "pm10": 120.5,
            "pm2_5": 85.0,
            "nitrogen_dioxide": 45.2,
            "carbon_monoxide": 650.0
        }

def get_current_weather(lat, lon):
    """
    Fetches live weather data from Open-Meteo for the simulation engine.
    Fully cached per location to prevent hammering the free API.
    """
    global _weather_cache
    cache_key = (round(lat, 2), round(lon, 2))
    now = time.time()
    
    if cache_key in _weather_cache and (now - _weather_cache[cache_key]["timestamp"] < CACHE_TTL):
        return _weather_cache[cache_key]["data"]

    url_minimal = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=auto"
    
    try:
        response = requests.get(url_minimal, timeout=15.0)
        response.raise_for_status()
        data = response.json()
        current = data.get("current", {})
        
        weather_data = {
            "temperature": current.get("temperature_2m", 25.0),
            "humidity": current.get("relative_humidity_2m", 60.0),
            "wind_speed": current.get("wind_speed_10m", 15.0),
            "precipitation": current.get("precipitation", 0.0)
        }
        
        _weather_cache[cache_key] = {
            "timestamp": now,
            "data": weather_data
        }
        return weather_data
        
    except Exception as e:
        logger.error(f"Weather API fetch failed: {str(e)}")
        return None

def get_historical_aqi(lat, lon):
    """
    Fetches real historical AQI data for the last 24 hours.
    Replaces static database placeholders with live city data.
    """
    url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&past_days=1&hourly=european_aqi,pm10,pm2_5,nitrogen_dioxide&timezone=auto"
    
    try:
        response = requests.get(url, timeout=15.0)
        response.raise_for_status()
        data = response.json()
        hourly = data.get("hourly", {})
        
        # We want the last 24 data points
        times = hourly.get("time", [])[-24:]
        aqi_values = hourly.get("european_aqi", [])[-24:]
        pm25 = hourly.get("pm2_5", [])[-24:]
        pm10 = hourly.get("pm10", [])[-24:]
        no2 = hourly.get("nitrogen_dioxide", [])[-24:]
        
        history = []
        for i in range(len(times)):
            history.append({
                "time": times[i].split("T")[1][:5], # Extract HH:MM
                "aqi": aqi_values[i],
                "pm25": pm25[i],
                "pm10": pm10[i],
                "no2": no2[i]
            })
            
        return history
    except Exception as e:
        logger.error(f"Historical AQI fetch failed: {e}")
        return []

def get_aqi_forecast(lat, lon):
    """
    Fetches real-time air quality forecast for the next 72 hours.
    Replaces static predictions with live global forecast data.
    """
    url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&hourly=european_aqi,pm10,pm2_5,nitrogen_dioxide&timezone=auto"
    
    try:
        response = requests.get(url, timeout=15.0)
        response.raise_for_status()
        data = response.json()
        hourly = data.get("hourly", {})
        
        # Open-Meteo returns data starting from the beginning of the current day.
        # We need to find the current hour index or just take the next 72 points.
        aqi_values = hourly.get("european_aqi", [])[:72]
        pm25_values = hourly.get("pm2_5", [])[:72]
        pm10_values = hourly.get("pm10", [])[:72]
        no2_values = hourly.get("nitrogen_dioxide", [])[:72]
        times = hourly.get("time", [])[:72]
        
        forecast = []
        # Return +24h, +48h, +72h markers
        for offset in [24, 48, 72]:
            idx = min(offset, len(aqi_values) - 1)
            forecast.append({
                "time": f"+{offset}h",
                "expected_aqi": round(aqi_values[idx])
            })
            
        full_hourly = []
        for i in range(len(times)):
            full_hourly.append({
                "time": times[i],
                "aqi": aqi_values[i],
                "pm25": pm25_values[i],
                "pm10": pm10_values[i],
                "no2": no2_values[i]
            })
            
        return forecast, full_hourly
    except Exception as e:
        logger.error(f"AQI forecast fetch failed: {e}")
        return [{"time": "+24h", "expected_aqi": 150}], []
