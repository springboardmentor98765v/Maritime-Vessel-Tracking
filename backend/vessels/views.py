from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
import csv
from django.contrib.auth import get_user_model

from .models import Vessel, SafetyZone, Notification, Subscription, VesselEvent
from .serializers import VesselSerializer, NotificationSerializer, SubscriptionSerializer
from .services.port_analytics_service import get_port_congestion


class VesselListView(APIView):
    """
    List vessels with optional filtering:
    /api/vessels/?vessel_type=Container&flag=India&cargo_type=Oil&destination=Mumbai
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Vessel.objects.all()

        vessel_type = request.query_params.get("vessel_type")
        flag = request.query_params.get("flag")
        cargo_type = request.query_params.get("cargo_type")
        destination = request.query_params.get("destination")

        if vessel_type:
            qs = qs.filter(vessel_type__iexact=vessel_type)
        if flag:
            qs = qs.filter(flag__iexact=flag)
        if cargo_type:
            qs = qs.filter(cargo_type__iexact=cargo_type)
        if destination:
            qs = qs.filter(destination__icontains=destination)

        serializer = VesselSerializer(qs, many=True)
        return Response(serializer.data)


class VesselDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, vessel_id):
        try:
            vessel = Vessel.objects.get(id=vessel_id)
        except Vessel.DoesNotExist:
            return Response({"error": "Vessel not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = VesselSerializer(vessel)
        return Response(serializer.data)


class SafetyZonesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        zones = SafetyZone.objects.all()

        data = []

        for zone in zones:
            data.append(
                {
                    "id": zone.id,
                    "name": zone.name,
                    "latitude": zone.latitude,
                    "longitude": zone.longitude,
                    "radius_km": zone.radius_km,
                    "zone_type": zone.zone_type,
                    "severity": zone.severity,
                }
            )

        return Response(data)


class SafetyStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vessels = Vessel.objects.all()
        zones = SafetyZone.objects.all()

        result = []

        for vessel in vessels:
            for zone in zones:
                distance = ((vessel.latitude - zone.latitude) ** 2 + (vessel.longitude - zone.longitude) ** 2) ** 0.5

                status_label = "SAFE"

                if distance <= zone.radius_km:
                    status_label = "DANGER"

                result.append(
                    {
                        "vessel": vessel.vessel_name,
                        "zone": zone.name,
                        "status": status_label,
                    }
                )

        return Response(result)


class UserNotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by("-created_at")
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
        except Notification.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        notification.is_read = True
        notification.save(update_fields=["is_read"])
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)


class SubscribeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, vessel_id):
        try:
            vessel = Vessel.objects.get(id=vessel_id)
        except Vessel.DoesNotExist:
            return Response({"detail": "Vessel not found."}, status=status.HTTP_404_NOT_FOUND)

        subscription, created = Subscription.objects.get_or_create(user=request.user, vessel=vessel)

        serializer = SubscriptionSerializer(subscription)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK

        return Response(serializer.data, status=status_code)


class UnsubscribeView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, vessel_id):
        try:
            vessel = Vessel.objects.get(id=vessel_id)
        except Vessel.DoesNotExist:
            return Response({"detail": "Vessel not found."}, status=status.HTTP_404_NOT_FOUND)

        Subscription.objects.filter(user=request.user, vessel=vessel).delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class PortAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = get_port_congestion()
        return Response(data)


class CompanyDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        User = get_user_model()
        total_vessels = Vessel.objects.count()
        active_vessels = Vessel.objects.filter(speed__gt=0).count()
        delayed_vessels = Vessel.objects.filter(speed__lte=0.5).count()
        risk_alerts = VesselEvent.objects.filter(
            event_type__iregex=r"(storm|piracy|danger|alert)"
        ).count()
        total_users = User.objects.count()

        return Response(
            {
                "total_vessels": total_vessels,
                "active_vessels": active_vessels,
                "delayed_vessels": delayed_vessels,
                "risk_alerts": risk_alerts,
                "total_users": total_users,
            },
            status=status.HTTP_200_OK,
        )


class PortDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        analytics = get_port_congestion()
        if not analytics:
            return Response(
                {
                    "congestion_score": 0,
                    "arrivals": 0,
                    "departures": 0,
                    "ports": [],
                    "avg_wait_time": 0,
                },
                status=status.HTTP_200_OK,
            )

        avg_congestion = round(sum(p.get("congestion_score", 0) for p in analytics) / len(analytics), 2)
        arrivals = sum(p.get("arrivals", 0) for p in analytics)
        departures = sum(p.get("departures", 0) for p in analytics)
        avg_wait_time = round((avg_congestion / 100) * 60, 2)

        ports = [
            {
                "port": p.get("port"),
                "arrivals": p.get("arrivals", 0),
                "departures": p.get("departures", 0),
                "congestionScore": p.get("congestion_score", 0),
            }
            for p in analytics
        ]

        return Response(
            {
                "congestion_score": avg_congestion,
                "arrivals": arrivals,
                "departures": departures,
                "ports": ports,
                "avg_wait_time": avg_wait_time,
            },
            status=status.HTTP_200_OK,
        )


class AdminApiStatusView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(
            {
                "MarineTraffic": "working",
                "NOAA": "working",
                "UNCTAD": "working",
            },
            status=status.HTTP_200_OK,
        )


class AdminLogsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        recent_events = VesselEvent.objects.order_by("-timestamp")[:20]
        logs = [
            {
                "source": "event_engine",
                "message": e.event_type,
                "timestamp": e.timestamp,
                "level": "warning" if "alert" in e.event_type.lower() else "info",
            }
            for e in recent_events
        ]
        return Response(logs, status=status.HTTP_200_OK)


class AdminVoyageExportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from voyages.models import Voyage

        format_type = request.query_params.get("format", "csv").lower()
        voyages = Voyage.objects.select_related("vessel").all().order_by("-start_time")

        if format_type == "json":
            data = [
                {
                    "id": v.id,
                    "vessel": v.vessel.vessel_name,
                    "start_port": v.start_port,
                    "end_port": v.end_port,
                    "start_time": v.start_time,
                    "end_time": v.end_time,
                    "status": v.status,
                }
                for v in voyages
            ]
            return Response(data, status=status.HTTP_200_OK)

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="voyages_export.csv"'
        writer = csv.writer(response)
        writer.writerow(["id", "vessel", "start_port", "end_port", "start_time", "end_time", "status"])
        for v in voyages:
            writer.writerow([v.id, v.vessel.vessel_name, v.start_port, v.end_port, v.start_time, v.end_time, v.status])
        return response