#!/bin/bash

sleep 20
cd /var/www/weatherhome/WeatherStation/src
. env/bin/activate
sudo pigpiod
python manage.py import_data
