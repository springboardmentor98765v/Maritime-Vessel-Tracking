import requests
import sys

BASE_URL = "http://localhost:8000"

def test_subscribe(username, password):
    print(f"--- Testing Subscription for {username} ---")
    
    # 1. Login and get token
    login_url = f"{BASE_URL}/api/token/"
    print(f"Logging in at {login_url}...")
    
    response = requests.post(login_url, json={
        "username": username,
        "password": password
    })
    
    if response.status_code != 200:
        print(f"❌ Login Failed! Status: {response.status_code}")
        print(response.json())
        return
        
    token = response.json().get('access')
    print("✅ Login Successful! Got JWT Token.")
    
    # 2. Setup Headers with Token
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 3. Try Subscribing to Vessel ID 1
    subscribe_url = f"{BASE_URL}/tracking/vessels/1/subscribe/"
    print(f"\nSubscribing to {subscribe_url}...")
    
    sub_response = requests.post(subscribe_url, headers=headers)
    
    if sub_response.status_code == 201:
        print("✅ SUCCESS (201): Subscribed successfully!")
    elif sub_response.status_code == 400:
        print("✅ SUCCESS (400): Server prevented duplicate subscription (Already subscribed).")
    else:
        print(f"❌ FAILED: Unexpected status code {sub_response.status_code}")
        print(sub_response.text)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python test_subscribe.py <username> <password>")
        sys.exit(1)
        
    test_subscribe(sys.argv[1], sys.argv[2])
