from django.urls import path
from .views import ApiStatusView, LogsView, ExportVoyagesView

urlpatterns = [
    path('api-status/', ApiStatusView.as_view()),
    path('logs/', LogsView.as_view()),
    path('export/voyages/', ExportVoyagesView.as_view()),
]
