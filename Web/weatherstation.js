var updateGraphActivated = false;
var updateCustomGraphActivated = false;
var updateRainPrecipitationGraphActivated = false;
var dayTempHumiGraph;
var dayPressureGraph;
var customGraph;
var actualTemperature;
var linkOpenWeatherMap;

// call and actualize fonction
window.onload = function()
{
    dateAndTime();
    getLink();
    showActualData();
    createGraph();
    createCustomGraph();
    setInterval("dateAndTime()", 1000);
    setInterval("showActualData()", 5000);
    setInterval("UpdateGraph()", 300000);
    setInterval("UpdateCustomGraph()", 300000);
    setInterval("forecast()", 1800000);
};

// show 0 before number if number < 10
function showZero(number)
{
    return number < 10 ? '0' + number : number;
}

// show Date an Time in webpage
function dateAndTime()
{
    const infos = new Date();
    document.getElementById('show_time').innerHTML = '<p id="dateTime">' + showZero(infos.getHours()) + ':' + showZero(infos.getMinutes()) + ':' + showZero(infos.getSeconds()) + '<br><span id="date">' + showZero(infos.getDate()) + '/' + showZero(infos.getMonth()+1) + '/' + infos.getFullYear() + '</span></p>';
}

//get Actual value from database and show it on webpage
function showActualData()
{
    const request = new XMLHttpRequest(),
    method = "GET",
    url = "ActualValue.php";

    request.open(method, url, true);
    request.onreadystatechange = function ()
    {
        // In local files, status is 0 upon success in Mozilla Firefox
        if(request.readyState === XMLHttpRequest.DONE)
        {
            var status = request.status;
            if (status === 0 || (status >= 200 && status < 400))
            {
                // The request has been completed successfully
                var response = JSON.parse(this.responseText);
                document.getElementById('actualOutsideTemperature').innerHTML = '<p>' + response.temperature + ' <span id="littleText">C°</span></p>';
                document.getElementById('actualOutsideHumidity').innerHTML = '<p>' + response.humidity + ' <span id="littleText">%</span></p>';
                document.getElementById('actualPressure').innerHTML = '<p>' + response.pressure + ' <span id="littleText">Hpa</span></p>';
                document.getElementById('actualInsideTemperature').innerHTML = '<p>' + response.IN_temperature + ' <span id="littleText">C°</span></p>';
                document.getElementById('actualInsideHumidity').innerHTML = '<p>' + response.IN_humidity + ' <span id="littleText">%</span></p>';
                document.getElementById('wind').innerHTML = '<p>' + response.windSpeed + ' <span id="littleText">Km/h</span> ' + response.windDirection + '</p>';
                document.getElementById('outsideDate').innerHTML = response.OUT_dataTime;
                document.getElementById('insideDate').innerHTML = response.IN_dataTime;
                actualTemperature = response.temperature;
            }
        }
    };
    request.send();
}

function createGraph()
{
    const request = new XMLHttpRequest(),
        method = "GET",
        url = "outsideData.php";
    request.open(method, url, true);
    // initialize global variable of graph

    request.onreadystatechange = function ()
    {
        // In local files, status is 0 upon success in Mozilla Firefox
        if(request.readyState === XMLHttpRequest.DONE)
        {
            var status = request.status;
            if (status === 0 || (status >= 200 && status < 400))
            {
                // The request has been completed successfully
                var response = JSON.parse(this.responseText);
                // Temperature and humidity graph
                var ctx = document.getElementById('dayTempHumiGraph').getContext('2d');
                var data =
                {
                    labels: response.date1Day,
                    datasets:
                    [
                        {
                            label: 'Temperature',
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(184, 66, 37)',
                            fill: false,
                            yAxisID: 'y-axis-1',
                            data: response.temperature
                        },
                        {
                            label: 'Humidity',
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(50, 52, 199)',
                            fill: false,
                            yAxisID: 'y-axis-2',
                            data: response.humidity
                        }
                    ]
                }
                var options =
                {
                    responsive: true,
                    aspectRatio: 3,
                    title:
                    {
                        display: true,
                        text: 'Temperature and humidity (24H)',
                        fontColor : 'rgb(255, 255, 255)'
                    },
                    legend:
                    {
                        labels:
                        {
                            fontColor : 'rgb(255, 255, 255)',
                        }
                    },
                    scales:
                    {
                        xAxes:
                        [{
                            ticks:
                            {		// sert a regler l'echelle du graphique et faire les reglage sur cette echelle
                                fontColor : 'rgb(255, 255, 255)' // couleur des jour de la semaine
                            },
                        }],

                        yAxes:
                        [{
                            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: 'left',
                            id: 'y-axis-1',
                            ticks:      // sert a regler l'echelle du graphique et faire les reglage sur cette echelle
                            {
                                fontColor : 'rgb(255, 255, 255)' // couleur des chiffre de la température
                            },
                            scaleLabel:
                            {
                                display: true,
                                labelString: 'Temperature C°',
                                fontColor : 'rgb(255, 255, 255)', // couleur du Label "Température"
                            },
                        },
                        {
                            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: 'right',
                            id: 'y-axis-2',
                            ticks: {		// sert a regler l'echelle du graphique
                                min: 0,
                                max: 100,
                                fontColor : 'rgb(255, 255, 255)', // Couleur des Chiffre de l'humidité
                            },
                            scaleLabel:
                            {
                                display: true,
                                labelString: 'Humidity %',
                                fontColor : 'rgb(255, 255, 255)', // Couleur du Label "Taux d'humidité"
                            },

                            // grid line settings
                            gridLines:
                            {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                        }],
                    }
                }
                var config =
                {
                    type: 'line',
                    data: data,
                    options: options
                }
                dayTempHumiGraph = new Chart(ctx, config);
                //pressure graph
                var ctx2 = document.getElementById('pressureGraph').getContext('2d');
                var data2 =
                {
                    labels: response.date2Days,
                    datasets:
                    [
                        {
                            label: 'Pressure',
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(67, 235, 52)',
                            fill: false,
                            yAxisID: 'y-axis-1',
                            data: response.pressure
                        }
                    ]
                }
                var options2 =
                {
                    responsive: true,
                    aspectRatio: 3,
                    title:
                    {
                        display: true,
                        text: 'Pressure (48H)',
                        fontColor : 'rgb(255, 255, 255)'
                    },
                    legend:
                    {
                        labels:
                        {
                            fontColor : 'rgb(255, 255, 255)',
                        }
                    },
                    scales:
                    {
                        xAxes:
                        [{
                            ticks:
                            {		// sert a regler l'echelle du graphique et faire les reglage sur cette echelle
                                fontColor : 'rgb(255, 255, 255)' // couleur des jour de la semaine
                            },
                        }],

                        yAxes:
                        [{
                            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: 'left',
                            id: 'y-axis-1',
                            ticks:      // sert a regler l'echelle du graphique et faire les reglage sur cette echelle
                            {
                                fontColor : 'rgb(255, 255, 255)' // couleur des chiffre de la température
                            },
                            scaleLabel:
                            {
                                display: true,
                                labelString: 'Presure hPa',
                                fontColor : 'rgb(255, 255, 255)', // couleur du Label "Température"
                            },

                            // grid line settings
                            gridLines:
                            {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                        }],
                    },
                }
                var config2 =
                {
                    type: 'line',
                    data: data2,
                    options: options2
                }
                dayPressureGraph = new Chart(ctx2, config2);
                //Wind graph
                var ctx5 = document.getElementById('windAverageAndMaxGraph').getContext('2d');
                var data5 =
                {
                    labels: response.date2Days,
                    datasets:
                    [
                        {
                            label: 'Wind',
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(218, 255, 214)',
                            fill: false,
                            yAxisID: 'y-axis-1',
                            data: response.windSpeed
                        },
                        {
                            label: 'Maximum Wind',
                            fontColor : 'rgba(247, 132, 0, 0.8)',
                            borderColor: 'rgba(207, 110, 0, 0.8)',
                            backgroundColor: 'rgba(247, 132, 0, 0.8)',
                            borderWidth: '2px',
                            fill: false,
                            yAxisID: 'y-axis-1',
                            data: response.maxWindSpeed,
                            type: 'bar'
                        }
                    ]
                }
                var options5 =
                {
                    responsive: true,
                    aspectRatio: 3,
                    title:
                    {
                        display: true,
                        text: 'Wind (48H)',
                        fontColor : 'rgb(255, 255, 255)'
                    },
                    legend:
                    {
                        labels:
                        {
                            fontColor : 'rgb(255, 255, 255)',
                        }
                    },
                    scales:
                    {
                        xAxes:
                        [{
                            ticks:
                            {		// sert a regler l'echelle du graphique et faire les reglage sur cette echelle
                                fontColor : 'rgb(255, 255, 255)' // couleur des jour de la semaine
                            },
                        }],

                        yAxes:
                        [{
                            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: 'left',
                            id: 'y-axis-1',
                            ticks:      // sert a regler l'echelle du graphique et faire les reglage sur cette echelle
                            {
                                fontColor : 'rgb(255, 255, 255)' // couleur des chiffre de la température
                            },
                            scaleLabel:
                            {
                                display: true,
                                labelString: 'wind Km/h',
                                fontColor : 'rgb(255, 255, 255)', // couleur du Label "Température"
                            },

                            // grid line settings
                            gridLines:
                            {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                        }],
                    },
                }
                var config5 =
                {
                    type: 'line',
                    data: data5,
                    options: options5
                }
                windGraph = new Chart(ctx5, config5);
                // precipitation graph
                var ctx4 = document.getElementById('rainPrecipitatonGraph').getContext('2d');
                var data4 =
                {
                    labels: response.precipitationDate,
                    datasets:
                    [
                        {
                            label: 'rain Precipitation',
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(50, 52, 199)',
                            backgroundColor: 'rgb(50, 52, 199)',
                            fill: false,
                            yAxisID: 'y-axis-1',
                            data: response.precipitation
                        },
                    ]
                }
                var options4 =
                {
                    responsive: true,
                    aspectRatio: 3,
                    title:
                    {
                        display: false,
                        text: 'rain Precipitation',
                        fontColor : 'rgb(255, 255, 255)'
                    },
                    legend:
                    {
                        labels:
                        {
                            fontColor : 'rgb(255, 255, 255)',
                        }
                    },
                    scales:
                    {
                        xAxes:
                        [{
                            ticks:
                            {		// sert a regler l'echelle du graphique et faire les reglage sur cette echelle
                                fontColor : 'rgb(255, 255, 255)' // couleur des jour de la semaine
                            },
                        }],

                        yAxes:
                        [{
                            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: 'left',
                            id: 'y-axis-1',
                            ticks:      // sert a regler l'echelle du graphique et faire les reglage sur cette echelle
                            {
                                fontColor : 'rgb(255, 255, 255)' // couleur des chiffre de la température
                            },
                            scaleLabel:
                            {
                                display: true,
                                labelString: 'Precipitation mm',
                                fontColor : 'rgb(255, 255, 255)', // couleur du Label "Température"
                            },

                            // grid line settings
                            gridLines:
                            {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                        }],
                    }
                }
                var config4 =
                {
                    type: 'bar',
                    data: data4,
                    options: options4
                }
                rainPrecipitationGraph = new Chart(ctx4, config4);
            }
        }
    };
    request.send();
    updateGraphActivated = true;
}
//create custom graph
function createCustomGraph()
{
    const request = new XMLHttpRequest(),
        method = "GET",
        url = "customGraph.php";
    request.open(method, url, true);
    // initialize global variable of graph

    request.onreadystatechange = function ()
    {
        // In local files, status is 0 upon success in Mozilla Firefox
        if(request.readyState === XMLHttpRequest.DONE)
        {
            var status = request.status;
            if (status === 0 || (status >= 200 && status < 400))
            {
                // The request has been completed successfully
                var response = JSON.parse(this.responseText);
                // Temperature and humidity graph
                var ctx3 = document.getElementById('customGraph').getContext('2d');
                var data3 =
                {
                    labels: response.date,
                    datasets:
                    [
                        {
                            label: 'Min',
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(50, 52, 199)',
                            fill: false,
                            yAxisID: 'y-axis-1',
                            data: response.min
                        },
                        {
                            label: 'Max',
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(184, 66, 37)',
                            fill: false,
                            yAxisID: 'y-axis-1',
                            data: response.max
                        },
                        {
                            label: 'Average',
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(67, 235, 52)',
                            fill: false,
                            yAxisID: 'y-axis-1',
                            data: response.average
                        }
                    ]
                }
                var options3 =
                {
                    responsive: true,
                    aspectRatio: 3,
                    title:
                    {
                        display: false,
                        text: 'Min Max and Average temperature for this month',
                        fontColor : 'rgb(255, 255, 255)'
                    },
                    legend:
                    {
                        labels:
                        {
                            fontColor : 'rgb(255, 255, 255)',
                        }
                    },
                    scales:
                    {
                        xAxes:
                        [{
                            ticks:
                            {		// sert a regler l'echelle du graphique et faire les reglage sur cette echelle
                                fontColor : 'rgb(255, 255, 255)' // couleur des jour de la semaine
                            },
                        }],

                        yAxes:
                        [{
                            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: 'left',
                            id: 'y-axis-1',
                            ticks:      // sert a regler l'echelle du graphique et faire les reglage sur cette echelle
                            {
                                fontColor : 'rgb(255, 255, 255)' // couleur des chiffre de la température
                            },
                            scaleLabel:
                            {
                                display: true,
                                labelString: 'Temperature C°',
                                fontColor : 'rgb(255, 255, 255)', // couleur du Label "Température"
                            },

                            // grid line settings
                            gridLines:
                            {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                        }],
                    }
                }
                var config3 =
                {
                    type: 'line',
                    data: data3,
                    options: options3
                }
                customGraph = new Chart(ctx3, config3);
            }
        }
    };
    request.send();
    updateCustomGraphActivated = true;
}
function UpdateGraph()
{
    if(updateGraphActivated)
    {
        const request = new XMLHttpRequest(),
            method = "GET",
            url = "outsideData.php";
        request.open(method, url, true);
        request.onreadystatechange = function ()
        {
            // In local files, status is 0 upon success in Mozilla Firefox
            if(request.readyState === XMLHttpRequest.DONE)
            {
                var status = request.status;
                if (status === 0 || (status >= 200 && status < 400))
                {
                    var response = JSON.parse(this.responseText);
                    // 1 day temperature and humidity graph
                    dayTempHumiGraph.data.labels = response.date1Day;
                    dayTempHumiGraph.data.datasets[0].data = response.temperature;
                    dayTempHumiGraph.data.datasets[1].data = response.humidity;
                    dayTempHumiGraph.update();
                    // 2 days pressure graph
                    dayPressureGraph.data.labels = response.date2Days;
                    dayPressureGraph.data.datasets[0].data = response.pressure;
                    dayPressureGraph.update();
                    // 2 days wind graph
                    windGraph.data.labels = response.date2Days;
                    windGraph.data.datasets[0].data = response.windSpeed;
                    windGraph.data.datasets[1].data = response.maxWindSpeed;
                    windGraph.update();
                    // 2 days precipitation graph
                    rainPrecipitationGraph.data.labels = response.precipitationDate;
                    rainPrecipitationGraph.data.datasets[0].data = response.precipitation;
                    rainPrecipitationGraph.update();
                }
            }
        };
        request.send();
    }
}
function UpdateCustomGraph()
{
    if(updateCustomGraphActivated)
    {
        const request = new XMLHttpRequest(),
            method = "GET",
            url = "customGraph.php";
        request.open(method, url, true);
        request.onreadystatechange = function ()
        {
            // In local files, status is 0 upon success in Mozilla Firefox
            if(request.readyState === XMLHttpRequest.DONE)
            {
                var status = request.status;
                if (status === 0 || (status >= 200 && status < 400))
                {
                    var response = JSON.parse(this.responseText);
                    customGraph.data.labels = response.date;
                    customGraph.data.datasets[0].data = response.min;
                    customGraph.data.datasets[1].data = response.max;
                    customGraph.data.datasets[2].data = response.average;
                    customGraph.update();
                }
            }
        };
        request.send();
    }
}

function getLink()
{
    const request = new XMLHttpRequest(),
    method = "GET",
    url = "link.php";
    request.open(method, url, true);
    request.onreadystatechange = function ()
    {
        // In local files, status is 0 upon success in Mozilla Firefox
        if(request.readyState === XMLHttpRequest.DONE)
        {
            var status = request.status;
            if (status === 0 || (status >= 200 && status < 400))
            {
                var response = JSON.parse(this.responseText);
                linkOpenWeatherMap = response.OpenWeatherMapLink;
                forecast();
            }
        }
    };
    request.send();
}

function forecast()
{
    // Get a lot of information from openweathermap.org
    const request = new XMLHttpRequest(),
    method = "GET",
    url = linkOpenWeatherMap;
    request.open(method, url, true);
    request.onreadystatechange = function ()
    {
        if(request.readyState === XMLHttpRequest.DONE)
        {
            var status = request.status;
            if (status === 0 || (status >= 200 && status < 400))
            {
                var response = JSON.parse(this.responseText);
                var sunriseTime = new Date(response.current.sunrise * 1000);
                var sunriseHours = sunriseTime.getHours();
                var sunriseMinutes = showZero(sunriseTime.getMinutes());
                var sunsetTime = new Date(response.current.sunset * 1000);
                var sunsetHours = sunsetTime.getHours();
                var sunsetMinutes = showZero(sunsetTime.getMinutes());
                document.getElementById('sunriseTime').innerHTML = '<img id="imageSunrise" src="icone/Sunrise.png"/><p>' + sunriseHours + ':' + sunriseMinutes + '</p>';
                document.getElementById('sunsetTime').innerHTML = '<img id="imageSunset" src="icone/Sunset.png"/><p>' + sunsetHours + ':' + sunsetMinutes + '</p>';
                document.getElementById('currentForecast').innerHTML = '<p>Now<br><img src="icone/' + response.current.weather[0].icon + '.png" alt="forecast" /><br>' + actualTemperature + ' C°</p>';
                document.getElementById('+1hForecast').innerHTML = '<p>+1H<br><img src="icone/' + response.hourly[2].weather[0].icon + '.png" alt="forecast" /><br>' + Math.round(response.hourly[2].temp) + ' C°</p>';
                document.getElementById('+3hForecast').innerHTML = '<p>+3H<br><img src="icone/' + response.hourly[4].weather[0].icon + '.png" alt="forecast" /><br>' + Math.round(response.hourly[4].temp) + ' C°</p>';
                document.getElementById('+6hForecast').innerHTML = '<p>+6H<br><img src="icone/' + response.hourly[7].weather[0].icon + '.png" alt="forecast" /><br>' + Math.round(response.hourly[7].temp) + ' C°</p>';
                document.getElementById('day+1').innerHTML = '<p>Day+1<br><img src="icone/' + response.daily[1].weather[0].icon + '.png" alt="forecast" /><br>' + Math.round(response.daily[1].temp.min) + ' C° / ' + Math.round(response.daily[1].temp.max) + ' C°</p>';
                document.getElementById('day+2').innerHTML = '<p>Day+2<br><img src="icone/' + response.daily[2].weather[0].icon + '.png" alt="forecast" /><br>' + Math.round(response.daily[2].temp.min) + ' C° / ' + Math.round(response.daily[2].temp.max) + ' C°</p>';
                document.getElementById('day+3').innerHTML = '<p>Day+3<br><img src="icone/' + response.daily[3].weather[0].icon + '.png" alt="forecast" /><br>' + Math.round(response.daily[3].temp.min) + ' C° / ' + Math.round(response.daily[3].temp.max) + ' C°</p>';
                document.getElementById('day+4').innerHTML = '<p>Day+4<br><img src="icone/' + response.daily[4].weather[0].icon + '.png" alt="forecast" /><br>' + Math.round(response.daily[4].temp.min) + ' C° / ' + Math.round(response.daily[4].temp.max) + ' C°</p>';
                document.getElementById('day+5').innerHTML = '<p>Day+5<br><img src="icone/' + response.daily[5].weather[0].icon + '.png" alt="forecast" /><br>' + Math.round(response.daily[5].temp.min) + ' C° / ' + Math.round(response.daily[5].temp.max) + ' C°</p>';
                document.getElementById('day+6').innerHTML = '<p>Day+6<br><img src="icone/' + response.daily[6].weather[0].icon + '.png" alt="forecast" /><br>' + Math.round(response.daily[6].temp.min) + ' C° / ' + Math.round(response.daily[6].temp.max) + ' C°</p>';
                document.getElementById('day+7').innerHTML = '<p>Day+7<br><img src="icone/' + response.daily[7].weather[0].icon + '.png" alt="forecast" /><br>' + Math.round(response.daily[7].temp.min) + ' C° / ' + Math.round(response.daily[7].temp.max) + ' C°</p>';
            }
        }
    };
    request.send();
}
