<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <link rel="stylesheet" href="style.css" />
        <script type="text/javascript" src="weatherstation.js"></script>
        <title>Weather Station</title>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"></script>

    </head>
    <body>
        <header>
            <div id="show_time"></div>
            <div id="sunriseSunsetTime">
                <div id="sunriseTime"></div>
                <div id="sunsetTime"></div>
            </div>
            <div id="todayForecast">
                <div id="currentForecast"></div>
                <div id="+1hForecast"></div>
                <div id="+3hForecast"></div>
                <div id="+6hForecast"></div>
            </div>
        </header>
        <nav>

        </nav>
        <section>
            <div id="blockinfo">
                <div id="Outside">
                    <h2>Outside</h2>
                    <h3 id="outsideDate"></h3>
                    <div id="actualOutsideTemperature"></div>
                    <div id="actualOutsideHumidity"></div>
                </div>
                <div id="Inside">
                    <h2>Inside</h2>
                    <h3 id="insideDate"></h3>
                    <div id="actualInsideTemperature"></div>
                    <div id="actualInsideHumidity"></div>
                </div>
                <div id="otherFactor">
                    <h2>Pressure and Wind</h2>
                    <div id="actualPressure"></div>
                    <div id="wind"></div>
                </div>
            </div>
            <div id="Forecast">
                <div id="day+1"></div>
                <div id="day+2"></div>
                <div id="day+3"></div>
                <div id="day+4"></div>
                <div id="day+5"></div>
                <div id="day+6"></div>
                <div id="day+7"></div>
            </div>
            <div id="graph"><canvas id="dayTempHumiGraph"></canvas></div>
            <div id="graph"><canvas id="pressureGraph"></canvas></div>
            <div id="graph"><canvas id="windAverageAndMaxGraph"></canvas></div>
            <div id="graph"><canvas id="customGraph"></canvas></div>
            <div id="graph"><canvas id="rainPrecipitatonGraph"></canvas></div>
        </section>
    </body>
    <footer>

    </footer>

</html>

