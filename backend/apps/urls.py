from rest_framework.routers import DefaultRouter
from .views import VoyageViewSet, VoyageHistoryViewSet

router = DefaultRouter()
router.register(r"", VoyageViewSet, basename="voyage")
router.register(r"history", VoyageHistoryViewSet, basename="voyage-history")

urlpatterns = router.urls