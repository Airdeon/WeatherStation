<?php
    try
    {
        $bdd = new PDO('mysql:host=localhost;dbname=WeatherDataBase;charset=utf8', 'weather', 'weatheraspremont');
        $bdd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    catch (Exception $e)
    {
        die('Erreur : ' . $e->getMessage());
    }
    // initialize day -1 and -2
    $actualTime = time();
    $formatActualTime = date('"Y-m-d H:i:s"', $actualTime);//H:i:s
    $day1Before = strtotime("-1 day");
    $formatday1Before = date('"Y-m-d H:i:s"', $day1Before);
    $day2Before = strtotime("-2 days");
    $formatday2Before = date('"Y-m-d H:i:s"', $day2Before);
    // call Bdd
    $request1Day = $bdd->query('SELECT * FROM Global_Data WHERE data_DateTime BETWEEN '.$formatday1Before.' AND '.$formatActualTime.'');
    $request2Days = $bdd->query('SELECT * FROM Global_Data WHERE data_DateTime BETWEEN '.$formatday2Before.' AND '.$formatActualTime.'');
    $rainPrecipitationRequest = $bdd->query('SELECT * FROM OUT_rainMeter WHERE entryDate BETWEEN '.$formatday2Before.' AND '.$formatActualTime.'');
    // read data of last 24h
    while($donnees = $request1Day->fetch())
    {
        $shortTime1day = substr($donnees['data_DateTime'],11,-3);
        $resultArray1dayDate[] = $shortTime1day;
        $resultArrayTemp[] = $donnees['temperature'];
        $resultArrayHumidity[] = $donnees['humidity'];
    }
    //read data of 2 last day
    while($donnees = $request2Days->fetch())
    {
        $shortTime2days = substr($donnees['data_DateTime'],11,-3);
        $resultArray2daysDate[] = $shortTime2days;
        $resultArrayPressure[] = $donnees['pressure'];
        $resultArrayWindSpeed[] = $donnees['windSpeed'];
        $resultArrayWindMaxSpeed[] = $donnees['maxWindSpeed'];
    }
    //read rain precipitation
    while($donnees = $rainPrecipitationRequest->fetch())
    {
        $shortTimePrecipitation = substr($donnees['entryDate'],11,-3);
        $resultArrayPrecipitationDate[] = $shortTimePrecipitation;
        $resultArrayPrecipitation[] = $donnees['rainPrecipitation'];
    }
    echo '{"date1Day": ', json_encode($resultArray1dayDate),',';
    echo '"temperature": ', json_encode($resultArrayTemp),',';
    echo '"humidity": ',json_encode($resultArrayHumidity),',';
    echo '"date2Days": ',json_encode($resultArray2daysDate),',';
    echo '"pressure": ',json_encode($resultArrayPressure),',';
    echo '"precipitationDate": ',json_encode($resultArrayPrecipitationDate),',';
    echo '"precipitation": ',json_encode($resultArrayPrecipitation),',';
    echo '"windSpeed": ',json_encode($resultArrayWindSpeed),',';
    echo '"maxWindSpeed": ',json_encode($resultArrayWindMaxSpeed),'}';
    $request1Day->closeCursor();
    $request2Days->closeCursor();
    $rainPrecipitationRequest->closeCursor();
?>