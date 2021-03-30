<?php
    try
    {
        $bdd = new PDO('mysql:host=localhost;dbname=WeatherDataBase;charset=utf8', 'weather', 'weatheraspremont');
    }
    catch (Exception $e)
    {
        die('Erreur : ' . $e->getMessage());
    }
    $OUT = $bdd->query('SELECT * FROM Actual_Data');
    $donneesOUT = $OUT->fetch();
    $IN = $bdd->query('SELECT * FROM IN_Actual_Data');
    $donneesIN = $IN->fetch();
    echo '{"OUT_dataTime": ', json_encode($donneesOUT['data_DateTime']),',';
    echo '"temperature": ', json_encode($donneesOUT['temperature']),',';
    echo '"humidity": ',json_encode($donneesOUT['humidity']),',';
    echo '"pressure": ',json_encode($donneesOUT['pressure']),',';
    echo '"averageWindSpeed": ',json_encode($donneesOUT['averageWindSpeed']),',';
    echo '"windSpeed": ',json_encode($donneesOUT['windSpeed']),',';
    echo '"maxWindSpeed10Min": ',json_encode($donneesOUT['maxWindSpeed10Min']),',';
    echo '"windDirection": ',json_encode($donneesOUT['windDirection']),',';
    echo '"IN_dataTime": ',json_encode($donneesIN['data_DateTime']),',';
    echo '"IN_temperature": ',json_encode($donneesIN['temperature']),',';
    echo '"IN_humidity": ',json_encode($donneesIN['humidity']),'}';
    $OUT->closeCursor();
    $IN->closeCursor();
?>
