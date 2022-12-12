const BASE_URL = location.protocol + "//" + location.host + "/"

// call and actualize fonction
window.onload = function () {
    //time
    dateAndTime();
    setInterval("dateAndTime()", 1000);
    //Forecast
    fill_forecast_data();
    //Chart
    fill_chart();
    setInterval("fill_chart()", 60000);
    //actual data
    fill_actual_data();
}

// show 0 before number if number < 10
function showZero(number) {
    return number < 10 ? '0' + number : number;
}

// show date and time on main page
function dateAndTime() {
    let element_date = document.getElementById('date')
    let date = new Date();
    // show time
    document.getElementById('time').innerHTML = showZero(date.getHours()) + ':' + showZero(date.getMinutes()) + ':' + showZero(date.getSeconds());

    // update
    if (element_date.innerHTML == "" || date.getHours() == 0 && date.getMinutes() == 0) {
        element_date.innerHTML = showZero(date.getDate()) + '/' + showZero(date.getMonth() + 1) + '/' + date.getFullYear();
    }
}

function get_data(url) {
    return fetch(url)
        .then(data => data.json())
        .catch(error => alert("Erreur : " + error));
}

async function fill_actual_data(){
    let url_inside = BASE_URL + "api/inside_data";
    let url_outside = BASE_URL + "api/outside_data";
    let url_day_value = BASE_URL + "api/long_term_data/"

    //inside
    let inside_data = await get_data(url_inside);
    document.getElementById("inside_temperature").innerHTML = inside_data[0].temperature;
    document.getElementById("inside_humidity").innerHTML = inside_data[0].humidity;

    //outside
    let outside_data = await get_data(url_outside);
    document.getElementById("outside_temperature").innerHTML = outside_data[0].temperature;
    document.getElementById("current_forecast").innerHTML = outside_data[0].temperature + " C°";
    document.getElementById("outside_humidity").innerHTML = outside_data[0].humidity;

    let date = new Date()
    let end_date_string = get_UTC_date_string(date)
    date.setDate(date.getDate() - 1)
    let start_date_string = get_UTC_date_string(date)
    url_day_value += "?start_date=" + start_date_string + "&" + "end_date=" + end_date_string

    let day_value_data = await get_data(url_day_value);

    if (day_value_data.length > 0){
        let min = day_value_data[0].temperature
        let max = day_value_data[0].temperature
        let average = 0

        for (data of day_value_data){
            if (data.temperature < min){
                min = data.temperature
            }
            if (data.temperature > max){
                max = data.temperature
            }
            average += data.temperature
        }
        average = average / day_value_data.length

        document.getElementById("outside_min").innerHTML = min;
        document.getElementById("outside_average").innerHTML = average;
        document.getElementById("outside_max").innerHTML = max;
    }
}

async function fill_forecast_data() {
    let url = BASE_URL + "forecast"
    let response = await get_data(url);
    var sunriseTime = new Date(response.current.sunrise * 1000);
    var sunsetTime = new Date(response.current.sunset * 1000);
    document.getElementById('sunrise_time').innerHTML = sunriseTime.getHours() + ":" + showZero(sunriseTime.getMinutes());
    document.getElementById('sunset_time').innerHTML = sunsetTime.getHours() + ":" + showZero(sunsetTime.getMinutes());
    document.getElementById('current_forecast_image').src = "static/images/" + response.current.weather[0].icon + ".png";
    document.getElementById('+1h_forecast').innerHTML = "" + Math.round(response.hourly[2].temp) + " C°";
    document.getElementById('+1h_forecast_image').src = "static/images/" + response.hourly[2].weather[0].icon + ".png";
    document.getElementById('+3h_forecast').innerHTML = "" + Math.round(response.hourly[4].temp) + " C°";
    document.getElementById('+3h_forecast_image').src = "static/images/" + response.hourly[4].weather[0].icon + ".png";
    document.getElementById('+6h_forecast').innerHTML = "" + Math.round(response.hourly[7].temp) + " C°";
    document.getElementById('+6h_forecast_image').src = "static/images/" + response.hourly[7].weather[0].icon + ".png";
}

function get_UTC_date_string(date) {
    return date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1) + '-' + date.getUTCDate() + "T" + date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds();
}

async function fill_chart(){
    const ELEMENT_ID = 'chart_canvas'
    const API_URL = BASE_URL + "api/long_term_data/"

    let start_date_string = "";
    let end_date_string = "";

    let type = "";
    if (document.getElementById("id_chart_type_0").checked){
        type = "temperature";
    }
    else if (document.getElementById("id_chart_type_1").checked){
        type = "humidity";
    }
    else if (document.getElementById("id_chart_type_2").checked){
        type = "pressure";
    }
    else if (document.getElementById("id_chart_type_3").checked){
        type = "wind";
    }

    document.getElementById('date_range_picker').style.display = 'none';
    let timing = ""
    if (document.getElementById("id_chart_timing_0").checked){
        timing = "day";
        let date = new Date()
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        start_date_string = get_UTC_date_string(date)
        date.setDate(date.getDate() + 1);
        end_date_string = get_UTC_date_string(date)
    }
    else if (document.getElementById("id_chart_timing_1").checked){
        timing = "week";
        let date = new Date()
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setDate(date.getDate() + 1);
        end_date_string = get_UTC_date_string(date)
        date.setDate(date.getDate() - 7);
        start_date_string = get_UTC_date_string(date)
    }
    else if (document.getElementById("id_chart_timing_2").checked){
        timing = "month";
        let date = new Date()
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setDate(date.getDate() + 1);
        end_date_string = get_UTC_date_string(date)
        date.setMonth(date.getMonth() - 1);
        start_date_string = get_UTC_date_string(date)
    }
    else if (document.getElementById("id_chart_timing_3").checked){
        timing = "year";
        let date = new Date()
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setDate(date.getDate() + 1);
        end_date_string = get_UTC_date_string(date)
        date.setFullYear(date.getFullYear() - 1);
        start_date_string = get_UTC_date_string(date)
    }
    else if (document.getElementById("id_chart_timing_4").checked){
        timing = "date_range";
        document.getElementById('date_range_picker').style.display = 'block';

        let start_date = document.getElementById('start_date_select').value
        if (start_date != ""){
            start_date_string = get_UTC_date_string(new Date(document.getElementById('start_date_select').value))
        }
        let end_date = document.getElementById('end_date_select').value
        if (end_date != ""){
            end_date = new Date(document.getElementById('end_date_select').value)
            end_date.setDate(end_date.getDate() + 1)
            end_date_string = get_UTC_date_string(end_date)
        }
    }

    if (start_date_string == "" || end_date_string == "") {
        return;
    }

    let url = API_URL + "?start_date=" + start_date_string + "&" + "end_date=" + end_date_string

    let response = await get_data(url);
    let graph_info = ""

    switch (type)
    {
        case 'temperature' : graph_info = build_temperature_graph(response);
        break;
        case 'humidity' : graph_info = build_humidity_graph(response);
        break;
        case 'pressure' : graph_info = build_pressure_graph(response);
        break;
        case 'wind' : graph_info = build_wind_graph(response);
        break;
    }

    if (typeof weather_chart === 'undefined') {
        let ctx = document.getElementById(ELEMENT_ID).getContext('2d');
        var config =
        {
            type: 'line',
            data: graph_info,
            options: GRAPH_OPTION_1
        }
        weather_chart = new Chart(ctx, config);

    }
    else {
        weather_chart.data.datasets = graph_info.datasets;
        weather_chart.data.labels = graph_info.labels;
        weather_chart.update();
    }
}

function build_temperature_graph(response){
    let date = [];
    let temperature_array = [];
    for (data of response){
        date.push(data.time);
        temperature_array.push(data.temperature);
    }
    let graph_info = {
        labels: date,
        datasets:
            [
                {
                    label: "Température",
                    data: temperature_array,
                    fontColor: 'rgb(255, 255, 255)',
                    borderColor: 'rgb(50, 52, 199)',
                    pointRadius: 5,
                    pointHoverRadius: 5,
                    fill: false,
                    hidden: false,
                    tension: 0.3,
                },
            ],
    }
    return graph_info
}
function build_humidity_graph(response){
    let date = [];
    let humidity_array = [];
    for (data of response){
        date.push(data.time);
        humidity_array.push(data.humidity);
    }
    let graph_info = {
        labels: date,
        datasets:
            [
                {
                    label: "Humidité",
                    data: humidity_array,
                    fontColor: 'rgb(255, 255, 255)',
                    borderColor: 'rgb(50, 52, 199)',
                    pointRadius: 5,
                    pointHoverRadius: 5,
                    fill: false,
                    hidden: false,
                    tension: 0.3,
                },
            ],
    }
    return graph_info
}

const GRAPH_OPTION_1 = {
    responsive: true,
    aspectRatio: 2,
    plugins:
    {
        title:
        {
            display: false,
            text: '',
            color: 'rgb(255, 255, 255)'
        },
        legend:
        {
            labels: {
                color: 'rgb(255, 255, 255)',
            },
            position: 'top',
            color: 'rgb(255, 255, 255)',
        },
    },
    scales:
    {
        x:
        {
            ticks: {
                color: 'rgb(255, 255, 255)',
            },
            title:
            {

                display: true,
                text: 'Date',
                color: 'rgb(255, 255, 255)'
            }
        },
        y:
        {
            ticks: {
                color: 'rgb(255, 255, 255)',
            },
        }
    }
}
