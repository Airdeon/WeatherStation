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
pressureCorection = altitude / 8.6

# Set timer for saving data
outsideDataLastSendTime = time.time() - 600
actualOutDataLastSendTime = time.time() - 30
actualInDataLastSendTime = time.time() - 30
pressureSendLastTime = time.time() - 1800
rainPrecipitationLastSendTime = time.time() - 1800

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


WeatherDataBase = mysql.connector.connect(host="localhost", user="weather", password="weatheraspremont", database="WeatherDataBase")
cursor = WeatherDataBase.cursor()
print("En attente de la reception des donnees")

try:
    while True:
        # BME680 measure and save (Inside Value)
        if sensor.get_sensor_data():
            if (time.time() - actualInDataLastSendTime) > 30:
                temperatureBME680 = round(sensor.data.temperature, 1)
                humidityBME680 = sensor.data.humidity
                seaLevelPressure = sensor.data.pressure + pressureCorection
                cursor.execute("UPDATE IN_Actual_Data SET data_DateTime = %s, temperature = %s, humidity = %s WHERE id = 1", (time.strftime("%Y-%m-%d %H:%M:%S"), temperatureBME680, humidityBME680))
                WeatherDataBase.commit()
                print(sensor.data.temperature)
                print(sensor.data.humidity)
                print(seaLevelPressure)
                actualInDataLastSendTime = time.time()

        # Outside Value receive
        while rx.ready():
            stringRecieveMsg = "".join(chr(c) for c in rx.get())
            boardRecieveMsg = stringRecieveMsg.split()
            msgPart0 = int(boardRecieveMsg[0])
            if msgPart0 == serial:
                print(time.strftime("%Y-%m-%d %H:%M:%S"))
                print(boardRecieveMsg)
                windData[currentIndex] = float(boardRecieveMsg[5])
                currentIndex = (currentIndex + 1) % numberOfData
                maxWind = 0.0
                for i in range(0, numberOfData):
                    if windData[i] > maxWind:
                        maxWind = windData[i]
                # Save Actual Outside Value (5 seconde interval)
                if (time.time() - actualOutDataLastSendTime) > 5:
                    cursor.execute("UPDATE Actual_Data SET data_DateTime = %s, temperature = %s, humidity = %s, pressure = %s, averageWindSpeed = %s, windSpeed = %s, maxWindSpeed10Min = %s, windDirection = %s, battery = %s WHERE id = 1", (time.strftime("%Y-%m-%d %H:%M:%S"), boardRecieveMsg[1], boardRecieveMsg[2], seaLevelPressure, boardRecieveMsg[4], boardRecieveMsg[5], maxWind, boardRecieveMsg[6], boardRecieveMsg[7]))
                    WeatherDataBase.commit()
                    print("send actual value")
                    actualOutDataLastSendTime = time.time()
                # Long time Save Outside data (10 minute interval)
                if (time.time() - outsideDataLastSendTime) > 600:
                    print("send all data to Database")
                    cursor.execute("INSERT INTO Global_Data (id, data_DateTime, UTCDateTime, temperature, humidity, pressure, windSpeed, maxWindSpeed, windDirection, battery) VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s)", (time.strftime("%Y-%m-%d %H:%M:%S"), datetime.utcnow(), boardRecieveMsg[1], boardRecieveMsg[2], seaLevelPressure, boardRecieveMsg[4], maxWind, boardRecieveMsg[6], boardRecieveMsg[7]))  # global data
                    WeatherDataBase.commit()
                    outsideDataLastSendTime = time.time()
                # precipitation save (30 minute interval)
                if (time.time() - rainPrecipitationLastSendTime) > 1800:
                    if int(boardRecieveMsg[3]) < rainPrecipitationLastTime:
                        rainPrecipitation = 0
                        rainPrecipitationLastTime = 0
                    # precipitation = (number of tick - previous number of tick) * ((ml Per Tick(5.5ml) / 1000(for convert to liter)) / (area cm²(80cm²) / 10000(for m²)))
                    rainPrecipitation = (int(boardRecieveMsg[3]) - rainPrecipitationLastTime)*((mlPerTick / 1000) / (areaCm2 / 10000))
                    rainPrecipitationLastTime = int(boardRecieveMsg[3])
                    print("send rain precipitation for database")
                    cursor.execute("INSERT INTO `OUT_rainMeter` (`id`, `rainPrecipitation`, `entryDate`) VALUES (NULL, %s, %s)", (rainPrecipitation, time.strftime("%Y-%m-%d %H:%M:%S")))  # rainPrecipitation
                    WeatherDataBase.commit()
                    rainPrecipitationLastSendTime = time.time()

        time.sleep(15)
except KeyboardInterrupt:
    print('interrupted!')

WeatherDataBase.close()
rx.cancel()

pi.stop()
