#!/usr/bin/env python
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Try to get existing user or create new one
user, created = User.objects.get_or_create(
    username='v',
    defaults={
        'email': 'v@test.com',
        'is_staff': True,
        'is_superuser': True
    }
)

# Set password
user.set_password('veerababu')
user.is_staff = True
user.is_superuser = True
user.save()

print("✓ Superuser 'v' configured successfully!")
print(f"  Username: v")
print(f"  Password: veerababu")
print(f"  Email: {user.email}")
print(f"  Admin URL: http://localhost:8000/admin/")
