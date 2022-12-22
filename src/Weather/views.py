from django.views.generic import TemplateView
from rest_framework.viewsets import ReadOnlyModelViewSet
from django.http import JsonResponse
import json
import requests
from .forms import ChartFilterForm
from .serializers import LongTermDataSerializer, ActualDataSerializer, InsideActualDataSerializer
from .models import LongTermData
from django.utils import timezone
from datetime import datetime
from Weather.models import ActualData, InsideActualData, LongTermData

# Create your views here.
class Index(TemplateView):
    template_name = "Weather/WeatherStation.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["form"] = ChartFilterForm
        return context


class ActualDataViewSet(ReadOnlyModelViewSet):
    """API Actual outside data"""
    serializer_class = ActualDataSerializer

    def get_queryset(self):
        return ActualData.objects.filter(id=1)


class InsideActualDataViewSet(ReadOnlyModelViewSet):
    """API Actual inside data"""
    serializer_class = InsideActualDataSerializer

    def get_queryset(self):
        return InsideActualData.objects.filter(id=1)


class LongTermDataViewSet(ReadOnlyModelViewSet):
    """API Long term data"""
    serializer_class = LongTermDataSerializer

    def get_queryset(self):
        queryset = LongTermData.objects.all()

        start_date = self.request.GET.get("start_date")
        end_date = self.request.GET.get("end_date")

        if start_date is not None and end_date is not None:
            start_date = timezone.make_aware(datetime.strptime(start_date, "%Y-%m-%dT%H:%M:%S"))
            end_date = timezone.make_aware(datetime.strptime(end_date, "%Y-%m-%dT%H:%M:%S"))
            queryset = queryset.filter(time__range=(start_date, end_date))

        elif start_date is not None:
            end_date = timezone.now()
            queryset = queryset.filter(
                time__range=[timezone.make_aware(datetime.strptime(start_date, "%Y-%m-%dT%H:%M:%S")), end_date]
            )
        return queryset

def get_forcast(request):
    response = requests.get(
        "https://api.openweathermap.org/data/2.5/onecall?lat=44.491626&lon=5.729331&units=metric&lang=fr&appid=f39953152da1fcc995e067622dc228f5"
    )
    # "https://api.openweathermap.org/data/3.0/onecall?lat=44.491626&lon=5.729331&units=metric&lang=fr&appid=75c22bca759f5d660ed7afea22827a7d"
    # "https://api.openweathermap.org/data/3.0/onecall?lat=44.491626&lon=5.729331&appid=75c22bca759f5d660ed7afea22827a7d"
    json_response = response.json()
    #print(json_response)
    return JsonResponse(json_response)
