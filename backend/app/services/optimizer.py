def calculate_optimizations(base_aqi: float, traffic: float, industry: float, construction: float, greenery: float = 0, energy: float = 0):
    # Weighted Impact Model
    # Traffic (30%), Industry (20%), Construction (10%), Greenery (20%), Energy (20%)
    impact_percentage = (0.3 * traffic) + (0.2 * industry) + (0.1 * construction) + (0.2 * greenery) + (0.2 * energy)
    
    # Maximum possible improvement is 70% of base AQI
    max_possible_drop = base_aqi * 0.70
    
    expected_reduction = max_possible_drop * (impact_percentage / 100.0)
    new_aqi = max(0, base_aqi - expected_reduction)
    
    if expected_reduction > base_aqi * 0.4:
        efficiency = "HIGH"
    elif expected_reduction > base_aqi * 0.2:
        efficiency = "MEDIUM"
    else:
        efficiency = "LOW"
        
    return {
        "new_aqi": new_aqi,
        "expected_reduction": expected_reduction,
        "effectiveness_label": efficiency
    }

def get_preset_strategies():
    return [
        {
            "name": "Strict Control",
            "traffic_reduction": 50,
            "industry_reduction": 40,
            "construction_reduction": 100,
        },
        {
            "name": "Moderate Control",
            "traffic_reduction": 20,
            "industry_reduction": 15,
            "construction_reduction": 10,
        },
        {
            "name": "Minimal Intervention",
            "traffic_reduction": 5,
            "industry_reduction": 5,
            "construction_reduction": 0,
        }
    ]
