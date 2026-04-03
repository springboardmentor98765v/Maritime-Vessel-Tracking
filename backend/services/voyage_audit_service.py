# services/voyage_audit_service.py
# Milestone 4 Step 2 — Voyage Audit & Compliance Logic

import logging

logger = logging.getLogger(__name__)

# ── Simple rules — keep it simple as PDF says ──
PIRACY_ZONE_FLAG    = "piracy_zone"
STORM_ZONE_FLAG     = "storm_zone"
PORT_DELAY_FLAG     = "port_delay"
PORT_WAIT_THRESHOLD = 24  # hours — if vessel waits more than this → delay


def check_piracy_zone(vessel_name):
    """
    Rule: If vessel passed through piracy zone → flag risk
    """
    try:
        from apps.safety.models import SafetyAlert
        piracy_alerts = SafetyAlert.objects.filter(
            vessel_name=vessel_name,
            alert_type="Piracy"
        )
        return piracy_alerts.exists()
    except Exception as e:
        logger.error(f"Piracy check error: {e}")
        return False


def check_storm_zone(vessel_name):
    """
    Rule: If vessel passed through storm zone → flag risk
    """
    try:
        from apps.safety.models import SafetyAlert
        storm_alerts = SafetyAlert.objects.filter(
            vessel_name=vessel_name,
            alert_type="Storm"
        )
        return storm_alerts.exists()
    except Exception as e:
        logger.error(f"Storm check error: {e}")
        return False


def check_port_delay(voyage):
    """
    Rule: If port wait time > threshold → flag delay
    PDF: If port_wait_time > threshold → flag delay
    """
    try:
        if voyage.departure_time and voyage.arrival_time:
            # ── Calculate wait time in hours ──
            diff = voyage.arrival_time - voyage.departure_time
            wait_hours = diff.total_seconds() / 3600

            if wait_hours > PORT_WAIT_THRESHOLD:
                return True, round(wait_hours, 2)

        return False, 0

    except Exception as e:
        logger.error(f"Port delay check error: {e}")
        return False, 0


def calculate_compliance_score(risk_flags, delay):
    """
    Simple compliance score calculation
    Start at 100, deduct for each issue
    """
    score = 100.0

    if PIRACY_ZONE_FLAG in risk_flags:
        score -= 30.0

    if STORM_ZONE_FLAG in risk_flags:
        score -= 20.0

    if delay:
        score -= 10.0

    return max(0.0, round(score, 2))


def audit_voyage(voyage_id):
    """
    Main audit function.
    PDF says:
    - Check if vessel passed through risk zones
    - Check if it stopped too long at congested ports
    Returns:
    {
        "risk_flags": ["piracy_zone"],
        "delay": true
    }
    """
    try:
        from apps.voyages.models import Voyage, Compliance

        # ── Fetch voyage ──
        try:
            voyage = Voyage.objects.select_related(
                "vessel",
                "departure_port",
                "arrival_port"
            ).get(id=voyage_id)
        except Voyage.DoesNotExist:
            return {"error": f"Voyage {voyage_id} not found"}

        vessel_name = voyage.vessel.name
        risk_flags  = []

        # ── Rule 1: Check piracy zone ──
        if check_piracy_zone(vessel_name):
            risk_flags.append(PIRACY_ZONE_FLAG)

        # ── Rule 2: Check storm zone ──
        if check_storm_zone(vessel_name):
            risk_flags.append(STORM_ZONE_FLAG)

        # ── Rule 3: Check port delay ──
        has_delay, wait_hours = check_port_delay(voyage)

        # ── Calculate compliance score ──
        compliance_score = calculate_compliance_score(
            risk_flags, has_delay
        )

        # ── Save compliance to database ──
        compliance, created = Compliance.objects.update_or_create(
            voyage=voyage,
            defaults={
                "piracy_zone_crossed":       PIRACY_ZONE_FLAG in risk_flags,
                "severe_weather_encountered": STORM_ZONE_FLAG in risk_flags,
                "port_delay":                has_delay,
                "compliance_score":          compliance_score,
            }
        )

        # ── Return result matching PDF output ──
        return {
            "voyage_id":        voyage.id,
            "vessel":           vessel_name,
            "risk_flags":       risk_flags,
            "delay":            has_delay,
            "wait_hours":       wait_hours,
            "compliance_score": compliance_score,
            "departure_port":   voyage.departure_port.name
                                if voyage.departure_port else None,
            "arrival_port":     voyage.arrival_port.name
                                if voyage.arrival_port else None,
        }

    except Exception as e:
        logger.error(f"Audit error: {e}")
        return {"error": str(e)}