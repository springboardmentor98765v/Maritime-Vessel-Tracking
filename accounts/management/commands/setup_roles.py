from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from vessels.models import Vessel

class Command(BaseCommand):
    help = 'Creates default groups and permissions'

    def handle(self, *args, **options):
        # Define roles and permissions
        roles = {
            'Operator': ['add_vessel', 'change_vessel', 'delete_vessel', 'view_vessel'],
            'Analyst': ['view_vessel'],
            'Admin': ['add_vessel', 'change_vessel', 'delete_vessel', 'view_vessel', 'add_user', 'change_user', 'delete_user', 'view_user'] # Admin has more but focus on vessels for now
        }

        for role_name, permissions in roles.items():
            group, created = Group.objects.get_or_create(name=role_name)
            if created:
                self.stdout.write(f'Created group {role_name}')
            else:
                self.stdout.write(f'Group {role_name} already exists')

            # Assign permissions
            for perm_codename in permissions:
                try:
                    # We assume these are mostly Vessel permissions for now
                    if 'user' in perm_codename:
                         content_type = ContentType.objects.get(app_label='auth', model='user')
                    else:
                         content_type = ContentType.objects.get_for_model(Vessel)
                    
                    permission = Permission.objects.get(codename=perm_codename, content_type=content_type)
                    group.permissions.add(permission)
                    self.stdout.write(f'  Added {perm_codename} to {role_name}')
                except Permission.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f'  Permission {perm_codename} not found'))
                except Exception as e:
                     self.stdout.write(self.style.ERROR(f'  Error adding {perm_codename}: {e}'))

        self.stdout.write(self.style.SUCCESS('Successfully configured roles and permissions'))
