const BASE_URL = location.protocol + "//" + location.host + "/"

// call and actualize fonction
window.onload = function()
{
    //time
    dateAndTime();
    setInterval("dateAndTime()", 1000);
    //Forecast
    fill_forecast_data();
}

// show 0 before number if number < 10
function showZero(number)
{
    return number < 10 ? '0' + number : number;
}

// show date and time on main page
function dateAndTime()
{
    let element_date = document.getElementById('date')
    let date = new Date();
    // show time
    document.getElementById('time').innerHTML = showZero(date.getHours()) + ':' + showZero(date.getMinutes()) + ':' + showZero(date.getSeconds());

    // update
    if (element_date.innerHTML == "" || date.getHours() == 0 && date.getMinutes() == 0){
        element_date.innerHTML = showZero(date.getDate()) + '/' + showZero(date.getMonth()+1) + '/' + date.getFullYear();
    }
}

function get_data(url) {
    return fetch(url)
        .then(data => data.json())
        .catch(error => alert("Erreur : " + error));
}

async function fill_forecast_data(){
    let url = BASE_URL + "forecast"
    let response = await get_data(url);
    var sunriseTime = new Date(response.current.sunrise * 1000);
    var sunsetTime = new Date(response.current.sunset * 1000);
    document.getElementById('sunrise_time').innerHTML = sunriseTime.getHours() + ":" + showZero(sunriseTime.getMinutes());
    document.getElementById('sunset_time').innerHTML = sunsetTime.getHours() + ":" + showZero(sunsetTime.getMinutes());
}