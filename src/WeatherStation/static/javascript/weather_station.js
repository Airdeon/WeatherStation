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
    setInterval("fill_chart()", 600000);
    //actual data
    fill_actual_data();
    setInterval("fill_actual_data()", 5000);
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

async function fill_actual_data() {
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
    let end_date_string = get_UTC_datetime_string(date)
    date.setDate(date.getDate() - 1)
    let start_date_string = get_UTC_datetime_string(date)
    url_day_value += "?start_date=" + start_date_string + "&" + "end_date=" + end_date_string

    let day_value_data = await get_data(url_day_value);

    if (day_value_data.length > 0) {
        let min = 0
        let max = 0
        let average = 0
        for (data of day_value_data){
            if(data != null){
                min = day_value_data[0].temperature;
                max = day_value_data[0].temperature;
                break;
            }
        }
        for (data of day_value_data) {
            if (data.temperature < min) {
                min = data.temperature
            }
            if (data.temperature > max) {
                max = data.temperature
            }
            average += data.temperature
        }
        average = Math.round((average / day_value_data.length) * 10) / 10

        document.getElementById("outside_min").innerHTML = min;
        document.getElementById("outside_average").innerHTML = average;
        document.getElementById("outside_max").innerHTML = max;
    }

    // pressure and wind

    document.getElementById("pressure").innerHTML = outside_data[0].pressure;
    document.getElementById("wind").innerHTML = outside_data[0].wind_speed;
    document.getElementById("wind_direction").innerHTML = outside_data[0].wind_direction;
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

async function fill_chart() {
    const ELEMENT_ID = 'chart_canvas'
    const API_URL = BASE_URL + "api/long_term_data/"

    let start_date_string = "";
    let end_date_string = "";

    // get type
    let type = "";
    if (document.getElementById("id_chart_type_0").checked) {
        type = "temperature";
    }
    else if (document.getElementById("id_chart_type_1").checked) {
        type = "humidity";
    }
    else if (document.getElementById("id_chart_type_2").checked) {
        type = "pressure";
    }
    else if (document.getElementById("id_chart_type_3").checked) {
        type = "wind";
    }

    // get timing
    let average_timing = "all_data"
    if (document.getElementById("id_average_timing_1").checked) {
        average_timing = "hourly"
    }
    if (document.getElementById("id_average_timing_2").checked) {
        average_timing = "daily"
    }
    if (document.getElementById("id_average_timing_3").checked) {
        average_timing = "monthly"
    }
    if (document.getElementById("id_average_timing_4").checked) {
        average_timing = "yearly"
    }

    // get date range
    document.getElementById('date_range_picker').style.display = 'none';
    let range = ""
    if (document.getElementById("id_chart_timing_0").checked) {
        range = "day";
        let date = new Date()
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        start_date_string = get_UTC_datetime_string(date)
        date.setDate(date.getDate() + 1);
        end_date_string = get_UTC_datetime_string(date)
    }
    else if (document.getElementById("id_chart_timing_1").checked) {
        range = "week";
        let date = new Date()
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setDate(date.getDate() + 1);
        end_date_string = get_UTC_datetime_string(date)
        date.setDate(date.getDate() - 7);
        start_date_string = get_UTC_datetime_string(date)
    }
    else if (document.getElementById("id_chart_timing_2").checked) {
        range = "month";
        let date = new Date()
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setDate(date.getDate() + 1);
        end_date_string = get_UTC_datetime_string(date)
        date.setMonth(date.getMonth() - 1);
        start_date_string = get_UTC_datetime_string(date)
    }
    else if (document.getElementById("id_chart_timing_3").checked) {
        range = "year";
        let date = new Date()
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setDate(date.getDate() + 1);
        end_date_string = get_UTC_datetime_string(date)
        date.setFullYear(date.getFullYear() - 1);
        start_date_string = get_UTC_datetime_string(date)
    }
    else if (document.getElementById("id_chart_timing_4").checked) {
        range = "date_range";
        document.getElementById('date_range_picker').style.display = 'block';

        let start_date = document.getElementById('start_date_select').value
        if (start_date != "") {
            start_date_string = get_UTC_datetime_string(new Date(document.getElementById('start_date_select').value))
        }
        let end_date = document.getElementById('end_date_select').value
        if (end_date != "") {
            end_date = new Date(document.getElementById('end_date_select').value)
            end_date.setDate(end_date.getDate() + 1)
            end_date_string = get_UTC_datetime_string(end_date)
        }
    }

    if (start_date_string == "" || end_date_string == "") {
        return;
    }

    let url = API_URL + "?start_date=" + start_date_string + "&" + "end_date=" + end_date_string

    let response = await get_data(url);
    let graph_info = build_simple_graph(response, type, range, average_timing);

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


function build_simple_graph(response, type, range, timing = "all_data") {
    let date = [];
    let value_array = [];
    let max_temperature = []
    let min_temperature = []
    let max_wind_speed = []
    if (response.length > 0) {
        let last_date = new Date(response[0].time);
        let temp_array = [];

        if (timing == "hourly") {
            date.push(get_hour_string(last_date));
        }
        else if (timing == "daily") {
            date.push(get_day_month_string(last_date));
        }
        else if (timing == "monthly") {
            date.push(get_month_year_string(last_date));
        }
        else if (timing == "yearly") {
            date.push(last_date.getFullYear());
        }

        for (data of response) {
            if (type == "temperature") {
                var data_value = data.temperature;
            }
            else if (type == "pressure") {
                var data_value = data.pressure;
            }
            else if (type == "humidity") {
                var data_value = data.humidity;
            }
            else if (type == "wind") {
                var data_value = data.average_wind_speed;
            }

            let actual_date = new Date(data.time)
            if (timing == "all_data") {
                if (range == "day"){
                    date.push(get_hours_minutes_string(data.time));
                }
                else if (range == "week"){
                    date.push(get_day_month_string(data.time));
                }
                else if (range == "month"){
                    date.push(get_day_month_string(data.time));
                }
                else if (range == "year"){
                    date.push(get_day_month_string(data.time));
                }
                else {
                    date.push(get_full_datetime_string(data.time));
                }

                value_array.push(data_value);
                if (type == "wind") {
                    max_wind_speed.push(data.max_wind_speed_10min);
                }
            }

            // Hourly
            else if (timing == "hourly") {
                console
                if (actual_date.getHours() == last_date.getHours()) {
                    temp_array.push(data_value);
                    if (type == "temperature") {
                        if (max_temperature.length == 0) {
                            max_temperature.push(data_value);
                            min_temperature.push(data_value);
                        }
                        else {
                            if (max_temperature[max_temperature.length - 1] < data_value) {
                                max_temperature[max_temperature.length - 1] = data_value;
                            }
                            if (min_temperature[min_temperature.length - 1] > data_value) {
                                min_temperature[min_temperature.length - 1] = data_value;
                            }
                        }
                    }
                    else if (type == "wind") {
                        if (max_wind_speed.length == 0) {
                            max_wind_speed.push(data.max_wind_speed_10min)
                        }
                        else {
                            if (max_wind_speed[max_wind_speed.length - 1] < data.max_wind_speed_10min) {
                                max_wind_speed[max_wind_speed.length - 1] = data.max_wind_speed_10min;
                            }
                        }

                    }
                    last_date = actual_date;
                }
                else {
                    value_array.push(average(temp_array));
                    date.push(get_hour_string(data.time));
                    temp_array = [];
                    temp_array.push(data_value);
                    if (type == "temperature") {
                        max_temperature.push(data_value);
                        min_temperature.push(data_value);
                    }
                    else if (type == "wind") {
                        max_wind_speed.push(data.max_wind_speed_10min)
                    }
                    last_date = actual_date;
                }
            }

            //Daily
            else if (timing == "daily") {
                if (actual_date.getDate() == last_date.getDate()) {
                    temp_array.push(data_value);
                    if (type == "temperature") {
                        if (max_temperature.length == 0) {
                            max_temperature.push(data_value);
                            min_temperature.push(data_value);
                        }
                        else {
                            if (max_temperature[max_temperature.length - 1] < data_value) {
                                max_temperature[max_temperature.length - 1] = data_value;
                            }
                            if (min_temperature[min_temperature.length - 1] > data_value) {
                                min_temperature[min_temperature.length - 1] = data_value;
                            }
                        }
                    }
                    else if (type == "wind") {
                        if (max_wind_speed.length == 0) {
                            max_wind_speed.push(data.max_wind_speed_10min)
                        }
                        else {
                            if (max_wind_speed[max_wind_speed.length - 1] < data.max_wind_speed_10min) {
                                max_wind_speed[max_wind_speed.length - 1] = data.max_wind_speed_10min;
                            }
                        }

                    }
                    last_date = actual_date;
                }
                else {
                    value_array.push(average(temp_array));
                    date.push(get_day_month_string(data.time));
                    temp_array = [];
                    temp_array.push(data_value);
                    if (type == "temperature") {
                        max_temperature.push(data_value);
                        min_temperature.push(data_value);
                    }
                    else if (type == "wind") {
                        max_wind_speed.push(data.max_wind_speed_10min)
                    }
                    last_date = actual_date;
                }
            }
            else if (timing == "monthly") {
                if (actual_date.getMonth() == last_date.getMonth()) {
                    temp_array.push(data_value);
                    if (type == "temperature") {
                        if (max_temperature.length == 0) {
                            max_temperature.push(data_value);
                            min_temperature.push(data_value);
                        }
                        else {
                            if (max_temperature[max_temperature.length - 1] < data_value) {
                                max_temperature[max_temperature.length - 1] = data_value;
                            }
                            if (min_temperature[min_temperature.length - 1] > data_value) {
                                min_temperature[min_temperature.length - 1] = data_value;
                            }
                        }
                    }
                    else if (type == "wind") {
                        if (max_wind_speed.length == 0) {
                            max_wind_speed.push(data.max_wind_speed_10min)
                        }
                        else {
                            if (max_wind_speed[max_wind_speed.length - 1] < data.max_wind_speed_10min) {
                                max_wind_speed[max_wind_speed.length - 1] = data.max_wind_speed_10min;
                            }
                        }

                    }
                    last_date = actual_date;
                }
                else {
                    value_array.push(average(temp_array));
                    date.push(get_month_year_string(data.time));
                    temp_array = [];
                    temp_array.push(data_value);
                    if (type == "temperature") {
                        max_temperature.push(data_value);
                        min_temperature.push(data_value);
                    }
                    else if (type == "wind") {
                        max_wind_speed.push(data.max_wind_speed_10min)
                    }
                    last_date = actual_date;
                }
            }
            else if (timing == "yearly") {
                if (actual_date.getFullYear() == last_date.getFullYear()) {
                    temp_array.push(data_value);
                    if (type == "temperature") {
                        if (max_temperature.length == 0) {
                            max_temperature.push(data_value);
                            min_temperature.push(data_value);
                        }
                        else {
                            if (max_temperature[max_temperature.length - 1] < data_value) {
                                max_temperature[max_temperature.length - 1] = data_value;
                            }
                            if (min_temperature[min_temperature.length - 1] > data_value) {
                                min_temperature[min_temperature.length - 1] = data_value;
                            }
                        }
                    }
                    else if (type == "wind") {
                        if (max_wind_speed.length == 0) {
                            max_wind_speed.push(data.max_wind_speed_10min)
                        }
                        else {
                            if (max_wind_speed[max_wind_speed.length - 1] < data.max_wind_speed_10min) {
                                max_wind_speed[max_wind_speed.length - 1] = data.max_wind_speed_10min;
                            }
                        }

                    }
                    last_date = actual_date;
                }
                else {
                    value_array.push(average(temp_array));
                    date.push(data.time.getFullYear());
                    temp_array = [];
                    temp_array.push(data_value);
                    if (type == "temperature") {
                        max_temperature.push(data_value);
                        min_temperature.push(data_value);
                    }
                    else if (type == "wind") {
                        max_wind_speed.push(data.max_wind_speed_10min)
                    }
                    last_date = actual_date;
                }
            }
        }
        if (timing != "all_data") {
            console.log("test")
            value_array.push(average(temp_array));
        }
    }

    //type traduction
    let label = ""
    if (type == "temperature") {
        label = "Temperature";
        if (timing != "all_data") {
            label = "Moyenne";
        }
    }
    else if (type == "pressure") {
        label = "Pression";
    }
    else if (type == "humidity") {
        label = "Humidité";
    }
    else if (type == "wind") {
        label = "Vent moyen";
    }

    let temperature_maximum_dict = {
        label: "Maximum",
        data: max_temperature,
        fontColor: 'rgb(255, 255, 255)',
        borderColor: 'rgb(255, 0, 0)',
        pointRadius: 5,
        pointHoverRadius: 5,
        fill: false,
        hidden: false,
        tension: 0.3,
    }

    let temperature_minimum_dict = {
        label: "Minimum",
        data: min_temperature,
        fontColor: 'rgb(255, 255, 255)',
        borderColor: 'rgb(0, 0, 255)',
        pointRadius: 5,
        pointHoverRadius: 5,
        fill: false,
        hidden: false,
        tension: 0.3,
    }

    let wind_maximum_dict = {
        label: "Vent maximum",
        data: max_wind_speed,
        fontColor: 'rgb(255, 255, 255)',
        borderColor: 'rgba(207, 110, 0, 0.8)',
        backgroundColor: 'rgba(247, 132, 0, 0.8)',
        borderWidth: '2px',
        pointRadius: 5,
        pointHoverRadius: 5,
        fill: false,
        hidden: false,
        type: 'bar',
    }

    let temperature_dict = {
        label: "Temperature",
        data: value_array,
        fontColor: 'rgb(255, 255, 255)',
        borderColor: 'rgb(0, 191, 22)',
        pointRadius: 5,
        pointHoverRadius: 5,
        fill: false,
        hidden: false,
        tension: 0.3,
    }

    let wind_dict = {
        label: label,
        data: value_array,
        fontColor: 'rgb(255, 255, 255)',
        borderColor: 'rgb(218, 255, 214)',
        pointRadius: 5,
        pointHoverRadius: 5,
        fill: false,
        hidden: false,
        tension: 0.3,
    }

    let humidity_dict = {
        label: "Humidité",
        data: value_array,
        fontColor: 'rgb(255, 255, 255)',
        borderColor: 'rgb(0, 0, 255)',
        pointRadius: 5,
        pointHoverRadius: 5,
        fill: false,
        hidden: false,
        tension: 0.3,
    }

    let pressure_dict = {
        label: "Pression",
        data: value_array,
        fontColor: 'rgb(255, 255, 255)',
        borderColor: 'rgb(0, 191, 22)',
        pointRadius: 5,
        pointHoverRadius: 5,
        fill: false,
        hidden: false,
        tension: 0.3,
    }

    console.log(value_array)

    let graph_info = {
        labels: date,
        datasets: [],
    }

    if (type == "temperature") {
        graph_info["datasets"].push(temperature_dict);
        if (timing != "all_data") {
            graph_info["datasets"].push(temperature_maximum_dict);
            graph_info["datasets"].push(temperature_minimum_dict);
        }
    }

    else if (type == "humidity") {
        graph_info["datasets"].push(humidity_dict);
    }

    else if (type == "pressure") {
        graph_info["datasets"].push(pressure_dict);
    }

    else if (type == "wind") {
        graph_info["datasets"].push(wind_maximum_dict);
        graph_info["datasets"].push(wind_dict);
    }
    console.log(graph_info);
    return graph_info;
}

function build_wind_graph(response) {
    let date = [];
    let max_wind_speed_array = [];
    let average_wind_speed_array = [];
    for (data of response) {
        date.push(data.time);
        max_wind_speed_array.push(data.max_wind_speed_10min);
        average_wind_speed_array.push(data.average_wind_speed);
    }
    let graph_info = {
        labels: date,
        datasets:
            [
                {
                    label: "Vent moyen",
                    data: average_wind_speed_array,
                    fontColor: 'rgb(255, 255, 255)',
                    borderColor: 'rgb(218, 255, 214)',
                    pointRadius: 5,
                    pointHoverRadius: 5,
                    fill: false,
                    hidden: false,
                    tension: 0.3,
                },
                {
                    label: "Vent maximum",
                    data: max_wind_speed_array,
                    fontColor: 'rgb(255, 255, 255)',
                    borderColor: 'rgba(207, 110, 0, 0.8)',
                    backgroundColor: 'rgba(247, 132, 0, 0.8)',
                    borderWidth: '2px',
                    pointRadius: 5,
                    pointHoverRadius: 5,
                    fill: false,
                    hidden: false,
                    tension: 0.3,
                    type: 'bar',
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
