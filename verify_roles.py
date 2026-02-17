import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "maritime_backend.settings")
django.setup()

from django.contrib.auth.models import Group, Permission

def verify_roles():
    roles = ['Operator', 'Analyst', 'Admin']
    for role in roles:
        try:
            group = Group.objects.get(name=role)
            perms = group.permissions.all()
            print(f"Role: {role}")
            for p in perms:
                print(f"  - {p.codename}")
        except Group.DoesNotExist:
            print(f"Role: {role} - DOES NOT EXIST")

if __name__ == '__main__':
    verify_roles()
