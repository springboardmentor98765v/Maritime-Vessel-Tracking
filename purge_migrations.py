import os
import glob

migration_dir = r'c:\backend (2) milestone 2\backend (2) milestone 2\backend (2) milestone 2\backend\backend\apps\notifications\migrations'
files = glob.glob(os.path.join(migration_dir, '0*.py'))

for f in files:
    try:
        os.remove(f)
        print(f"Deleted: {f}")
    except Exception as e:
        print(f"Failed to delete {f}: {e}")
