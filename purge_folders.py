import os
import shutil

# THE ACTIVE PATH
BASE_DIR = r'c:\backend  milestone 3\backend (8) milestone 2\backend (2) milestone 2\backend (2) milestone 2\backend\backend'

def purge_legacy_folders():
    paths = [
        os.path.join(BASE_DIR, 'tracking'),
        os.path.join(BASE_DIR, 'apps', 'users'),
        os.path.join(BASE_DIR, 'apps', 'subscriptions'),
    ]
    
    for path in paths:
        if os.path.exists(path):
            try:
                shutil.rmtree(path)
                print(f"Deleted directory: {path}")
            except Exception as e:
                print(f"Failed to delete {path}: {e}")
        else:
            print(f"Directory not found: {path}")

purge_legacy_folders()
