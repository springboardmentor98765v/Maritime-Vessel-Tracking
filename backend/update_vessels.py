import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from vessels.models import Vessel

# List of 100 vessel names
vessel_names = [
    "Ever Given", "Maersk Alabama", "Costa Concordia", "Titanic", "Queen Mary",
    "USS Enterprise", "HMS Victory", "Black Pearl", "Flying Dutchman", "Santa Maria",
    "Pinta", "Niña", "Mayflower", "Beagle", "Endeavour",
    "Golden Hind", "Cutty Sark", "Tea Clipper", "SS Great Britain", "RMS Lusitania",
    "SS Normandie", "Queen Elizabeth", "QE2", "Freedom of the Seas", "Oasis of the Seas",
    "Allure of the Seas", "Harmony of the Seas", "Symphony of the Seas", "Wonder of the Seas", "Explorer of the Seas",
    "Voyager of the Seas", "Navigator of the Seas", "Mariner of the Seas", "Radiance of the Seas", "Brilliance of the Seas",
    "Jewel of the Seas", "Serena of the Seas", "Legend of the Seas", "Splendour of the Seas", "Enchantment of the Seas",
    "Grandeur of the Seas", "Rhapsody of the Seas", "Vision of the Seas", "Adventure of the Seas", "Galaxy of the Seas",
    "Star of the Seas", "Century of the Seas", "Millennium of the Seas", "Sovereign of the Seas", "Majesty of the Seas",
    "Monarch of the Seas", "Crown of the Seas", "Empress of the Seas", "Viking of the Seas", "Conquest of the Seas",
    "Liberty of the Seas", "Independence of the Seas", "Pride of the Seas", "Spirit of the Seas", "Summit of the Seas",
    "Horizon of the Seas", "Ovation of the Seas", "Quantum of the Seas", "Anthem of the Seas", "Spectrum of the Seas",
    "Ovation of the Seas", "Celebrity Summit", "Celebrity Millennium", "Celebrity Constellation", "Celebrity Infinity",
    "Celebrity Solstice", "Celebrity Equinox", "Celebrity Eclipse", "Celebrity Silhouette", "Celebrity Reflection",
    "Celebrity Edge", "Celebrity Apex", "Celebrity Beyond", "Norwegian Sky", "Norwegian Sun",
    "Norwegian Dawn", "Norwegian Star", "Norwegian Jewel", "Norwegian Pearl", "Norwegian Gem",
    "Norwegian Jade", "Norwegian Epic", "Norwegian Breakaway", "Norwegian Getaway", "Norwegian Bliss",
    "Norwegian Encore", "MSC Seaside", "MSC Seaview", "MSC Meraviglia", "MSC Bellissima",
    "MSC Grandiosa", "MSC Virtuosa", "MSC Magnifica", "MSC Preziosa", "MSC Splendida"
]

# Get all vessels ordered by id
vessels = Vessel.objects.all().order_by('id')

# Update names
for i, vessel in enumerate(vessels):
    if i < len(vessel_names):
        vessel.vessel_name = vessel_names[i]
        vessel.save()
        print(f'Updated vessel {vessel.id} to: {vessel.vessel_name}')
    else:
        print(f'No more names for vessel {vessel.id}')

print('Finished updating vessel names.')