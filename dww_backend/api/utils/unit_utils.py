# def convert_weight(weight, from_unit, to_unit):
#     """
#     Convert weight between imperial (lbs) and metric (kg) units
#     """
#     if from_unit == to_unit:
#         return weight
    
#     if from_unit == 'imperial' and to_unit == 'metric':
#         # Convert lbs to kg
#         return round(weight * 0.45359237, 2)
#     elif from_unit == 'metric' and to_unit == 'imperial':
#         # Convert kg to lbs
#         return round(weight * 2.20462262, 2)
    
#     raise ValueError(f"Invalid unit conversion: {from_unit} to {to_unit}")

# def format_weight(weight, unit):
#     """
#     Format weight with appropriate unit
#     """
#     if unit == 'imperial':
#         return f"{weight} lbs"
#     elif unit == 'metric':
#         return f"{weight} kg"
#     else:
#         raise ValueError(f"Invalid unit: {unit}") 