from django.contrib import admin
from .models import InsideActualData, ActualData, LongTermData


# Register your models here.
admin.site.register(InsideActualData)
admin.site.register(ActualData)
admin.site.register(LongTermData)