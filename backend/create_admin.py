import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from authentication.models import User

user, created = User.objects.get_or_create(username='subadmin')
user.set_password('Password123!')
user.role = 'admin'
user.save()
print("Admin created")
