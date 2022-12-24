from django.core.management.base import BaseCommand, CommandError
from Weather.models import LongTermData, ActualData, InsideActualData
import MySQLdb
import pytz
import bme680
import pigpio
from WeatherStation.management.commands import vw
from django.utils import timezone
import time

class Command(BaseCommand):
    help = "populate database with previous data"

    def handle(self, *args, **options):

        serial = 10001

        # config pigpio and virtualwire
        RX = 27
        BPS = 2000
        pi = pigpio.pi()
        rx = vw.rx(pi, RX, BPS)

        # config BME680
        sensor = bme680.BME680(bme680.I2C_ADDR_SECONDARY)

        sensor.set_humidity_oversample(bme680.OS_2X)
        sensor.set_pressure_oversample(bme680.OS_4X)
        sensor.set_temperature_oversample(bme680.OS_8X)
        sensor.set_filter(bme680.FILTER_SIZE_3)

        sensor.set_gas_status(bme680.ENABLE_GAS_MEAS)
        sensor.set_gas_heater_temperature(320)
        sensor.set_gas_heater_duration(150)
        sensor.select_gas_heater_profile(0)
        altitude = 720
        pressureCorection = altitude / 8.7

        # Set timer for saving data
        globalDataSaveTime = time.time() - 600
        ousideDataTime = time.time() - 1800

        # initialize Rainmeter
        mlPerTick = 5.5
        areaCm2 = 120
        rainPrecipitation = 0
        rainPrecipitationLastTime = 0

        # initialize max Wind Speed of last 10 minute (120x5s(sleeptime))
        numberOfData = 120
        windData = []
        currentIndex = 0
        for i in range(0, numberOfData):
            windData.append(0.0)

        # declaration of variable for data
        outTemperature = 0
        outHumidity = 0
        outAverageWindSpeed = 0
        outWindSpeed = 0
        outWindDirection = "NoData"
        outBattery = 0
        insideTemperature = 0
        insideHumidity = 0
        outData = False
        outsideDataReady = False

        inside = InsideActualData.objects.get(id=1)
        outside = ActualData.objects.get(id=1)

        try:
            while True:
                # BME680 measure (Inside Value)
                if sensor.get_sensor_data():
                    insideDataReady = True
                    insideTemperature = round(sensor.data.temperature, 1)
                    insideHumidity = sensor.data.humidity
                    seaLevelPressure = round(sensor.data.pressure + pressureCorection, 2)
                    print(sensor.data.temperature)
                    print(sensor.data.humidity)
                    print(seaLevelPressure)
                    actualInDataLastSendTime = time.time()
                else :
                    insideDataReady = False

                # Outside Value receive
                while rx.ready():
                    outsideDataReady = True
                    stringRecieveMsg = "".join(chr(c) for c in rx.get())
                    boardRecieveMsg = stringRecieveMsg.split()
                    msgPart0 = int(boardRecieveMsg[0])
                    if msgPart0 == serial:
                        print(boardRecieveMsg)
                        outTemperature = boardRecieveMsg[1]
                        outHumidity = boardRecieveMsg[2]
                        outRainPrecipitation = boardRecieveMsg[3]
                        outAverageWindSpeed = boardRecieveMsg[4]
                        outWindSpeed = boardRecieveMsg[5]
                        outWindDirection = boardRecieveMsg[6]
                        outBattery = boardRecieveMsg[7]
                        windData[currentIndex] = float(boardRecieveMsg[5])
                        currentIndex = (currentIndex + 1) % numberOfData
                        maxWind = 0.0
                        for i in range(0, numberOfData):
                            if windData[i] > maxWind:
                                maxWind = windData[i]
                        ousideDataTime = time.time()
                        print(maxWind)

                # Erase data if superior of 30 min
                if (time.time() - ousideDataTime) > 1800:
                    outsideDataRead = False

                if insideDataReady:
                    # Save actual value
                    inside.time = timezone.now()
                    inside.temperature = insideTemperature
                    inside.humidity = insideHumidity
                    inside.pressure = seaLevelPressure
                    inside.save()

                if outsideDataReady:
                    outside.time = timezone.now()
                    outside.temperature = outTemperature
                    outside.humidity = outHumidity
                    if insideDataReady:
                        outside.pressure = seaLevelPressure
                    outside.wind_speed = outWindSpeed
                    outside.average_wind_speed = outAverageWindSpeed
                    outside.max_wind_speed_10min = maxWind
                    outside.wind_direction = outWindDirection
                    outside.battery = outBattery
                    outside.save()

                # calcul for put around 10 minute
                shortDate = time.strftime("%M")
                shortDate = shortDate[1:]
                print(int(shortDate))

                # Long time Save Outside data (10 minute interval)
                if (time.time() - globalDataSaveTime) > 300 and int(shortDate) == 0:
                    updateTime = time.strftime("%Y-%m-%d %H:%M:%S")
                    long_term = LongTermData.objects.create(time=timezone.now())
                    if insideDataReady:
                        long_term.pressure = seaLevelPressure
                    if outsideDataReady:
                        outsideDataReady = False
                        # Calcul for rain precipitation
                        if int(outRainPrecipitation) < rainPrecipitationLastTime:
                            rainPrecipitation = 0
                            rainPrecipitationLastTime = 0
                        # precipitation = (number of tick - previous number of tick) * ((ml Per Tick(5.5ml) / 1000(for convert to liter)) / (area cm²(80cm²) / 10000(for m²)))
                        rainPrecipitation = (int(outRainPrecipitation) - rainPrecipitationLastTime)*((mlPerTick / 1000) / (areaCm2 / 10000))
                        rainPrecipitationLastTime = int(outRainPrecipitation)

                        long_term.temperature = outTemperature
                        long_term.humidity = outHumidity
                        long_term.average_wind_speed = outAverageWindSpeed
                        long_term.max_wind_speed_10min = maxWind
                        long_term.wind_direction = outWindDirection
                        long_term.battery = outBattery
                    long_term.save()
                    globalDataSaveTime = time.time()
                    print("save all data")

                time.sleep(5)
        except KeyboardInterrupt:
            print('interrupted!')


        time.sleep(5)

