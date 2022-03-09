#!/bin/bash

sleep 20
cd /home/pi/WeatherStation/
sudo -u pi screen -dmS weatherStation -L -Logfile weather.log python3 weatherStationV2.py
