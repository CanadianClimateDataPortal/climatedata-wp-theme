<?php


$get_rcp = isset($_GET['rcp']) ? $_GET['rcp'] : 'rcp45';
$get_var = isset($_GET['var']) ? $_GET['var'] : 'tx_max';
$get_year = isset($_GET['year']) ? $_GET['year'] : 1950;

$get_month = isset($_GET['month']) ? $_GET['month'] : '';

if ($get_month == 'jan') { $qmonth = "01January"; }
if ($get_month == 'feb') { $qmonth = "02February"; }
if ($get_month == 'mar') { $qmonth = "03March"; }
if ($get_month == 'apr') { $qmonth = "04April"; }
if ($get_month == 'may') { $qmonth = "05May"; }
if ($get_month == 'jun') { $qmonth = "06June"; }
if ($get_month == 'jul') { $qmonth = "07July"; }
if ($get_month == 'aug') { $qmonth = "08August"; }
if ($get_month == 'sep') { $qmonth = "09September"; }
if ($get_month == 'oct') { $qmonth = "10October"; }
if ($get_month == 'nov') { $qmonth = "11November"; }
if ($get_month == 'dec') { $qmonth = "12December"; }

foreach (glob("/home/cccapi/public_html/csvs/BCCAQv2/".$get_var."/".$get_rcp."/MS/*AllYears_Ensemble_percentiles_".$qmonth.".csv") as $filename) {
    $Data = str_getcsv($filename, "\n"); //parse the rows
    $newcsv[] = array_map('str_getcsv', file($filename));
}

//echo "<pre>";
//print_r($newcsv);
//echo "</pre>";

$chorodata = [];

foreach ($newcsv as $key => $value) {
    foreach ($value as $subkey => $subvalue) {
//        echo "<pre>";
//        print_r($subvalue);
//        echo "</pre>";
        if ($subvalue[0] == 1950){
            $chorodata[1950][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[1950][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[1950][$subvalue[5]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 1960){
            $chorodata[1960][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[1960][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[1960][$subvalue[5]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 1970){
            $chorodata[1970][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[1970][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[1970][$subvalue[5]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 1980){
            $chorodata[1980][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[1980][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[1980][$subvalue[5]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 1990){
            $chorodata[1990][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[1990][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[1990][$subvalue[5]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2000){
            $chorodata[2000][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[2000][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[2000][$subvalue[5]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2010){
            $chorodata[2010][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[2010][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[2010][$subvalue[5]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2020){
            $chorodata[2020][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[2020][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[2020][$subvalue[5]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2030){
            $chorodata[2030][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[2030][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[2030][$subvalue[5]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2040){
            $chorodata[2040][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[2040][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[2040][$subvalue[5]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2050){
            $chorodata[2050][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[2050][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[2050][$subvalue[5]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2060){
            $chorodata[2060][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[2060][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[2060][$subvalue[5]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2070){
            $chorodata[2070][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[2070][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[2070][$subvalue[5]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2080){
            $chorodata[2080][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[2080][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[2080][$subvalue[5]]['p90'] = $subvalue[3];
        }
        if ($subvalue[0] == 2090){
            $chorodata[2090][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[2090][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[2090][$subvalue[5]]['p90'] = $subvalue[3];
        }
    }

}
$json_string = json_encode($chorodata, JSON_PRETTY_PRINT);
echo $json_string;


