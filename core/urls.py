from django.contrib.auth.views import LogoutView
from django.contrib import admin
from django.urls import path, include
from apps.vessels.views import VesselList, vessel_map # Make sure both are here

urlpatterns = [
    path('accounts/', include('apps.authentication.urls')),
    path('admin/', admin.site.urls),
    path('api/vessels/', VesselList.as_view()),
    path('map/', vessel_map), # This adds the missing link
    path('logout/', LogoutView.as_view(), name='logout'),
]