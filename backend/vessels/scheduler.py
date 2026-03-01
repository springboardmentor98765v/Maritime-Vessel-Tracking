from apscheduler.schedulers.background import BackgroundScheduler
from .services.vessel_updater import update_vessels

def start():
    scheduler = BackgroundScheduler()
    scheduler.add_job(update_vessels, 'interval', minutes=2)
    scheduler.start()