import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = 'vv'
password = 'veerababu'

user, created = User.objects.get_or_create(username=username)
user.set_password(password)
user.is_superuser = True
user.is_staff = True
user.save()

if created:
    print(f"Superuser '{username}' created successfully.")
else:
    print(f"Superuser '{username}' updated successfully.")
