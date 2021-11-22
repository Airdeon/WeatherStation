<?php
    try
    {
        $db = new PDO('mysql:host=localhost;dbname=c1WeatherDataBase;charset=utf8', 'c1weatherstation', 'W4fYizE_',[PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION],);
    }
    catch (Exception $e)
    {
        die('Erreur : ' . $e->getMessage());
    }
    $data = $db->query('SELECT * FROM Actual_Data');
    $actualdata = $data->fetch();
    echo '{"OUT_dataTime": ',json_encode($actualdata['OUT_DateTime']),',';
    echo '"temperature": ',json_encode($actualdata['OUT_Temperature']),',';
    echo '"humidity": ',json_encode($actualdata['OUT_Humidity']),',';
    echo '"pressure": ',json_encode($actualdata['pressure']),',';
    echo '"averageWindSpeed": ',json_encode($actualdata['averageWindSpeed']),',';
    echo '"windSpeed": ',json_encode($actualdata['windSpeed']),',';
    echo '"maxWindSpeed10Min": ',json_encode($actualdata['maxWindSpeed10Min']),',';
    echo '"windDirection": ',json_encode($actualdata['windDirection']),',';
    echo '"IN_dataTime": ',json_encode($actualdata['IN_DateTime']),',';
    echo '"IN_temperature": ',json_encode($actualdata['IN_Temperature']),',';
    echo '"IN_humidity": ',json_encode($actualdata['IN_Humidity']),'}';
    $data->closeCursor();
?>
