from app.services.movement_service import MovementAnalyzer
from app.services.recovery_service import calculate_recovery
from app.services.risk_service import assess_risk

def test_session_load_known_calculation():
    assert 35 * 8 == 280

def test_recovery_calculation_returns_valid_status():
    score, status, breakdown = calculate_recovery({'sleep_hours': 7, 'fatigue': 4, 'soreness': 3, 'stress': 5, 'rest_days': 1, 'training_intensity': 7})
    assert 0 <= score <= 100
    assert status in {'GOOD', 'MODERATE', 'LOW'}
    assert set(breakdown) == {'sleep', 'fatigue', 'soreness', 'stress', 'rest', 'training_intensity'}

def test_movement_quality_weights():
    analyzer = MovementAnalyzer()
    assert analyzer.calculate_movement_quality(88, 84, 79, 91) == 86

def test_risk_rules_are_explainable():
    result = assess_risk(70, 80, 280, 20, 70)
    assert result['risk_level'] == 'MODERATE'
    assert result['reasons']
