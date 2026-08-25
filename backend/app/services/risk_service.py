def assess_risk(movement_quality: int, recovery_score: int, training_load: int, workload_change_percentage: float, movement_consistency: int) -> dict:
    reasons = []
    if recovery_score < 55: reasons.append('Recovery score is below the monitoring threshold.')
    elif recovery_score < 75: reasons.append('Recovery score decreased.')
    if movement_quality < 55: reasons.append('Movement quality is below the monitoring threshold.')
    elif movement_quality < 75: reasons.append('Movement quality is below the target range.')
    if workload_change_percentage > 30: reasons.append('Training load increased significantly compared with baseline.')
    elif workload_change_percentage >= 15: reasons.append('Training load increased compared with baseline.')
    if movement_consistency < 60: reasons.append('Movement consistency is below the target range.')
    if recovery_score < 55 or movement_quality < 55 or workload_change_percentage > 30:
        level = 'HIGH'
    elif recovery_score < 75 or movement_quality < 75 or workload_change_percentage >= 15:
        level = 'MODERATE'
    else:
        level = 'LOW'
    recommendation = 'Consider discussing workload adjustment with your coach.' if level == 'MODERATE' else 'Pause high-intensity training and consult your coach.' if level == 'HIGH' else 'Current training and recovery indicators are stable.'
    return {'risk_level': level, 'reasons': reasons, 'recommendation': recommendation, 'movement_quality': movement_quality, 'recovery_score': recovery_score, 'training_load': training_load, 'workload_change_percentage': workload_change_percentage}
