# Generated by Django 4.1.4 on 2022-12-12 18:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Weather", "0002_remove_longtermdata_wind_speed"),
    ]

    operations = [
        migrations.AlterField(
            model_name="longtermdata",
            name="max_wind_speed_10min",
            field=models.FloatField(verbose_name="Vitesse maximum du vent sur 10 min"),
        ),
    ]
