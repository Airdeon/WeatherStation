from django import forms


class ChartFilterForm(forms.Form):
    chart_type = forms.ChoiceField(widget=forms.RadioSelect(attrs={"onchange": "fill_chart()"}), initial=(0, "Température"), choices=[(0, "Température"), (1, "Humidité"), (2, "pression"), (3, "Vent")], label="Type de graphique")
    chart_timing = forms.ChoiceField(widget=forms.RadioSelect(attrs={"onchange": "fill_chart()"}), initial=(1, "Semaine"), choices=[(0, "Jour"), (1, "Semaine"), (2, "Mois"), (3, "Année"), (4, "Date à date")], label="Plage de dates")