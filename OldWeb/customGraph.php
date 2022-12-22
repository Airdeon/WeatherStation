<?php
    try
    {
        $db = new PDO('mysql:host=localhost;dbname=c1WeatherDataBase;charset=utf8', 'c1weatherstation', 'W4fYizE_',[PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION],);
    }
    catch (Exception $e)
    {
        die('Erreur : ' . $e->getMessage());
    }
    // load data selector
    $query = "SELECT * FROM Custom_Graph";
    $dataType = $db->prepare($query);
    $dataType->execute();
    $dataTypeFetch = $dataType->fetch();
    $parameter = [$dataTypeFetch['dataType'], $dataTypeFetch['timeRate'], $dataTypeFetch['time1'], $dataTypeFetch['time2'], $dataTypeFetch['dataParam1'], $dataTypeFetch['dataParam2'], $dataTypeFetch['dataParam3']];
    $dateStart = $dataTypeFetch['time1'];
        $dateEnd = $dataTypeFetch['time2'];
        error_log($dateStart, 0);
    //make query with data selector
    if ($dataTypeFetch['dataType'] == 1)
    {
        $query = 'SELECT data_DateTime, temperature FROM Global_Data WHERE data_DateTime BETWEEN :dateStart AND :dateEnd';
    }
    else if ($dataTypeFetch['dataType'] == 2)
    {
        $query = "SELECT data_DateTime, humidity FROM Global_Data WHERE data_DateTime BETWEEN :dateStart AND :dateEnd";
    }
    else if ($dataTypeFetch['dataType'] == 3)
    {
        $query = 'SELECT data_DateTime, pressure FROM Global_Data WHERE data_DateTime BETWEEN :dateStart AND :dateEnd';
    }
    else if ($dataTypeFetch['dataType'] == 4)
    {
        $query = 'SELECT data_DateTime, precipitation FROM Global_Data WHERE data_DateTime BETWEEN :dateStart AND :dateEnd';
    }
    else if ($dataTypeFetch['dataType'] == 5)
    {
        $query = 'SELECT data_DateTime, windSpeed, maxWindSpeed FROM Global_Data WHERE data_DateTime BETWEEN :dateStart AND :dateEnd';
    }
    error_log($query, 0);
    if ($dataTypeFetch['dataType'] > 0)
    {
        $sql_connect = $db->prepare($query);
        $sql_connect->execute(array(':dateStart' => $dateStart, ':dateEnd' => $dateEnd));

        $notPlay = true;
        $saveDataPerTimeRate = 0;
        $sameIndex = -1;
        $initValue = -1;
        $sameDate = -1;
        $index = 0;
        $calculAverage = 0;
        $calculTotal = 0;
        $lastDate = "00-00-00";

        switch ($dataTypeFetch['dataType'])
        {
            case 1: $dataTypeString = 'temperature';
            break;
            case 2: $dataTypeString = 'humidity';
            break;
            case 3: $dataTypeString = 'pressure';
            break;
            case 4: $dataTypeString = 'precipitation';
            break;
            case 5: $dataTypeString = 'windSpeed';
            break;
        }

        // all data
        if ($dataTypeFetch['timeRate'] == 1 )
        {
            while($dataArray = $sql_connect->fetch())
            {
                $shortTime = substr($dataArray['data_DateTime'],0,-3);
                $date[] = $shortTime;
                $resultArrayData[] = $dataArray[$dataTypeString];
                if ($dataTypeFetch['dataType'] == 5)
                {
                    $resultArrayDataMaxWind[] = $dataArray['maxWindSpeed'];
                }
            }
        }
        // precipitation
        else if ($dataTypeFetch['dataType'] == 4 && $dataTypeFetch['timeRate'] > 1)
        {
            // hourly precipitation
            if ($dataTypeFetch['timeRate'] == 2)
            {
                while($dataArray = $sql_connect->fetch())
                {
                    if($notPlay)
                    {
                        $lastDate = substr($dataArray['data_DateTime'],2,-6);
                        $notPlay = false;
                    }
                    //send last day average and change index
                    if(substr($dataArray['data_DateTime'],2,-6) != $lastDate)
                    {
                        $PrecipitationTotal[$index] = $calculTotal;
                        $calculTotal = 0;
                        $index++;
                        $lastDate = substr($dataArray['data_DateTime'],2,-6);
                    }
                    //calcule average data from timeRate
                    $calculTotal += $dataArray[$dataTypeString];
                    if($sameDate != $index)
                    {
                        $date[$index] = substr($dataArray['data_DateTime'],2,-6);
                        $sameDate = $index;
                    }
                }
            }
            // daily precipitation
            if ($dataTypeFetch['timeRate'] == 3)
            {
                while($dataArray = $sql_connect->fetch())
                {
                    if($notPlay)
                    {
                        $lastDate = substr($dataArray['data_DateTime'],2,-9);
                        $notPlay = false;
                    }
                    //send last day average and change index
                    if(substr($dataArray['data_DateTime'],2,-9) != $lastDate)
                    {
                        $PrecipitationTotal[$index] = $calculTotal;
                        $calculTotal = 0;
                        $index++;
                        $lastDate = substr($dataArray['data_DateTime'],2,-9);
                    }
                    //calcule average data from timeRate
                    $calculTotal += $dataArray[$dataTypeString];
                    if($sameDate != $index)
                    {
                        $date[$index] = substr($dataArray['data_DateTime'],2,-9);
                        $sameDate = $index;
                    }
                }
            }
            // monthly precipitation
            if ($dataTypeFetch['timeRate'] == 4)
            {
                while($dataArray = $sql_connect->fetch())
                {
                    if($notPlay)
                    {
                        $lastDate = substr($dataArray['data_DateTime'],2,-12);
                        $notPlay = false;
                    }
                    //send last day average and change index
                    if(substr($dataArray['data_DateTime'],2,-12) != $lastDate)
                    {
                        $PrecipitationTotal[$index] = $calculTotal;
                        $calculTotal = 0;
                        $index++;
                        $lastDate = substr($dataArray['data_DateTime'],2,-12);
                    }
                    //calcule average data from timeRate
                    $calculTotal += $dataArray[$dataTypeString];
                    if($sameDate != $index)
                    {
                        $date[$index] = substr($dataArray['data_DateTime'],2,-12);
                        $sameDate = $index;
                    }
                }
            }
            // yearly precipitation
            if ($dataTypeFetch['timeRate'] == 5)
            {
                while($dataArray = $sql_connect->fetch())
                {
                    if($notPlay)
                    {
                        $lastDate = substr($dataArray['data_DateTime'],0,-15);
                        $notPlay = false;
                    }
                    //send last day average and change index
                    if(substr($dataArray['data_DateTime'],0,-15) != $lastDate)
                    {
                        $PrecipitationTotal[$index] = $calculTotal;
                        $calculTotal = 0;
                        $index++;
                        $lastDate = substr($dataArray['data_DateTime'],0,-15);
                    }
                    //calcule average data from timeRate
                    $calculTotal += $dataArray[$dataTypeString];
                    if($sameDate != $index)
                    {
                        $date[$index] = substr($dataArray['data_DateTime'],0,-15);
                        $sameDate = $index;
                    }
                }
            }
        }
        // hourly data temperature
        else if ($dataTypeFetch['timeRate'] == 2 && $dataTypeFetch['dataType'] != 4)
        {
            while($dataArray = $sql_connect->fetch())
            {
                if($notPlay)
                {
                    $lastDate = substr($dataArray['data_DateTime'],2,-6);
                    $notPlay = false;
                }
                //send last day average and change index
                if(substr($dataArray['data_DateTime'],2,-6) != $lastDate)
                {
                    $average[$index] = ''. round($calculAverage/$saveDataPerTimeRate,1) . '';
                    $calculAverage = 0;
                    $saveDataPerTimeRate = 0;
                    $index++;
                    $lastDate = substr($dataArray['data_DateTime'],2,-6);
                }
                if($dataArray[$dataTypeString] != NULL)
                {
                    //initialisation of the first value of the day
                    if($initValue != $index)
                    {
                        $max[$index] = $dataArray[$dataTypeString];
                        $min[$index] = $dataArray[$dataTypeString];
                        $initValue = $index;
                    }
                    // if data is temperature or wind
                    if ($dataTypeFetch['dataType'] == 1 || $dataTypeFetch['dataType'] == 5)
                    {
                        //save maximal
                        if($max[$index] < $dataArray[$dataTypeString])
                        {
                            $max[$index] = $dataArray[$dataTypeString];
                        }
                    }
                    // if data is temperature
                    if ($dataTypeFetch['dataType'] == 1)
                    {
                        //save minimal
                        if($min[$index] > $dataArray[$dataTypeString])
                        {
                            $min[$index] = $dataArray[$dataTypeString];
                        }
                    }
                    //calcule average data from timeRate
                    $calculAverage += $dataArray[$dataTypeString];
                    $saveDataPerTimeRate++;
                    //Save Date
                    if($sameDate != $index)
                    {
                        $date[$index] = substr($dataArray['data_DateTime'],2,-6);
                        $sameDate = $index;
                    }
                }
            }
        }
        // daily data temperature
        else if ($dataTypeFetch['timeRate'] == 3 && $dataTypeFetch['dataType'] != 4)
        {
            while($dataArray = $sql_connect->fetch())
            {
                if($notPlay)
                {
                    $lastDate = substr($dataArray['data_DateTime'],2,-9);
                    $notPlay = false;
                }
                //send last day average and change index
                if(substr($dataArray['data_DateTime'],2,-9) != $lastDate)
                {
                    $average[$index] = ''. round($calculAverage/$saveDataPerTimeRate,1) . '';
                    $calculAverage = 0;
                    $saveDataPerTimeRate = 0;
                    $index++;
                    $lastDate = substr($dataArray['data_DateTime'],2,-9);
                }
                if($dataArray[$dataTypeString] != NULL)
                {
                    //initialisation of the first value of the day
                    if($initValue != $index)
                    {
                        $max[$index] = $dataArray[$dataTypeString];
                        $min[$index] = $dataArray[$dataTypeString];
                        $initValue = $index;
                    }
                    // if data is temperature or wind
                    if ($dataTypeFetch['dataType'] == 1 || $dataTypeFetch['dataType'] == 5)
                    {
                        //save maximal
                        if($max[$index] < $dataArray[$dataTypeString])
                        {
                            $max[$index] = $dataArray[$dataTypeString];
                        }
                    }
                    // if data is temperature
                    if ($dataTypeFetch['dataType'] == 1)
                    {
                        //save minimal
                        if($min[$index] > $dataArray[$dataTypeString])
                        {
                            $min[$index] = $dataArray[$dataTypeString];
                        }
                    }
                    //calcule average data from timeRate
                    $calculAverage += $dataArray[$dataTypeString];
                    $saveDataPerTimeRate++;

                    //Save Date
                    if($sameDate != $index)
                    {
                        $date[$index] = substr($dataArray['data_DateTime'],2,-9);
                        $sameDate = $index;
                    }
                }
            }
        }
        // monthly data temperature
        else if ($dataTypeFetch['timeRate'] == 4 && $dataTypeFetch['dataType'] != 4)
        {
            while($dataArray = $sql_connect->fetch())
            {
                if($notPlay)
                {
                    $lastDate = substr($dataArray['data_DateTime'],2,-12);
                    $notPlay = false;
                }
                //send last day average and change index
                if(substr($dataArray['data_DateTime'],2,-12) != $lastDate)
                {
                    $average[$index] = ''. round($calculAverage/$saveDataPerTimeRate,1) . '';
                    $calculAverage = 0;
                    $saveDataPerTimeRate = 0;
                    $index++;
                    $lastDate = substr($dataArray['data_DateTime'],2,-12);
                }
                if($dataArray[$dataTypeString] != NULL)
                {
                    //initialisation of the first value of the day
                    if($initValue != $index)
                    {
                        $max[$index] = $dataArray[$dataTypeString];
                        $min[$index] = $dataArray[$dataTypeString];
                        $initValue = $index;
                    }
                    // if data is temperature or wind
                    if ($dataTypeFetch['dataType'] == 1 || $dataTypeFetch['dataType'] == 5)
                    {
                        //save maximal
                        if($max[$index] < $dataArray[$dataTypeString])
                        {
                            $max[$index] = $dataArray[$dataTypeString];
                        }
                    }
                    // if data is temperature
                    if ($dataTypeFetch['dataType'] == 1)
                    {
                        //save minimal
                        if($min[$index] > $dataArray[$dataTypeString])
                        {
                            $min[$index] = $dataArray[$dataTypeString];
                        }
                    }
                    //calcule average data from timeRate
                    $calculAverage += $dataArray[$dataTypeString];
                    $saveDataPerTimeRate++;

                    //Save Date
                    if($sameDate != $index)
                    {
                        $date[$index] = substr($dataArray['data_DateTime'],2,-12);
                        $sameDate = $index;
                    }
                }
            }
        }
        // yearly data temperature
        else if ($dataTypeFetch['timeRate'] == 4 && $dataTypeFetch['dataType'] != 4)
        {
            while($dataArray = $sql_connect->fetch())
            {
                if($notPlay)
                {
                    $lastDate = substr($dataArray['data_DateTime'],0,-15);
                    $notPlay = false;
                }
                //send last day average and change index
                if(substr($dataArray['data_DateTime'],0,-15) != $lastDate)
                {
                    $average[$index] = ''. round($calculAverage/$saveDataPerTimeRate,1) . '';
                    $calculAverage = 0;
                    $saveDataPerTimeRate = 0;
                    $index++;
                    $lastDate = substr($dataArray['data_DateTime'],0,-15);
                }
                if($dataArray[$dataTypeString] != NULL)
                {
                    //initialisation of the first value of the day
                    if($initValue != $index)
                    {
                        $max[$index] = $dataArray[$dataTypeString];
                        $min[$index] = $dataArray[$dataTypeString];
                        $initValue = $index;
                    }
                    // if data is temperature or wind
                    if ($dataTypeFetch['dataType'] == 1 || $dataTypeFetch['dataType'] == 5)
                    {
                        //save maximal
                        if($max[$index] < $dataArray[$dataTypeString])
                        {
                            $max[$index] = $dataArray[$dataTypeString];
                        }
                    }
                    // if data is temperature
                    if ($dataTypeFetch['dataType'] == 1)
                    {
                        //save minimal
                        if($min[$index] > $dataArray[$dataTypeString])
                        {
                            $min[$index] = $dataArray[$dataTypeString];
                        }
                    }
                    //calcule average data from timeRate
                    $calculAverage += $dataArray[$dataTypeString];
                    $saveDataPerTimeRate++;

                    //Save Date
                    if($sameDate != $index)
                    {
                        $date[$index] = substr($dataArray['data_DateTime'],0,-15);
                        $sameDate = $index;
                    }
                }
            }
        }
        $average[$index] = ''. round($calculAverage/$saveDataPerTimeRate,1) . '';


        //generate json
        echo '{"date": ', json_encode($date),',';
        // all data
        if ($dataTypeFetch['timeRate'] == 1)
        {
            // for wind
            if ($dataTypeFetch['dataType'] == 5)
            {
                if ($dataTypeFetch['dataParam2'] == 1)
                {
                    echo '"max": ', json_encode($max),',';
                }
                if ($dataTypeFetch['dataParam3'] == 1)
                {
                    echo '"average": ', json_encode($average),',';
                }
            }
            // for anything else
            else
            {
            echo '"value": ', json_encode($resultArrayData),',';
            }
        }
        // other time rate
        else
        {
            if ($dataTypeFetch['dataType'] == 1)
            {
                if ($dataTypeFetch['dataParam1'] == 1)
                {
                    echo '"min": ', json_encode($min),',';
                }
                if ($dataTypeFetch['dataParam2'] == 1)
                {
                    echo '"max": ', json_encode($max),',';
                }
                if ($dataTypeFetch['dataParam3'] == 1)
                {
                    echo '"average": ', json_encode($average),',';
                }
            }
            else if ($dataTypeFetch['dataType'] == 5)
            {
                if ($dataTypeFetch['dataParam2'] == 1)
                {
                    echo '"max": ', json_encode($max),',';
                }
                if ($dataTypeFetch['dataParam3'] == 1)
                {
                    echo '"average": ', json_encode($average),',';
                }
            }
            else if ($dataTypeFetch['dataType'] == 4)
            {
                echo '"total": ', json_encode($PrecipitationTotal),',';
            }
            else
            {
                echo '"average": ', json_encode($average),',';
            }
        }
        echo '"parameter": ', json_encode($parameter),'}';
        // echo '}';
    }
?>