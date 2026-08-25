from app.utils.calculations import weighted_score

class MovementAnalyzer:
    def calculate_joint_angle(self, a: dict, b: dict, c: dict) -> float:
        import math
        radians = math.atan2(c['y'] - b['y'], c['x'] - b['x']) - math.atan2(a['y'] - b['y'], a['x'] - b['x'])
        degrees = abs(math.degrees(radians))
        return 360 - degrees if degrees > 180 else degrees

    def detect_squat_phase(self, knee_angle: float, previous_angle: float = 180) -> str:
        if knee_angle < 100: return 'BOTTOM'
        if knee_angle > 160: return 'STANDING'
        return 'DESCENDING' if knee_angle < previous_angle else 'ASCENDING'

    def count_repetitions(self, phases: list[str]) -> int:
        return sum(1 for previous, current in zip(phases, phases[1:]) if previous == 'BOTTOM' and current == 'STANDING')

    def calculate_movement_quality(self, depth: int, alignment: int, stability: int, consistency: int) -> int:
        return weighted_score({'depth': depth, 'alignment': alignment, 'stability': stability, 'consistency': consistency}, {'depth': .30, 'alignment': .25, 'stability': .20, 'consistency': .25})

    def analyze(self, data: dict) -> dict:
        score = self.calculate_movement_quality(data['depth_score'], data['knee_alignment_score'], data['stability_score'], data['consistency_score'])
        return {**data, 'movement_quality_score': score}

movement_analyzer = MovementAnalyzer()
