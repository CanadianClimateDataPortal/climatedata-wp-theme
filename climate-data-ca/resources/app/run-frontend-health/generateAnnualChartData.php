<?php


$get_rcp = isset($_GET['rcp']) ? $_GET['rcp'] : 'rcp45';
$get_var = isset($_GET['var']) ? $_GET['var'] : 'tx_max';
$get_year = isset($_GET['year']) ? $_GET['year'] : 1950;

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
        if ($subvalue[0] == 1950){
            $chorodata[1950][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[1950][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[1950][$subvalue[4]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 1960){
            $chorodata[1960][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[1960][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[1960][$subvalue[4]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 1970){
            $chorodata[1970][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[1970][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[1970][$subvalue[4]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 1980){
            $chorodata[1980][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[1980][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[1980][$subvalue[4]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 1990){
            $chorodata[1990][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[1990][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[1990][$subvalue[4]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2000){
            $chorodata[2000][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[2000][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[2000][$subvalue[4]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2010){
            $chorodata[2010][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[2010][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[2010][$subvalue[4]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2020){
            $chorodata[2020][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[2020][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[2020][$subvalue[4]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2030){
            $chorodata[2030][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[2030][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[2030][$subvalue[4]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2040){
            $chorodata[2040][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[2040][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[2040][$subvalue[4]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2050){
            $chorodata[2050][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[2050][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[2050][$subvalue[4]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2060){
            $chorodata[2060][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[2060][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[2060][$subvalue[4]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2070){
            $chorodata[2070][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[2070][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[2070][$subvalue[4]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2080){
            $chorodata[2080][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[2080][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[2080][$subvalue[4]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2090){
            $chorodata[2090][$subvalue[4]]['p10'] = $subvalue[1];
            $chorodata[2090][$subvalue[4]]['p50'] = $subvalue[2];
            $chorodata[2090][$subvalue[4]]['p90'] = $subvalue[3];
        }
    }

}
$json_string = json_encode($chorodata, JSON_PRETTY_PRINT);
echo $json_string;


