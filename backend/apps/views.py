# apps/voyages/views.py
# Milestone 4 Step 1 — Voyage History API
# Milestone 4 Step 2 — Voyage Audit API

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.utils import timezone

from .models import Voyage, VoyageHistory
from .serializers import VoyageSerializer, VoyageHistorySerializer


class VoyageViewSet(viewsets.ModelViewSet):
    queryset           = Voyage.objects.all()
    serializer_class   = VoyageSerializer
    permission_classes = [AllowAny]

    # ── Milestone 4 Step 1 ──
    # GET /api/voyage/{vessel_id}/history/
    @action(
        detail=False,
        methods=["get"],
        url_path="(?P<vessel_id>[^/.]+)/history"
    )
    def history(self, request, vessel_id=None):
        """
        Returns ordered list of positions and events
        sorted by timestamp. Uses only stored DB data.
        """
        try:
            from apps.vessels.models import Vessel
            from apps.safety.models import SafetyEvent

            try:
                vessel = Vessel.objects.get(id=vessel_id)
            except Vessel.DoesNotExist:
                return Response(
                    {"error": f"Vessel {vessel_id} not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            timeline = []

            # ── Fetch voyage history positions ──
            voyage_histories = VoyageHistory.objects.filter(
                voyage__vessel=vessel
            ).order_by("timestamp")

            for history in voyage_histories:
                timeline.append({
                    "type":   "position",
                    "lat":    history.latitude,
                    "lon":    history.longitude,
                    "speed":  history.speed,
                    "time":   history.timestamp.isoformat(),
                    "vessel": vessel.name,
                })

            # ── Add voyage departure and arrival ──
            voyages = Voyage.objects.filter(
                vessel=vessel
            ).order_by("departure_time")

            for voyage in voyages:
                if voyage.departure_port and voyage.departure_time:
                    timeline.append({
                        "type":   "position",
                        "lat":    voyage.departure_port.latitude,
                        "lon":    voyage.departure_port.longitude,
                        "time":   voyage.departure_time.isoformat(),
                        "event":  "departed",
                        "port":   voyage.departure_port.name,
                        "vessel": vessel.name,
                    })

                if voyage.arrival_port and voyage.arrival_time:
                    timeline.append({
                        "type":   "position",
                        "lat":    voyage.arrival_port.latitude,
                        "lon":    voyage.arrival_port.longitude,
                        "time":   voyage.arrival_time.isoformat(),
                        "event":  "arrived",
                        "port":   voyage.arrival_port.name,
                        "vessel": vessel.name,
                    })

            # ── Fetch safety events ──
            safety_events = SafetyEvent.objects.all().order_by(
                "reported_at"
            )
            for event in safety_events:
                timeline.append({
                    "type":     "event",
                    "event":    event.event_type.lower(),
                    "title":    event.title,
                    "lat":      event.latitude,
                    "lon":      event.longitude,
                    "severity": event.severity,
                    "time":     event.reported_at.isoformat(),
                })

            # ── Add safety alerts for this vessel ──
            try:
                from apps.safety.models import SafetyAlert
                alerts = SafetyAlert.objects.filter(
                    vessel_name=vessel.name
                ).order_by("created_at")

                for alert in alerts:
                    timeline.append({
                        "type":     "event",
                        "event":    alert.alert_type.lower(),
                        "title":    alert.message,
                        "lat":      alert.zone.latitude,
                        "lon":      alert.zone.longitude,
                        "severity": alert.severity,
                        "time":     alert.created_at.isoformat(),
                    })
            except Exception:
                pass

            # ── Add current vessel position ──
            if vessel.last_position_lat and vessel.last_position_lon:
                timeline.append({
                    "type":    "position",
                    "lat":     vessel.last_position_lat,
                    "lon":     vessel.last_position_lon,
                    "time":    vessel.last_update.isoformat()
                               if vessel.last_update else
                               timezone.now().isoformat(),
                    "speed":   vessel.speed,
                    "heading": vessel.heading,
                    "vessel":  vessel.name,
                    "event":   "current_position",
                })

            # ── Sort by timestamp ──
            def get_time(item):
                t = item.get("time")
                if t:
                    try:
                        from datetime import datetime
                        return datetime.fromisoformat(
                            t.replace("Z", "+00:00")
                        )
                    except Exception:
                        pass
                return timezone.now()

            timeline.sort(key=get_time)
            return Response(timeline)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # ── Milestone 4 Step 2 ──
    # GET /api/voyage/{id}/audit/
    @action(
        detail=True,
        methods=["get"],
        url_path="audit"
    )
    def audit(self, request, pk=None):
        """
        Voyage Audit & Compliance Logic.
        Checks:
        - Did vessel pass through risk zones?
        - Did it stop too long at congested ports?

        PDF output:
        {
            "risk_flags": ["piracy_zone"],
            "delay": true
        }
        """
        try:
            from services.voyage_audit_service import audit_voyage
            result = audit_voyage(pk)
            return Response(result)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VoyageHistoryViewSet(viewsets.ModelViewSet):
    queryset           = VoyageHistory.objects.all()
    serializer_class   = VoyageHistorySerializer
    permission_classes = [AllowAny]