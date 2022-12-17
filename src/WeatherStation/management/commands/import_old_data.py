from django.core.management.base import BaseCommand, CommandError
from Weather.models import LongTermData
import MySQLdb
import pytz


class Command(BaseCommand):
    help = "populate database with previous data"

    def handle(self, *args, **options):
        db = MySQLdb.connect("localhost", "c1weatherstation", "W4fYizE_", "c1WeatherDataBase")
        cursor = db.cursor()
        sql1 = "SELECT * FROM Global_Data;"

        try:
            cursor.execute(sql1)
            results = cursor.fetchall()
        except:
            print("error")

        for row in results:
            new_param_list = []
            date = row[4]
            paris = pytz.timezone("Europe/Paris")
            date = paris.localize(date)
            date = date.astimezone(pytz.utc)

            LongTermData.objects.create(time=date, temperature=, humidity=, pressure=, average_wind_speed=, max_wind_speed_10min=, wind_direction=, battery=,)