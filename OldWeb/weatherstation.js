var updateGraphActivated = false;
var updateCustomGraphActivated = false;
var updateRainPrecipitationGraphActivated = false;
var dayTempHumiGraph;
var dayPressureGraph;
var temperatureGraph;
var customGraph;
var actualTemperature;
var linkOpenWeatherMap;
var customGraphGeneratorValue = new Array("0","0","0","0","0","0","0");
var firstLoad = true;

// call and actualize fonction
window.onload = function()
{
    dateAndTime();
    getLink();
    showActualData();
    createGraph();
    createTemperatureGraph();
    setInterval("dateAndTime()", 1000);
    setInterval("showActualData()", 5000);
    setInterval("UpdateGraph()", 300000);
    setInterval("UpdateTemperatureGraph()", 300000);
    setInterval("forecast()", 1800000);
    showBlockDataType('yes');
    showTimeRate('no');
    showTime('no');
    showTemperature('no');
    showWind('no');
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
                            data: response.temperature,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(184, 66, 37)',
                            fill: false,
                            yAxisID: 'y',
                            tension: 0.3,
                        },
                        {
                            label: 'Humidity',
                            data: response.humidity,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(50, 52, 199)',
                            fill: false,
                            yAxisID: 'y1',
                            tension: 0.3,
                        }
                    ]
                }
                var options =
                {
                    responsive: true,
                    aspectRatio: 3,
                    interaction:
                    {
                        mode: 'index',
                        intersect: false,
                    },
                    stacked: false,
                    plugins:
                    {
                        title:
                        {
                            display: true,
                            text: 'Temperature and humidity (24H)',
                            color : 'rgb(255, 255, 255)'
                        },
                        legend:
                        {
                            position: 'top',
                            color : 'rgb(255, 255, 255)',
                        },
                    },
                    scales:
                    {
                        x:
                        {
                            title:
                            {
                                display: true,
                                text: 'Date',
                                color : 'rgb(255, 255, 255)'
                            }
                        },
                        y:
                        {
                            title:
                            {
                                display: true,
                                text: 'Temperature',
                                color: 'rgb(255, 255, 255)',
                            },
                            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: 'left',
                        },
                        y1:
                        {
                            title:
                            {
                                display: true,
                                text: 'Humidity',
                                color: 'rgb(255, 255, 255)',
                            },
                            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: 'right',
                    		// sert a regler l'echelle du graphique
                            min: 0,
                            max: 100,
                            // grid line settings
                            grid:
                            {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                        },
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
                            data: response.pressure,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(67, 235, 52)',
                            fill: false,
                            tension: 0.3,
                        }
                    ]
                }
                var options2 =
                {
                    responsive: true,
                    aspectRatio: 3,
                    plugins:
                    {
                        title:
                        {
                            display: true,
                            text: 'Pressure (48H)',
                            color : 'rgb(255, 255, 255)',
                        },
                        legend:
                        {
                            position: 'top',
                            color : 'rgb(255, 255, 255)',
                        },
                    },
                    scales:
                    {
                        x:
                        {
                            title:
                            {
                                display: true,
                                text: 'Date',
                                color : 'rgb(255, 255, 255)'
                            }
                        },
                        y:
                        {
                            title:
                            {
                                display: true,
                                text: 'Presure hPa',
                                color: 'rgb(255, 255, 255)',
                            },
                            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: 'left',
                        },
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
                            data: response.windSpeed,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(218, 255, 214)',
                            fill: false,
                            tension: 0.3,
                        },
                        {
                            label: 'Maximum Wind',
                            data: response.maxWindSpeed,
                            fontColor : 'rgba(247, 132, 0, 0.8)',
                            borderColor: 'rgba(207, 110, 0, 0.8)',
                            backgroundColor: 'rgba(247, 132, 0, 0.8)',
                            borderWidth: '2px',
                            fill: false,
                            type: 'bar'
                        }
                    ]
                }
                var options5 =
                {
                    responsive: true,
                    aspectRatio: 3,
                    plugins:
                    {
                        title:
                        {
                            display: true,
                            text: 'Wind (48H)',
                            color : 'rgb(255, 255, 255)'
                        },
                        legend:
                        {
                            labels:
                            {
                                position: 'top',
                                color : 'rgb(255, 255, 255)',
                            }
                        },
                    },
                    scales:
                    {
                        x:
                        {
                            title:
                            {
                                display: true,
                                text: 'Date',
                                color : 'rgb(255, 255, 255)'
                            },
                        },

                        y:
                        {
                            title:
                            {
                                display: true,
                                text: 'Wind km/h',
                                color : 'rgb(255, 255, 255)'
                            },
                            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: 'left',
                        },
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
                            data: response.precipitation,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(50, 52, 199)',
                            backgroundColor: 'rgb(50, 52, 199)',
                            fill: false,
                            yAxisID: 'y',
                        },
                    ]
                }
                var options4 =
                {
                    responsive: true,
                    aspectRatio: 3,
                    plugins:
                    {
                        title:
                        {
                            display: false,
                            text: 'rain Precipitation',
                            color : 'rgb(255, 255, 255)'
                        },
                        legend:
                        {
                            position: 'top',
                            color : 'rgb(255, 255, 255)',
                        },
                    },
                    scales:
                    {
                        x:
                        {
                            ticks:
                            {		// sert a regler l'echelle du graphique et faire les reglage sur cette echelle
                                fontColor : 'rgb(255, 255, 255)' // couleur des jour de la semaine
                            },
                        },

                        y:
                        {
                            title:
                            {
                                display: true,
                                text: 'Precipitation mm',
                                color: 'rgb(255, 255, 255)',
                            },
                            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: 'left',
                        },
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
function createTemperatureGraph()
{
    const request = new XMLHttpRequest(),
        method = "GET",
        url = "temperatureGraph.php";
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
                // Temperature graph
                var ctx3 = document.getElementById('temperatureGraph').getContext('2d');
                var data3 =
                {
                    labels: response.date,
                    datasets:
                    [
                        {
                            label: 'Min',
                            data: response.min,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(50, 52, 199)',
                            fill: false,
                            tension: 0.3,
                        },
                        {
                            label: 'Max',
                            data: response.max,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(184, 66, 37)',
                            fill: false,
                            tension: 0.3,
                        },
                        {
                            label: 'Average',
                            data: response.average,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(67, 235, 52)',
                            fill: false,
                            tension: 0.3,
                        }
                    ]
                }
                var options3 =
                {
                    responsive: true,
                    aspectRatio: 3,
                    plugins:
                    {
                        title:
                        {
                            display: true,
                            text: 'Min Max and Average temperature for last 30 days',
                            color : 'rgb(255, 255, 255)'
                        },
                        legend:
                        {
                            position: 'top',
                            color : 'rgb(255, 255, 255)',
                        },
                    },
                    scales:
                    {
                        x:
                        {
                            title:
                            {
                                display: true,
                                text: 'Date',
                                color : 'rgb(255, 255, 255)'
                            }
                        },

                        y:
                        {
                            title:
                            {
                                display: true,
                                text: 'Temperature C°',
                                color: 'rgb(255, 255, 255)',
                            },
                            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: 'left',
                        },
                    }
                }
                var config3 =
                {
                    type: 'line',
                    data: data3,
                    options: options3
                }
                temperatureGraph = new Chart(ctx3, config3);
            }
        }
    };
    request.send();
    updateTemperatureGraphActivated = true;
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
function UpdateTemperatureGraph()
{
    if(updateTemperatureGraphActivated)
    {
        const request = new XMLHttpRequest(),
            method = "GET",
            url = "temperatureGraph.php";
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
                    temperatureGraph.data.labels = response.date;
                    temperatureGraph.data.datasets[0].data = response.min;
                    temperatureGraph.data.datasets[1].data = response.max;
                    temperatureGraph.data.datasets[2].data = response.average;
                    temperatureGraph.update();
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

function choiseBlockDataType(value)
{
    customGraphGeneratorValue [0] = value;
    if (value > 0)
    {
        showTimeRate('yes'); showTime('no'); showTemperature('no'); showWind('no');
    }
    else
    {
        showTimeRate('no'); showTime('no'); showTemperature('no'); showWind('no');
    }
    if (customGraphGeneratorValue[1] > 0)
    {
        showTimeRateSelect(customGraphGeneratorValue[1])
    }
}
function showTimeRateSelect(value)
{
    customGraphGeneratorValue [1] = value;
    if (value > 0)
    {
        showTime('yes');
    }
    else
    {
        showTime('no');
    }
}
function showBlockDataType(action)
{
    document.getElementById('blockDataType').style.display = (action == "yes")? "inline" : "none";
    document.getElementById('customGraph').style.display = "none";
}
function showTimeRate(action)
{
    document.getElementById('blockTimeRate').style.display = (action == "yes")? "inline" : "none";
}
function soustractDayToCurrentDate(days)
{
    var currentDate = new Date();
    return new Date(currentDate.setDate(currentDate.getDate() - days)).toISOString().slice(0, 10);
}
function showTime(action)
{
    var date = new Date().toISOString().slice(0, 10);
    document.getElementById('blockTimeStart').style.display = (action == "yes")? "inline" : "none";
    //document.getElementById('startDate').Value = soustractDayToCurrentDate(2);
    document.getElementById('blockTimeEnd').style.display = (action == "yes")? "inline" : "none";
    //document.getElementById('endDate').Value = date;
    if (firstLoad)
    {
        customGraphGeneratorValue[2] = soustractDayToCurrentDate(2);
        customGraphGeneratorValue[3] = date;
        firstLoad = false
    }
    //Show parameter if necessary
    if (customGraphGeneratorValue[0] == 1 && customGraphGeneratorValue[1] > 1 )
    {
        showTemperature('yes');
        showWind('no');
    }
    else if (customGraphGeneratorValue[0] == 5)
    {
        showWind('yes');
        showTemperature('no');
    }
    else
    {
        showWind('no');
        showTemperature('no');
    }
    saveDataBase();
}
function saveTimeStart(value)
{
    customGraphGeneratorValue [2] = value;
    saveDataBase();
}
function showTemperature(action)
{
    document.getElementById('blockTemperature').style.display = (action == "yes")? "inline" : "none";
}
function showWind(action)
{
    document.getElementById('blockWind').style.display = (action == "yes")? "inline" : "none";
}
function saveTimeEnd(value)
{
    customGraphGeneratorValue [3] = value;
    saveDataBase();
}
function checkboxclik(checkBox)
{
    if (checkBox.checked)
    {
        switch (checkBox.id)
        {
            case 'min' : customGraphGeneratorValue [4] = 1;
            break;
            case 'max' : customGraphGeneratorValue [5] = 1;
            break;
            case 'average' : customGraphGeneratorValue [6] = 1;
            break;
        }
    }
    else
    {
        switch (checkBox.id)
        {
            case 'min' : customGraphGeneratorValue [4] = 0;
            break;
            case 'max' : customGraphGeneratorValue [5] = 0;
            break;
            case 'average' : customGraphGeneratorValue [6] = 0;
            break;
        }
    }
    if (customGraphGeneratorValue[0] == 5)
    {
        customGraphGeneratorValue[4] = 0;
    }
    saveDataBase(customGraphGeneratorValue);
}

function saveDataBase()
{
    if (customGraphGeneratorValue[0] == 1 || customGraphGeneratorValue[0] == 5)
    {
        sendString = "var0=" + customGraphGeneratorValue[0] + "&var1=" + customGraphGeneratorValue[1] + "&var2=" + customGraphGeneratorValue[2] + "&var3=" + customGraphGeneratorValue[3] + "&var4=" + customGraphGeneratorValue[4] + "&var5=" + customGraphGeneratorValue[5] + "&var6=" + customGraphGeneratorValue[6];
    }
    else
    {
        sendString = "var0=" + customGraphGeneratorValue[0] + "&var1=" + customGraphGeneratorValue[1] + "&var2=" + customGraphGeneratorValue[2] + "&var3=" + customGraphGeneratorValue[3] + "&var4=" + 0  + "&var5=" + 0  + "&var6=" + 0;
    }
    var php = new XMLHttpRequest();
    php.open("POST", "saveDatabase.php", true)
    php.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    php.send(sendString);
    if (customGraphGeneratorValue[0] > 0 && customGraphGeneratorValue[1] > 0)
    {
    setTimeout(callGraph(),200);
    }
    document.getElementById('testtext').innerHTML = customGraphGeneratorValue;
}
function callGraph()
{
    document.getElementById('customGraph').style.display = "block";
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
                // selecter of graph format
                var dataSetsChart;
                var title;
                var ylabel;
                if (response.parameter[0] == 1)
                {
                    title = 'Temperature';
                    ylabel = 'C°';
                    //temperature
                    if (response.parameter[1] == 1)
                    {
                        dataSetsChart =
                        [{
                            label: 'Temperature',
                            data: response.value,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(184, 66, 37)',
                            fill: false,
                            tension: 0.3,
                        }];
                    }
                    if (response.parameter[1] > 1)
                    {
                        if (response.parameter[4] == 1)
                        {
                            dataSetsChart =
                            [{
                                label: 'Minimum',
                                data: response.min,
                                fontColor : 'rgb(255, 255, 255)',
                                borderColor: 'rgb(50, 52, 199)',
                                fill: false,
                                tension: 0.3,
                            }];
                        }
                        if (response.parameter[5] == 1)
                        {
                            dataSetsChart =
                            [{
                                label: 'Maximum',
                                data: response.max,
                                fontColor : 'rgb(255, 255, 255)',
                                borderColor: 'rgb(184, 66, 37)',
                                fill: false,
                                tension: 0.3,
                            }];
                        }
                        if (response.parameter[6] == 1)
                        {
                            dataSetsChart =
                            [{
                                label: 'Average',
                                data: response.average,
                                fontColor : 'rgb(255, 255, 255)',
                                borderColor: 'rgb(67, 235, 52)',
                                fill: false,
                                tension: 0.3,
                            }];
                        }
                        if (response.parameter[4] == 1 && response.parameter[5] == 1)
                        {
                            dataSetsChart =
                            [{
                                label: 'Minimum',
                                data: response.min,
                                fontColor : 'rgb(255, 255, 255)',
                                borderColor: 'rgb(50, 52, 199)',
                                fill: false,
                                tension: 0.3,
                            },
                            {
                                label: 'Maximum',
                                data: response.max,
                                fontColor : 'rgb(255, 255, 255)',
                                borderColor: 'rgb(184, 66, 37)',
                                fill: false,
                                tension: 0.3,
                            }];
                        }
                        if (response.parameter[4] == 1 && response.parameter[6] == 1)
                        {
                            dataSetsChart =
                            [{
                                label: 'Minimum',
                                data: response.min,
                                fontColor : 'rgb(255, 255, 255)',
                                borderColor: 'rgb(50, 52, 199)',
                                fill: false,
                                tension: 0.3,
                            },
                            {
                                label: 'Average',
                                data: response.average,
                                fontColor : 'rgb(255, 255, 255)',
                                borderColor: 'rgb(67, 235, 52)',
                                fill: false,
                                tension: 0.3,
                            }];
                        }
                        if (response.parameter[5] == 1 && response.parameter[6] == 1)
                        {
                            dataSetsChart =
                            [{
                                label: 'Maximum',
                                data: response.max,
                                fontColor : 'rgb(255, 255, 255)',
                                borderColor: 'rgb(184, 66, 37)',
                                fill: false,
                                tension: 0.3,
                            },
                            {
                                label: 'Average',
                                data: response.average,
                                fontColor : 'rgb(255, 255, 255)',
                                borderColor: 'rgb(67, 235, 52)',
                                fill: false,
                                tension: 0.3,
                            }];
                        }
                        if (response.parameter[4] == 1 && response.parameter[5] == 1 && response.parameter[6] == 1)
                        {
                            dataSetsChart =
                            [{
                                label: 'Minimum',
                                data: response.min,
                                fontColor : 'rgb(255, 255, 255)',
                                borderColor: 'rgb(50, 52, 199)',
                                fill: false,
                                tension: 0.3,
                            },
                            {
                                label: 'Maximum',
                                data: response.max,
                                fontColor : 'rgb(255, 255, 255)',
                                borderColor: 'rgb(184, 66, 37)',
                                fill: false,
                                tension: 0.3,
                            },
                            {
                                label: 'Average',
                                data: response.average,
                                fontColor : 'rgb(255, 255, 255)',
                                borderColor: 'rgb(67, 235, 52)',
                                fill: false,
                                tension: 0.3,
                            }];
                        }
                    }
                }
                // Wind
                if (response.parameter[0] == 5)
                {
                    title = 'Wind';
                    ylabel = 'Km/H';
                    if (response.parameter[5] == 1)
                    {
                        dataSetsChart =
                        [{
                            label: 'Maximum wind speed',
                            data: response.max,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgba(207, 110, 0, 0.8)',
                            backgroundColor: 'rgba(247, 132, 0, 0.8)',
                            fill: false,
                            tension: 0.3,
                            type: 'bar'
                        }];
                    }
                    if (response.parameter[6] == 1)
                    {
                        dataSetsChart =
                        [{
                            label: 'Average wind speed',
                            data: response.average,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(218, 255, 214)',
                            fill: false,
                            tension: 0.3,
                        }];
                    }
                    if (response.parameter[5] == 1 && response.parameter[6] == 1)
                    {
                        dataSetsChart =
                        [{
                            label: 'Maximum wind speed',
                            data: response.max,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgba(207, 110, 0, 0.8)',
                            backgroundColor: 'rgba(247, 132, 0, 0.8)',
                            fill: false,
                            tension: 0.3,
                            type: 'bar'
                        },
                        {
                            label: 'Average wind speed',
                            data: response.average,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(218, 255, 214)',
                            fill: false,
                            tension: 0.3,
                        }];
                    }
                }
                // Humidity
                if (response.parameter[0] == 2)
                {
                    title = 'Humidity';
                    ylabel = '%';
                    if (response.parameter[1] == 1)
                    {
                        dataSetsChart =
                        [{
                            label: 'Humidity',
                            data: response.value,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(50, 52, 199)',
                            fill: false,
                            tension: 0.3,
                        }];
                    }
                    if (response.parameter[1] > 1)
                    {
                        title = 'Average Humidity';
                        dataSetsChart =
                        [{
                            label: 'Humidity',
                            data: response.average,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(50, 52, 199)',
                            fill: false,
                            tension: 0.3,
                        }];
                    }
                }
                // Pressure
                if (response.parameter[0] == 3)
                {
                    title = 'Pressure';
                    ylabel = 'Hpa';
                    if (response.parameter[1] == 1)
                    {
                        dataSetsChart =
                        [{
                            label: 'Pressure',
                            data: response.value,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(67, 235, 52)',
                            fill: false,
                            tension: 0.3,
                        }];
                    }
                    if (response.parameter[1] > 1)
                    {
                        title = 'Average Pressure';
                        dataSetsChart =
                        [{
                            label: 'Pressure',
                            data: response.average,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(67, 235, 52)',
                            fill: false,
                            tension: 0.3,
                        }];
                    }
                }
                // Precipitation
                if (response.parameter[0] == 4)
                {
                    title = 'Precipitation';
                    ylabel = 'mm';
                    if (response.parameter[1] == 1)
                    {
                        dataSetsChart =
                        [{
                            label: 'Precipitation',
                            data: response.value,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(50, 52, 199)',
                            fill: false,
                            type: 'bar'
                        }];
                    }
                    if (response.parameter[1] > 1)
                    {
                        title = 'Total Precipitation';
                        dataSetsChart =
                        [{
                            label: 'Precipitation',
                            data: response.total,
                            fontColor : 'rgb(255, 255, 255)',
                            borderColor: 'rgb(50, 52, 199)',
                            fill: false,
                            type: 'bar'
                        }];
                    }
                }
                // graph
                var customctx = document.getElementById('customGraph').getContext('2d');
                var customData =
                {
                    labels: response.date,
                    datasets: dataSetsChart
                }
                var customOptions =
                {
                    responsive: true,
                    aspectRatio: 3,
                    plugins:
                    {
                        title:
                        {
                            display: true,
                            text: title,
                            color : 'rgb(255, 255, 255)'
                        },
                        legend:
                        {
                            position: 'top',
                            color : 'rgb(255, 255, 255)',
                        },
                    },
                    scales:
                    {
                        x:
                        {
                            title:
                            {
                                display: true,
                                text: 'Date',
                                color : 'rgb(255, 255, 255)'
                            }
                        },

                        y:
                        {
                            title:
                            {
                                display: true,
                                text: ylabel,
                                color: 'rgb(255, 255, 255)',
                            },
                            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: 'left',
                        },
                    }
                }
                var customConfig =
                {
                    type: 'line',
                    data: customData,
                    options: customOptions
                }
                if (customGraph)
                {
                    customGraph.destroy();
                }
                customGraph = new Chart(customctx, customConfig);
            }
        }
    };
    request.send();
}