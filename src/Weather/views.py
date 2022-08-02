from django.views.generic import TemplateView
from django.shortcuts import render
from django.http import JsonResponse
import json
import requests

# Create your views here.
class Index(TemplateView):
    template_name = "Weather/WeatherStation.html"

def get_forcast(request):
    response = requests.get("https://api.openweathermap.org/data/2.5/onecall?lat=44.491626&lon=5.729331&units=metric&lang=fr&appid=f39953152da1fcc995e067622dc228f5")
    #"https://api.openweathermap.org/data/3.0/onecall?lat=44.491626&lon=5.729331&units=metric&lang=fr&appid=75c22bca759f5d660ed7afea22827a7d"
    #"https://api.openweathermap.org/data/3.0/onecall?lat=44.491626&lon=5.729331&appid=75c22bca759f5d660ed7afea22827a7d"
    json_response = response.json()
    print(json_response)
    return JsonResponse(json_response)