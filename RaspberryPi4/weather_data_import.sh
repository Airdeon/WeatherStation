#!/bin/bash

sleep 20
cd /var/www/weatherhome/WeatherStation/src
. env/bin/activate
python manage.py import_data
