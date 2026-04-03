from django.contrib import admin
from django.urls import path, include
from django.contrib.auth.views import LogoutView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from apps.authentication.views import MeAPIView
from apps.vessels.views import vessel_map
urlpatterns = [
    # Admin and Auth
    path('admin/', admin.site.urls),
    path("api/dashboard/", include("apps.dashboard.urls")),
    path('api/admin/', include('apps.admin.urls')),
    path('accounts/', include('apps.authentication.urls')),
    path('logout/', LogoutView.as_view(), name='logout'),
    # API endpoints
    path('api/me/', MeAPIView.as_view(), name='me'),
    path('api/vessels/', include('apps.vessels.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/ports/', include('apps.ports.urls')),
    path('api/safety/', include('apps.safety.urls')),
    path('api/voyage/', include('apps.voyages.urls')),
    # JWT tokens
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 
    # UI endpoints
    path('map/', vessel_map, name='vessel_map'),
]
