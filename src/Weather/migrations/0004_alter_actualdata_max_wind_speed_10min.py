# Generated by Django 4.1.4 on 2022-12-17 15:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Weather", "0003_alter_longtermdata_max_wind_speed_10min"),
    ]

    operations = [
        migrations.AlterField(
            model_name="actualdata",
            name="max_wind_speed_10min",
            field=models.FloatField(verbose_name="Vitesse maximum du vent sur 10 min"),
        ),
    ]
