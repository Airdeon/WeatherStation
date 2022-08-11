from django.core.management.base import BaseCommand, CommandError
from Weather.models import LongTermData, ActualData, InsideActualData
import MySQLdb
import pytz
from datetime import datetime


class Command(BaseCommand):
    help = "populate database with previous data"

    def handle(self, *args, **options):
        LongTermData.objects.create(
            time=datetime.utcnow(),
            temperature=24.5,
            humidity=30,
            pressure=1025.2,
            average_wind_speed=5,
            max_wind_speed_10min=24,
            wind_direction="W",
            battery=34,
        )
        LongTermData.objects.create(
            time=datetime.utcnow(),
            temperature=22.2,
            humidity=32,
            pressure=1024.2,
            average_wind_speed=6,
            max_wind_speed_10min=20,
            wind_direction="E",
            battery=32,
        )
        ActualData.objects.create(
            time=datetime.utcnow(),
            temperature=24.6,
            humidity=45,
            pressure=1027.1,
            wind_speed=12.5,
            average_wind_speed=7,
            max_wind_speed_10min=20,
            wind_direction="E",
            battery=32,
        )
        InsideActualData.objects.create(time=datetime.utcnow(), temperature=21.6, humidity=41, pressure=1025.1)
