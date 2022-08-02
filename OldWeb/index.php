<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <link rel="stylesheet" href="style.css" />
        <script type="text/javascript" src="weatherstation.js"></script>
        <title>Weather Station</title>
        <!--<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"></script>-->
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.6.0/chart.js"></script>

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
            <div id="graph"><canvas id="temperatureGraph"></canvas></div>
            <div id="graph"><canvas id="rainPrecipitatonGraph"></canvas></div>
            <!--Form for custom graph-->
            <div id="formCustomGraph">
                <form method="post" action="customgraph.php">
                    <!--part 1 : Global data type-->
                    <div id="blockDataType">
                        <select name="datatype" id="datatype" onchange="choiseBlockDataType(this.value);">
                            <option value="0">Select</option>
                            <option value="1">Temperature</option>
                            <option value="2">Humidity</option>
                            <option value="3">Pressure</option>
                            <option value="4">Hydrometry</option>
                            <option value="5">Wind</option>
                        </select>
                    </div>
                    <!--part 2 : Time Rate-->
                    <div id="blockTimeRate">
                        <select name="timeRate" id="timeRate" onchange="showTimeRateSelect(this.value)">
                            <option value="0">Select</option>
                            <option value="1">All Data</option>
                            <option value="2">Hourly</option>
                            <option value="3">Daily</option>
                            <option value="4">Monthly</option>
                            <option value="5">yearly</option>
                        </select>
                    </div>
                    <!--part 3 : Start Date-->
                    <div id="blockTimeStart">
                        <input type="date" name="startDate" id="startDate" min="<?php include('minDate.php');?>" max="<?php echo date('Y-m-d') ?>" value="<?php echo date("Y-m-d", strtotime("-2 days")) ?>" onchange="saveTimeStart(this.value)"/>
                    </div>
                    <!--part 4 : End Date-->
                    <div id="blockTimeEnd">
                        <input type="date" name="endDate" id="endDate" min="<?php include('minDate.php');?>" max="<?php echo date('Y-m-d') ?>" value="<?php echo date("Y-m-d") ?>" onchange="saveTimeEnd(this.value)"/>
                    </div>
                    <!--part 5 : Detail data type-->
                    <div id="blockTemperature">
                        <input type="checkbox" name="min" id="min" onclick="checkboxclik(this)" /> <label for="min">Minimum</label>
                        <input type="checkbox" name="max" id="max" onclick="checkboxclik(this)" /> <label for="max">Maximum</label>
                        <input type="checkbox" name="average" id="average" onclick="checkboxclik(this)" /> <label for="average">Average</label>
                    </div>
                    <div id="blockWind">
                        <input type="checkbox" name="max" id="max" onclick="checkboxclik(this)" /> <label for="max">Maximum</label>
                        <input type="checkbox" name="average" id="average" onclick="checkboxclik(this)" /> <label for="average">Average</label>
                    </div>
                </form>
                <div id="test">
                    <p id="testtext"></p>
                    <p id="testtext2"></p>
                </div>
            </div>
            <div id="graph"><canvas id="customGraph"></canvas></div>
        </section>
    </body>
    <footer>

    </footer>

</html>

