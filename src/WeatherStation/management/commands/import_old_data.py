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
            date = row[1]
            print(row)

            paris = pytz.timezone("Europe/Paris")
            date = paris.localize(date)
            date = date.astimezone(pytz.utc)
            #print(date)


            LongTermData.objects.create(time=date, temperature=row[3], humidity=row[4], pressure=row[5], average_wind_speed=row[6], max_wind_speed_10min=row[7], wind_direction=row[8], battery=row[10],)