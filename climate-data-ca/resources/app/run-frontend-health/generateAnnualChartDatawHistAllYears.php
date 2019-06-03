<?php


$get_rcp = isset($_GET['rcp']) ? $_GET['rcp'] : 'rcp45';
$get_var = isset($_GET['var']) ? $_GET['var'] : 'tx_max';
$get_year = isset($_GET['year']) ? $_GET['year'] : 1950;
$get_hruid = isset($_GET['hruid']) ? $_GET['hruid'] : '';

$get_month = isset($_GET['month']) ? $_GET['month'] : '';

foreach (glob("/home/cccapi/public_html/csvs/BCCAQv2/".$get_var."/".$get_rcp."/YS/*_AllYears_Ensemble_percentiles.csv") as $filename) {
    $Data = str_getcsv($filename, "\n"); //parse the rows
    $newcsv[] = array_map('str_getcsv', file($filename));
}

$chorodata = [];

foreach ($newcsv as $key => $value) {
    foreach ($value as $subkey => $subvalue) {
//        echo "<pre>";
//        print_r($subvalue);
//        echo "</pre>";

        if ($subvalue[4] === $get_hruid) {
            $chorodata[$subvalue[0]][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[$subvalue[0]][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[$subvalue[0]][$subvalue[4]]['p90'] = $subvalue[3];
        }
    }

}
$json_string = json_encode($chorodata, JSON_PRETTY_PRINT);
echo $json_string;


