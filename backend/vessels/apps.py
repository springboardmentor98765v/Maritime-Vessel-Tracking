from django.apps import AppConfig

class VesselsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'vessels'

    def ready(self):
        from .scheduler import start
        start()