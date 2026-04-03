def calculate_voyage_risk(compliance):
    score = 100

    if compliance.piracy_zone_crossed:
        score -= 30

    if compliance.severe_weather_encountered:
        score -= 25

    if compliance.port_delay:
        score -= 15

    return max(score, 0)
