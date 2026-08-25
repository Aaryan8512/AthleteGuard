def clamp(value: float, low: float = 0, high: float = 100) -> int:
    return round(max(low, min(high, value)))

def weighted_score(values: dict[str, float], weights: dict[str, float]) -> int:
    return clamp(sum(values[name] * weights[name] for name in weights))

def normalize_inverse(value: float, minimum: float, maximum: float) -> int:
    if maximum == minimum:
        return 100
    return clamp((maximum - value) / (maximum - minimum) * 100)
