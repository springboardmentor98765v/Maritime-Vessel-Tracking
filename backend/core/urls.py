from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.vessels.views import SafetyEventListView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('apps.authentication.urls')),
    path('vessels/', include('apps.vessels.urls')),
    path('ports/', include('apps.ports.urls')),
    path('notifications/', include('apps.notifications.urls')),
    path('voyages/', include('apps.voyages.urls')),
    # M3 safety overlay endpoint
    path('safety-events/', SafetyEventListView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
