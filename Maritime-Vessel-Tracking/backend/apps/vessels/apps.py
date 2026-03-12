from django.apps import AppConfig


class VesselsConfig(AppConfig):
    name = 'apps.vessels'

    def ready(self):
        import apps.vessels.signals  # noqa: F401
