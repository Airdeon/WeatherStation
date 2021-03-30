<?php
    try
    {
        $bdd = new PDO('mysql:host=localhost;dbname=WeatherDataBase;charset=utf8', 'weather', 'weatheraspremont');
    }
    catch (Exception $e)
    {
        die('Erreur : ' . $e->getMessage());
    }
    $actualTime = time();
    $formatActualTime = date('"Y-m-d H:i:s"', $actualTime);//H:i:s
    $beginOfTheMonth = date('"Y-m-01"', $actualTime);
    $day30Before = strtotime("-30 days");
    $formatday30Before = date('"Y-m-d H:i:s"', $day30Before);
    $request = $bdd->query('SELECT * FROM Global_Data WHERE data_DateTime BETWEEN '.$formatday30Before.' AND '.$formatActualTime.'');
    $notPlay = true;
    $saveDataPerDay = 0;
    $sameIndex = -1;
    $initValue = -1;
    $sameDate = -1;
    $index = 0;
    $calculAverage = 0;
    $saveDataPerDay = 0;
    $lastDate = "00-00-00";
    while($donnees = $request->fetch())
    {
        if($notPlay)
        {
            $lastDate = substr($donnees['data_DateTime'],2,-9);
            $notPlay = false;
        }
        //send last day average and change index
        if(substr($donnees['data_DateTime'],2,-9) != $lastDate)
        {
            $average[$index] = ''. round($calculAverage/$saveDataPerDay,1) . '';
            $calculAverage = 0;
            $saveDataPerDay = 0;
            $index++;
            $lastDate = substr($donnees['data_DateTime'],2,-9);
        }
        //initialisation of the first value of the day
        if($initValue != $index)
        {
            $max[$index] = $donnees['temperature'];
            $min[$index] = $donnees['temperature'];
            $initValue = $index;
        }
        //save maximal temperature
        if($max[$index] < $donnees['temperature'])
        {
            $max[$index] = $donnees['temperature'];
        }
        //save minimal temperature
        if($min[$index] > $donnees['temperature'])
        {
            $min[$index] = $donnees['temperature'];
        }
        //calcule average temperature of the day
        $calculAverage += $donnees['temperature'];
        $saveDataPerDay++;
        //Save Date
        if($sameDate != $index)
        {
            $date[$index] = substr($donnees['data_DateTime'],5,-9);
            $sameDate = $index;
        }
    }
    $average[$index] = ''. round($calculAverage/$saveDataPerDay,1) . '';
    //generate json
    echo '{"date": ', json_encode($date),',';
    echo '"max": ', json_encode($max),',';
    echo '"min": ', json_encode($min),',';
    echo '"average": ', json_encode($average),'}';
    $request->closeCursor();
?>