from django.views.generic import TemplateView

# Create your views here.
class Index(TemplateView):
    template_name = "Weather/WeatherStation.html"
