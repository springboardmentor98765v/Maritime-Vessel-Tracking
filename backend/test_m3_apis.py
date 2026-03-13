import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client

client = Client()

print("--- Testing /ports/analytics/ ---")
r1 = client.get('/ports/analytics/')
print(f"Status: {r1.status_code}")
if r1.status_code == 200:
    print(r1.json())
else:
    print(r1.content)

print("\n--- Testing /vessels/safety/zones/ ---")
r2 = client.get('/vessels/safety/zones/')
print(f"Status: {r2.status_code}")
if r2.status_code == 200:
    print(r2.json())
else:
    print(r2.content)

print("\n--- Testing /vessels/safety/alerts/ ---")
r3 = client.get('/vessels/safety/alerts/')
print(f"Status: {r3.status_code}")
if r3.status_code == 200:
    print(r3.json()[:2]) # print just first two
else:
    print(r3.content)
