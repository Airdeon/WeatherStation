# -*- coding: utf-8 -*-
import time
from datetime import datetime
import mysql.connector
import bme680
import pigpio
import vw

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
areaCm2 = 80
rainPrecipitation = 0
rainPrecipitationLastTime = 0

# initialize max Wind Speed of last 10 minute
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

WeatherDataBase = mysql.connector.connect(host="localhost", user="c1weatherstation", password="W4fYizE_", database="c1WeatherDataBase")
cursor = WeatherDataBase.cursor()
print("En attente de la reception des donnees")

try:
    while True:
        print(time.strftime("%Y-%m-%d %H:%M:%S"))
        # BME680 measure (Inside Value)
        if sensor.get_sensor_data():
            insideDataReady = True
            insideTemperature = round(sensor.data.temperature, 1)
            insideHumidity = sensor.data.humidity
            seaLevelPressure = sensor.data.pressure + pressureCorection
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

        # Erase data if superior of 30 min
        if (time.time() - ousideDataTime) > 1800:
            outsideDataRead = False

        # Save Actual Outside Value (5 seconde interval (cycle))
        change = False
        if insideDataReady:
            change = True
            cursor.execute("UPDATE Actual_Data SET IN_DateTime = %s, IN_Temperature = %s, IN_Humidity = %s, pressure = %s WHERE id = 1", (time.strftime("%Y-%m-%d %H:%M:%S"), insideTemperature, insideHumidity, seaLevelPressure))
        if outsideDataReady:
            change = True
            cursor.execute("UPDATE Actual_Data SET OUT_DateTime = %s, OUT_Temperature = %s, OUT_Humidity = %s, averageWindSpeed = %s, windSpeed = %s, maxWindSpeed10Min = %s, windDirection = %s, battery = %s WHERE id = 1", (time.strftime("%Y-%m-%d %H:%M:%S"), outTemperature, outHumidity, outAverageWindSpeed, outWindSpeed, maxWind, outWindDirection, outBattery))
        if change:
            WeatherDataBase.commit()
            print("save actual value")

        # calcul for put around 10 minute
        shortDate = time.strftime("%M")
        shortDate = shortDate[1:]
        print(int(shortDate))

        # Long time Save Outside data (10 minute interval)
        if (time.time() - globalDataSaveTime) > 300 and int(shortDate) == 0:
            updateTime = time.strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("INSERT INTO Global_Data (id, data_DateTime, UTCDateTime) VALUES (NULL, %s, %s)", (updateTime, datetime.utcnow()))
            if insideDataReady:
                cursor.execute("UPDATE Global_Data SET pressure = %s WHERE data_DateTime = %s", (seaLevelPressure, updateTime))
            if outsideDataReady :
                outsideDataReady = False
                # Calcul for rain precipitation
                if int(outRainPrecipitation) < rainPrecipitationLastTime:
                    rainPrecipitation = 0
                    rainPrecipitationLastTime = 0
                # precipitation = (number of tick - previous number of tick) * ((ml Per Tick(5.5ml) / 1000(for convert to liter)) / (area cm²(80cm²) / 10000(for m²)))
                rainPrecipitation = (int(outRainPrecipitation) - rainPrecipitationLastTime)*((mlPerTick / 1000) / (areaCm2 / 10000))
                rainPrecipitationLastTime = int(outRainPrecipitation)
                cursor.execute("UPDATE Global_Data SET temperature = %s, humidity = %s, windSpeed = %s, maxWindSpeed = %s, windDirection = %s, precipitation = %s, battery = %s WHERE data_DateTime = %s", (outTemperature, outHumidity, outWindSpeed, maxWind, outWindDirection, rainPrecipitation, outBattery, updateTime))
            WeatherDataBase.commit()
            globalDataSaveTime = time.time()
            print("save all data")

        time.sleep(5)
except KeyboardInterrupt:
    print('interrupted!')

WeatherDataBase.close()
rx.cancel()

pi.stop()
