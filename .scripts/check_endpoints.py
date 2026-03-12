import urllib.request
import urllib.error
import socket

backend = 'http://127.0.0.1:8000'
frontend_local = 'http://localhost:5173/'
frontend_network = 'http://10.25.71.32:5173/'

paths = [
    '/',
    '/admin/',
    '/auth/register/',
    '/auth/login/',
    '/auth/profile/me/',
    '/vessels/',
    '/vessels/subscriptions/',
    '/vessels/1/',
    '/vessels/1/position/',
    '/vessels/1/events/',
    '/vessels/1/subscribe/',
    '/ports/',
    '/ports/congestion/',
    '/ports/1/',
    '/notifications/',
    '/notifications/1/read/',
    '/voyages/',
    '/voyages/1/',
    '/voyages/1/replay/',
    '/safety-events/',
]

results = []

def fetch(url):
    try:
        with urllib.request.urlopen(url, timeout=5) as r:
            status = r.getcode()
            data = r.read(800).decode('utf-8', 'replace')
            return (status, data)
    except urllib.error.HTTPError as e:
        try:
            body = e.read(800).decode('utf-8', 'replace')
        except Exception:
            body = ''
        return (e.code, body or e.reason)
    except urllib.error.URLError as e:
        return (None, str(e))
    except socket.timeout:
        return (None, 'timeout')

for p in paths:
    url = backend.rstrip('/') + p
    status, body = fetch(url)
    results.append((url, status, body.replace('\n',' ')[:400]))

# frontend
for url in (frontend_local, frontend_network):
    status, body = fetch(url)
    results.append((url, status, body.replace('\n',' ')[:400]))

for url, status, snippet in results:
    print('URL:', url)
    print('Status:', status)
    if snippet:
        print('Snippet:', snippet)
    print('-' * 60)

print('Done')
