from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification, Event, Subscription
from .serializers import NotificationSerializer, EventSerializer, SubscriptionSerializer
from rest_framework.decorators import action

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError

class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        vessel_id = request.data.get("vessel")
        user = request.user

        # ✅ check duplicate BEFORE serializer
        if Subscription.objects.filter(user=user, vessel_id=vessel_id).exists():
            return Response(
                {"detail": "Already subscribed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        subscription = serializer.save(user=user)

        # ✅ create notification
        Notification.objects.create(
            user=user,
            vessel=subscription.vessel,
            message=f"Subscribed to {subscription.vessel.name}",
            type="info"
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

from rest_framework.permissions import IsAuthenticated

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        

        if notification.user != request.user:
            return Response({"error": "Not allowed"}, status=403)

        notification.is_read = True
        notification.save()

        return Response({"status": "marked as read"})
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "all marked as read"})
