import os
import django
import random
import math
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from vessels.models import Vessel, VesselEvent
from voyages.models import Voyage, VoyageHistory

# A rough path around the Indian coast that strictly stays in the water
WAYPOINTS = [
    (22.0, 68.0), # near Gujarat
    (18.0, 71.0), # near Mumbai
    (15.0, 73.0), # near Goa
    (11.0, 75.0), # near Kozhikode
    (8.0, 76.5),  # near Trivandrum
    (5.5, 78.0),  # south of India
    (5.5, 81.0),  # south of Sri Lanka
    (9.0, 82.0),  # east of Sri Lanka
    (13.0, 81.0), # near Chennai
    (17.0, 84.0), # near Visakhapatnam
    (21.0, 88.0), # near Kolkata
]

def get_distance(p1, p2):
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def generate_voyage_data():
    vessels = Vessel.objects.all()
    print("Clearing old dummy voyages to ensure clean water-paths...")
    Voyage.objects.all().delete()
    
    print(f"Generating new valid ocean voyages for {len(vessels)} vessels...")
    
    for vessel in vessels:
        start_time = datetime.now() - timedelta(days=5)
        is_completed = random.choice([True, False])
        end_time = start_time + timedelta(hours=20*6) if is_completed else None
        
        # Start matching closest waypoint
        vessel_pos = (float(vessel.latitude), float(vessel.longitude))
        closest_idx = min(range(len(WAYPOINTS)), key=lambda i: get_distance(vessel_pos, WAYPOINTS[i]))
        
        # Determine movement direction along path
        direction = random.choice([1, -1])
        if closest_idx == 0: direction = 1
        if closest_idx == len(WAYPOINTS) - 1: direction = -1
        
        # Build path to sample points from
        path = [vessel_pos]
        curr_idx = closest_idx
        for _ in range(5): # grab next few waypoints to define trajectory
            path.append(WAYPOINTS[curr_idx])
            curr_idx += direction
            if curr_idx < 0 or curr_idx >= len(WAYPOINTS):
                break
                
        # Calculate total path length
        total_len = sum(get_distance(path[i], path[i+1]) for i in range(len(path)-1))
        
        # We need 20 points
        num_points = 20
        step = total_len / max(1, (num_points - 1))
        
        sampled_points = []
        curr_dist = 0
        path_idx = 0
        dist_on_segment = 0
        
        for i in range(num_points):
            if i == 0:
                sampled_points.append(path[0])
                continue
            if i == num_points - 1:
                sampled_points.append(path[-1])
                continue
                
            target_dist = i * step
            
            # traverse to the right segment
            while path_idx < len(path)-1:
                seg_len = get_distance(path[path_idx], path[path_idx+1])
                if dist_on_segment + seg_len >= target_dist or path_idx == len(path)-2:
                    # interpolate
                    ratio = min((target_dist - dist_on_segment) / max(seg_len, 0.0001), 1.0)
                    lat = path[path_idx][0] + ratio * (path[path_idx+1][0] - path[path_idx][0])
                    lon = path[path_idx][1] + ratio * (path[path_idx+1][1] - path[path_idx][1])
                    # Add tiny jitter for realism but not too much to land on land
                    lat += random.uniform(-0.1, 0.1)
                    lon += random.uniform(-0.1, 0.1)
                    sampled_points.append((lat, lon))
                    break
                else:
                    dist_on_segment += seg_len
                    path_idx += 1
        
        # Ensure we have exactly 20 points (fallback if precision issues)
        while len(sampled_points) < 20:
            sampled_points.append(sampled_points[-1])
            
        voyage = Voyage.objects.create(
            vessel=vessel,
            start_port="Port A",
            end_port="Port B",
            start_time=start_time,
            end_time=end_time,
            status="COMPLETED" if is_completed else "ONGOING"
        )
        
        for i in range(20):
            pt_time = start_time + timedelta(hours=i*6)
            VoyageHistory.objects.create(
                voyage=voyage,
                latitude=sampled_points[i][0],
                longitude=sampled_points[i][1],
            )
            last_pt = VoyageHistory.objects.last()
            last_pt.timestamp = pt_time
            last_pt.save(update_fields=['timestamp'])
            
            # Add a random event sometimes
            if random.random() < 0.2:
                event = VesselEvent.objects.create(
                    vessel=vessel,
                    event_type=random.choice(["Storm Warning", "Piracy Risk", "Congestion Alert", "Routine Check"]),
                    latitude=sampled_points[i][0],
                    longitude=sampled_points[i][1],
                    details="Autogenerated event for replay testing"
                )
                event.timestamp = pt_time
                event.save(update_fields=['timestamp'])
                
        print(f"Generated ocean voyage and history for {vessel.vessel_name}")

if __name__ == '__main__':
    generate_voyage_data()
    print("Done generating voyage data.")
