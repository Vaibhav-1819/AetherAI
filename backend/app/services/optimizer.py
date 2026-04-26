def calculate_optimizations(base_aqi: float, traffic_reduction: float, industry_reduction: float, construction_reduction: float):
    # Weighted Impact Model
    impact_percentage = (0.5 * traffic_reduction) + (0.3 * industry_reduction) + (0.2 * construction_reduction)
    
    max_possible_drop = base_aqi * 0.60
    
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
