from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from apps.authentication.models import User
from apps.vessels.models import Vessel, VesselEvent, VesselSubscription
from apps.vessels.services import process_vessel_update
from apps.notifications.models import Notification

class VesselAndEventTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', 
            password='testpassword',
            email='test@example.com'
        )
        self.vessel1 = Vessel.objects.create(
            imo_number='1234567',
            name='Test Ship Alpha',
            vessel_type='Container',
            flag='Panama',
            cargo_type='General',
            last_position_lat=10.0,
            last_position_lon=20.0,
            speed=15.0,
            heading=90.0,
            destination='Tokyo'
        )
        self.vessel2 = Vessel.objects.create(
            imo_number='9876543',
            name='Test Ship Beta',
            vessel_type='Tanker',
            flag='Liberia',
            cargo_type='Oil',
            last_position_lat=5.0,
            last_position_lon=5.0,
            speed=0.0,
            heading=0.0,
            destination='Singapore'
        )
        # Create a subscription for user -> vessel1
        VesselSubscription.objects.create(user=self.user, vessel=self.vessel1)

    def test_vessel_list_api(self):
        """Test GET /vessels/ returns all vessels and allows filtering."""
        response = self.client.get('/vessels/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # Test filtering by type
        response = self.client.get('/vessels/?type=Container')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Ship Alpha')

    def test_vessel_detail_api(self):
        """Test GET /vessels/<id>/ returns single vessel."""
        response = self.client.get(f'/vessels/{self.vessel1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['imo_number'], '1234567')

    def test_event_detection_speed_stopped(self):
        """Test process_vessel_update triggers 'Stopped' event when speed > 0 drops to 0."""
        update_data = {
            "imo": "1234567",
            "lat": 10.1,
            "lon": 20.1,
            "speed": 0.0, # Alpha was 15.0, now 0.0
            "heading": 90,
            "destination": "Tokyo"
        }
        process_vessel_update(update_data)
        
        # Check that Vessel was updated
        self.vessel1.refresh_from_db()
        self.assertEqual(self.vessel1.speed, 0.0)

        # Check that Event was created
        events = VesselEvent.objects.filter(vessel=self.vessel1).order_by('-timestamp')
        self.assertTrue(events.exists())
        self.assertEqual(events.first().event_type, "stopped")

        # Check that Notification was dispatched via Signal
        notifs = Notification.objects.filter(user=self.user, vessel=self.vessel1)
        self.assertTrue(notifs.exists())
        self.assertIn("stopped", notifs.first().message)

    def test_event_detection_route_changed(self):
        """Test process_vessel_update triggers 'Route Changed' when destination changes."""
        update_data = {
            "imo": "9876543",
            "lat": 5.1,
            "lon": 5.1,
            "speed": 12.0, # Beta was 0.0, now 12.0
            "heading": 45,
            "destination": "Shanghai" # Beta was Singapore
        }
        process_vessel_update(update_data)
        
        # Check that Event was created
        events = VesselEvent.objects.filter(vessel=self.vessel2).order_by('-timestamp')
        self.assertTrue(events.exists())
        
        # We should get 2 events: 'underway' and 'route_changed'
        event_types = [e.event_type for e in events]
        self.assertIn("underway", event_types)
        self.assertIn("route_changed", event_types)

class SubscriptionAndNotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', 
            password='testpassword',
            email='test@example.com'
        )
        self.vessel = Vessel.objects.create(
            imo_number='8888888',
            name='Subscribe Test Ship',
            vessel_type='Bulk Carrier',
            flag='',
            cargo_type='',
        )
        
        # Authenticate client directly
        self.client.force_authenticate(user=self.user)

    def test_subscribe_vessel(self):
        """Test POST /vessels/<id>/subscribe/ works."""
        url = f'/vessels/{self.vessel.id}/subscribe/'
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(VesselSubscription.objects.filter(user=self.user, vessel=self.vessel).exists())

        # Test duplicate subscription returns 200 OK (already subbed)
        response2 = self.client.post(url)
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        # Verify no duplicate entry
        self.assertEqual(VesselSubscription.objects.filter(user=self.user, vessel=self.vessel).count(), 1)

    def test_unsubscribe_vessel(self):
        """Test DELETE /vessels/<id>/subscribe/ works."""
        VesselSubscription.objects.create(user=self.user, vessel=self.vessel)
        url = f'/vessels/{self.vessel.id}/subscribe/'
        
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(VesselSubscription.objects.filter(user=self.user, vessel=self.vessel).exists())

    def test_notification_apis(self):
        """Test GET /notifications/ and PATCH mark-read."""
        # Create a notification manually
        notif = Notification.objects.create(
            user=self.user,
            vessel=self.vessel,
            message="Test notification",
            type="TestEvent"
        )

        response = self.client.get('/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertFalse(response.data[0]['is_read'])

        # Mark read
        url = f'/notifications/{notif.id}/read/'
        read_response = self.client.patch(url)
        self.assertEqual(read_response.status_code, status.HTTP_200_OK)
        
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)
