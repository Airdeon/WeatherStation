<?php
    try
    {
        $db = new PDO('mysql:host=localhost;dbname=c1WeatherDataBase;charset=utf8', 'c1weatherstation', 'W4fYizE_',[PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION],);
    }
    catch (Exception $e)
    {
        die('Erreur : 2' . $e->getMessage());
    }
    $arrayDataType = &$_POST;
    $dataType = $arrayDataType["var0"];
    $timeRate = $arrayDataType["var1"];
    $time1 = $arrayDataType["var2"];
    $time2 = $arrayDataType["var3"];
    $dataParam1 = $arrayDataType["var4"];
    $dataParam2 = $arrayDataType["var5"];
    $dataParam3 = $arrayDataType["var6"];

    $sql = 'UPDATE Custom_Graph
            SET dataType = :dataType, timeRate = :timeRate, time1 = :time1, time2 = :time2, dataParam1 = :dataParam1, dataParam2 = :dataParam2, dataParam3 = :dataParam3,   time2 = :time2 
            WHERE id = 1';

    $insertData = $db->prepare($sql);
    $insertData->execute([
        'dataType' => $dataType,
        'timeRate' => $timeRate,
        'time1' => $time1,
        'time2' => $time2,
        'dataParam1' => $dataParam1,
        'dataParam2' => $dataParam2,
        'dataParam3' => $dataParam3,
    ]);
?>