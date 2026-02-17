import os
import django
from django.test import Client

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "maritime_backend.settings")
django.setup()

from django.urls import reverse

def test_registration_page():
    client = Client()
    
    # Test 1: Check if Registration URL exists
    try:
        url = reverse('register')
        print(f"SUCCESS: Registration URL reversed to: {url}")
    except Exception as e:
        print(f"FAILURE: Could not reverse 'register' URL. Error: {e}")
        return

    # Test 2: Access Registration Page
    response = client.get(url)
    if response.status_code == 200:
        print("SUCCESS: Registration page returned 200 OK")
    else:
        print(f"FAILURE: Registration page returned {response.status_code}")

    # Test 3: Check Admin Login Page for Register Link
    admin_login_url = reverse('admin:login')
    response = client.get(admin_login_url)
    if response.status_code == 200:
        if b'Register New User' in response.content:
            print("SUCCESS: Admin login page contains 'Register New User' link")
        else:
            print("FAILURE: Admin login page does NOT contain 'Register New User' link")
    else:
        print(f"FAILURE: Admin login page returned {response.status_code}")

if __name__ == '__main__':
    test_registration_page()
