<?php
    try
    {
        $db = new PDO('mysql:host=localhost;dbname=c1WeatherDataBase;charset=utf8', 'c1weatherstation', 'W4fYizE_',[PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION],);
    }
    catch (Exception $e)
    {
        die('Erreur : ' . $e->getMessage());
    }

    $date = $db->query("SELECT data_DateTime FROM Global_Data ORDER BY 'data_DateTime' DESC LIMIT 1");
    $fetchDate = $date->fetch();
    $firstDate = substr($fetchDate['data_DateTime'],0,-9);

    echo $firstDate;
?>