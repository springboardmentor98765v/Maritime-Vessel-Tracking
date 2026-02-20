# Minimal stub for PIL.Image used only to satisfy Django system checks in tests
class Image:
    @staticmethod
    def open(fp):
        raise RuntimeError("PIL Image open not supported in test stub")
