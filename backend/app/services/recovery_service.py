from app.utils.calculations import clamp, weighted_score

WEIGHTS = {'sleep': 0.30, 'fatigue': 0.20, 'soreness': 0.15, 'stress': 0.10, 'rest': 0.10, 'training_intensity': 0.15}

def calculate_recovery(data: dict) -> tuple[int, str, dict]:
    breakdown = {
        'sleep': clamp(data['sleep_hours'] / 8 * 100),
        'fatigue': clamp((10 - data['fatigue']) / 9 * 100),
        'soreness': clamp((10 - data['soreness']) / 9 * 100),
        'stress': clamp((10 - data['stress']) / 9 * 100),
        'rest': clamp(data['rest_days'] / 2 * 100),
        'training_intensity': clamp((10 - data['training_intensity']) / 9 * 100),
    }
    score = weighted_score(breakdown, WEIGHTS)
    status = 'GOOD' if score >= 75 else 'MODERATE' if score >= 55 else 'LOW'
    return score, status, breakdown
