from rest_framework import serializers
from .models import LongTermData

class LongTermDataSerializer(serializers.ModelSerializer):

    class Meta:
        model = LongTermData
        fields = [
            "id",
            "time",
            "temperature",
            "humidity",
            "pressure",
            "wind_speed",
            "average_wind_speed",
            "max_wind_speed_10min",
            "wind_direction",
            "battery",
        ]