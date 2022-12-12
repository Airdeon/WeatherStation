"""WeatherStation URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from Weather.views import Index, get_forcast
from rest_framework import routers
from Weather.views import LongTermDataViewSet


# API URL
router = routers.SimpleRouter()
# Long Term Data API
router.register("long_term_data", LongTermDataViewSet, basename="long_term_data")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", Index.as_view(), name="index"),
    path("api/", include(router.urls)),
    path("forecast", get_forcast, name="forecast"),

]
