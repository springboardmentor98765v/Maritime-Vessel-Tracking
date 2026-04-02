import os
import sys
import django

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
import json

User = get_user_model()
client = Client()

user = User.objects.first()
if user:
    client.force_login(user)

for vid in range(1, 10):
    response = client.get(f'/api/voyage/{vid}/history/')
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"Vessel {vid} history points: {len(data)}")
    else:
        print(f"Vessel {vid} Error: {response.status_code} - {response.content}")
