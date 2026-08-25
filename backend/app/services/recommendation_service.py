def recommendations(recovery_score: int | None, workload_change: float, movement_quality: int | None) -> list[str]:
    result = []
    if recovery_score is not None and recovery_score < 55:
        result.append('Prioritize recovery before high-intensity training.')
    if workload_change > 30:
        result.append('Training load has increased significantly compared with the recent baseline.')
    if movement_quality is not None and movement_quality < 60:
        result.append('Review movement technique with your coach.')
    return result or ['Current training and recovery indicators are stable.']
