from django.db import models
from django.utils import timezone

class InsideActualData(models.Model):
    time = models.DateTimeField(verbose_name="date")
    temperature = models.FloatField(verbose_name="Temperature")
    humidity = models.SmallIntegerField(verbose_name="Humidité")
    pressure = models.FloatField(verbose_name="Pression")

# Create your models here.
class ActualData(models.Model):
    time = models.DateTimeField(verbose_name="date")
    temperature = models.FloatField(verbose_name="Temperature")
    humidity = models.SmallIntegerField(verbose_name="Humidité")
    pressure = models.FloatField(verbose_name="Pression")
    wind_speed = models.FloatField(verbose_name="Vitesse actuel du vent")
    average_wind_speed = models.FloatField(verbose_name="Vitesse moyenne du vent")
    max_wind_speed_10min = models.FloatField(verbose_name="Vitesse maximum du vent sur 10 min")
    wind_direction = models.CharField(max_length=10, verbose_name="Direction du vent")
    battery = models.SmallIntegerField(verbose_name="battery")

class LongTermData(models.Model):
    time = models.DateTimeField(default=timezone.now, verbose_name="date")
    temperature = models.FloatField(null=True, blank=True, verbose_name="Temperature")
    humidity = models.SmallIntegerField(null=True, blank=True, verbose_name="Humidité")
    pressure = models.FloatField(null=True, blank=True, verbose_name="Pression")
    average_wind_speed = models.FloatField(null=True, blank=True, verbose_name="Vitesse moyenne du vent")
    max_wind_speed_10min = models.FloatField(null=True, blank=True, verbose_name="Vitesse maximum du vent sur 10 min")
    wind_direction = models.CharField(null=True, blank=True, max_length=10, verbose_name="Direction du vent")
    battery = models.SmallIntegerField(null=True, blank=True, verbose_name="battery")
